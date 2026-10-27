import os
import sys
import argparse
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def migrate(postgres_url=None):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    # Adjust base_dir if in scratch
    backend_dir = r"c:\Users\raksh\Downloads\Agri_AI_6_Models\backend"
    sqlite_path = os.path.join(backend_dir, 'agri_procurement.db')
    
    target_url = postgres_url or os.environ.get('DATABASE_URL')
    if not target_url:
        print("[Error] No PostgreSQL URL provided. Pass --url <postgres_connection_string> or set DATABASE_URL in .env")
        sys.exit(1)
        
    if target_url.startswith('postgres://'):
        target_url = target_url.replace('postgres://', 'postgresql://', 1)

    print(f"\n=======================================================")
    print(f" Connecting to PostgreSQL: {target_url.split('@')[-1] if '@' in target_url else target_url}")
    print(f"=======================================================")

    # Test psycopg2 connection directly
    try:
        import psycopg2
        print("[1/5] Testing PostgreSQL network connection...")
        test_conn = psycopg2.connect(target_url)
        test_conn.close()
        print("  ✓ PostgreSQL server connected successfully!")
    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        print("\nPlease verify your PostgreSQL host, port, username, password, and database name.")
        sys.exit(1)

    # Set environment variable so Flask config picks it up
    os.environ['DATABASE_URL'] = target_url
    sys.path.insert(0, backend_dir)

    from config import Config
    from app import create_app
    from database import db
    from models.user import User, FarmerProfile, OfficerProfile, OTPStore
    from models.centre import ProcurementCentre
    from models.booking import Booking
    from models.timeline import TimelineEvent
    from models.notification import Notification
    from seed_data import seed_database
    import sqlite3

    app = create_app()

    with app.app_context():
        print("[2/5] Creating all database tables in PostgreSQL...")
        db.create_all()
        print("  ✓ All PostgreSQL tables created successfully.")

        # Check if SQLite database exists to migrate data from
        if os.path.exists(sqlite_path):
            print(f"[3/5] Migrating records from SQLite ({sqlite_path}) to PostgreSQL...")
            sqlite_conn = sqlite3.connect(sqlite_path)
            sqlite_conn.row_factory = sqlite3.Row
            sqlite_cur = sqlite_conn.cursor()

            def table_exists_in_sqlite(tname):
                return sqlite_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{tname}'").fetchone() is not None

            def parse_dt(v):
                if not v:
                    return None
                try:
                    return datetime.fromisoformat(v)
                except Exception:
                    return None

            def parse_date(v):
                if not v:
                    return None
                try:
                    return datetime.strptime(v.split('T')[0], '%Y-%m-%d').date()
                except Exception:
                    return None

            # 1. Users
            if table_exists_in_sqlite('users'):
                rows = sqlite_cur.execute("SELECT * FROM users").fetchall()
                for r in rows:
                    if not User.query.filter_by(id=r['id']).first():
                        u = User(
                            id=r['id'],
                            username=r['username'],
                            password_hash=r['password_hash'],
                            role=r['role'],
                            full_name=r['full_name'],
                            mobile_number=r['mobile_number'],
                            aadhaar_number=r['aadhaar_number'],
                            preferred_language=r['preferred_language'] or 'en',
                            created_at=parse_dt(r['created_at']) or datetime.utcnow()
                        )
                        db.session.add(u)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Users")

            # 2. Procurement Centres
            if table_exists_in_sqlite('procurement_centres'):
                rows = sqlite_cur.execute("SELECT * FROM procurement_centres").fetchall()
                for r in rows:
                    if not ProcurementCentre.query.filter_by(id=r['id']).first():
                        c = ProcurementCentre(
                            id=r['id'],
                            name=r['name'],
                            code=r['code'],
                            district=r['district'],
                            state=r['state'],
                            market=r['market'],
                            latitude=r['latitude'],
                            longitude=r['longitude'],
                            total_capacity=r['total_capacity'],
                            remaining_capacity=r['remaining_capacity'],
                            current_queue=r['current_queue'],
                            number_of_counters=r['number_of_counters'],
                            active_counters=r['active_counters'],
                            staff_available=r['staff_available'],
                            processing_rate=r['processing_rate'],
                            daily_processing_capacity=r['daily_processing_capacity'],
                            processed_today=r['processed_today'],
                            avg_quantity_per_farmer=r['avg_quantity_per_farmer'],
                            status=r['status']
                        )
                        db.session.add(c)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Procurement Centres")

            # 3. Farmer Profiles
            if table_exists_in_sqlite('farmer_profiles'):
                rows = sqlite_cur.execute("SELECT * FROM farmer_profiles").fetchall()
                for r in rows:
                    if not FarmerProfile.query.filter_by(id=r['id']).first():
                        fp = FarmerProfile(
                            id=r['id'],
                            user_id=r['user_id'],
                            address=r['address'],
                            district=r['district'],
                            state=r['state'],
                            land_area_acres=r['land_area_acres'],
                            primary_crop=r['primary_crop'],
                            preferred_centre_id=r['preferred_centre_id']
                        )
                        db.session.add(fp)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Farmer Profiles")

            # 4. Officer Profiles
            if table_exists_in_sqlite('officer_profiles'):
                rows = sqlite_cur.execute("SELECT * FROM officer_profiles").fetchall()
                for r in rows:
                    if not OfficerProfile.query.filter_by(id=r['id']).first():
                        op = OfficerProfile(
                            id=r['id'],
                            user_id=r['user_id'],
                            officer_id_code=r['officer_id_code'],
                            designation=r['designation'],
                            assigned_centre_id=r['assigned_centre_id']
                        )
                        db.session.add(op)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Officer Profiles")

            # 5. Bookings
            if table_exists_in_sqlite('bookings'):
                rows = sqlite_cur.execute("SELECT * FROM bookings").fetchall()
                for r in rows:
                    if not Booking.query.filter_by(id=r['id']).first():
                        b = Booking(
                            id=r['id'],
                            booking_reference=r['booking_reference'],
                            token_number=r['token_number'],
                            qr_code_data=r['qr_code_data'],
                            farmer_id=r['farmer_id'],
                            centre_id=r['centre_id'],
                            crop_name=r['crop_name'],
                            land_area=r['land_area'],
                            expected_harvest_date=parse_date(r['expected_harvest_date']),
                            quantity=r['quantity'],
                            booking_date=parse_date(r['booking_date']),
                            time_slot=r['time_slot'],
                            status=r['status'],
                            current_stage=r['current_stage'],
                            queue_position=r['queue_position'],
                            farmers_ahead=r['farmers_ahead'],
                            estimated_wait_minutes=r['estimated_wait_minutes'],
                            ai_confidence=r['ai_confidence'],
                            payment_amount=r['payment_amount'],
                            payment_status=r['payment_status'],
                            created_at=parse_dt(r['created_at']) or datetime.utcnow(),
                            checked_in_at=parse_dt(r['checked_in_at'])
                        )
                        db.session.add(b)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Bookings")

            # 6. Timeline Events
            if table_exists_in_sqlite('timeline_events'):
                rows = sqlite_cur.execute("SELECT * FROM timeline_events").fetchall()
                for r in rows:
                    if not TimelineEvent.query.filter_by(id=r['id']).first():
                        te = TimelineEvent(
                            id=r['id'],
                            booking_id=r['booking_id'],
                            order_index=r['order_index'],
                            stage_name=r['stage_name'],
                            status=r['status'],
                            completed_at=parse_dt(r['completed_at']),
                            remarks=r['remarks']
                        )
                        db.session.add(te)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Timeline Events")

            # 7. Notifications
            if table_exists_in_sqlite('notifications'):
                rows = sqlite_cur.execute("SELECT * FROM notifications").fetchall()
                for r in rows:
                    if not Notification.query.filter_by(id=r['id']).first():
                        n = Notification(
                            id=r['id'],
                            user_id=r['user_id'],
                            mobile_number=r['mobile_number'],
                            title=r['title'],
                            message=r['message'],
                            notification_type=r['notification_type'],
                            is_read=bool(r['is_read']),
                            created_at=parse_dt(r['created_at']) or datetime.utcnow()
                        )
                        db.session.add(n)
                db.session.commit()
                print(f"  ✓ Migrated {len(rows)} Notifications")

            sqlite_conn.close()
        else:
            print("[3/5] No local SQLite file found. Seeding fresh data...")
            seed_database()

        # Step 4: Reset PostgreSQL sequence counters
        print("[4/5] Syncing PostgreSQL primary key sequences...")
        tables = ['users', 'procurement_centres', 'farmer_profiles', 'officer_profiles', 'bookings', 'timeline_events', 'notifications', 'otp_store']
        from sqlalchemy import text
        for t in tables:
            try:
                db.session.execute(text(f"SELECT setval(pg_get_serial_sequence('{t}', 'id'), coalesce(max(id), 1)) FROM {t};"))
                db.session.commit()
            except Exception:
                db.session.rollback()
        print("  ✓ Sequence counters updated.")

        # Step 5: Save to backend/.env
        print("[5/5] Updating backend/.env configuration file...")
        env_file = os.path.join(backend_dir, '.env')
        env_lines = []
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                env_lines = f.readlines()

        has_db_url = False
        new_lines = []
        for line in env_lines:
            if line.strip().startswith('DATABASE_URL='):
                new_lines.append(f"DATABASE_URL={target_url}\n")
                has_db_url = True
            else:
                new_lines.append(line)
        if not has_db_url:
            new_lines.append(f"\nDATABASE_URL={target_url}\n")

        with open(env_file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"  ✓ Saved DATABASE_URL to {env_file}")

    print("\n=======================================================")
    print(" PostgreSQL Migration Complete! The application is now")
    print(" running on PostgreSQL.")
    print("=======================================================\n")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Migrate Agri AI to PostgreSQL")
    parser.add_argument('--url', help="PostgreSQL connection string (e.g. postgresql://user:pwd@host:5432/dbname)")
    args = parser.parse_args()
    migrate(args.url)
