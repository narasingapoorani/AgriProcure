import os
import sys
from datetime import datetime, date, timedelta
from sqlalchemy import text

backend_dir = r"c:\Users\raksh\Downloads\Agri_AI_6_Models\backend"
sys.path.insert(0, backend_dir)

from app import create_app
from database import db
from models.user import User, FarmerProfile, OfficerProfile, OTPStore
from models.centre import ProcurementCentre
from models.booking import Booking
from models.timeline import TimelineEvent, OFFICIAL_STAGES
from models.notification import Notification
from models.payment_transaction import PaymentTransaction
from services.qr_service import QRService

def reset_and_seed():
    app = create_app()
    with app.app_context():
        print("\n=======================================================")
        print(" [1/4] Clearing all data from MySQL tables...")
        print("=======================================================")
        
        # Disable foreign key checks to safely truncate all tables
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        tables = [
            'payment_transactions',
            'timeline_events',
            'notifications',
            'bookings',
            'farmer_profiles',
            'officer_profiles',
            'procurement_centres',
            'otp_store',
            'users'
        ]
        for t in tables:
            try:
                db.session.execute(text(f"TRUNCATE TABLE `{t}`;"))
                print(f"  [OK] Truncated {t}")
            except Exception as e:
                print(f"  Note on {t}: {e}")
                
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.session.commit()

        print("\n=======================================================")
        print(" [2/4] Seeding APMC Procurement Centres...")
        print("=======================================================")
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
                'current_queue': 12,
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
                'current_queue': 8,
                'number_of_counters': 5,
                'active_counters': 4,
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
                'remaining_capacity': 320.0,
                'current_queue': 25,
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
                'current_queue': 15,
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
                'current_queue': 10,
                'number_of_counters': 3,
                'active_counters': 3,
                'staff_available': 6,
                'processing_rate': 9.0,
                'daily_processing_capacity': 250.0,
                'processed_today': 110.0,
                'avg_quantity_per_farmer': 2.0,
                'status': 'Active'
            },
            {
                'name': 'Tirunelveli APMC Regulated Market Yard',
                'code': 'TN-TNV-06',
                'district': 'Tirunelveli',
                'state': 'Tamil Nadu',
                'market': 'Tirunelveli',
                'latitude': 8.7139,
                'longitude': 77.7567,
                'total_capacity': 1100.0,
                'remaining_capacity': 800.0,
                'current_queue': 6,
                'number_of_counters': 4,
                'active_counters': 3,
                'staff_available': 8,
                'processing_rate': 11.0,
                'daily_processing_capacity': 400.0,
                'processed_today': 120.0,
                'avg_quantity_per_farmer': 2.2,
                'status': 'Active'
            },
            {
                'name': 'Madurai Central APMC & Grain Market',
                'code': 'TN-MDU-07',
                'district': 'Madurai',
                'state': 'Tamil Nadu',
                'market': 'Madurai',
                'latitude': 9.9252,
                'longitude': 78.1198,
                'total_capacity': 1300.0,
                'remaining_capacity': 950.0,
                'current_queue': 9,
                'number_of_counters': 5,
                'active_counters': 4,
                'staff_available': 9,
                'processing_rate': 12.0,
                'daily_processing_capacity': 450.0,
                'processed_today': 150.0,
                'avg_quantity_per_farmer': 2.3,
                'status': 'Active'
            },
            {
                'name': 'Ludhiana Grain Market APMC Yard',
                'code': 'PB-LDH-08',
                'district': 'Ludhiana',
                'state': 'Punjab',
                'market': 'Ludhiana',
                'latitude': 30.9010,
                'longitude': 75.8573,
                'total_capacity': 2000.0,
                'remaining_capacity': 1500.0,
                'current_queue': 14,
                'number_of_counters': 6,
                'active_counters': 5,
                'staff_available': 12,
                'processing_rate': 15.0,
                'daily_processing_capacity': 600.0,
                'processed_today': 210.0,
                'avg_quantity_per_farmer': 3.0,
                'status': 'Active'
            },
            {
                'name': 'Bhopal Karond Krishi Upaj Mandi',
                'code': 'MP-BPL-09',
                'district': 'Bhopal',
                'state': 'Madhya Pradesh',
                'market': 'Bhopal',
                'latitude': 23.2599,
                'longitude': 77.4126,
                'total_capacity': 1400.0,
                'remaining_capacity': 1000.0,
                'current_queue': 10,
                'number_of_counters': 4,
                'active_counters': 3,
                'staff_available': 8,
                'processing_rate': 10.0,
                'daily_processing_capacity': 380.0,
                'processed_today': 130.0,
                'avg_quantity_per_farmer': 2.4,
                'status': 'Active'
            },
            {
                'name': 'Belagavi APMC Market Yard',
                'code': 'KA-BLG-10',
                'district': 'Belagavi',
                'state': 'Karnataka',
                'market': 'Belagavi',
                'latitude': 15.8497,
                'longitude': 74.4977,
                'total_capacity': 1000.0,
                'remaining_capacity': 700.0,
                'current_queue': 7,
                'number_of_counters': 4,
                'active_counters': 3,
                'staff_available': 7,
                'processing_rate': 10.0,
                'daily_processing_capacity': 320.0,
                'processed_today': 115.0,
                'avg_quantity_per_farmer': 2.1,
                'status': 'Active'
            },
            {
                'name': 'Coimbatore Central APMC & Agricultural Complex',
                'code': 'TN-CBE-11',
                'district': 'Coimbatore',
                'state': 'Tamil Nadu',
                'market': 'Coimbatore',
                'latitude': 11.0168,
                'longitude': 76.9558,
                'total_capacity': 1250.0,
                'remaining_capacity': 900.0,
                'current_queue': 7,
                'number_of_counters': 4,
                'active_counters': 3,
                'staff_available': 8,
                'processing_rate': 11.0,
                'daily_processing_capacity': 420.0,
                'processed_today': 130.0,
                'avg_quantity_per_farmer': 2.2,
                'status': 'Active'
            }
        ]

        centre_objs = []
        for c in centres_data:
            obj = ProcurementCentre(**c)
            db.session.add(obj)
            centre_objs.append(obj)
        db.session.flush()
        print(f"  [OK] Seeded {len(centre_objs)} Procurement Centres")

        print("\n=======================================================")
        print(" [3/4] Seeding Users (Farmer and Officer)...")
        print("=======================================================")
        
        # 1. Main Demo Farmer
        farmer1 = User(
            username='farmer1',
            role='farmer',
            full_name='Ramesh Kisan Patil',
            mobile_number='9876543210',
            aadhaar_number='1234-5678-9012',
            preferred_language='hi'
        )
        farmer1.set_password('farmer123')
        db.session.add(farmer1)
        db.session.flush()

        farmer1_profile = FarmerProfile(
            user_id=farmer1.id,
            address='Coimbatore South Agricultural Zone, Tamil Nadu',
            district='Coimbatore',
            state='Tamil Nadu',
            land_area_acres=4.5,
            primary_crop='Wheat',
            preferred_centre_id=centre_objs[0].id,
            latitude=11.0168,
            longitude=76.9558
        )
        db.session.add(farmer1_profile)

        # 2. Main Demo Officer
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
            officer_id_code='OFFICER-MH-001',
            designation='Chief Procurement & Operations Officer',
            assigned_centre_id=centre_objs[0].id
        )
        db.session.add(officer_profile)

        # 3. Additional Farmers for Officer Queue Table
        extra_farmers = [
            {
                'name': 'Suresh Baburao Deshmukh',
                'mobile': '9822334455',
                'aadhaar': '2345-6789-0123',
                'crop': 'Soybean',
                'land': 3.5,
                'qty': 3.5,
                'token': 'B-201',
                'stage': 'Quality Inspection',
                'status': 'Checked-in',
                'amount': 16100.0
            },
            {
                'name': 'Anand Vitthal Shinde',
                'mobile': '9844556677',
                'aadhaar': '3456-7890-1234',
                'crop': 'Wheat',
                'land': 5.0,
                'qty': 5.0,
                'token': 'B-202',
                'stage': 'Weighing',
                'status': 'Checked-in',
                'amount': 11375.0
            },
            {
                'name': 'Prakash Narayan Gholap',
                'mobile': '9866778899',
                'aadhaar': '4567-8901-2345',
                'crop': 'Cotton',
                'land': 4.0,
                'qty': 2.5,
                'token': 'B-203',
                'stage': 'Crop Accepted',
                'status': 'Checked-in',
                'amount': 16550.0
            }
        ]

        created_extra = []
        for idx, ef in enumerate(extra_farmers, start=2):
            u = User(
                username=f"farmer{idx}",
                role='farmer',
                full_name=ef['name'],
                mobile_number=ef['mobile'],
                aadhaar_number=ef['aadhaar'],
                preferred_language='en'
            )
            u.set_password('farmer123')
            db.session.add(u)
            db.session.flush()

            fp = FarmerProfile(
                user_id=u.id,
                address='Coimbatore South Agricultural Zone, Tamil Nadu',
                district='Coimbatore',
                state='Tamil Nadu',
                land_area_acres=ef['land'],
                primary_crop=ef['crop'],
                preferred_centre_id=centre_objs[0].id
            )
            db.session.add(fp)
            created_extra.append((u, ef))

        db.session.commit()
        print(f"  [OK] Seeded Main Farmer (farmer1), Main Officer (officer1), and 3 Queue Farmers")

        print("\n=======================================================")
        print(" [4/4] Seeding Clean Bookings, Timelines & Notifications...")
        print("=======================================================")

        # Clean Active Booking for Ramesh (farmer1) - Token A-101
        qr_payload = f"AGRI_PROCUREMENT|TOKEN:A-101|REF:BK-20260906-101|CENTRE:{centre_objs[0].id}|FARMER:{farmer1.id}|CROP:Wheat|QTY:4.0"
        qr_b64 = QRService.generate_qr_base64(qr_payload)

        main_booking = Booking(
            booking_reference='BK-20260906-101',
            token_number='A-101',
            qr_code_data=qr_b64,
            farmer_id=farmer1.id,
            centre_id=centre_objs[0].id,
            crop_name='Wheat',
            land_area=4.5,
            expected_harvest_date=date.today() + timedelta(days=1),
            quantity=4.0,
            booking_date=date.today(),
            time_slot='10:00 - 11:00',
            status='Booked',
            current_stage='Token Confirmed',
            queue_position=12,
            farmers_ahead=5,
            estimated_wait_minutes=15.0,
            ai_confidence=94.5,
            payment_amount=9100.0,
            payment_status='Pending',
            checked_in_at=None
        )
        db.session.add(main_booking)
        db.session.flush()

        # 7-stage timeline for Token A-101 (Only Token Confirmed is completed, rest pending)
        for idx, stage in enumerate(OFFICIAL_STAGES):
            if stage == 'Token Confirmed':
                st = 'completed'
                c_at = datetime.utcnow()
                rem = 'Token A-101 generated and registered'
            else:
                st = 'pending'
                c_at = None
                rem = None

            db.session.add(TimelineEvent(
                booking_id=main_booking.id,
                order_index=idx,
                stage_name=stage,
                status=st,
                completed_at=c_at,
                remarks=rem
            ))

        # Welcome notification for farmer1
        db.session.add(Notification(
            user_id=farmer1.id,
            mobile_number=farmer1.mobile_number,
            title='Slot & Token Confirmed',
            message=f"Welcome Ramesh Patil! Token: A-101 confirmed for Coimbatore Central APMC & Agricultural Complex. Arrival slot: 10:00 AM - 11:00 AM.",
            notification_type='sms'
        ))

        # Seed the 3 extra bookings for the officer queue
        for u, ef in created_extra:
            bk_ref = f"BK-20260906-{ef['token'].replace('-', '')}"
            qr = QRService.generate_qr_base64(f"AGRI_PROCUREMENT|TOKEN:{ef['token']}|REF:{bk_ref}|FARMER:{u.id}|CROP:{ef['crop']}")
            b = Booking(
                booking_reference=bk_ref,
                token_number=ef['token'],
                qr_code_data=qr,
                farmer_id=u.id,
                centre_id=centre_objs[0].id,
                crop_name=ef['crop'],
                land_area=ef['land'],
                expected_harvest_date=date.today(),
                quantity=ef['qty'],
                booking_date=date.today(),
                time_slot='09:00 - 10:00',
                status=ef['status'],
                current_stage=ef['stage'],
                queue_position=18,
                farmers_ahead=10,
                estimated_wait_minutes=18.0,
                ai_confidence=92.0,
                payment_amount=ef['amount'],
                payment_status='Pending',
                checked_in_at=datetime.utcnow() - timedelta(minutes=20)
            )
            db.session.add(b)
            db.session.flush()

            # Timeline for queue booking
            stages_order = list(OFFICIAL_STAGES)
            stage_idx = stages_order.index(ef['stage']) if ef['stage'] in stages_order else 1
            for i, st_name in enumerate(stages_order):
                if i < stage_idx:
                    status = 'completed'
                    comp_at = datetime.utcnow() - timedelta(minutes=(stage_idx - i) * 15)
                elif i == stage_idx:
                    status = 'in_progress'
                    comp_at = None
                else:
                    status = 'pending'
                    comp_at = None

                db.session.add(TimelineEvent(
                    booking_id=b.id,
                    order_index=i,
                    stage_name=st_name,
                    status=status,
                    completed_at=comp_at,
                    remarks='Processed by counter operator' if status == 'completed' else None
                ))

        db.session.commit()
        print(f"  [OK] Clean active booking A-101 created for Ramesh Patil (Payment: Pending, Stage: Token Confirmed)")
        print(f"  [OK] 3 queue bookings created for Officer Queue table (Payments: Pending)")
        print(f"  [OK] Payment Transactions ledger: 0 records (completely clean)")

        # Summary of row counts
        print("\n=======================================================")
        print(" NEW DATABASE STATE (MySQL 'agri_ai_db'):")
        print("=======================================================")
        print(f"  * Users: {User.query.count()} (farmer1, officer1, + 3 queue farmers)")
        print(f"  * APMC Centres: {ProcurementCentre.query.count()} (Coimbatore, Tiruppur, Erode, Salem, etc.)")
        print(f"  * Bookings: {Booking.query.count()} (1 active for Ramesh + 3 in queue)")
        print(f"  * Timeline Events: {TimelineEvent.query.count()}")
        print(f"  * Notifications: {Notification.query.count()}")
        print(f"  * Payment Transactions: {PaymentTransaction.query.count()} (Empty, ready for fresh testing)")
        print("=======================================================\n")

if __name__ == '__main__':
    reset_and_seed()
