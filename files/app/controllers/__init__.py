"""
Controllers Package
"""

from app.controllers.student_controller import student_bp
from app.controllers.session_controller import session_bp

__all__ = ['student_bp', 'session_bp']
