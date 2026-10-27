from datetime import datetime
from database import db

class PaymentTransaction(db.Model):
    __tablename__ = 'payment_transactions'

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(100), unique=True, nullable=False)
    order_id = db.Column(db.String(100), nullable=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=True)
    transaction_type = db.Column(db.String(50), nullable=False)  # 'fee' | 'payout'
    description = db.Column(db.String(255), nullable=False)
    description_ta = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(100), default='Razorpay UPI')
    payment_method_ta = db.Column(db.String(100), default='ரேசர்பே UPI')
    status = db.Column(db.String(50), default='Success')
    status_ta = db.Column(db.String(50), default='வெற்றி')
    is_credit = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    farmer = db.relationship('User', backref=db.backref('payment_transactions', lazy=True))
    booking = db.relationship('Booking', backref=db.backref('transactions', lazy=True))

    def to_dict(self):
        return {
            'id': self.transaction_id,
            'orderId': self.order_id,
            'type': self.description,
            'typeTa': self.description_ta or self.description,
            'amount': f"{self.amount:,.2f}",
            'method': self.payment_method,
            'methodTa': self.payment_method_ta or self.payment_method,
            'date': self.created_at.strftime('%d %b %Y, %H:%M') if self.created_at else 'Just now',
            'status': self.status,
            'statusTa': self.status_ta or self.status,
            'credit': self.is_credit
        }
