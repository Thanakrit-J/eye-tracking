"""
Flowchart Model
"""

from app import db
from datetime import datetime

class Flowchart(db.Model):
    """Flowchart database model"""
    __tablename__ = 'flowchart'
    
    id = db.Column(db.Integer, primary_key=True)
    flowchart_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    algorithm_type = db.Column(db.String(100))  # e.g., sorting, searching
    steps = db.Column(db.Integer)  # Number of steps in flowchart
    image_url = db.Column(db.String(500))  # URL to flowchart image
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sessions = db.relationship('EyeTrackingSession', backref='flowchart_obj', lazy=True, foreign_keys='EyeTrackingSession.flowchart_id_ref')
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'flowchart_id': self.flowchart_id,
            'name': self.name,
            'description': self.description,
            'difficulty': self.difficulty,
            'algorithm_type': self.algorithm_type,
            'steps': self.steps,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Flowchart {self.flowchart_id}: {self.name}>'
