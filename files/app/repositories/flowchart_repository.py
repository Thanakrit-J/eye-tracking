"""
Flowchart Repository
"""

from app import db
from app.repositories.base_repository import BaseRepository
from app.models.flowchart import Flowchart

class FlowchartRepository(BaseRepository):
    """Repository for Flowchart operations"""
    
    def __init__(self):
        super().__init__(Flowchart)
    
    def get_by_flowchart_id(self, flowchart_id):
        """Get flowchart by flowchart_id"""
        return self.model.query.filter_by(flowchart_id=flowchart_id).first()
    
    def get_by_difficulty(self, difficulty):
        """Get all flowcharts by difficulty level"""
        return self.model.query.filter_by(difficulty=difficulty, is_active=True).all()
    
    def get_active(self):
        """Get all active flowcharts"""
        return self.model.query.filter_by(is_active=True).all()
    
    def get_by_algorithm(self, algorithm_type):
        """Get flowcharts by algorithm type"""
        return self.model.query.filter_by(algorithm_type=algorithm_type, is_active=True).all()
    
    def create(self, flowchart_id, name, difficulty='medium', **kwargs):
        """Create a new flowchart"""
        flowchart = self.model(
            flowchart_id=flowchart_id,
            name=name,
            difficulty=difficulty,
            **kwargs
        )
        db.session.add(flowchart)
        db.session.commit()
        return flowchart
