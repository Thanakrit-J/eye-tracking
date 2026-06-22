"""
Base Controller Class
"""

from flask import jsonify
import logging

logger = logging.getLogger(__name__)

class BaseController:
    """Base controller with common methods"""
    
    @staticmethod
    def success_response(data, status_code=200):
        """Return success response"""
        return jsonify({'success': True, 'data': data}), status_code
    
    @staticmethod
    def error_response(error, status_code=400):
        """Return error response"""
        return jsonify({'success': False, 'error': str(error)}), status_code
    
    @staticmethod
    def log_info(message):
        """Log info message"""
        logger.info(message)
    
    @staticmethod
    def log_error(message):
        """Log error message"""
        logger.error(message)
