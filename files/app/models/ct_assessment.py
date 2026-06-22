"""
Computational Thinking Assessment Model
"""

from app import db
from datetime import datetime

class CTAssessment(db.Model):
    """Computational Thinking assessment database model"""
    __tablename__ = 'ct_assessment'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('eye_tracking_session.id'), nullable=False)
    decomposition_score = db.Column(db.Float)
    pattern_recognition_score = db.Column(db.Float)
    flow_understanding_score = db.Column(db.Float)
    abstraction_score = db.Column(db.Float)
    overall_ct_score = db.Column(db.Float)
    reading_efficiency = db.Column(db.Float)
    cognitive_load = db.Column(db.Float)
    error_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    assessment_notes = db.Column(db.Text)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'decomposition_score': self.decomposition_score,
            'pattern_recognition_score': self.pattern_recognition_score,
            'flow_understanding_score': self.flow_understanding_score,
            'abstraction_score': self.abstraction_score,
            'overall_ct_score': self.overall_ct_score,
            'reading_efficiency': self.reading_efficiency,
            'cognitive_load': self.cognitive_load,
            'error_count': self.error_count,
            'assessment_notes': self.assessment_notes
        }
    
    def __repr__(self):
        return f'<CTAssessment {self.id}: {self.overall_ct_score}>'
