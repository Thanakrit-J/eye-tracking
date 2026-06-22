"""
CT Assessment Service
"""

import numpy as np
from app.models.ct_assessment import CTAssessment
import logging

logger = logging.getLogger(__name__)

class CTAssessmentService:
    """Service for computational thinking assessment calculations"""
    
    @staticmethod
    def calculate_assessment(session, gaze_points):
        """
        Calculate comprehensive CT assessment from gaze data
        
        Args:
            session: EyeTrackingSession instance
            gaze_points: List of GazePoint instances
            
        Returns:
            CTAssessment: Assessment object with calculated scores
        """
        try:
            if not gaze_points:
                return CTAssessment(session_id=session.id)
            
            # Extract metrics from gaze points
            element_counts = {}
            fixation_durations = []
            
            for gp in gaze_points:
                if gp.element_focused:
                    element_counts[gp.element_focused] = element_counts.get(gp.element_focused, 0) + 1
                if gp.fixation_duration:
                    fixation_durations.append(gp.fixation_duration)
            
            # Calculate individual scores
            decomposition_score = CTAssessmentService._calculate_decomposition_score(element_counts)
            pattern_score = CTAssessmentService._calculate_pattern_score(fixation_durations)
            flow_score = CTAssessmentService._calculate_flow_score(gaze_points)
            abstraction_score = CTAssessmentService._calculate_abstraction_score(element_counts)
            
            # Calculate overall CT score
            overall_score = (
                decomposition_score * 0.25 + 
                pattern_score * 0.25 + 
                flow_score * 0.25 + 
                abstraction_score * 0.25
            )
            
            # Calculate efficiency metrics
            reading_efficiency = CTAssessmentService._calculate_reading_efficiency(
                len(element_counts), 
                session.total_frames
            )
            cognitive_load = CTAssessmentService._calculate_cognitive_load(fixation_durations)
            error_count = sum(1 for gp in gaze_points if not gp.element_focused)
            
            # Create assessment
            assessment = CTAssessment(
                session_id=session.id,
                decomposition_score=float(decomposition_score),
                pattern_recognition_score=float(pattern_score),
                flow_understanding_score=float(flow_score),
                abstraction_score=float(abstraction_score),
                overall_ct_score=float(overall_score),
                reading_efficiency=float(reading_efficiency),
                cognitive_load=float(cognitive_load),
                error_count=int(error_count),
                assessment_notes=f"Analyzed {len(gaze_points)} gaze points from {len(element_counts)} elements"
            )
            
            return assessment
        
        except Exception as e:
            logger.error(f"Error calculating assessment: {e}")
            return CTAssessment(session_id=session.id)
    
    @staticmethod
    def _calculate_decomposition_score(element_counts):
        """Calculate decomposition score (how many elements were examined)"""
        unique_elements = len(element_counts)
        return min(100, (unique_elements / 5) * 100)
    
    @staticmethod
    def _calculate_pattern_score(fixation_durations):
        """Calculate pattern recognition score"""
        if not fixation_durations:
            return 0
        
        fixation_variance = np.var(fixation_durations)
        return max(0, 100 - (fixation_variance / 100))
    
    @staticmethod
    def _calculate_flow_score(gaze_points):
        """Calculate flow understanding score (logical sequence)"""
        flow_sequence = []
        for gp in gaze_points:
            if gp.element_focused and (not flow_sequence or gp.element_focused != flow_sequence[-1]):
                flow_sequence.append(gp.element_focused)
        
        return min(100, (len(flow_sequence) / 5) * 100)
    
    @staticmethod
    def _calculate_abstraction_score(element_counts):
        """Calculate abstraction score (minimal backtracking)"""
        revisit_count = sum(1 for count in element_counts.values() if count > 1)
        return max(0, 100 - (revisit_count * 15))
    
    @staticmethod
    def _calculate_reading_efficiency(unique_elements, total_frames):
        """Calculate reading efficiency"""
        reading_time = total_frames * 33 / 1000  # milliseconds to seconds
        return min(100, (unique_elements / max(reading_time, 1)) * 10)
    
    @staticmethod
    def _calculate_cognitive_load(fixation_durations):
        """Calculate cognitive load"""
        if not fixation_durations:
            return 0
        
        avg_fixation = np.mean(fixation_durations)
        return min(100, (avg_fixation / 500) * 100)
