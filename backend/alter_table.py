from sqlalchemy import create_engine, text
from config import Config

def alter_procurement_centres():
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    columns = [
        ('taluk', 'VARCHAR(100) NULL'),
        ('address', 'VARCHAR(255) NULL'),
        ('contact_number', 'VARCHAR(30) NULL'),
        ('accepted_crops', "VARCHAR(255) DEFAULT 'Paddy, Wheat, Maize, Cotton, Pulses, Gram'"),
        ('avg_processing_time_min', 'FLOAT DEFAULT 8.0'),
        ('estimated_wait_time_min', 'FLOAT DEFAULT 45.0'),
        ('operating_hours', "VARCHAR(50) DEFAULT '08:00 AM - 05:00 PM'"),
        ('accepting_bookings', 'TINYINT(1) DEFAULT 1'),
        ('slot_duration_min', 'INT DEFAULT 60'),
        ('total_slots_today', 'INT DEFAULT 24'),
        ('available_slots_today', 'INT DEFAULT 18'),
        ('next_available_slot', "VARCHAR(50) DEFAULT '08:00 - 09:00'"),
        ('today_booked', 'INT DEFAULT 6'),
        ('today_completed', 'INT DEFAULT 12'),
        ('today_cancelled', 'INT DEFAULT 0'),
        ('today_rejected', 'INT DEFAULT 0'),
        ('quality_check_available', 'TINYINT(1) DEFAULT 1'),
        ('weighing_available', 'TINYINT(1) DEFAULT 1'),
        ('storage_available', 'TINYINT(1) DEFAULT 1'),
        ('payment_available', 'TINYINT(1) DEFAULT 1'),
        ('current_price_per_kg', 'FLOAT DEFAULT 22.75'),
        ('last_price_update', 'DATETIME NULL'),
        ('weather_status', "VARCHAR(50) DEFAULT 'Clear Sky'"),
        ('weather_risk', "VARCHAR(20) DEFAULT 'LOW'"),
        ('daily_target', 'FLOAT DEFAULT 300.0'),
        ('last_updated', 'DATETIME NULL')
    ]

    with engine.connect() as conn:
        for col_name, col_type in columns:
            try:
                conn.execute(text(f"ALTER TABLE procurement_centres ADD COLUMN {col_name} {col_type}"))
                conn.commit()
                print(f"  [+] Added column {col_name}")
            except Exception as e:
                print(f"  [-] Column {col_name}: already exists or skipped")

    print("[OK] Alteration completed successfully.")

if __name__ == '__main__':
    alter_procurement_centres()
