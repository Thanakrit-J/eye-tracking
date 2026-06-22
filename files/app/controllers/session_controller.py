"""
Session Controller
"""

from flask import Blueprint, request, jsonify, send_file
from datetime import datetime
import csv
import io
from app.controllers.base_controller import BaseController
from app.repositories.session_repository import SessionRepository
from app.repositories.student_repository import StudentRepository
from app.services.eye_tracking_service import EyeTrackingService
from app.services.ct_assessment_service import CTAssessmentService

# Create blueprint
session_bp = Blueprint('session', __name__, url_prefix='/api')

# Initialize repositories and services
session_repo = SessionRepository()
student_repo = StudentRepository()
eye_tracker = EyeTrackingService()

class SessionController(BaseController):
    """Controller for session operations"""
    
    @staticmethod
    def start_session():
        """Start a new eye tracking session"""
        try:
            data = request.json
            
            if not data or not data.get('student_id'):
                return SessionController.error_response('student_id is required', 400)
            
            student = student_repo.get_by_id(data.get('student_id'))
            if not student:
                return SessionController.error_response('Student not found', 404)
            
            # Create session
            session = session_repo.create(
                student_id=data.get('student_id'),
                flowchart_id=data.get('flowchart_id'),
                flowchart_name=data.get('flowchart_name')
            )
            
            # Set AOI regions and reset tracker
            if 'aoi_regions' in data:
                eye_tracker.set_aoi_regions(data['aoi_regions'])
            eye_tracker.reset()
            
            SessionController.log_info(f"Session started: {session.id}")
            return SessionController.success_response(session.to_dict(), 201)
        
        except Exception as e:
            SessionController.log_error(f"Error starting session: {e}")
            return SessionController.error_response(str(e), 400)
    
    @staticmethod
    def process_frame(session_id):
        """Process a frame from the camera"""
        try:
            data = request.json
            frame_base64 = data.get('frame')
            
            if not frame_base64:
                return SessionController.error_response('No frame provided', 400)
            
            session = session_repo.get_by_id(session_id)
            if not session:
                return SessionController.error_response('Session not found', 404)
            
            # Process frame using eye tracking service
            gaze_info = eye_tracker.process_frame(frame_base64)
            
            if gaze_info and gaze_info['detected']:
                # Save gaze point to database
                gaze_data = {
                    'frame_number': eye_tracker.get_frame_count(),
                    'gaze_x': gaze_info['gaze_x'],
                    'gaze_y': gaze_info['gaze_y'],
                    'fixation_duration': gaze_info['fixation_duration'],
                    'element_focused': gaze_info['element_focused'],
                    'confidence': gaze_info['confidence']
                }
                
                gaze_point = session_repo.add_gaze_point(session_id, gaze_data)
                
                return SessionController.success_response({
                    'gaze_info': gaze_info,
                    'gaze_point_id': gaze_point.id
                })
            else:
                return SessionController.error_response('Face not detected', 400)
        
        except Exception as e:
            SessionController.log_error(f"Error processing frame: {e}")
            return SessionController.error_response(str(e), 400)
    
    @staticmethod
    def end_session(session_id):
        """End eye tracking session"""
        try:
            session = session_repo.get_by_id(session_id)
            if not session:
                return SessionController.error_response('Session not found', 404)
            
            # Update session end time and frame count
            session.end_time = datetime.utcnow()
            session.total_frames = eye_tracker.get_frame_count()
            
            from app import db
            db.session.commit()
            
            # Get gaze points and calculate assessment
            gaze_points = session_repo.get_gaze_points(session_id)
            assessment = CTAssessmentService.calculate_assessment(session, gaze_points)
            
            # Save assessment
            session_repo.save_assessment(assessment)
            
            SessionController.log_info(f"Session ended: {session_id}")
            return SessionController.success_response({
                'session': session.to_dict(),
                'assessment': assessment.to_dict()
            })
        
        except Exception as e:
            SessionController.log_error(f"Error ending session: {e}")
            return SessionController.error_response(str(e), 400)
    
    @staticmethod
    def get_session_data(session_id):
        """Get session data including gaze points and assessment"""
        try:
            session = session_repo.get_by_id(session_id)
            if not session:
                return SessionController.error_response('Session not found', 404)
            
            gaze_points = session_repo.get_gaze_points(session_id)
            assessment = session_repo.get_assessment(session_id)
            
            return SessionController.success_response({
                'session': session.to_dict(),
                'gaze_points': [gp.to_dict() for gp in gaze_points],
                'assessment': assessment.to_dict() if assessment else None
            })
        
        except Exception as e:
            SessionController.log_error(f"Error getting session data: {e}")
            return SessionController.error_response(str(e), 400)
    
    @staticmethod
    def export_session_data(session_id):
        """Export session data as CSV"""
        try:
            gaze_points = session_repo.get_gaze_points(session_id)
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            writer.writerow(['Frame', 'Gaze X', 'Gaze Y', 'Timestamp', 'Fixation Duration (ms)', 'Element', 'Confidence'])
            
            for gp in gaze_points:
                writer.writerow([
                    gp.frame_number,
                    f"{gp.gaze_x:.2f}",
                    f"{gp.gaze_y:.2f}",
                    gp.timestamp.isoformat(),
                    f"{gp.fixation_duration:.2f}",
                    gp.element_focused,
                    f"{gp.confidence:.4f}"
                ])
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode()),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'eye-tracking-{session_id}.csv'
            )
        
        except Exception as e:
            SessionController.log_error(f"Error exporting session data: {e}")
            return SessionController.error_response(str(e), 400)
    
    @staticmethod
    def get_student_sessions(student_id):
        """Get all sessions for a student"""
        try:
            student = student_repo.get_by_id(student_id)
            if not student:
                return SessionController.error_response('Student not found', 404)
            
            sessions = session_repo.get_by_student_id(student_id)
            return SessionController.success_response([s.to_dict() for s in sessions])
        
        except Exception as e:
            SessionController.log_error(f"Error getting student sessions: {e}")
            return SessionController.error_response(str(e), 400)

# Routes
@session_bp.route('/session/start', methods=['POST'])
def start_session():
    return SessionController.start_session()

@session_bp.route('/session/<int:session_id>/frame', methods=['POST'])
def process_frame(session_id):
    return SessionController.process_frame(session_id)

@session_bp.route('/session/<int:session_id>/end', methods=['POST'])
def end_session(session_id):
    return SessionController.end_session(session_id)

@session_bp.route('/session/<int:session_id>/data', methods=['GET'])
def get_session_data(session_id):
    return SessionController.get_session_data(session_id)

@session_bp.route('/session/<int:session_id>/export', methods=['GET'])
def export_session_data(session_id):
    return SessionController.export_session_data(session_id)

@session_bp.route('/student/<int:student_id>/sessions', methods=['GET'])
def get_student_sessions(student_id):
    return SessionController.get_student_sessions(student_id)
