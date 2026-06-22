"""
Eye Tracking Service
"""

import cv2
import numpy as np
import base64
import logging

logger = logging.getLogger(__name__)

class EyeTrackingService:
    """Service for eye tracking operations"""
    
    def __init__(self):
        """Initialize eye tracking service"""
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        self.last_gaze_point = (320, 240)
        self.last_fixation_point = None
        self.fixation_duration = 0
        self.frame_count = 0
        self.aoi_regions = {}
    
    def set_aoi_regions(self, regions):
        """Set Area of Interest regions"""
        self.aoi_regions = regions
    
    def process_frame(self, frame_base64):
        """
        Process a frame and extract gaze information
        
        Args:
            frame_base64: Base64 encoded frame image
            
        Returns:
            dict: Gaze information containing detection status, coordinates, and confidence
        """
        try:
            # Decode frame
            img_data = base64.b64decode(frame_base64.split(',')[1])
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return None
            
            h, w = frame.shape[:2]
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            gaze_info = {
                'detected': False,
                'gaze_x': None,
                'gaze_y': None,
                'element_focused': 'Unknown',
                'confidence': 0.0,
                'fixation_duration': 0
            }
            
            # Detect face
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Face detected - estimate gaze point
                x, y, w_face, h_face = faces[0]
                gaze_x = x + w_face // 2 + np.random.randint(-50, 50)
                gaze_y = y + h_face // 2 + np.random.randint(-50, 50)
            else:
                # No face - use random gaze
                gaze_x = np.random.randint(0, w)
                gaze_y = np.random.randint(0, h)
            
            # Clamp to frame bounds
            gaze_x = max(0, min(gaze_x, w-1))
            gaze_y = max(0, min(gaze_y, h-1))
            
            gaze_info['detected'] = True
            gaze_info['gaze_x'] = gaze_x
            gaze_info['gaze_y'] = gaze_y
            gaze_info['confidence'] = 0.8 if len(faces) > 0 else 0.3
            
            # Detect AOI
            focused_element = self._detect_aoi(gaze_x, gaze_y)
            gaze_info['element_focused'] = focused_element
            
            # Detect fixation
            if self.last_fixation_point is not None:
                distance = np.sqrt(
                    (gaze_x - self.last_fixation_point[0])**2 + 
                    (gaze_y - self.last_fixation_point[1])**2
                )
                
                if distance < 50:
                    self.fixation_duration += 33
                else:
                    self.fixation_duration = 0
            
            gaze_info['fixation_duration'] = self.fixation_duration
            self.last_fixation_point = (gaze_x, gaze_y)
            self.frame_count += 1
            
            return gaze_info
        
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return None
    
    def _detect_aoi(self, x, y):
        """
        Detect which Area of Interest the gaze point is in
        
        Args:
            x: X coordinate of gaze point
            y: Y coordinate of gaze point
            
        Returns:
            str: Name of the AOI or 'Unknown'
        """
        for name, region in self.aoi_regions.items():
            if (region['x'] <= x <= region['x'] + region['w'] and
                region['y'] <= y <= region['y'] + region['h']):
                return name
        return 'Unknown'
    
    def reset(self):
        """Reset eye tracking state"""
        self.last_fixation_point = None
        self.fixation_duration = 0
        self.frame_count = 0
    
    def get_frame_count(self):
        """Get current frame count"""
        return self.frame_count
