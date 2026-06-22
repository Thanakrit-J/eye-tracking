"""
Session Repository
"""

from app.repositories.base_repository import BaseRepository
from app.models.eye_tracking_session import EyeTrackingSession
from app.models.gaze_point import GazePoint
from app.models.ct_assessment import CTAssessment
import logging

logger = logging.getLogger(__name__)

class SessionRepository(BaseRepository):
    """Repository for EyeTrackingSession model"""
    
    def __init__(self):
        super().__init__(EyeTrackingSession)
    
    def get_by_student_id(self, student_id):
        """Get all sessions by student ID"""
        try:
            return EyeTrackingSession.query.filter_by(student_id=student_id).all()
        except Exception as e:
            logger.error(f"Error getting sessions for student {student_id}: {e}")
            return []
    
    def get_gaze_points(self, session_id):
        """Get all gaze points for a session"""
        try:
            return GazePoint.query.filter_by(session_id=session_id).all()
        except Exception as e:
            logger.error(f"Error getting gaze points for session {session_id}: {e}")
            return []
    
    def add_gaze_point(self, session_id, gaze_data):
        """Add a gaze point to a session"""
        try:
            gaze_point = GazePoint(session_id=session_id, **gaze_data)
            from app import db
            db.session.add(gaze_point)
            db.session.commit()
            return gaze_point
        except Exception as e:
            from app import db
            db.session.rollback()
            logger.error(f"Error adding gaze point: {e}")
            raise
    
    def get_assessment(self, session_id):
        """Get CT assessment for a session"""
        try:
            return CTAssessment.query.filter_by(session_id=session_id).first()
        except Exception as e:
            logger.error(f"Error getting assessment for session {session_id}: {e}")
            return None
    
    def save_assessment(self, assessment):
        """Save CT assessment"""
        try:
            from app import db
            db.session.add(assessment)
            db.session.commit()
            return assessment
        except Exception as e:
            from app import db
            db.session.rollback()
            logger.error(f"Error saving assessment: {e}")
            raise
