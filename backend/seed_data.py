from datetime import datetime, date, timedelta
from app import create_app
from database import db
from models.user import User, FarmerProfile, OfficerProfile
from models.centre import ProcurementCentre
from models.booking import Booking
from models.timeline import TimelineEvent, OFFICIAL_STAGES
from models.notification import Notification
from services.qr_service import QRService

def seed_database():
    app = create_app()
    with app.app_context():
        print("[Seed] Dropping and recreating tables...")
        db.create_all()

        # Check if already seeded
        if ProcurementCentre.query.first():
            print("[Seed] Database already contains records.")
            return

        print("[Seed] Seeding realistic APMC Procurement Centres...")
        centres_data = [
            {
                'name': 'Coimbatore Central APMC & Agricultural Complex',
                'code': 'TN-CBE-01',
                'district': 'Coimbatore',
                'state': 'Tamil Nadu',
                'market': 'Coimbatore',
                'latitude': 11.0168,
                'longitude': 76.9558,
                'total_capacity': 1200.0,
                'remaining_capacity': 750.0,
                'current_queue': 23,
                'number_of_counters': 4,
                'active_counters': 3,
                'staff_available': 8,
                'processing_rate': 10.0,
                'daily_processing_capacity': 350.0,
                'processed_today': 140.0,
                'avg_quantity_per_farmer': 2.0,
                'status': 'Active'
            },
            {
                'name': 'Pune APMC Hadapsar Terminal Market',
                'code': 'MH-PUN-02',
                'district': 'Pune',
                'state': 'Maharashtra',
                'market': 'Pune',
                'latitude': 18.5204,
                'longitude': 73.8567,
                'total_capacity': 1500.0,
                'remaining_capacity': 1100.0,
                'current_queue': 12,
                'number_of_counters': 5,
                'active_counters': 5,
                'staff_available': 10,
                'processing_rate': 12.0,
                'daily_processing_capacity': 480.0,
                'processed_today': 180.0,
                'avg_quantity_per_farmer': 2.5,
                'status': 'Active'
            },
            {
                'name': 'Amravati Grain & Cotton APMC Sub-Centre',
                'code': 'MH-AMR-03',
                'district': 'Amravati',
                'state': 'Maharashtra',
                'market': 'Amravati',
                'latitude': 20.9374,
                'longitude': 77.7796,
                'total_capacity': 800.0,
                'remaining_capacity': 280.0,
                'current_queue': 42,
                'number_of_counters': 3,
                'active_counters': 2,
                'staff_available': 5,
                'processing_rate': 8.0,
                'daily_processing_capacity': 200.0,
                'processed_today': 95.0,
                'avg_quantity_per_farmer': 1.8,
                'status': 'Busy'
            },
            {
                'name': 'Nagpur Kalmeshwar Agricultural Hub',
                'code': 'MH-NGP-04',
                'district': 'Nagpur',
                'state': 'Maharashtra',
                'market': 'Nagpur',
                'latitude': 21.1458,
                'longitude': 79.0882,
                'total_capacity': 1800.0,
                'remaining_capacity': 1400.0,
                'current_queue': 18,
                'number_of_counters': 6,
                'active_counters': 5,
                'staff_available': 12,
                'processing_rate': 14.0,
                'daily_processing_capacity': 600.0,
                'processed_today': 220.0,
                'avg_quantity_per_farmer': 2.2,
                'status': 'Active'
            },
            {
                'name': 'Kolhapur Sugarcane & Grain Mandi',
                'code': 'MH-KLP-05',
                'district': 'Kolhapur',
                'state': 'Maharashtra',
                'market': 'Kolhapur',
                'latitude': 16.7050,
                'longitude': 74.2433,
                'total_capacity': 950.0,
                'remaining_capacity': 620.0,
                'current_queue': 15,
                'number_of_counters': 3,
                'active_counters': 3,
                'staff_available': 6,
                'processing_rate': 9.0,
                'daily_processing_capacity': 250.0,
                'processed_today': 110.0,
                'avg_quantity_per_farmer': 2.0,
                'status': 'Active'
            }
        ]

        centre_objs = []
        for c in centres_data:
            obj = ProcurementCentre(**c)
            db.session.add(obj)
            centre_objs.append(obj)
        db.session.flush()

        print("[Seed] Creating Demo Users (Farmer and Officer)...")
        # 1. Demo Farmer
        farmer = User(
            username='farmer1',
            role='farmer',
            full_name='Ramesh Kisan Patil',
            mobile_number='9876543210',
            aadhaar_number='1234-5678-9012',
            preferred_language='hi'
        )
        farmer.set_password('farmer123')
        db.session.add(farmer)
        db.session.flush()

        farmer_profile = FarmerProfile(
            user_id=farmer.id,
            address='Coimbatore South Agricultural Zone, Tamil Nadu',
            district='Coimbatore',
            state='Tamil Nadu',
            land_area_acres=4.5,
            primary_crop='Wheat',
            preferred_centre_id=centre_objs[0].id
        )
        db.session.add(farmer_profile)

        # 2. Demo Officer
        officer = User(
            username='officer1',
            role='officer',
            full_name='Dr. Arvind Sharma',
            mobile_number='9123456780',
            aadhaar_number='9876-5432-1098',
            preferred_language='en'
        )
        officer.set_password('officer123')
        db.session.add(officer)
        db.session.flush()

        officer_profile = OfficerProfile(
            user_id=officer.id,
            officer_id_code='OFFICER-TN-001',
            designation='Chief Procurement & Operations Officer',
            assigned_centre_id=centre_objs[0].id
        )
        db.session.add(officer_profile)

        print("[Seed] Creating Demo Booking matching handwritten flow diagram (Token A-123)...")
        # Booking matching diagram:
        # Token: A-123, Queue position: 23, Farmers Ahead: 12, Estimated wait: 24 min, Stage: Quality Inspection
        qr_payload = f"AGRI_PROCUREMENT|TOKEN:A-123|REF:BK-20260906-123|CENTRE:{centre_objs[0].id}|FARMER:{farmer.id}|CROP:Wheat|QTY:4.0"
        qr_b64 = QRService.generate_qr_base64(qr_payload)

        sample_booking = Booking(
            booking_reference='BK-20260906-123',
            token_number='A-123',
            qr_code_data=qr_b64,
            farmer_id=farmer.id,
            centre_id=centre_objs[0].id,
            crop_name='Wheat',
            land_area=4.5,
            expected_harvest_date=date.today() - timedelta(days=2),
            quantity=4.0,
            booking_date=date.today(),
            time_slot='10:00 - 11:00',
            status='Checked-in',
            current_stage='Quality Inspection',
            queue_position=23,
            farmers_ahead=12,
            estimated_wait_minutes=24.0,
            ai_confidence=91.0,
            payment_amount=9100.0,
            payment_status='Pending',
            checked_in_at=datetime.utcnow() - timedelta(minutes=15)
        )
        db.session.add(sample_booking)
        db.session.flush()

        # Create Timeline for sample booking (Token Confirmed & Arrived completed, Quality Inspection in progress)
        for idx, stage in enumerate(OFFICIAL_STAGES):
            if stage in ['Token Confirmed', 'Arrived']:
                st = 'completed'
                c_at = datetime.utcnow() - timedelta(minutes=30 - idx * 15)
            elif stage == 'Quality Inspection':
                st = 'in_progress'
                c_at = None
            else:
                st = 'pending'
                c_at = None

            db.session.add(TimelineEvent(
                booking_id=sample_booking.id,
                order_index=idx,
                stage_name=stage,
                status=st,
                completed_at=c_at,
                remarks='Verified at counter' if st == 'completed' else None
            ))

        # Sample SMS Notification
        db.session.add(Notification(
            user_id=farmer.id,
            mobile_number=farmer.mobile_number,
            title='Slot & Token Confirmed',
            message=f"Token: A-123 confirmed for Coimbatore Central APMC & Agricultural Complex. Expected arrival: 10:00 AM. Expected waiting time: 24 min.",
            notification_type='sms'
        ))

        db.session.commit()
        print("[Seed] Successfully populated APMC centres, users, active token A-123, and timelines!")

if __name__ == '__main__':
    seed_database()
