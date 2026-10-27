from routes.auth_routes import auth_bp
from routes.farmer_routes import farmer_bp
from routes.officer_routes import officer_bp
from routes.centre_routes import centre_bp
from routes.payment_routes import payment_bp
from routes.whatsapp_routes import whatsapp_bp

__all__ = ['auth_bp', 'farmer_bp', 'officer_bp', 'centre_bp', 'payment_bp', 'whatsapp_bp']
