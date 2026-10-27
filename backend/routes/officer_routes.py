from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.centre import ProcurementCentre
from models.booking import Booking
from models.timeline import TimelineEvent, OFFICIAL_STAGES
from models.notification import Notification
from models.user import User
from services.ml_service import MLService
from services.digital_twin_service import DigitalTwinService
from services.notification_service import NotificationService

officer_bp = Blueprint('officer', __name__)
ml_service = MLService()
digital_twin_service = DigitalTwinService()

@officer_bp.route('/dashboard', methods=['GET'])
def get_officer_dashboard():
    """
    Officer Dashboard:
    1. Select Center
    2. Overload Risk, Queues, Capacities, Recommended Actions
    """
    centre_id = request.args.get('centre_id', type=int)
    centre = db.session.get(ProcurementCentre, centre_id) if centre_id else None
    if not centre:
        centre = ProcurementCentre.query.first()
    if not centre:
        return jsonify({'status': 'error', 'message': 'No centres available'}), 404

    # Evaluate Overload Risk using ML model
    overload_result = ml_service.predict_overload(
        predicted_arrivals=centre.processed_today + centre.current_queue,
        centre_capacity=centre.total_capacity,
        current_queue=centre.current_queue,
        staff_available=centre.staff_available,
        number_of_counters=centre.active_counters,
        processing_rate=centre.processing_rate,
        remaining_capacity=centre.remaining_capacity,
        daily_processing_capacity=centre.daily_processing_capacity
    )

    # Evaluate ETA
    eta_result = ml_service.predict_eta(
        queue=centre.current_queue,
        counters=centre.active_counters,
        processing_rate=centre.processing_rate
    )

    # Evaluate Decision Intelligence Rule Engine
    decision = ml_service.evaluate_decision_intelligence(
        queue=centre.current_queue,
        eta_minutes=eta_result['estimated_wait_minutes'],
        overload_risk=overload_result['risk_level']
    )

    # Recent active queue bookings
    active_bookings = Booking.query.filter_by(centre_id=centre.id).filter(
        Booking.status.in_(['Booked', 'Checked-in'])
    ).order_by(Booking.created_at.asc()).all()

    return jsonify({
        'status': 'success',
        'centre': centre.to_dict(),
        'overload_analysis': overload_result,
        'eta_analysis': eta_result,
        'decision_intelligence': decision,
        'active_queue_count': len(active_bookings),
        'active_bookings': [b.to_dict() for b in active_bookings]
    })

import time

_centres_cache = {
    'data': None,
    'timestamp': 0
}

_forecast_cache = {}

def invalidate_officer_caches():
    _centres_cache['data'] = None
    _centres_cache['timestamp'] = 0
    _forecast_cache.clear()

@officer_bp.route('/centres', methods=['GET'])
def get_centres():
    now = time.time()
    # High performance TTL cache (15s)
    if _centres_cache['data'] is not None and (now - _centres_cache['timestamp']) < 15:
        return jsonify(_centres_cache['data'])

    centres = ProcurementCentre.query.all()
    rows = []
    c_dicts = []
    for c in centres:
        c_dict = c.to_dict()
        c_dicts.append(c_dict)
        rows.append({
            'predicted_arrivals': c.processed_today + c.current_queue,
            'centre_capacity': c.total_capacity,
            'current_queue': c.current_queue,
            'staff_available': c.staff_available,
            'number_of_counters': c.active_counters,
            'processing_rate': c.processing_rate,
            'remaining_capacity': c.remaining_capacity,
            'daily_processing_capacity': c.daily_processing_capacity
        })

    # High-performance batch evaluation in a single matrix
    overload_results = ml_service.predict_overload_batch(rows)
    for c_dict, overload in zip(c_dicts, overload_results):
        c_dict['overload_risk'] = overload['risk_level']
        c_dict['overload_probability'] = overload['overload_probability']

    response_payload = {
        'status': 'success',
        'centres': c_dicts
    }
    _centres_cache['data'] = response_payload
    _centres_cache['timestamp'] = now

    return jsonify(response_payload)

@officer_bp.route('/demand-forecast', methods=['POST'])
def demand_forecast():
    """
    AI Demand Forecast (This Week, Next Week):
    & compares capacity with predicted amount.
    If the comparison shows overload risk and it's high,
    then officer can shift center for some farmers.
    """
    data = request.get_json() or {}
    centre_id = data.get('centre_id')
    now = time.time()

    centre = db.session.get(ProcurementCentre, centre_id) if centre_id else None
    if not centre:
        centre = ProcurementCentre.query.first()
    if not centre:
        return jsonify({'status': 'error', 'message': 'No centres available'}), 404

    resolved_centre_id = centre.id

    # High performance TTL cache (30s per centre)
    if resolved_centre_id in _forecast_cache:
        cached = _forecast_cache[resolved_centre_id]
        if (now - cached['timestamp']) < 30:
            return jsonify(cached['data'])

    forecast = ml_service.forecast_demand(
        state=centre.state,
        district=centre.district,
        market=centre.market,
        base_arrival=centre.processed_today or 120.0
    )

    # Compare capacity vs predicted
    daily_cap = centre.daily_processing_capacity
    weekly_cap = daily_cap * 7.0

    this_week_util = round((forecast['this_week_total'] / weekly_cap) * 100.0, 1)
    next_week_util = round((forecast['next_week_total'] / weekly_cap) * 100.0, 1)

    overload_eval = ml_service.predict_overload(
        predicted_arrivals=forecast['this_week_avg_daily'],
        centre_capacity=centre.total_capacity,
        current_queue=centre.current_queue,
        staff_available=centre.staff_available,
        number_of_counters=centre.active_counters,
        processing_rate=centre.processing_rate,
        remaining_capacity=centre.remaining_capacity,
        daily_processing_capacity=centre.daily_processing_capacity
    )

    decision = ml_service.evaluate_decision_intelligence(
        queue=centre.current_queue,
        eta_minutes=round((centre.current_queue / max(1, centre.active_counters)) * (60.0 / centre.processing_rate)),
        overload_risk=overload_eval['risk_level']
    )

    can_shift_farmers = (overload_eval['risk_level'] == 'HIGH' or this_week_util > 95.0)

    result_payload = {
        'status': 'success',
        'centre_id': centre.id,
        'centre_name': centre.name,
        'daily_processing_capacity': daily_cap,
        'weekly_processing_capacity': weekly_cap,
        'forecast': forecast,
        'capacity_comparison': {
            'this_week_utilization_percent': this_week_util,
            'next_week_utilization_percent': next_week_util,
            'status': 'Overload Risk' if can_shift_farmers else 'Optimal Flow'
        },
        'overload_risk': overload_eval['risk_level'],
        'overload_probability': overload_eval['overload_probability'],
        'decision_recommendation': decision,
        'can_shift_farmers': can_shift_farmers
    }

    _forecast_cache[resolved_centre_id] = {
        'data': result_payload,
        'timestamp': now
    }

    return jsonify(result_payload)

@officer_bp.route('/digital-twin/simulate', methods=['POST'])
def simulate_digital_twin():
    """
    Digital Twin:
    1. Officer Dashboard -> Select Digital Twin
    2. Select the center
    3. Simulate the center using what-if conditions:
       - Add Counter
       - Remove Counter
       - Heavy rain
       - 50 extra farmers
    Then make changes if required, shift the farmers with other procurement centers.
    """
    data = request.get_json() or {}
    centre_id = data.get('centre_id', 1)
    centre = ProcurementCentre.query.get(centre_id)
    if not centre:
        return jsonify({'status': 'error', 'message': 'Centre not found'}), 404

    what_if = {
        'add_counter': int(data.get('add_counter', 0)),
        'remove_counter': int(data.get('remove_counter', 0)),
        'heavy_rain': bool(data.get('heavy_rain', False)),
        'extra_farmers': int(data.get('extra_farmers', 0))
    }

    result = digital_twin_service.simulate_what_if(centre, what_if)
    return jsonify({
        'status': 'success',
        'simulation': result
    })

@officer_bp.route('/shift-farmers', methods=['POST'])
def shift_farmers():
    """
    Shift farmers to other procurement centers using AI recommendation model.
    Shift using SMS notification.
    """
    data = request.get_json() or {}
    source_centre_id = data.get('source_centre_id', 1)
    shift_count = int(data.get('shift_count', 10))

    source_centre = ProcurementCentre.query.get(source_centre_id)
    if not source_centre:
        return jsonify({'status': 'error', 'message': 'Source centre not found'}), 404

    # Find other candidate centres
    other_centres = ProcurementCentre.query.filter(ProcurementCentre.id != source_centre_id).all()
    if not other_centres:
        return jsonify({'status': 'error', 'message': 'No alternate centres available'}), 400

    other_centres_data = [c.to_dict() for c in other_centres]

    # Find top alternate centre
    recommendations = ml_service.recommend_centres(
        centres_list=other_centres_data,
        farmer_lat=source_centre.latitude,
        farmer_lng=source_centre.longitude,
        farmer_quantity=2.0
    )
    if not recommendations:
        return jsonify({'status': 'error', 'message': 'No feasible alternate centre found'}), 400

    target_centre_id = recommendations[0]['centre_id']
    target_centre = ProcurementCentre.query.get(target_centre_id)

    # Pick bookings to shift
    eligible_bookings = Booking.query.filter_by(centre_id=source_centre_id, status='Booked').limit(shift_count).all()
    shifted_records = []

    for b in eligible_bookings:
        old_centre_name = source_centre.name
        b.centre_id = target_centre.id
        b.status = 'Shifted'

        # Notify farmer via SMS
        if b.farmer:
            sms_text = f"Notice: Due to heavy queue load at {old_centre_name}, your booking {b.token_number} has been AI-shifted to {target_centre.name}. Expected wait: {recommendations[0]['estimated_wait_minutes']} min. Please proceed to {target_centre.name}."
            NotificationService.send_sms(
                user_id=b.farmer_id,
                mobile_number=b.farmer.mobile_number,
                message=sms_text,
                title="Procurement Centre Rebalancing Notice"
            )

        shifted_records.append({
            'booking_id': b.id,
            'token_number': b.token_number,
            'farmer_name': b.farmer.full_name if b.farmer else 'Farmer',
            'new_centre': target_centre.name
        })

    # Update queues
    source_centre.current_queue = max(0, source_centre.current_queue - len(shifted_records))
    target_centre.current_queue += len(shifted_records)
    db.session.commit()
    invalidate_officer_caches()

    return jsonify({
        'status': 'success',
        'message': f"Successfully rebalanced {len(shifted_records)} farmers to {target_centre.name} with automated SMS alerts sent!",
        'shifted_count': len(shifted_records),
        'target_centre': target_centre.to_dict(),
        'shifted_records': shifted_records
    })

@officer_bp.route('/update-stage', methods=['POST'])
def update_stage():
    """
    Officer advances farmer's timeline stage:
    Token Confirmed -> Arrived -> Quality Inspection -> Weighing -> Crop Accepted -> Payment Generated -> Payment Initiated
    """
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    new_stage = data.get('new_stage')

    if not booking_id or not new_stage:
        return jsonify({'status': 'error', 'message': 'booking_id and new_stage required'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    if new_stage not in OFFICIAL_STAGES:
        return jsonify({'status': 'error', 'message': f'Invalid stage. Must be one of {OFFICIAL_STAGES}'}), 400

    booking.current_stage = new_stage
    stage_idx = OFFICIAL_STAGES.index(new_stage)

    # Update timeline events up to this stage
    for event in booking.timeline_events:
        if event.order_index < stage_idx:
            event.status = 'completed'
        elif event.order_index == stage_idx:
            event.status = 'in_progress'
        else:
            event.status = 'pending'

    # If completed payment
    if new_stage == 'Payment Initiated':
        booking.payment_status = 'Initiated'
        booking.status = 'Completed'

    db.session.commit()
    invalidate_officer_caches()

    return jsonify({
        'status': 'success',
        'message': f'Stage updated to {new_stage}',
        'booking': booking.to_dict()
    })


@officer_bp.route('/all-bookings', methods=['GET'])
def get_all_bookings():
    """
    Returns all real registered farmer applications and active tokens in the database.
    Replaces static mock farmers.
    """
    bookings = Booking.query.order_by(Booking.booking_date.asc(), Booking.created_at.desc()).all()
    results = []
    for b in bookings:
        eff = b.effective_status
        if eff == 'Upcoming':
            q_status = 'Upcoming'
            q_status_ta = 'வரவிருக்கும்'
            p_status = 'Pending'
            p_status_ta = 'நிலுவையில்'
        elif eff == 'Completed':
            q_status = 'Completed'
            q_status_ta = 'நிறைவடைந்தது'
            p_status = 'Paid'
            p_status_ta = 'செலுத்தப்பட்டது'
        else:
            q_status = b.current_stage or 'In Progress'
            q_status_ta = b.current_stage or 'செயல்பாட்டில்'
            p_status = 'Pending'
            p_status_ta = 'நிலுவையில்'

        results.append({
            'id': f"PROC-2026-{b.id:04d}",
            'booking_id': b.id,
            'token': b.token_number,
            'name': b.farmer.full_name if b.farmer else f"Farmer #{b.farmer_id}",
            'nameTa': b.farmer.full_name if b.farmer else f"விவசாயி #{b.farmer_id}",
            'phone': b.farmer.mobile_number if b.farmer else "9876543210",
            'crop': b.crop_name,
            'cropTa': b.crop_name,
            'quantityQt': b.quantity,
            'landArea': f"{b.land_area} acres",
            'center': b.centre.name if b.centre else "APMC Procurement Hub",
            'centre_id': b.centre_id,
            'date': b.booking_date.isoformat() if b.booking_date else "2026-09-10",
            'slot': b.time_slot,
            'payment_amount': b.payment_amount or round(b.quantity * 2275.0, 2),
            'aadhaar': b.farmer.aadhaar_number if b.farmer else None,
            'paymentStatus': p_status,
            'paymentStatusTa': p_status_ta,
            'queueStatus': q_status,
            'queueStatusTa': q_status_ta,
            'status': eff,
            'effective_status': eff,
            'is_upcoming': eff == 'Upcoming',
            'is_completed': eff == 'Completed',
            'is_in_progress': eff == 'In Progress',
            'checked_in_at': b.checked_in_at.isoformat() if b.checked_in_at else None,
            'created_at': b.created_at.isoformat() if b.created_at else None
        })

    return jsonify({
        'status': 'success',
        'total': len(results),
        'bookings': results
    })

@officer_bp.route('/notifications', methods=['GET'])
def get_officer_notifications():
    """
    Returns real operational notifications, queue rebalancing alerts, and system notices.
    """
    notifs = Notification.query.order_by(Notification.created_at.desc()).limit(20).all()
    results = []
    for n in notifs:
        results.append({
            'id': f"notif_{n.id}",
            'title': n.title,
            'titleTa': n.title,
            'message': n.message,
            'messageTa': n.message,
            'time': n.created_at.strftime('%d %b, %H:%M') if n.created_at else 'Just now',
            'type': n.notification_type or 'system',
            'read': n.is_read
        })

    return jsonify({
        'status': 'success',
        'notifications': results
    })

@officer_bp.route('/notifications/clear', methods=['POST', 'DELETE'])
def clear_officer_notifications():
    """
    Clears / removes notifications for officers.
    """
    deleted_count = Notification.query.delete(synchronize_session=False)
    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': f'Cleared {deleted_count} notifications',
        'deleted_count': deleted_count
    })

@officer_bp.route('/notifications/<string:notif_id>', methods=['DELETE', 'POST'])
def delete_officer_notification(notif_id):
    """
    Deletes a single notification by id (e.g. 'notif_1' or '1').
    """
    numeric_id = int(str(notif_id).replace('notif_', ''))
    notif = Notification.query.get(numeric_id)
    if notif:
        db.session.delete(notif)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Notification deleted'})
    return jsonify({'status': 'error', 'message': 'Notification not found'}), 404
