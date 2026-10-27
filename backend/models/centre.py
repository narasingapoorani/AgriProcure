from datetime import datetime
from database import db

class ProcurementCentre(db.Model):
    __tablename__ = 'procurement_centres'

    # Identification & Location
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    district = db.Column(db.String(100), nullable=False)
    taluk = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), default='Tamil Nadu', nullable=False)
    market = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(255), nullable=True)
    contact_number = db.Column(db.String(30), nullable=True)

    # Crop Acceptance & Capacity
    accepted_crops = db.Column(db.String(255), default='Paddy, Wheat, Maize, Cotton, Pulses, Gram')
    total_capacity = db.Column(db.Float, default=500.0)             # in Quintals
    remaining_capacity = db.Column(db.Float, default=300.0)         # available_capacity

    # Queue & Waiting Time Metrics
    current_queue = db.Column(db.Integer, default=10)               # count of farmers in queue
    active_counters = db.Column(db.Integer, default=2)
    number_of_counters = db.Column(db.Integer, default=3)
    avg_processing_time_min = db.Column(db.Float, default=8.0)      # min per farmer
    processing_rate = db.Column(db.Float, default=15.0)             # processing_rate_per_hour
    estimated_wait_time_min = db.Column(db.Float, default=45.0)     # est. wait time in minutes

    # Operations & Slots
    operating_hours = db.Column(db.String(50), default='08:00 AM - 05:00 PM')
    status = db.Column(db.String(30), default='OPEN')               # OPEN, BUSY, OVERLOADED
    accepting_bookings = db.Column(db.Boolean, default=True)

    slot_duration_min = db.Column(db.Integer, default=60)
    total_slots_today = db.Column(db.Integer, default=24)
    available_slots_today = db.Column(db.Integer, default=18)
    next_available_slot = db.Column(db.String(50), default='08:00 - 09:00')

    today_booked = db.Column(db.Integer, default=6)
    today_completed = db.Column(db.Integer, default=12)
    today_cancelled = db.Column(db.Integer, default=0)
    today_rejected = db.Column(db.Integer, default=0)

    # Facilities & Services
    quality_check_available = db.Column(db.Boolean, default=True)
    weighing_available = db.Column(db.Boolean, default=True)
    storage_available = db.Column(db.Boolean, default=True)
    payment_available = db.Column(db.Boolean, default=True)

    # Pricing & Market Intelligence
    current_price_per_kg = db.Column(db.Float, default=22.75)       # MSP in Rs / kg
    last_price_update = db.Column(db.DateTime, default=datetime.utcnow)

    # Weather Intelligence
    weather_status = db.Column(db.String(50), default='Clear Sky')
    weather_risk = db.Column(db.String(20), default='LOW')          # LOW, MEDIUM, HIGH

    # Targets & Progress
    daily_target = db.Column(db.Float, default=300.0)               # target in Quintals
    processed_today = db.Column(db.Float, default=120.0)            # daily_procured_quantity
    daily_processing_capacity = db.Column(db.Float, default=350.0)
    staff_available = db.Column(db.Integer, default=6)
    avg_quantity_per_farmer = db.Column(db.Float, default=2.5)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings = db.relationship('Booking', backref='centre', lazy=True)

    def to_dict(self):
        return {
            # Canonical IDs & Names
            'id': self.id,
            'centre_id': self.id,
            'code': self.code,
            'centre_code': self.code,
            'name': self.name,
            'centre_name': self.name,
            'district': self.district,
            'taluk': self.taluk or self.district,
            'state': self.state,
            'market': self.market or self.taluk or self.district,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address or f"{self.name}, {self.taluk or self.district}, {self.district}, {self.state}",
            'contact_number': self.contact_number or '+91 422 2300100',

            # Crops & Capacity
            'accepted_crops': self.accepted_crops,
            'total_capacity': self.total_capacity,
            'remaining_capacity': self.remaining_capacity,
            'available_capacity': self.remaining_capacity,

            # Queue & Flow
            'current_queue': self.current_queue,
            'active_counters': self.active_counters,
            'number_of_counters': self.number_of_counters,
            'avg_processing_time_min': self.avg_processing_time_min,
            'processing_rate': self.processing_rate,
            'processing_rate_per_hour': self.processing_rate,
            'estimated_wait_time_min': self.estimated_wait_time_min,

            # Operations & Slots
            'operating_hours': self.operating_hours,
            'status': self.status,
            'accepting_bookings': self.accepting_bookings,
            'slot_duration_min': self.slot_duration_min,
            'total_slots_today': self.total_slots_today,
            'available_slots_today': self.available_slots_today,
            'next_available_slot': self.next_available_slot,
            'today_booked': self.today_booked,
            'today_completed': self.today_completed,
            'today_cancelled': self.today_cancelled,
            'today_rejected': self.today_rejected,

            # Facilities
            'quality_check_available': self.quality_check_available,
            'weighing_available': self.weighing_available,
            'storage_available': self.storage_available,
            'payment_available': self.payment_available,

            # Price & Weather
            'current_price_per_kg': self.current_price_per_kg,
            'last_price_update': self.last_price_update.isoformat() if self.last_price_update else None,
            'weather_status': self.weather_status,
            'weather_risk': self.weather_risk,

            # Targets
            'daily_target': self.daily_target,
            'processed_today': self.processed_today,
            'daily_procured_quantity': self.processed_today,
            'daily_processing_capacity': self.daily_processing_capacity,
            'staff_available': self.staff_available,
            'avg_quantity_per_farmer': self.avg_quantity_per_farmer,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
