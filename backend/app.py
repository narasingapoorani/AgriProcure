from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db
from routes.auth_routes import auth_bp
from routes.farmer_routes import farmer_bp
from routes.officer_routes import officer_bp
from routes.centre_routes import centre_bp
from routes.payment_routes import payment_bp
from routes.whatsapp_routes import whatsapp_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable Cross-Origin Resource Sharing for modern React/Vue/Angular frontends
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Register Route Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(farmer_bp, url_prefix='/api/farmer')
    app.register_blueprint(officer_bp, url_prefix='/api/officer')
    app.register_blueprint(centre_bp, url_prefix='/api/centre')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    app.register_blueprint(whatsapp_bp, url_prefix='/api/whatsapp')

    @app.route('/')
    def index():
        return jsonify({
            'status': 'online',
            'project': 'Agri AI Smart Procurement System (SIH)',
            'description': 'AI-driven dynamic slot allocation, ETA prediction, overload risk mitigation, demand forecasting, and digital twin simulation backend.',
            'endpoints': {
                'auth': '/api/auth',
                'farmer': '/api/farmer',
                'officer': '/api/officer',
                'centre': '/api/centre',
                'payment': '/api/payment',
                'whatsapp': '/api/whatsapp'
            }
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'status': 'error', 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
