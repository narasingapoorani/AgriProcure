from datetime import datetime, date
from database import db

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(50), unique=True, nullable=False)
    token_number = db.Column(db.String(20), unique=True, nullable=False)  # e.g., 'A-123'
    qr_code_data = db.Column(db.Text, nullable=True)                     # Base64 data URL
    
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    centre_id = db.Column(db.Integer, db.ForeignKey('procurement_centres.id'), nullable=False)
    
    crop_name = db.Column(db.String(100), nullable=False)
    land_area = db.Column(db.Float, default=1.0)
    expected_harvest_date = db.Column(db.Date, nullable=True)
    quantity = db.Column(db.Float, nullable=False)                        # in Quintals / Tonnes
    
    booking_date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)                  # e.g., '09:00 - 10:00'
    
    status = db.Column(db.String(30), default='Booked')                   # Booked, Checked-in, Completed, Shifted, Cancelled
    current_stage = db.Column(db.String(50), default='Token Confirmed')  
    # 7 Stages: Token Confirmed, Arrived, Quality Inspection, Weighing, Crop Accepted, Payment Generated, Payment Initiated
    
    queue_position = db.Column(db.Integer, default=0)
    farmers_ahead = db.Column(db.Integer, default=0)
    estimated_wait_minutes = db.Column(db.Float, default=0.0)
    ai_confidence = db.Column(db.Float, default=91.0)
    
    # Financial details
    payment_amount = db.Column(db.Float, default=0.0)
    payment_status = db.Column(db.String(30), default='Pending')          # Pending, Initiated, Success
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    checked_in_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    timeline_events = db.relationship('TimelineEvent', backref='booking', lazy=True, cascade="all, delete-orphan", order_by="TimelineEvent.order_index")

    @property
    def effective_status(self):
        """
        Dynamically evaluates procurement status based on current date and centre check-in:
        - If booking_date > date.today(): Strictly 'Upcoming'.
        - If booking_date <= date.today():
            - If farmer went to centre (checked_in_at is not None or status in ['Checked-in', 'Completed'] or current_stage != 'Token Confirmed'):
                - If all stages completed (status == 'Completed' or current_stage == 'Payment Initiated' or payment_status in ['Success', 'Completed']):
                    -> 'Completed'
                - Else:
                    -> 'In Progress'
            - Else (farmer has not yet checked in at centre):
                -> 'Upcoming'
        """
        today = date.today()
        b_date = self.booking_date
        if isinstance(b_date, str):
            try:
                b_date = datetime.strptime(b_date, '%Y-%m-%d').date()
            except Exception:
                b_date = today

        # Future booking dates are strictly Upcoming
        if b_date and b_date > today:
            return 'Upcoming'

        # Has farmer actually arrived and checked in at the centre?
        has_visited_centre = (self.checked_in_at is not None) or (self.status == 'Checked-in') or (self.current_stage and self.current_stage != 'Token Confirmed')

        if not has_visited_centre:
            return 'Upcoming'

        # If arrived, did they complete the full procurement lifecycle?
        is_stage_done = self.current_stage in ['Payment Initiated', 'Payment Completed']
        is_paid = self.payment_status in ['Success', 'Completed']
        if (self.status == 'Completed' or is_stage_done or is_paid) and has_visited_centre:
            return 'Completed'

        return 'In Progress'

    @property
    def is_upcoming(self):
        return self.effective_status == 'Upcoming'

    @property
    def is_completed(self):
        return self.effective_status == 'Completed'

    @property
    def is_in_progress(self):
        return self.effective_status == 'In Progress'

    def to_dict(self):
        eff_status = self.effective_status
        return {
            'id': self.id,
            'booking_reference': self.booking_reference,
            'token_number': self.token_number,
            'qr_code_data': self.qr_code_data,
            'farmer_id': self.farmer_id,
            'farmer_name': self.farmer.full_name if self.farmer else None,
            'centre_id': self.centre_id,
            'centre_name': self.centre.name if self.centre else None,
            'crop_name': self.crop_name,
            'land_area': self.land_area,
            'expected_harvest_date': self.expected_harvest_date.isoformat() if self.expected_harvest_date else None,
            'quantity': self.quantity,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'time_slot': self.time_slot,
            'status': eff_status,
            'original_status': self.status,
            'effective_status': eff_status,
            'is_upcoming': eff_status == 'Upcoming',
            'is_completed': eff_status == 'Completed',
            'is_in_progress': eff_status == 'In Progress',
            'current_stage': self.current_stage if eff_status != 'Upcoming' else 'Token Confirmed',
            'queue_position': self.queue_position,
            'farmers_ahead': self.farmers_ahead,
            'estimated_wait_minutes': round(self.estimated_wait_minutes, 1),
            'ai_confidence': self.ai_confidence,
            'payment_amount': self.payment_amount,
            'payment_status': self.payment_status if eff_status == 'Completed' else 'Pending',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None,
            'timeline': [e.to_dict() for e in self.timeline_events]
        }
