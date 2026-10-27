import os
import sys
from app import create_app
from seed_data import seed_database

if __name__ == '__main__':
    # Ensure database is created and seeded with demo data
    seed_database()

    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"\n=======================================================")
    print(f" Agri AI Smart Procurement API Server is LIVE on:")
    print(f" http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
