"""
Gaze Point Model
"""

from app import db
from datetime import datetime

class GazePoint(db.Model):
    """Gaze point database model"""
    __tablename__ = 'gaze_point'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('eye_tracking_session.id'), nullable=False)
    frame_number = db.Column(db.Integer)
    gaze_x = db.Column(db.Float)
    gaze_y = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    fixation_duration = db.Column(db.Float)
    element_focused = db.Column(db.String(100))
    confidence = db.Column(db.Float)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'frame_number': self.frame_number,
            'gaze_x': self.gaze_x,
            'gaze_y': self.gaze_y,
            'timestamp': self.timestamp.isoformat(),
            'fixation_duration': self.fixation_duration,
            'element_focused': self.element_focused,
            'confidence': self.confidence
        }
    
    def __repr__(self):
        return f'<GazePoint {self.id}: ({self.gaze_x}, {self.gaze_y})>'
