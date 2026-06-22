"""
Eye Tracking System - Flask Application Factory (Fixed for Object Configuration)
"""

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import config
import logging
import os

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_app(config_name=None):
    """
    Application factory function
    """
    # Get the directory where this file is located
    basedir = os.path.abspath(os.path.dirname(__file__))
    parent_dir = os.path.dirname(basedir)  # Go up to 'files' directory
    
    app = Flask(__name__, static_folder=parent_dir, static_url_path='')
    
    # 💡 ปรับปรุงใหม่: ดึงโหมดจาก .env อัตโนมัติ (เช่น development, production)
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
        
    # 💡 ปรับปรุงใหม่: แปลงคลาสเป็น Instance ก่อน เพื่อให้ `@property` ของ URI ทำงานได้ถูกต้อง
    config_obj = config[config_name]()
    app.config.from_object(config_obj)
    
    # ดึงค่า URI มาเซ็ตลงแอปตรงๆ อีกชั้นเพื่อให้มั่นใจว่าดึงข้อมูลจาก Docker แน่นอน
    app.config['SQLALCHEMY_DATABASE_URI'] = config_obj.SQLALCHEMY_DATABASE_URI
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Register blueprints
    with app.app_context():
        from app.controllers.student_controller import student_bp
        from app.controllers.session_controller import session_bp
        from app.controllers.flowchart_controller import flowchart_bp
        
        app.register_blueprint(student_bp)
        app.register_blueprint(session_bp)
        app.register_blueprint(flowchart_bp)
        
        # Create database tables
        db.create_all()
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        from flask import jsonify
        return jsonify({'status': 'ok', 'message': 'Eye Tracking System is running'}), 200
    
    # Frontend routes
    @app.route('/', methods=['GET'])
    def serve_root():
        return send_from_directory(parent_dir, 'auth.html')
    
    @app.route('/auth.html', methods=['GET'])
    def serve_auth():
        return send_from_directory(parent_dir, 'auth.html')
    
    @app.route('/dashboard.html', methods=['GET'])
    def serve_dashboard():
        return send_from_directory(parent_dir, 'dashboard.html')
    
    @app.route('/<path:filename>', methods=['GET'])
    def serve_static(filename):
        if filename and os.path.isfile(os.path.join(parent_dir, filename)):
            return send_from_directory(parent_dir, filename)
        # For any other route, serve auth.html
        return send_from_directory(parent_dir, 'auth.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        from flask import jsonify
        return jsonify({'success': False, 'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        from flask import jsonify
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
    
    return app