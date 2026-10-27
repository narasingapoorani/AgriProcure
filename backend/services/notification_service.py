from datetime import datetime
from database import db
from models.notification import Notification

class NotificationService:
    @staticmethod
    def send_sms(user_id: int, mobile_number: str, message: str, title: str = "Agri AI Notification") -> Notification:
        """
        Simulates SMS dispatch to farmer or officer, recording in database.
        Format matches: 'Notified through SMS, showing: expected arrival and expected waiting time.'
        """
        notif = Notification(
            user_id=user_id,
            mobile_number=mobile_number,
            title=title,
            message=message,
            notification_type='sms',
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.session.add(notif)
        db.session.commit()
        print(f"\n[SMS DISPATCHED] To: {mobile_number} | Title: {title} | Message: {message}\n")
        return notif
