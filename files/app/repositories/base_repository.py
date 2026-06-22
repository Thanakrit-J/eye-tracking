"""
Base Repository Class
"""

from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)

class BaseRepository(ABC):
    """Abstract base repository class"""
    
    def __init__(self, model):
        self.model = model
    
    def create(self, **kwargs):
        """Create a new record"""
        try:
            instance = self.model(**kwargs)
            from app import db
            db.session.add(instance)
            db.session.commit()
            return instance
        except Exception as e:
            from app import db
            db.session.rollback()
            logger.error(f"Error creating {self.model.__name__}: {e}")
            raise
    
    def get_by_id(self, id):
        """Get record by ID"""
        try:
            return self.model.query.get(id)
        except Exception as e:
            logger.error(f"Error getting {self.model.__name__} by ID {id}: {e}")
            return None
    
    def get_all(self):
        """Get all records"""
        try:
            return self.model.query.all()
        except Exception as e:
            logger.error(f"Error getting all {self.model.__name__}: {e}")
            return []
    
    def update(self, id, **kwargs):
        """Update a record"""
        try:
            instance = self.model.query.get(id)
            if not instance:
                return None
            
            for key, value in kwargs.items():
                setattr(instance, key, value)
            
            from app import db
            db.session.commit()
            return instance
        except Exception as e:
            from app import db
            db.session.rollback()
            logger.error(f"Error updating {self.model.__name__}: {e}")
            raise
    
    def delete(self, id):
        """Delete a record"""
        try:
            instance = self.model.query.get(id)
            if not instance:
                return False
            
            from app import db
            db.session.delete(instance)
            db.session.commit()
            return True
        except Exception as e:
            from app import db
            db.session.rollback()
            logger.error(f"Error deleting {self.model.__name__}: {e}")
            raise
