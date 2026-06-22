"""
Eye Tracking Session Model
"""

from app import db
from datetime import datetime

class EyeTrackingSession(db.Model):
    """Eye tracking session database model"""
    __tablename__ = 'eye_tracking_session'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    flowchart_id_ref = db.Column(db.Integer, db.ForeignKey('flowchart.id'), nullable=True)
    flowchart_id = db.Column(db.String(50))
    flowchart_name = db.Column(db.String(200))
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    total_frames = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float)
    notes = db.Column(db.Text)
    
    # Relationships
    gaze_points = db.relationship('GazePoint', backref='session', lazy=True, cascade='all, delete-orphan')
    ct_assessment = db.relationship('CTAssessment', backref='session', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'flowchart_id': self.flowchart_id,
            'flowchart_name': self.flowchart_name,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'total_frames': self.total_frames,
            'accuracy': self.accuracy
        }
    
    def __repr__(self):
        return f'<EyeTrackingSession {self.id}: {self.flowchart_name}>'
