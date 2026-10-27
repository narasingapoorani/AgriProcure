from dotenv import load_dotenv
load_dotenv()
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'agri-ai-sih-super-secret-key-2026')
    _raw_db_url = os.environ.get('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'agri_procurement.db')}")
    if _raw_db_url:
        if _raw_db_url.startswith('postgres://'):
            _raw_db_url = _raw_db_url.replace('postgres://', 'postgresql://', 1)
        elif _raw_db_url.startswith('mysql://'):
            _raw_db_url = _raw_db_url.replace('mysql://', 'mysql+pymysql://', 1)
    SQLALCHEMY_DATABASE_URI = _raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
    }
    
    # 6 ML Models Paths
    CENTRE_RECOMMENDATION_MODEL = os.path.join(MODELS_DIR, 'centre_recommendation_model.joblib')
    DEMAND_FORECASTING_MODEL = os.path.join(MODELS_DIR, 'demand_forecasting_model.joblib')
    ETA_PREDICTION_MODEL = os.path.join(MODELS_DIR, 'eta_prediction_model.joblib')
    OFFICER_DECISION_INTELLIGENCE_MODEL = os.path.join(MODELS_DIR, 'officer_decision_intelligence_model.joblib')
    OVERLOAD_PREDICTION_MODEL = os.path.join(MODELS_DIR, 'overload_prediction_model.joblib')
    SMART_SLOT_ALLOCATION_MODEL = os.path.join(MODELS_DIR, 'smart_slot_allocation_model.joblib')

    # Razorpay Payment Gateway Configuration
    RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_agri_ai_sih_2026')
    RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'agri_ai_secret_key_sih')
    RAZORPAY_CURRENCY = 'INR'

    # WhatsApp API Configuration (Meta Cloud API / Twilio / Direct wa.me)
    WHATSAPP_API_KEY = os.environ.get('WHATSAPP_API_KEY', '')
    WHATSAPP_PHONE_NUMBER_ID = os.environ.get('WHATSAPP_PHONE_NUMBER_ID', '')
    WHATSAPP_SENDER_NUMBER = os.environ.get('WHATSAPP_SENDER_NUMBER', '919876543210')

