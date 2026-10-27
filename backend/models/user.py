from datetime import datetime
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'farmer' or 'officer'
    full_name = db.Column(db.String(120), nullable=False)
    mobile_number = db.Column(db.String(15), unique=True, nullable=False)
    aadhaar_number = db.Column(db.String(20), nullable=True)
    preferred_language = db.Column(db.String(30), default='en')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    farmer_profile = db.relationship('FarmerProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    officer_profile = db.relationship('OfficerProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    bookings = db.relationship('Booking', backref='farmer', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        data = {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'full_name': self.full_name,
            'name': self.full_name,
            'mobile_number': self.mobile_number,
            'mobile': self.mobile_number,
            'phone': self.mobile_number,
            'aadhaar_number': self.aadhaar_number,
            'aadhaar': self.aadhaar_number,
            'preferred_language': self.preferred_language,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if self.role == 'farmer' and self.farmer_profile:
            fp = self.farmer_profile.to_dict()
            data['farmer_profile'] = fp
            data['district'] = fp.get('district')
            data['state'] = fp.get('state')
            data['land_area'] = fp.get('land_area_acres')
            data['landArea'] = fp.get('land_area_acres')
            data['land_area_acres'] = fp.get('land_area_acres')
            data['primary_crop'] = fp.get('primary_crop')
            data['cropDetails'] = fp.get('primary_crop')
            data['address'] = fp.get('address')
            data['landLocation'] = fp.get('address')
            data['latitude'] = fp.get('latitude')
            data['longitude'] = fp.get('longitude')
        elif self.role == 'officer' and self.officer_profile:
            op = self.officer_profile.to_dict()
            data['officer_profile'] = op
            data['officer_id_code'] = op.get('officer_id_code')
            data['officerId'] = op.get('officer_id_code')
            data['officer_id'] = op.get('officer_id_code')
            data['designation'] = op.get('designation')
            data['assigned_centre_id'] = op.get('assigned_centre_id')
        return data


class FarmerProfile(db.Model):
    __tablename__ = 'farmer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    land_area_acres = db.Column(db.Float, default=1.0)
    primary_crop = db.Column(db.String(100), nullable=True)
    preferred_centre_id = db.Column(db.Integer, db.ForeignKey('procurement_centres.id'), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'address': self.address,
            'district': self.district,
            'state': self.state,
            'land_area_acres': self.land_area_acres,
            'primary_crop': self.primary_crop,
            'preferred_centre_id': self.preferred_centre_id,
            'latitude': self.latitude,
            'longitude': self.longitude
        }


class OfficerProfile(db.Model):
    __tablename__ = 'officer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    officer_id_code = db.Column(db.String(50), unique=True, nullable=False)
    designation = db.Column(db.String(100), default='Procurement Officer')
    assigned_centre_id = db.Column(db.Integer, db.ForeignKey('procurement_centres.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'officer_id_code': self.officer_id_code,
            'designation': self.designation,
            'assigned_centre_id': self.assigned_centre_id
        }


class OTPStore(db.Model):
    __tablename__ = 'otp_store'

    id = db.Column(db.Integer, primary_key=True)
    mobile_number = db.Column(db.String(15), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    purpose = db.Column(db.String(50), default='register')
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
