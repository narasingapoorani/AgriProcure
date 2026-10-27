from flask import Blueprint, request, jsonify
from services.whatsapp_service import WhatsAppService
from models.booking import Booking

whatsapp_bp = Blueprint('whatsapp', __name__)

@whatsapp_bp.route('/send', methods=['POST'])
def send_message():
    data = request.get_json() or {}
    mobile = data.get('mobile_number')
    message = data.get('message')

    if not mobile or not message:
        return jsonify({'status': 'error', 'message': 'mobile_number and message are required'}), 400

    result = WhatsAppService.send_whatsapp_message(mobile, message)
    return jsonify({
        'status': 'success',
        'result': result
    })

@whatsapp_bp.route('/chat-link/<booking_id_or_token>', methods=['GET'])
def get_chat_link(booking_id_or_token):
    booking = Booking.query.filter(
        (Booking.token_number == booking_id_or_token) | (Booking.id == booking_id_or_token)
    ).first()

    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    msg = WhatsAppService.format_slot_booking_msg(
        farmer_name=booking.farmer.full_name if booking.farmer else 'Kisan',
        token_number=booking.token_number,
        centre_name=booking.centre.name if booking.centre else 'Procurement Centre',
        booking_date=booking.booking_date.isoformat(),
        time_slot=booking.time_slot,
        wait_mins=booking.estimated_wait_minutes,
        crop=booking.crop_name,
        qty=booking.quantity
    )

    mobile = booking.farmer.mobile_number if booking.farmer else '9876543210'
    chat_link = WhatsAppService.create_click_to_chat_link(mobile, msg)

    return jsonify({
        'status': 'success',
        'token_number': booking.token_number,
        'mobile_number': mobile,
        'chat_link': chat_link,
        'message_preview': msg
    })
