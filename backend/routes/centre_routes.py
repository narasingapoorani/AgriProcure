from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.centre import ProcurementCentre
from models.booking import Booking
from models.timeline import TimelineEvent
from services.notification_service import NotificationService

centre_bp = Blueprint('centre', __name__)

@centre_bp.route('/check-in', methods=['POST'])
def check_in():
    """
    After Farmer reach center:
    Farmer's QR is scanned and checked-in.
    Updates booking status to Checked-in, advances timeline stage to 'Arrived'.
    """
    data = request.get_json() or {}
    token_or_code = data.get('token_number') or data.get('qr_data')
    if not token_or_code:
        return jsonify({'status': 'error', 'message': 'Token number or QR data is required'}), 400

    # Extract token if whole QR payload is provided
    token = token_or_code
    if '|TOKEN:' in token_or_code:
        token = token_or_code.split('|TOKEN:')[1].split('|')[0]

    booking = Booking.query.filter_by(token_number=token).first()
    if not booking:
        return jsonify({'status': 'error', 'message': f'Booking with token {token} not found'}), 404

    booking.status = 'Checked-in'
    booking.checked_in_at = datetime.utcnow()
    booking.current_stage = 'Arrived'

    # Update timeline
    arrived_event = TimelineEvent.query.filter_by(booking_id=booking.id, stage_name='Arrived').first()
    if arrived_event:
        arrived_event.status = 'completed'
        arrived_event.completed_at = datetime.utcnow()
        arrived_event.remarks = 'Farmer checked in via QR scan at gate'

    # Next stage in progress
    insp_event = TimelineEvent.query.filter_by(booking_id=booking.id, stage_name='Quality Inspection').first()
    if insp_event:
        insp_event.status = 'in_progress'

    # Dispatch SMS
    if booking.farmer:
        sms_text = f"Checked-in at {booking.centre.name}. Token: {booking.token_number}. Position: {booking.queue_position}. Estimated wait: {round(booking.estimated_wait_minutes)} min."
        NotificationService.send_sms(
            user_id=booking.farmer_id,
            mobile_number=booking.farmer.mobile_number,
            message=sms_text,
            title="Checked-In at Procurement Centre"
        )

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': f'Farmer {booking.farmer.full_name if booking.farmer else ""} successfully checked in!',
        'booking': booking.to_dict()
    })
