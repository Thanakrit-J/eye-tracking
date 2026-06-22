"""
USAGE EXAMPLES - How to Use the New MVC Architecture
Common development tasks with code examples
"""

# ====================================================
# HOW TO RUN THE APPLICATION
# ====================================================

# From PowerShell in project directory:
# 1. Activate virtual environment
#    .\venv\Scripts\Activate.ps1

# 2. Run the app
#    python main.py

# 3. Access in browser
#    http://localhost:5000

# 4. Check health
#    http://localhost:5000/api/health


# ====================================================
# EXAMPLE 1: ADD A NEW STUDENT (Using Controllers)
# ====================================================

# Frontend sends POST request to /api/student
fetch('http://localhost:5000/api/student', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        name: 'John Doe',
        student_id: 'S001',
        grade: 10
    })
})
.then(r => r.json())
.then(data => console.log(data));

# Response:
# {
#     "success": true,
#     "data": {
#         "id": 1,
#         "name": "John Doe",
#         "student_id": "S001",
#         "grade": 10,
#         "created_at": "2024-01-15T10:30:00"
#     }
# }


# ====================================================
# EXAMPLE 2: ADD NEW FUNCTIONALITY TO A SERVICE
# ====================================================

# File: app/services/eye_tracking_service.py
# Add a new method to EyeTrackingService:

class EyeTrackingService:
    # ... existing code ...
    
    def detect_eye_movement_speed(self, gaze_points):
        """Calculate eye movement speed between gaze points"""
        if len(gaze_points) < 2:
            return 0
        
        speeds = []
        for i in range(1, len(gaze_points)):
            prev = gaze_points[i-1]
            curr = gaze_points[i]
            
            distance = np.sqrt(
                (curr['gaze_x'] - prev['gaze_x'])**2 + 
                (curr['gaze_y'] - prev['gaze_y'])**2
            )
            speed = distance / 33  # milliseconds
            speeds.append(speed)
        
        return np.mean(speeds) if speeds else 0

# Then use it in SessionController:
#   speed = eye_tracker.detect_eye_movement_speed(gaze_data)


# ====================================================
# EXAMPLE 3: ADD NEW REPOSITORY METHOD
# ====================================================

# File: app/repositories/session_repository.py
# Add specialized query to SessionRepository:

class SessionRepository(BaseRepository):
    # ... existing code ...
    
    def get_sessions_by_flowchart(self, flowchart_id):
        """Get all sessions for a specific flowchart"""
        try:
            return EyeTrackingSession.query.filter_by(
                flowchart_id=flowchart_id
            ).all()
        except Exception as e:
            logger.error(f"Error: {e}")
            return []

# Usage in controller:
#   sessions = session_repo.get_sessions_by_flowchart('flowchart_123')


# ====================================================
# EXAMPLE 4: CREATE NEW API ENDPOINT
# ====================================================

# File: app/controllers/session_controller.py
# Add new route in SessionController:

class SessionController(BaseController):
    # ... existing methods ...
    
    @staticmethod
    def get_session_statistics(student_id):
        """Get summary statistics for all student sessions"""
        try:
            sessions = session_repo.get_by_student_id(student_id)
            
            stats = {
                'total_sessions': len(sessions),
                'total_frames': sum(s.total_frames for s in sessions),
                'avg_accuracy': np.mean([s.accuracy for s in sessions if s.accuracy])
            }
            
            return SessionController.success_response(stats)
        except Exception as e:
            return SessionController.error_response(str(e), 400)

# Add route:
# @session_bp.route('/student/<int:student_id>/statistics', methods=['GET'])
# def get_session_statistics(student_id):
#     return SessionController.get_session_statistics(student_id)


# ====================================================
# EXAMPLE 5: WRITE A UNIT TEST
# ====================================================

# File: test_services.py (create new file)
import unittest
from app import create_app, db
from app.services.ct_assessment_service import CTAssessmentService

class TestCTAssessmentService(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.ctx = self.app.app_context()
        self.ctx.push()
    
    def tearDown(self):
        self.ctx.pop()
    
    def test_decomposition_score_calculation(self):
        element_counts = {
            'start': 5,
            'process': 8,
            'decision': 3,
            'end': 2
        }
        
        score = CTAssessmentService._calculate_decomposition_score(
            element_counts
        )
        
        # Should calculate correctly
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 100)

# Run test:
# python -m unittest test_services.py


# ====================================================
# EXAMPLE 6: IMPORT AND USE IN PYTHON SHELL
# ====================================================

# PowerShell:
# cd d:\project_eyetracking_flowchart\files
# .\venv\Scripts\Activate.ps1
# python

# In Python shell:
from main import app, db
from app.models.student import Student
from app.repositories.student_repository import StudentRepository

# Create app context
with app.app_context():
    # Use repositories
    repo = StudentRepository()
    
    # Get all students
    students = repo.get_all()
    print(f"Total students: {len(students)}")
    
    # Get specific student
    student = repo.get_by_student_id('S001')
    if student:
        print(student.to_dict())


# ====================================================
# EXAMPLE 7: EXTEND SERVICE WITH CALCULATION
# ====================================================

# File: app/services/ct_assessment_service.py
# Add new scoring method:

class CTAssessmentService:
    # ... existing code ...
    
    @staticmethod
    def _calculate_visual_attention_score(gaze_points):
        """Calculate visual attention quality score"""
        # Elements that received attention
        attended_elements = set(gp.element_focused for gp in gaze_points 
                               if gp.element_focused != 'Unknown')
        
        # Elements visited multiple times (shows focus)
        revisit_score = sum(1 for gp in gaze_points 
                           if gp.element_focused != 'Unknown')
        
        # Combine for attention score
        attention_score = (len(attended_elements) * 10) + (revisit_score * 2)
        return min(100, attention_score)

# Use in calculate_assessment():
#   attention_score = CTAssessmentService._calculate_visual_attention_score(gaze_points)


# ====================================================
# EXAMPLE 8: ADD DATABASE MIGRATION
# ====================================================

# New file: app/models/performance_metric.py

from app import db
from datetime import datetime

class PerformanceMetric(db.Model):
    """Performance metrics per session"""
    __tablename__ = 'performance_metric'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('eye_tracking_session.id'))
    metric_name = db.Column(db.String(100))
    metric_value = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'metric_name': self.metric_name,
            'metric_value': self.metric_value
        }

# Add to app/models/__init__.py:
# from app.models.performance_metric import PerformanceMetric

# Database will auto-migrate on app start:
# python main.py


# ====================================================
# EXAMPLE 9: ADD AUTHENTICATION
# ====================================================

# Install Flask-Login and Flask-JWT-Extended:
# pip install Flask-Login Flask-JWT-Extended

# File: app/middleware/auth.py (create new file)
from flask_jwt_extended import JWTManager, jwt_required

jwt = JWTManager()

def init_jwt(app):
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'
    jwt.init_app(app)

# In app/__init__.py:
# from app.middleware.auth import init_jwt
# init_jwt(app)

# Protect endpoints:
# @student_bp.route('/student', methods=['GET'])
# @jwt_required()
# def get_all_students():
#     return StudentController.get_all_students()


# ====================================================
# EXAMPLE 10: ADD API DOCUMENTATION
# ====================================================

# Install Flask-RESTX:
# pip install Flask-RESTX

# File: app/api_doc.py (create new file)
from flask_restx import Api, fields
from flask import Blueprint

api_bp = Blueprint('api_doc', __name__)
api = Api(api_bp, version='1.0', title='Eye Tracking API')

student_ns = api.namespace('student', description='Student operations')

student_model = api.model('Student', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'student_id': fields.String(required=True),
    'grade': fields.Integer()
})

@student_ns.route('/<int:id>')
class StudentResource(Resource):
    @student_ns.marshal_with(student_model)
    def get(self, id):
        """Get student by ID"""
        return StudentController.get_student(id)

# Access documentation at: /api/doc


# ====================================================
# DEVELOPMENT WORKFLOW
# ====================================================

1. CREATE NEW FEATURE:
   - Define model in app/models/
   - Create repository method in app/repositories/
   - Add service logic in app/services/
   - Create controller endpoint in app/controllers/
   - Test the endpoint with curl or Postman

2. FIX A BUG:
   - Find which layer has the bug
   - Fix in that layer only
   - Run tests to ensure no regression
   - Update documentation if needed

3. ADD CALCULATION:
   - Add static method to CTAssessmentService
   - Use in calculate_assessment()
   - Update models if new score needed

4. OPTIMIZE PERFORMANCE:
   - Add caching in repositories
   - Optimize service algorithms
   - Use database indexes
   - Profile with cProfile
"""
