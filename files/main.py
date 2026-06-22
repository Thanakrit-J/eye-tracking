"""
Eye Tracking System - Main Entry Point
พัฒนาระบบวินิจฉัยการคิดเชิงคำนวณด้วย Eye Tracking
"""

from app import create_app, db
import os
from dotenv import load_dotenv

load_dotenv()

# Get environment
ENV = os.getenv('FLASK_ENV', 'development')

# Create Flask app
app = create_app(ENV)

@app.shell_context_processor
def make_shell_context():
    """Make database context available in shell"""
    return {'db': db}

if __name__ == '__main__':
    # Run development server
    with app.app_context():
        db.create_all()
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
