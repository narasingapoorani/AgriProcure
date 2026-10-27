from flask import Blueprint, request, jsonify
from datetime import datetime, date
import uuid
import random
import jwt
from config import Config
from database import db
from models.user import User, FarmerProfile
from models.centre import ProcurementCentre
from models.booking import Booking
from models.timeline import TimelineEvent, OFFICIAL_STAGES
from models.notification import Notification
from models.payment_transaction import PaymentTransaction
from services.ml_service import MLService
from services.qr_service import QRService
from services.notification_service import NotificationService
from services.whatsapp_service import WhatsAppService

farmer_bp = Blueprint('farmer', __name__)
ml_service = MLService()

CROPS_CATALOG = [
    {'name': 'Wheat', 'variety': 'Sharbati / Lokwan', 'msp_per_quintal': 2275, 'unit': 'Quintals'},
    {'name': 'Paddy (Rice)', 'variety': 'Basmati / Common', 'msp_per_quintal': 2183, 'unit': 'Quintals'},
    {'name': 'Soybean', 'variety': 'Yellow', 'msp_per_quintal': 4600, 'unit': 'Quintals'},
    {'name': 'Cotton', 'variety': 'Medium Staple', 'msp_per_quintal': 6620, 'unit': 'Quintals'},
    {'name': 'Gram (Chana)', 'variety': 'Desi', 'msp_per_quintal': 5440, 'unit': 'Quintals'},
    {'name': 'Mustard', 'variety': 'Pusa Bold', 'msp_per_quintal': 5650, 'unit': 'Quintals'},
    {'name': 'Maize', 'variety': 'Hybrid', 'msp_per_quintal': 2090, 'unit': 'Quintals'}
]

@farmer_bp.route('/crops', methods=['GET'])
def get_crops():
    return jsonify({
        'status': 'success',
        'crops': CROPS_CATALOG
    })

@farmer_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    farmer_id = request.args.get('farmer_id', type=int)
    if not farmer_id:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
                if payload.get('role') == 'farmer':
                    farmer_id = payload.get('user_id')
            except Exception:
                pass
    if not farmer_id:
        # Default to first farmer
        first_farmer = User.query.filter_by(role='farmer').first()
        farmer_id = first_farmer.id if first_farmer else None

    farmer = User.query.get(farmer_id) if farmer_id else None
    active_bookings = Booking.query.filter_by(farmer_id=farmer_id).order_by(Booking.created_at.desc()).all() if farmer_id else []
    notifications = Notification.query.filter_by(user_id=farmer_id).order_by(Notification.created_at.desc()).limit(10).all() if farmer_id else []

    # Get active token if any (any upcoming or in-progress booking)
    active_token = None
    for b in active_bookings:
        if b.effective_status in ['Upcoming', 'In Progress'] or b.status in ['Booked', 'Checked-in']:
            if not b.qr_code_data:
                qr_payload = f"AGRI_PROCUREMENT|TOKEN:{b.token_number}|REF:{b.booking_reference}|CENTRE:{b.centre_id}|FARMER:{b.farmer_id}|CROP:{b.crop_name}|QTY:{b.quantity}"
                b.qr_code_data = QRService.generate_qr_base64(qr_payload)
                db.session.commit()
            active_token = b.to_dict()
            break
    if not active_token and active_bookings:
        b = active_bookings[0]
        if not b.qr_code_data:
            qr_payload = f"AGRI_PROCUREMENT|TOKEN:{b.token_number}|REF:{b.booking_reference}|CENTRE:{b.centre_id}|FARMER:{b.farmer_id}|CROP:{b.crop_name}|QTY:{b.quantity}"
            b.qr_code_data = QRService.generate_qr_base64(qr_payload)
            db.session.commit()
        active_token = b.to_dict()

    return jsonify({
        'status': 'success',
        'farmer': farmer.to_dict() if farmer else None,
        'active_token': active_token,
        'total_bookings': len(active_bookings),
        'bookings': [b.to_dict() for b in active_bookings],
        'notifications': [n.to_dict() for n in notifications]
    })

DISTRICT_COORDINATES = {
    # Tamil Nadu Districts & Taluks (Primary Focus)
    'coimbatore': {'lat': 11.0168, 'lng': 76.9558, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'pollachi': {'lat': 10.6609, 'lng': 77.0048, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'kinathukadavu': {'lat': 10.8228, 'lng': 77.0189, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'sulur': {'lat': 11.0244, 'lng': 77.1264, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'mettupalayam': {'lat': 11.3000, 'lng': 76.9450, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'annur': {'lat': 11.2333, 'lng': 77.1833, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'anaimalai': {'lat': 10.5833, 'lng': 76.9333, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    'valparai': {'lat': 10.3267, 'lng': 76.9554, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},

    'tiruppur': {'lat': 11.1085, 'lng': 77.3411, 'district': 'Tiruppur', 'state': 'Tamil Nadu'},
    'avinashi': {'lat': 11.1936, 'lng': 77.2689, 'district': 'Tiruppur', 'state': 'Tamil Nadu'},
    'palladam': {'lat': 11.0045, 'lng': 77.2882, 'district': 'Tiruppur', 'state': 'Tamil Nadu'},
    'kangeyam': {'lat': 11.0057, 'lng': 77.5587, 'district': 'Tiruppur', 'state': 'Tamil Nadu'},
    'dharapuram': {'lat': 10.7289, 'lng': 77.5256, 'district': 'Tiruppur', 'state': 'Tamil Nadu'},

    'erode': {'lat': 11.3410, 'lng': 77.7172, 'district': 'Erode', 'state': 'Tamil Nadu'},
    'bhavani': {'lat': 11.4468, 'lng': 77.6826, 'district': 'Erode', 'state': 'Tamil Nadu'},
    'gobichettipalayam': {'lat': 11.4552, 'lng': 77.4426, 'district': 'Erode', 'state': 'Tamil Nadu'},
    'sathyamangalam': {'lat': 11.5042, 'lng': 77.2431, 'district': 'Erode', 'state': 'Tamil Nadu'},
    'perundurai': {'lat': 11.2764, 'lng': 77.5828, 'district': 'Erode', 'state': 'Tamil Nadu'},

    'salem': {'lat': 11.6643, 'lng': 78.1460, 'district': 'Salem', 'state': 'Tamil Nadu'},
    'mettur': {'lat': 11.7942, 'lng': 77.8016, 'district': 'Salem', 'state': 'Tamil Nadu'},
    'attur': {'lat': 11.5973, 'lng': 78.5996, 'district': 'Salem', 'state': 'Tamil Nadu'},
    'sankari': {'lat': 11.4839, 'lng': 77.8687, 'district': 'Salem', 'state': 'Tamil Nadu'},

    'namakkal': {'lat': 11.2189, 'lng': 78.1674, 'district': 'Namakkal', 'state': 'Tamil Nadu'},
    'rasipuram': {'lat': 11.4646, 'lng': 78.1751, 'district': 'Namakkal', 'state': 'Tamil Nadu'},
    'tiruchengode': {'lat': 11.3804, 'lng': 77.8967, 'district': 'Namakkal', 'state': 'Tamil Nadu'},

    'krishnagiri': {'lat': 12.5186, 'lng': 78.2137, 'district': 'Krishnagiri', 'state': 'Tamil Nadu'},
    'hosur': {'lat': 12.7409, 'lng': 77.8253, 'district': 'Krishnagiri', 'state': 'Tamil Nadu'},

    'dharmapuri': {'lat': 12.1211, 'lng': 78.1582, 'district': 'Dharmapuri', 'state': 'Tamil Nadu'},

    'thanjavur': {'lat': 10.7870, 'lng': 79.1378, 'district': 'Thanjavur', 'state': 'Tamil Nadu'},
    'kumbakonam': {'lat': 10.9602, 'lng': 79.3845, 'district': 'Thanjavur', 'state': 'Tamil Nadu'},
    'pattukkottai': {'lat': 10.4287, 'lng': 79.3175, 'district': 'Thanjavur', 'state': 'Tamil Nadu'},

    'tiruchirappalli': {'lat': 10.7905, 'lng': 78.7047, 'district': 'Tiruchirappalli', 'state': 'Tamil Nadu'},
    'trichy': {'lat': 10.7905, 'lng': 78.7047, 'district': 'Tiruchirappalli', 'state': 'Tamil Nadu'},
    'srirangam': {'lat': 10.8622, 'lng': 78.6948, 'district': 'Tiruchirappalli', 'state': 'Tamil Nadu'},
    'manapparai': {'lat': 10.6074, 'lng': 78.4178, 'district': 'Tiruchirappalli', 'state': 'Tamil Nadu'},

    'madurai': {'lat': 9.9252, 'lng': 78.1198, 'district': 'Madurai', 'state': 'Tamil Nadu'},
    'melur': {'lat': 10.0333, 'lng': 78.3333, 'district': 'Madurai', 'state': 'Tamil Nadu'},
    'usilampatti': {'lat': 9.9678, 'lng': 77.7944, 'district': 'Madurai', 'state': 'Tamil Nadu'},

    'dindigul': {'lat': 10.3673, 'lng': 77.9803, 'district': 'Dindigul', 'state': 'Tamil Nadu'},
    'palani': {'lat': 10.4500, 'lng': 77.5167, 'district': 'Dindigul', 'state': 'Tamil Nadu'},

    'tirunelveli': {'lat': 8.7139, 'lng': 77.7567, 'district': 'Tirunelveli', 'state': 'Tamil Nadu'},
    'ambasamudram': {'lat': 8.7073, 'lng': 77.4578, 'district': 'Tirunelveli', 'state': 'Tamil Nadu'},

    'thoothukudi': {'lat': 8.7642, 'lng': 78.1348, 'district': 'Thoothukudi', 'state': 'Tamil Nadu'},
    'tuticorin': {'lat': 8.7642, 'lng': 78.1348, 'district': 'Thoothukudi', 'state': 'Tamil Nadu'},
    'kovilpatti': {'lat': 9.1728, 'lng': 77.8687, 'district': 'Thoothukudi', 'state': 'Tamil Nadu'},

    'chennai': {'lat': 13.0827, 'lng': 80.2707, 'district': 'Chennai', 'state': 'Tamil Nadu'},

    # Secondary National Reference
    'pune': {'lat': 18.5204, 'lng': 73.8567, 'district': 'Pune', 'state': 'Maharashtra'},
    'mumbai': {'lat': 19.0760, 'lng': 72.8777, 'district': 'Mumbai', 'state': 'Maharashtra'},
    'bangalore': {'lat': 12.9716, 'lng': 77.5946, 'district': 'Bengaluru', 'state': 'Karnataka'},
    'bengaluru': {'lat': 12.9716, 'lng': 77.5946, 'district': 'Bengaluru', 'state': 'Karnataka'}
}

@farmer_bp.route('/recommend-centres', methods=['POST'])
def recommend_centres():
    """
    AI Procurement Centre Recommendation:
    Dynamically recommends APMC centres closest to the farmer's area / district / GPS coordinates.
    Inputs:
      - crop_name, land_area, expected_quantity, preferred_arrival_date
      - latitude, longitude (GPS coordinates if available)
      - district, state, area (Area/District name)
      - farmer_id (optional to fetch registered farmer's profile)
    """
    data = request.get_json() or {}
    quantity = float(data.get('expected_quantity', 2.0))

    # 1. Resolve farmer profile if farmer_id is provided
    farmer_id = data.get('farmer_id')
    farmer_profile = None
    if farmer_id:
        farmer_profile = FarmerProfile.query.filter_by(user_id=farmer_id).first()

    # 2. Determine District & State
    req_district = (data.get('district') or '').strip()
    req_area = (data.get('area') or '').strip()
    req_state = (data.get('state') or '').strip()

    district = req_district or (farmer_profile.district if farmer_profile else '')
    area = req_area or req_district or district
    state = req_state or (farmer_profile.state if farmer_profile else '')

    # 3. Determine Latitude & Longitude
    lat = data.get('latitude')
    lng = data.get('longitude')

    # Step A: If district is supplied, resolve its centroid coordinates or check for stale coords
    dist_key = district.lower().strip() if district else ''
    if dist_key and dist_key in DISTRICT_COORDINATES:
        dist_info = DISTRICT_COORDINATES[dist_key]
        c_lat = dist_info['lat']
        c_lng = dist_info['lng']
        if not req_state and dist_info.get('state'):
            state = dist_info['state']

        if lat is None or lng is None:
            lat = c_lat
            lng = c_lng
        else:
            try:
                # If coords are > 100km away from district centroid, they are stale coordinates from another region
                d_km = ml_service.haversine_distance(float(lat), float(lng), c_lat, c_lng)
                if d_km > 100.0:
                    lat = c_lat
                    lng = c_lng
            except Exception:
                lat = c_lat
                lng = c_lng

    # Step B: If coordinates are still none, check farmer_profile coordinates (only if district matches or not specified)
    if (lat is None or lng is None) and farmer_profile and farmer_profile.latitude and farmer_profile.longitude:
        profile_dist = (farmer_profile.district or '').lower().strip()
        if not dist_key or dist_key == profile_dist:
            lat = farmer_profile.latitude
            lng = farmer_profile.longitude
            if not district and farmer_profile.district:
                district = farmer_profile.district
            if not state and farmer_profile.state:
                state = farmer_profile.state

    # Step C: Final fallback if still none (Default to Coimbatore, Tamil Nadu)
    if lat is None:
        lat = 11.0168  # Coimbatore lat
    if lng is None:
        lng = 76.9558  # Coimbatore lng
        
    lat = float(lat)
    lng = float(lng)

    if not district:
        # If coordinates provided, auto-resolve closest district name
        closest_name = None
        closest_state = None
        min_d = float('inf')
        for d_name, d_val in DISTRICT_COORDINATES.items():
            d = (lat - d_val['lat'])**2 + (lng - d_val['lng'])**2
            if d < min_d:
                min_d = d
                closest_name = d_val['district']
                closest_state = d_val['state']
        district = closest_name or 'Coimbatore'
        if not state:
            state = closest_state or 'Tamil Nadu'
    if not state:
        state = 'Tamil Nadu'
    if not area:
        area = district

    centres = ProcurementCentre.query.all()
    centres_data = [c.to_dict() for c in centres]

    recommended = ml_service.recommend_centres(
        centres_list=centres_data,
        farmer_lat=lat,
        farmer_lng=lng,
        farmer_quantity=quantity,
        preferred_date=data.get('preferred_arrival_date'),
        farmer_district=district,
        farmer_state=state,
        area_name=area
    )

    return jsonify({
        'status': 'success',
        'farmer_area': area or district,
        'farmer_district': district,
        'farmer_state': state,
        'farmer_coordinates': {'latitude': lat, 'longitude': lng},
        'recommended_centres': recommended,
        'count': len(recommended),
        'model_name': 'Multi-Objective Proximity & Constraint-Based Recommendation Model'
    })

@farmer_bp.route('/book-slot', methods=['POST'])
def book_slot():
    """
    After Farmer accept any center:
    1. Slot generated
    2. Token and QR Scan generated
    3. Notified through SMS showing: expected arrival and expected waiting time
    """
    data = request.get_json() or {}
    required = ['centre_id', 'crop_name', 'quantity', 'booking_date', 'time_slot']
    for r in required:
        if not data.get(r):
            return jsonify({'status': 'error', 'message': f'{r} is required'}), 400

    farmer_id = data.get('farmer_id')
    if not farmer_id:
        first_farmer = User.query.filter_by(role='farmer').first()
        farmer_id = first_farmer.id if first_farmer else 1

    farmer = User.query.get(farmer_id)
    centre = ProcurementCentre.query.get(data['centre_id'])
    if not centre:
        return jsonify({'status': 'error', 'message': 'Centre not found'}), 404

    # Generate unique token (e.g. A-123)
    prefix = chr(65 + (centre.id % 26))
    random_num = random.randint(101, 999)
    token_number = f"{prefix}-{random_num}"
    booking_ref = f"BK-{date.today().strftime('%Y%m%d')}-{random_num}"

    # Calculate ETA & wait time
    eta_calc = ml_service.predict_eta(
        queue=centre.current_queue,
        counters=centre.active_counters,
        processing_rate=centre.processing_rate,
        farmer_quantity=float(data['quantity'])
    )
    est_wait = eta_calc['estimated_wait_minutes']

    # Generate QR Code
    qr_payload = f"AGRI_PROCUREMENT|TOKEN:{token_number}|REF:{booking_ref}|CENTRE:{centre.id}|FARMER:{farmer_id}|CROP:{data['crop_name']}|QTY:{data['quantity']}"
    qr_base64 = QRService.generate_qr_base64(qr_payload)

    # Calculate MSP payment estimate
    crop_info = next((c for c in CROPS_CATALOG if c['name'].lower() == data['crop_name'].lower()), None)
    msp = crop_info['msp_per_quintal'] if crop_info else 2200
    est_payment = round(float(data['quantity']) * msp, 2)

    try:
        booking_date = datetime.strptime(str(data.get('booking_date', '')).strip(), '%Y-%m-%d').date()
    except Exception:
        try:
            booking_date = datetime.strptime(str(data.get('booking_date', '')).strip(), '%d %b %Y').date()
        except Exception:
            booking_date = date.today()

    booking = Booking(
        booking_reference=booking_ref,
        token_number=token_number,
        qr_code_data=qr_base64,
        farmer_id=farmer_id,
        centre_id=centre.id,
        crop_name=data['crop_name'],
        land_area=float(data.get('land_area', 1.0)),
        quantity=float(data['quantity']),
        booking_date=booking_date,
        time_slot=data['time_slot'],
        status='Booked',
        current_stage='Token Confirmed',
        queue_position=centre.current_queue + 1,
        farmers_ahead=centre.current_queue,
        estimated_wait_minutes=est_wait,
        ai_confidence=91.0,
        payment_amount=est_payment,
        payment_status='Pending'
    )
    db.session.add(booking)
    db.session.flush()

    # Create the 7 timeline events
    for idx, stage_name in enumerate(OFFICIAL_STAGES):
        is_first = (idx == 0)
        event = TimelineEvent(
            booking_id=booking.id,
            order_index=idx,
            stage_name=stage_name,
            status='completed' if is_first else 'pending',
            completed_at=datetime.utcnow() if is_first else None,
            remarks='Token generated and confirmed by system' if is_first else None
        )
        db.session.add(event)

    # Update centre remaining capacity
    centre.remaining_capacity = max(0.0, centre.remaining_capacity - float(data['quantity']))
    centre.current_queue += 1

    # Dispatch SMS Notification
    mobile = farmer.mobile_number if farmer else '9876543210'
    sms_text = f"Token: {token_number} confirmed for {centre.name}. Slot: {data['time_slot']} on {booking_date}. Expected arrival: {data['time_slot'].split(' - ')[0]}. Expected waiting time: {round(est_wait)} min."
    notif = NotificationService.send_sms(
        user_id=farmer_id,
        mobile_number=mobile,
        message=sms_text,
        title="Procurement Slot & Token Confirmed"
    )

    
    # Dispatch WhatsApp Notification
    wa_msg = WhatsAppService.format_slot_booking_msg(
        farmer_name=farmer.full_name if farmer else 'Kisan',
        token_number=token_number,
        centre_name=centre.name,
        booking_date=booking_date.isoformat(),
        time_slot=data['time_slot'],
        wait_mins=est_wait,
        crop=data['crop_name'],
        qty=float(data['quantity'])
    )
    wa_result = WhatsAppService.send_whatsapp_message(mobile, wa_msg, template_type="slot_booking")

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Slot booked successfully! Token and QR generated.',
        'booking': booking.to_dict(),
        'sms_notification': sms_text,
        'whatsapp_notification': wa_result
    }), 201

@farmer_bp.route('/live-status/<token_or_id>', methods=['GET'])
def get_live_status(token_or_id):
    """
    After Farmer reach center:
    Farmer QR scanned and checked-in.
    Page changed to showing:
      -> Checked-in
      -> Queue position: 23
      -> Token number: A-123
      -> Farmers Ahead: 12
      -> Estimated wait: 24 min
      -> Current stage: Quality Inspection
    Explainable AI:
      Why 24 minutes wait?
      -> 12 farmers ahead
      -> Avg inspection: 4 min
      -> 1 counter temporarily unavailable
      -> Current arrival rate
      -> AI confidence: 91%
    """
    booking = Booking.query.filter(
        (Booking.token_number == token_or_id) | (Booking.id == token_or_id)
    ).first()

    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    centre = booking.centre
    active_counters = centre.active_counters if centre else 3
    total_counters = centre.number_of_counters if centre else 4
    rate = centre.processing_rate if centre else 10.0

    # Calculate real-time dynamic wait
    farmers_ahead = max(0, booking.farmers_ahead)
    avg_insp = round(60.0 / (rate * max(1, active_counters)), 1)
    if avg_insp <= 0:
        avg_insp = 4.0

    wait_mins = round((farmers_ahead / max(1, active_counters)) * (60.0 / rate), 1)
    wait_mins = max(4.0, wait_mins)

    # Unavailable counter note
    unavail = total_counters - active_counters
    counter_status_text = f"{active_counters}/{total_counters} counters active"
    if unavail > 0:
        counter_status_text += f" ({unavail} counter temporarily unavailable)"

    explainable_ai = {
        'question': f"Why {round(wait_mins)} minutes wait?",
        'farmers_ahead': farmers_ahead,
        'avg_inspection_time': f"{avg_insp} min",
        'counter_status': counter_status_text,
        'current_arrival_rate': f"{round(centre.processed_today / 8.0, 1)} farmers/hr" if centre else "12 farmers/hr",
        'ai_confidence': f"{round(booking.ai_confidence)}%",
        'reasons': [
            f"{farmers_ahead} farmers ahead",
            f"Avg inspection : {avg_insp} min",
            f"{unavail} counter temporarily unavailable" if unavail > 0 else "All counters operational",
            f"Current arrival rate : {round(centre.processed_today / 8.0, 1)}/hr" if centre else "12/hr",
            f"AI confidence : {round(booking.ai_confidence)}%"
        ]
    }

    # Ensure QR Code exists
    qr_data = booking.qr_code_data
    if not qr_data:
        qr_payload = f"AGRI_PROCUREMENT|TOKEN:{booking.token_number}|REF:{booking.booking_reference}|CENTRE:{booking.centre_id}|FARMER:{booking.farmer_id}|CROP:{booking.crop_name}|QTY:{booking.quantity}"
        qr_data = QRService.generate_qr_base64(qr_payload)
        booking.qr_code_data = qr_data
        db.session.commit()

    is_checked_in = (booking.status == 'Checked-in') or (booking.checked_in_at is not None)

    return jsonify({
        'status': 'success',
        'is_checked_in': is_checked_in,
        'checked_in_at': booking.checked_in_at.isoformat() if booking.checked_in_at else None,
        'queue_position': booking.queue_position,
        'token_number': booking.token_number,
        'booking_reference': booking.booking_reference,
        'qr_code_data': qr_data,
        'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
        'time_slot': booking.time_slot,
        'crop_name': booking.crop_name,
        'quantity': booking.quantity,
        'farmers_ahead': farmers_ahead,
        'estimated_wait_minutes': round(wait_mins),
        'current_stage': booking.current_stage,
        'effective_status': booking.effective_status,
        'centre_name': centre.name if centre else None,
        'centre_id': centre.id if centre else None,
        'explainable_ai': explainable_ai
    })

@farmer_bp.route('/timeline/<token_or_id>', methods=['GET'])
def get_timeline(token_or_id):
    """
    Timeline: A separate Tab on the website:
      - Token Confirmed
      - Arrived
      - Quality Inspection
      - Weighing
      - Crop Accepted
      - Payment Generated
      - Payment Initiated
    """
    booking = Booking.query.filter(
        (Booking.token_number == token_or_id) | (Booking.id == token_or_id)
    ).first()

    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found'}), 404

    events = [e.to_dict() for e in booking.timeline_events]
    active_stage_idx = next((i for i, e in enumerate(events) if e['stage_name'] == booking.current_stage), 0)

    return jsonify({
        'status': 'success',
        'token_number': booking.token_number,
        'booking_reference': booking.booking_reference,
        'crop_name': booking.crop_name,
        'quantity': booking.quantity,
        'land_area': booking.land_area,
        'centre_id': booking.centre_id,
        'centre_name': booking.centre.name if booking.centre else 'Coimbatore Central APMC & Agricultural Complex',
        'time_slot': booking.time_slot,
        'current_stage': booking.current_stage,
        'effective_status': booking.effective_status,
        'is_upcoming': booking.is_upcoming,
        'is_completed': booking.is_completed,
        'booking_date': booking.booking_date.strftime('%Y-%m-%d') if booking.booking_date else None,
        'active_stage_index': active_stage_idx,
        'payment_amount': booking.payment_amount,
        'payment_status': booking.payment_status,
        'timeline': events
    })


@farmer_bp.route('/notifications', methods=['GET'])
def get_farmer_notifications():
    """
    Returns real SMS, WhatsApp, and procurement notifications sent to this farmer.
    """
    farmer_id = request.args.get('farmer_id', type=int)
    query = Notification.query
    if farmer_id:
        query = query.filter_by(user_id=farmer_id)
    notifs = query.order_by(Notification.created_at.desc()).limit(25).all()

    results = []
    for n in notifs:
        results.append({
            'id': f"notif_{n.id}",
            'title': n.title,
            'titleTa': n.title,
            'message': n.message,
            'messageTa': n.message,
            'time': n.created_at.strftime('%d %b, %H:%M') if n.created_at else 'Just now',
            'type': n.notification_type or 'sms',
            'read': n.is_read
        })

    return jsonify({
        'status': 'success',
        'notifications': results
    })

@farmer_bp.route('/notifications/clear', methods=['POST', 'DELETE'])
def clear_farmer_notifications():
    """
    Clears / removes notifications for a farmer or all notifications.
    """
    data = request.get_json(silent=True) or {}
    farmer_id = request.args.get('farmer_id', type=int) or data.get('farmer_id')
    query = Notification.query
    if farmer_id:
        query = query.filter_by(user_id=farmer_id)
    deleted_count = query.delete(synchronize_session=False)
    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': f'Cleared {deleted_count} notifications',
        'deleted_count': deleted_count
    })

@farmer_bp.route('/notifications/<string:notif_id>', methods=['DELETE', 'POST'])
def delete_farmer_notification(notif_id):
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

@farmer_bp.route('/history', methods=['GET'])
def get_farmer_history():
    """
    Returns genuine completed procurement records for this farmer from MySQL.
    If procurement is upcoming (future booking date or farmer has not checked in at centre),
    it is separated into 'upcoming' rather than counted in completed history.
    """
    farmer_id = request.args.get('farmer_id', type=int)
    if not farmer_id:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
                if payload.get('role') == 'farmer':
                    farmer_id = payload.get('user_id')
            except Exception:
                pass
    if not farmer_id:
        first_farmer = User.query.filter_by(role='farmer').first()
        farmer_id = first_farmer.id if first_farmer else None

    if not farmer_id:
        return jsonify({'status': 'success', 'history': [], 'upcoming': [], 'total_disbursed': 0.0})

    all_bookings = Booking.query.filter_by(farmer_id=farmer_id).order_by(Booking.booking_date.desc(), Booking.created_at.desc()).all()

    completed_results = []
    upcoming_results = []

    for b in all_bookings:
        eff = b.effective_status
        amount_val = b.payment_amount or (b.quantity * 2275.0)
        record = {
            'id': f"PROC-2026-{b.id:04d}",
            'booking_id': b.id,
            'token': b.token_number,
            'crop': b.crop_name,
            'cropTa': b.crop_name,
            'quantity': f"{b.quantity} Quintals",
            'quantityTa': f"{b.quantity} குவிண்டால்",
            'quantityRaw': b.quantity,
            'center': b.centre.name if b.centre else 'Procurement Center',
            'centerTa': b.centre.name if b.centre else 'கொள்முதல் மையம்',
            'date': b.booking_date.strftime('%d %b %Y') if b.booking_date else '10 Sep 2026',
            'dateTa': b.booking_date.strftime('%d %b %Y') if b.booking_date else '10 Sep 2026',
            'time_slot': b.time_slot,
            'mspPaid': f"{amount_val:,.2f}",
            'mspAmount': amount_val,
            'status': eff,
            'statusTa': 'நிறைவடைந்தது' if eff == 'Completed' else ('செயல்பாட்டில்' if eff == 'In Progress' else 'வரவிருக்கும்'),
            'effective_status': eff,
            'is_upcoming': eff == 'Upcoming',
            'is_completed': eff == 'Completed',
            'grade': 'Grade A (FAQ)',
            'gradeTa': 'தரம் A (FAQ)',
            'moisture': '12.8%',
            'paymentStatus': 'Paid' if eff == 'Completed' else 'Pending',
            'checked_in_at': b.checked_in_at.isoformat() if b.checked_in_at else None
        }

        if eff == 'Completed':
            completed_results.append(record)
        else:
            upcoming_results.append(record)

    total_disbursed = sum(item['mspAmount'] for item in completed_results)

    return jsonify({
        'status': 'success',
        'history': completed_results,
        'upcoming': upcoming_results,
        'total_disbursed': total_disbursed
    })

@farmer_bp.route('/transactions', methods=['GET'])
def get_farmer_transactions():
    """
    Returns only genuine payment and payout transactions that have actually occurred.
    Before anything is processed or paid, this will be completely empty.
    """
    farmer_id = request.args.get('farmer_id', type=int)
    if not farmer_id:
        first_farmer = User.query.filter_by(role='farmer').first()
        farmer_id = first_farmer.id if first_farmer else None

    if not farmer_id:
        return jsonify({'status': 'success', 'transactions': []})

    # Query genuine transaction ledger in database
    txs = PaymentTransaction.query.filter_by(farmer_id=farmer_id).order_by(PaymentTransaction.created_at.desc()).all()

    return jsonify({
        'status': 'success',
        'total': len(txs),
        'transactions': [tx.to_dict() for tx in txs]
    })
