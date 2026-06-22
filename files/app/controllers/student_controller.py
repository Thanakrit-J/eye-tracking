"""
Student Controller
"""

from flask import Blueprint, request, jsonify
from app.controllers.base_controller import BaseController
from app.repositories.student_repository import StudentRepository

# Create blueprint
student_bp = Blueprint('student', __name__, url_prefix='/api')

# Initialize repository
student_repo = StudentRepository()

class StudentController(BaseController):
    """Controller for student operations"""
    
    @staticmethod
    def create_student():
        """Create a new student"""
        try:
            data = request.json
            
            if not data or not data.get('name') or not data.get('student_id'):
                return StudentController.error_response('Name and student_id are required', 400)
            
            student = student_repo.create(
                name=data.get('name'),
                student_id=data.get('student_id'),
                grade=data.get('grade')
            )
            
            StudentController.log_info(f"Student created: {student.student_id}")
            return StudentController.success_response(student.to_dict(), 201)
        
        except Exception as e:
            StudentController.log_error(f"Error creating student: {e}")
            return StudentController.error_response(str(e), 400)
    
    @staticmethod
    def get_student(student_id):
        """Get student by ID"""
        try:
            student = student_repo.get_by_student_id(student_id)
            
            if not student:
                return StudentController.error_response('Student not found', 404)
            
            return StudentController.success_response(student.to_dict())
        
        except Exception as e:
            StudentController.log_error(f"Error getting student: {e}")
            return StudentController.error_response(str(e), 400)
    
    @staticmethod
    def get_all_students():
        """Get all students"""
        try:
            students = student_repo.get_all()
            return StudentController.success_response([s.to_dict() for s in students])
        
        except Exception as e:
            StudentController.log_error(f"Error getting students: {e}")
            return StudentController.error_response(str(e), 400)
    
    @staticmethod
    def update_student(student_id):
        """Update student information"""
        try:
            student = student_repo.get_by_student_id(student_id)
            
            if not student:
                return StudentController.error_response('Student not found', 404)
            
            data = request.json
            updated_student = student_repo.update(student.id, **data)
            
            StudentController.log_info(f"Student updated: {student_id}")
            return StudentController.success_response(updated_student.to_dict())
        
        except Exception as e:
            StudentController.log_error(f"Error updating student: {e}")
            return StudentController.error_response(str(e), 400)
    
    @staticmethod
    def delete_student(student_id):
        """Delete a student"""
        try:
            student = student_repo.get_by_student_id(student_id)
            
            if not student:
                return StudentController.error_response('Student not found', 404)
            
            student_repo.delete(student.id)
            StudentController.log_info(f"Student deleted: {student_id}")
            
            return StudentController.success_response({'message': 'Student deleted successfully'})
        
        except Exception as e:
            StudentController.log_error(f"Error deleting student: {e}")
            return StudentController.error_response(str(e), 400)

# Routes
@student_bp.route('/student', methods=['POST'])
def create_student():
    return StudentController.create_student()

@student_bp.route('/student/<student_id>', methods=['GET'])
def get_student(student_id):
    return StudentController.get_student(student_id)

@student_bp.route('/student', methods=['GET'])
def get_all_students():
    return StudentController.get_all_students()

@student_bp.route('/student/<student_id>', methods=['PUT'])
def update_student(student_id):
    return StudentController.update_student(student_id)

@student_bp.route('/student/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    return StudentController.delete_student(student_id)
