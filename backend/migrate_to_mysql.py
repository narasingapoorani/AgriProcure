import os
import sys
import argparse
from datetime import datetime
import sqlite3
import pymysql

def run_migration(password=None, user='root', host='127.0.0.1', port=3306, db_name='agri_ai_db', full_url=None):
    backend_dir = r"c:\Users\raksh\Downloads\Agri_AI_6_Models\backend"
    sqlite_path = os.path.join(backend_dir, 'agri_procurement.db')

    if full_url:
        mysql_url = full_url
    else:
        from urllib.parse import quote_plus
        pwd_part = f":{quote_plus(password)}" if password else ""
        mysql_url = f"mysql+pymysql://{user}{pwd_part}@{host}:{port}/{db_name}"

    print(f"\n=======================================================")
    print(f" Connecting to MySQL server at {host}:{port}...")
    print(f"=======================================================")

    # 1. Connect to MySQL server and ensure database exists
    try:
        raw_conn = pymysql.connect(
            host=host,
            port=int(port),
            user=user,
            password=password or '',
            charset='utf8mb4'
        )
        cur = raw_conn.cursor()
        print(f"[1/5] Creating database '{db_name}' if it does not exist...")
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        raw_conn.commit()
        raw_conn.close()
        print(f"  [OK] Database '{db_name}' is ready!")
    except Exception as e:
        print(f"  [FAIL] Failed to connect to MySQL: {e}")
        return False

    # 2. Configure Flask to use MySQL
    os.environ['DATABASE_URL'] = mysql_url
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

    app = create_app()

    with app.app_context():
        print(f"[2/5] Creating tables in MySQL ({db_name})...")
        db.create_all()
        print("  [OK] All MySQL tables created successfully.")

        # 3. Migrate data from SQLite
        if os.path.exists(sqlite_path):
            print(f"[3/5] Migrating records from SQLite ({sqlite_path}) to MySQL...")
            sq_conn = sqlite3.connect(sqlite_path)
            sq_conn.row_factory = sqlite3.Row
            sq_cur = sq_conn.cursor()

            def table_exists(t):
                return sq_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{t}'").fetchone() is not None

            def parse_dt(v):
                if not v:
                    return None
                try:
                    return datetime.fromisoformat(v)
                except:
                    return None

            def parse_date(v):
                if not v:
                    return None
                try:
                    return datetime.strptime(v.split('T')[0], '%Y-%m-%d').date()
                except:
                    return None

            # Users
            if table_exists('users'):
                rows = sq_cur.execute("SELECT * FROM users").fetchall()
                for r in rows:
                    if not User.query.filter_by(id=r['id']).first():
                        db.session.add(User(
                            id=r['id'],
                            username=r['username'],
                            password_hash=r['password_hash'],
                            role=r['role'],
                            full_name=r['full_name'],
                            mobile_number=r['mobile_number'],
                            aadhaar_number=r['aadhaar_number'],
                            preferred_language=r['preferred_language'] or 'en',
                            created_at=parse_dt(r['created_at']) or datetime.utcnow()
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Users")

            # Centres
            if table_exists('procurement_centres'):
                rows = sq_cur.execute("SELECT * FROM procurement_centres").fetchall()
                for r in rows:
                    if not ProcurementCentre.query.filter_by(id=r['id']).first():
                        db.session.add(ProcurementCentre(
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
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Procurement Centres")

            # Farmer Profiles
            if table_exists('farmer_profiles'):
                rows = sq_cur.execute("SELECT * FROM farmer_profiles").fetchall()
                for r in rows:
                    if not FarmerProfile.query.filter_by(id=r['id']).first():
                        db.session.add(FarmerProfile(
                            id=r['id'],
                            user_id=r['user_id'],
                            address=r['address'],
                            district=r['district'],
                            state=r['state'],
                            land_area_acres=r['land_area_acres'],
                            primary_crop=r['primary_crop'],
                            preferred_centre_id=r['preferred_centre_id']
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Farmer Profiles")

            # Officer Profiles
            if table_exists('officer_profiles'):
                rows = sq_cur.execute("SELECT * FROM officer_profiles").fetchall()
                for r in rows:
                    if not OfficerProfile.query.filter_by(id=r['id']).first():
                        db.session.add(OfficerProfile(
                            id=r['id'],
                            user_id=r['user_id'],
                            officer_id_code=r['officer_id_code'],
                            designation=r['designation'],
                            assigned_centre_id=r['assigned_centre_id']
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Officer Profiles")

            # Bookings
            if table_exists('bookings'):
                rows = sq_cur.execute("SELECT * FROM bookings").fetchall()
                for r in rows:
                    if not Booking.query.filter_by(id=r['id']).first():
                        db.session.add(Booking(
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
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Bookings")

            # Timeline Events
            if table_exists('timeline_events'):
                rows = sq_cur.execute("SELECT * FROM timeline_events").fetchall()
                for r in rows:
                    if not TimelineEvent.query.filter_by(id=r['id']).first():
                        db.session.add(TimelineEvent(
                            id=r['id'],
                            booking_id=r['booking_id'],
                            order_index=r['order_index'],
                            stage_name=r['stage_name'],
                            status=r['status'],
                            completed_at=parse_dt(r['completed_at']),
                            remarks=r['remarks']
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Timeline Events")

            # Notifications
            if table_exists('notifications'):
                rows = sq_cur.execute("SELECT * FROM notifications").fetchall()
                for r in rows:
                    if not Notification.query.filter_by(id=r['id']).first():
                        db.session.add(Notification(
                            id=r['id'],
                            user_id=r['user_id'],
                            mobile_number=r['mobile_number'],
                            title=r['title'],
                            message=r['message'],
                            notification_type=r['notification_type'],
                            is_read=bool(r['is_read']),
                            created_at=parse_dt(r['created_at']) or datetime.utcnow()
                        ))
                db.session.commit()
                print(f"  [OK] Migrated {len(rows)} Notifications")

            sq_conn.close()
        else:
            print("[3/5] No local SQLite file found. Seeding fresh data...")
            seed_database()

        # 4. Verification
        print("[4/5] Verifying row counts in MySQL...")
        print(f"  - Users: {User.query.count()}")
        print(f"  - Centres: {ProcurementCentre.query.count()}")
        print(f"  - Bookings: {Booking.query.count()}")
        print(f"  - Timeline Events: {TimelineEvent.query.count()}")
        print(f"  - Notifications: {Notification.query.count()}")

        # 5. Save to backend/.env
        print(f"[5/5] Writing DATABASE_URL to backend/.env...")
        env_file = os.path.join(backend_dir, '.env')
        env_lines = []
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                env_lines = f.readlines()

        has_db_url = False
        new_lines = []
        for line in env_lines:
            if line.strip().startswith('DATABASE_URL='):
                new_lines.append(f"DATABASE_URL={mysql_url}\n")
                has_db_url = True
            else:
                new_lines.append(line)
        if not has_db_url:
            new_lines.append(f"\nDATABASE_URL={mysql_url}\n")

        with open(env_file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"  [OK] Saved to {env_file}")

    print("\n=======================================================")
    print(" MySQL Migration Complete! Agri AI is now fully running")
    print(f" on MySQL database '{db_name}'.")
    print("=======================================================\n")
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Migrate Agri AI to MySQL")
    parser.add_argument('--password', '-p', default='', help="MySQL password for user")
    parser.add_argument('--user', '-u', default='root', help="MySQL username (default: root)")
    parser.add_argument('--host', default='127.0.0.1', help="MySQL host (default: 127.0.0.1)")
    parser.add_argument('--port', type=int, default=3306, help="MySQL port (default: 3306)")
    parser.add_argument('--db', default='agri_ai_db', help="Database name (default: agri_ai_db)")
    parser.add_argument('--url', default=None, help="Full MySQL URL")
    args = parser.parse_args()

    run_migration(
        password=args.password,
        user=args.user,
        host=args.host,
        port=args.port,
        db_name=args.db,
        full_url=args.url
    )
