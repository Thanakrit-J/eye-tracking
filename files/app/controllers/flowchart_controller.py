"""
Flowchart Controller
"""

from flask import Blueprint, request, jsonify
from app.controllers.base_controller import BaseController
from app.repositories.flowchart_repository import FlowchartRepository

# Create blueprint
flowchart_bp = Blueprint('flowchart', __name__, url_prefix='/api')

# Initialize repository
flowchart_repo = FlowchartRepository()

class FlowchartController(BaseController):
    """Controller for flowchart operations"""
    
    @staticmethod
    def get_all_flowcharts():
        """Get all active flowcharts"""
        try:
            flowcharts = flowchart_repo.get_active()
            return FlowchartController.success_response([f.to_dict() for f in flowcharts])
        
        except Exception as e:
            FlowchartController.log_error(f"Error getting flowcharts: {e}")
            return FlowchartController.error_response(str(e), 400)
    
    @staticmethod
    def get_flowchart(flowchart_id):
        """Get flowchart by ID"""
        try:
            flowchart = flowchart_repo.get_by_flowchart_id(flowchart_id)
            
            if not flowchart:
                return FlowchartController.error_response('Flowchart not found', 404)
            
            return FlowchartController.success_response(flowchart.to_dict())
        
        except Exception as e:
            FlowchartController.log_error(f"Error getting flowchart: {e}")
            return FlowchartController.error_response(str(e), 400)
    
    @staticmethod
    def get_by_difficulty(difficulty):
        """Get flowcharts by difficulty"""
        try:
            flowcharts = flowchart_repo.get_by_difficulty(difficulty)
            return FlowchartController.success_response([f.to_dict() for f in flowcharts])
        
        except Exception as e:
            FlowchartController.log_error(f"Error getting flowcharts by difficulty: {e}")
            return FlowchartController.error_response(str(e), 400)
    
    @staticmethod
    def create_flowchart():
        """Create a new flowchart"""
        try:
            data = request.json
            
            if not data or not data.get('flowchart_id') or not data.get('name'):
                return FlowchartController.error_response('flowchart_id and name are required', 400)
            
            # Check if flowchart already exists
            existing = flowchart_repo.get_by_flowchart_id(data.get('flowchart_id'))
            if existing:
                return FlowchartController.error_response('Flowchart already exists', 400)
            
            flowchart = flowchart_repo.create(
                flowchart_id=data.get('flowchart_id'),
                name=data.get('name'),
                difficulty=data.get('difficulty', 'medium'),
                description=data.get('description'),
                algorithm_type=data.get('algorithm_type'),
                steps=data.get('steps'),
                image_url=data.get('image_url')
            )
            
            FlowchartController.log_info(f"Flowchart created: {flowchart.flowchart_id}")
            return FlowchartController.success_response(flowchart.to_dict(), 201)
        
        except Exception as e:
            FlowchartController.log_error(f"Error creating flowchart: {e}")
            return FlowchartController.error_response(str(e), 400)

# Routes
@flowchart_bp.route('/flowchart', methods=['GET'])
def get_all_flowcharts():
    return FlowchartController.get_all_flowcharts()

@flowchart_bp.route('/flowchart/<flowchart_id>', methods=['GET'])
def get_flowchart(flowchart_id):
    return FlowchartController.get_flowchart(flowchart_id)

@flowchart_bp.route('/flowchart/difficulty/<difficulty>', methods=['GET'])
def get_by_difficulty(difficulty):
    return FlowchartController.get_by_difficulty(difficulty)

@flowchart_bp.route('/flowchart', methods=['POST'])
def create_flowchart():
    return FlowchartController.create_flowchart()
