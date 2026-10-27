from datetime import datetime
from database import db

# The 7 Official Stages from user flow diagram:
OFFICIAL_STAGES = [
    'Token Confirmed',
    'Arrived',
    'Quality Inspection',
    'Weighing',
    'Crop Accepted',
    'Payment Generated',
    'Payment Initiated'
]

class TimelineEvent(db.Model):
    __tablename__ = 'timeline_events'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    stage_name = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')  # completed, in_progress, pending
    completed_at = db.Column(db.DateTime, nullable=True)
    remarks = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_index': self.order_index,
            'stage_name': self.stage_name,
            'status': self.status,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'remarks': self.remarks
        }
