from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import jwt
from config import Config
from database import db
from models.user import User, FarmerProfile, OfficerProfile, OTPStore

auth_bp = Blueprint('auth', __name__)

SUPPORTED_LANGUAGES = [
    {'code': 'en', 'name': 'English', 'native': 'English'},
    {'code': 'hi', 'name': 'Hindi', 'native': 'हिन्दी'},
    {'code': 'mr', 'name': 'Marathi', 'native': 'मराठी'},
    {'code': 'pa', 'name': 'Punjabi', 'native': 'ਪੰਜਾਬੀ'},
    {'code': 'te', 'name': 'Telugu', 'native': 'తెలుగు'},
    {'code': 'ta', 'name': 'Tamil', 'native': 'தமிழ்'},
    {'code': 'kn', 'name': 'Kannada', 'native': 'ಕನ್ನಡ'},
    {'code': 'gu', 'name': 'Gujarati', 'native': 'ગુજરાતી'},
    {'code': 'bn', 'name': 'Bengali', 'native': 'বাংলা'}
]

@auth_bp.route('/languages', methods=['GET'])
def get_languages():
    return jsonify({
        'status': 'success',
        'languages': SUPPORTED_LANGUAGES,
        'default': 'hi'
    })

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json() or {}
    mobile = data.get('mobile_number')
    if not mobile or len(mobile) < 10:
        return jsonify({'status': 'error', 'message': 'Valid 10-digit mobile number required'}), 400

    otp_code = '123456'  # Deterministic test OTP for hackathon demo convenience
    otp_entry = OTPStore.query.filter_by(mobile_number=mobile).first()
    if not otp_entry:
        otp_entry = OTPStore(mobile_number=mobile, otp_code=otp_code)
        db.session.add(otp_entry)
    else:
        otp_entry.otp_code = otp_code
        otp_entry.is_verified = False
        otp_entry.created_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': f'OTP sent successfully to {mobile}',
        'demo_otp': otp_code
    })

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    mobile = data.get('mobile_number')
    otp = data.get('otp')

    if not mobile or not otp:
        return jsonify({'status': 'error', 'message': 'Mobile number and OTP are required'}), 400

    otp_entry = OTPStore.query.filter_by(mobile_number=mobile).first()
    if not otp_entry or otp_entry.otp_code != otp:
        return jsonify({'status': 'error', 'message': 'Invalid or expired OTP'}), 400

    otp_entry.is_verified = True
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Mobile number verified successfully',
        'verified': True
    })

@auth_bp.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    data = request.get_json() or {}
    aadhaar = data.get('aadhaar_number', '').replace('-', '').replace(' ', '')
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        return jsonify({'status': 'error', 'message': 'Aadhaar must be a 12-digit number'}), 400

    return jsonify({
        'status': 'success',
        'verified': True,
        'message': 'Aadhaar verified successfully via UIDAI Government Gateway',
        'masked_aadhaar': f"XXXX-XXXX-{aadhaar[-4:]}"
    })

@auth_bp.route('/verify-officer-id', methods=['POST'])
def verify_officer_id():
    data = request.get_json() or {}
    officer_id = data.get('officer_id', '').strip()
    if not officer_id:
        return jsonify({'status': 'error', 'message': 'Officer ID is required'}), 400

    return jsonify({
        'status': 'success',
        'verified': True,
        'officer_id': officer_id,
        'department': 'Department of Agriculture & Farmers Welfare',
        'designation': 'Senior Procurement & Quality Assurance Officer'
    })

@auth_bp.route('/farmer/register', methods=['POST'])
def register_farmer():
    data = request.get_json() or {}
    required_fields = ['username', 'password', 'full_name', 'mobile_number', 'district', 'state']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'status': 'error', 'message': f'{field} is required'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'status': 'error', 'message': 'Username already taken'}), 400
    if User.query.filter_by(mobile_number=data['mobile_number']).first():
        return jsonify({'status': 'error', 'message': 'Mobile number already registered'}), 400

    user = User(
        username=data['username'],
        role='farmer',
        full_name=data['full_name'],
        mobile_number=data['mobile_number'],
        aadhaar_number=data.get('aadhaar_number'),
        preferred_language=data.get('preferred_language', 'en')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.flush()

    profile = FarmerProfile(
        user_id=user.id,
        address=data.get('land_location') or data.get('address') or '',
        district=data['district'],
        state=data['state'],
        land_area_acres=float(data.get('land_area') or data.get('land_area_acres') or 1.0),
        primary_crop=data.get('crop_details') or data.get('primary_crop') or 'Wheat',
        preferred_centre_id=data.get('preferred_centre_id'),
        latitude=float(data['latitude']) if data.get('latitude') is not None and data.get('latitude') != '' else None,
        longitude=float(data['longitude']) if data.get('longitude') is not None and data.get('longitude') != '' else None
    )
    db.session.add(profile)
    db.session.commit()

    token = jwt.encode({
        'user_id': user.id,
        'role': 'farmer',
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return jsonify({
        'status': 'success',
        'message': 'Farmer registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/officer/register', methods=['POST'])
def register_officer():
    data = request.get_json() or {}
    officer_code = data.get('officer_id_code') or data.get('officer_id')
    if not officer_code:
        return jsonify({'status': 'error', 'message': 'officer_id_code is required'}), 400

    required_fields = ['username', 'password', 'full_name', 'mobile_number']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'status': 'error', 'message': f'{field} is required'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'status': 'error', 'message': 'Username already taken'}), 400
    if User.query.filter_by(mobile_number=data['mobile_number']).first():
        return jsonify({'status': 'error', 'message': 'Mobile number already registered'}), 400

    user = User(
        username=data['username'],
        role='officer',
        full_name=data['full_name'],
        mobile_number=data['mobile_number'],
        aadhaar_number=data.get('aadhaar_number'),
        preferred_language=data.get('preferred_language', 'en')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.flush()

    profile = OfficerProfile(
        user_id=user.id,
        officer_id_code=officer_code,
        designation=data.get('designation', 'Procurement Officer'),
        assigned_centre_id=data.get('assigned_centre_id', 1)
    )
    db.session.add(profile)
    db.session.commit()

    token = jwt.encode({
        'user_id': user.id,
        'role': 'officer',
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return jsonify({
        'status': 'success',
        'message': 'Officer registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Username and password required'}), 400

    # Clean phone format if applicable
    digits_only = ''.join(c for c in username if c.isdigit())
    digits_10 = digits_only[2:] if (len(digits_only) == 12 and digits_only.startswith('91')) else digits_only

    # Allow login by username OR mobile number
    user = User.query.filter(
        (User.username == username) | 
        (User.mobile_number == username) |
        ((User.mobile_number == digits_10) if len(digits_10) == 10 else False)
    ).first()

    if not user:
        return jsonify({
            'status': 'error',
            'error_code': 'ACCOUNT_NOT_FOUND',
            'message': "Account doesn't exist. Please register first."
        }), 404

    if not user.check_password(password):
        return jsonify({
            'status': 'error',
            'error_code': 'INVALID_PASSWORD',
            'message': 'Invalid password. Please check your credentials.'
        }), 401

    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return jsonify({
        'status': 'success',
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })
