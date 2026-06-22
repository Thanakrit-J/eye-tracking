"""
Configuration file for Eye Tracking System (Fixed Production URI Properties)
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    
    # Database configurations
    DB_USER = os.getenv('DB_USER', 'admin')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'admin')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'eyetracking_db')
    
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        # ตรวจสอบค่า DATABASE_URL เป็นอันดับแรก หากไม่มีให้ใช้โครงสร้าง Postgres Docker คอนฟิก
        default_postgres = f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return os.getenv('DATABASE_URL', default_postgres)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRAME_RATE = 30  
    AOI_DISTANCE_THRESHOLD = 50  
    FIXATION_THRESHOLD = 33  

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        return "sqlite:///:memory:"

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}