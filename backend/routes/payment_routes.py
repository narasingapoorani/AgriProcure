from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.booking import Booking
from models.timeline import TimelineEvent
from models.payment_transaction import PaymentTransaction
from services.razorpay_service import RazorpayService
from services.whatsapp_service import WhatsAppService

payment_bp = Blueprint('payment', __name__)
razorpay_service = RazorpayService()

@payment_bp.route('/create-order', methods=['POST'])
def create_order():
    """
    Creates a Razorpay Order for a farmer's crop settlement.
    """
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    
    if not booking_id:
        return jsonify({'status': 'error', 'message': 'booking_id is required'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    amount = float(booking.payment_amount or 5000.0)
    receipt_id = f"rcpt_{booking.booking_reference}"
    
    order = razorpay_service.create_order(
        amount_in_rupees=amount,
        receipt_id=receipt_id,
        notes={
            'token_number': booking.token_number,
            'crop_name': booking.crop_name,
            'quantity': str(booking.quantity),
            'farmer_id': str(booking.farmer_id)
        }
    )

    # Advance stage to Payment Generated if not already
    booking.current_stage = 'Payment Generated'
    pgen_event = TimelineEvent.query.filter_by(booking_id=booking.id, stage_name='Payment Generated').first()
    if pgen_event:
        pgen_event.status = 'completed'
        pgen_event.completed_at = datetime.utcnow()
        pgen_event.remarks = f"Razorpay Order {order['order_id']} generated for ₹{amount}"

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Razorpay order created successfully',
        'order': order,
        'booking': booking.to_dict()
    })

@payment_bp.route('/verify', methods=['POST'])
def verify_payment():
    """
    Verifies Razorpay payment signature, updates booking status to Completed,
    and advances timeline stage to 'Payment Initiated'.
    """
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_signature = data.get('razorpay_signature', 'sig_mock_verified')

    if not booking_id or not razorpay_order_id or not razorpay_payment_id:
        return jsonify({'status': 'error', 'message': 'booking_id, razorpay_order_id, and razorpay_payment_id are required'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    is_valid = razorpay_service.verify_payment_signature(
        order_id=razorpay_order_id,
        payment_id=razorpay_payment_id,
        signature=razorpay_signature
    )

    if not is_valid:
        return jsonify({'status': 'error', 'message': 'Invalid payment signature'}), 400

    booking.payment_status = 'Success'
    booking.status = 'Completed'
    booking.current_stage = 'Payment Initiated'

    # Update timeline
    p_init_event = TimelineEvent.query.filter_by(booking_id=booking.id, stage_name='Payment Initiated').first()
    if p_init_event:
        p_init_event.status = 'completed'
        p_init_event.completed_at = datetime.utcnow()
    # Record genuine transaction in database
    tx = PaymentTransaction(
        transaction_id=razorpay_payment_id,
        order_id=razorpay_order_id,
        farmer_id=booking.farmer_id,
        booking_id=booking.id,
        transaction_type='fee',
        description=f"Slot Verification & Inspection Fee ({booking.crop_name})",
        description_ta=f"முன்பதிவு & ஆய்வு கட்டணம் ({booking.crop_name})",
        amount=50.0,
        payment_method='Razorpay UPI',
        payment_method_ta='ரேசர்பே UPI',
        status='Success',
        status_ta='வெற்றி',
        is_credit=False,
        created_at=datetime.utcnow()
    )
    db.session.add(tx)

    # Send WhatsApp confirmation to farmer
    if booking.farmer:
        msg = WhatsAppService.format_payment_dbt_msg(
            farmer_name=booking.farmer.full_name,
            token_number=booking.token_number,
            crop=booking.crop_name,
            qty=booking.quantity,
            amount=booking.payment_amount,
            utr=razorpay_payment_id
        )
        WhatsAppService.send_whatsapp_message(booking.farmer.mobile_number, msg, template_type="payment_success")

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Payment verified and credited successfully!',
        'booking': booking.to_dict()
    })

@payment_bp.route('/initiate-payout', methods=['POST'])
def initiate_payout():
    """
    Direct Government MSP Payout (DBT) trigger by procurement officer.
    """
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    farmer = booking.farmer
    dbt_acc = f"DBT-AADHAAR-{farmer.aadhaar_number.replace('-', '')}" if (farmer and farmer.aadhaar_number) else f"DBT-ACC-{farmer.mobile_number if farmer else '9876543210'}"
    payout_amt = float(booking.payment_amount) if (booking.payment_amount and booking.payment_amount > 0) else round(float(booking.quantity or 1.0) * 2275.0, 2)
    payout = razorpay_service.initiate_msp_payout(
        farmer_name=farmer.full_name if farmer else 'Registered Farmer',
        mobile=farmer.mobile_number if farmer else '9876543210',
        bank_account=dbt_acc,
        amount_in_rupees=payout_amt,
        token_number=booking.token_number
    )

    booking.payment_status = 'Success'
    booking.status = 'Completed'
    booking.current_stage = 'Payment Initiated'

    p_init = TimelineEvent.query.filter_by(booking_id=booking.id, stage_name='Payment Initiated').first()
    if p_init:
        p_init.status = 'completed'
        p_init.completed_at = datetime.utcnow()
    # Record genuine payout transaction in database
    payout_tx = PaymentTransaction(
        transaction_id=payout['payout_id'],
        order_id=payout.get('utr_number'),
        farmer_id=booking.farmer_id,
        booking_id=booking.id,
        transaction_type='payout',
        description=f"MSP Direct Procurement Payout - {booking.crop_name} ({booking.token_number})",
        description_ta=f"MSP கொள்முதல் வரவு - {booking.crop_name} ({booking.token_number})",
        amount=payout_amt,
        payment_method='RazorpayX DBT Transfer',
        payment_method_ta='ரேசர்பே வங்கி நேரடிப் பரிமாற்றம்',
        status='Success',
        status_ta='வெற்றி',
        is_credit=True,
        created_at=datetime.utcnow()
    )
    db.session.add(payout_tx)

    # Send WhatsApp payment receipt
    if farmer:
        msg = WhatsAppService.format_payment_dbt_msg(
            farmer_name=farmer.full_name,
            token_number=booking.token_number,
            crop=booking.crop_name,
            qty=booking.quantity,
            amount=booking.payment_amount,
            utr=payout['utr_number']
        )
        WhatsAppService.send_whatsapp_message(farmer.mobile_number, msg, template_type="msp_payout")

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Government MSP Payout successfully disbursed via Direct Benefit Transfer',
        'payout': payout,
        'booking': booking.to_dict()
    })
