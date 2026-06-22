"""
Student Repository
"""

from app.repositories.base_repository import BaseRepository
from app.models.student import Student
import logging

logger = logging.getLogger(__name__)

class StudentRepository(BaseRepository):
    """Repository for Student model"""
    
    def __init__(self):
        super().__init__(Student)
    
    def get_by_student_id(self, student_id):
        """Get student by student_id"""
        try:
            return Student.query.filter_by(student_id=student_id).first()
        except Exception as e:
            logger.error(f"Error getting student by ID {student_id}: {e}")
            return None
    
    def get_by_grade(self, grade):
        """Get all students by grade"""
        try:
            return Student.query.filter_by(grade=grade).all()
        except Exception as e:
            logger.error(f"Error getting students by grade {grade}: {e}")
            return []
