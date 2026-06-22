"""
Student Model
"""

from app import db
from datetime import datetime

class Student(db.Model):
    """Student database model"""
    __tablename__ = 'student'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    grade = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sessions = db.relationship('EyeTrackingSession', backref='student', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'student_id': self.student_id,
            'grade': self.grade,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Student {self.student_id}: {self.name}>'
