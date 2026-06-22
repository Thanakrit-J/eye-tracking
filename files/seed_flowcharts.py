"""
Seed sample flowcharts to database
Run: python seed_flowcharts.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models.flowchart import Flowchart
from datetime import datetime

app = create_app('development')

with app.app_context():
    # Check if flowcharts already exist
    existing = Flowchart.query.first()
    if existing:
        print("❌ Flowcharts already exist in database")
        print("To reset, run: flask db reset")
        sys.exit(0)
    
    # Sample flowcharts
    flowcharts = [
        {
            'flowchart_id': 'fc_001',
            'name': 'Bubble Sort',
            'description': 'เรียงข้อมูลโดยการเปรียบเทียบ 2 ตัวติดกัน',
            'difficulty': 'easy',
            'algorithm_type': 'Sorting',
            'steps': 5,
            'image_url': 'https://via.placeholder.com/400x300?text=Bubble+Sort'
        },
        {
            'flowchart_id': 'fc_002',
            'name': 'Linear Search',
            'description': 'ค้นหาข้อมูลโดยการตรวจสอบตัวต่อตัว',
            'difficulty': 'easy',
            'algorithm_type': 'Searching',
            'steps': 4,
            'image_url': 'https://via.placeholder.com/400x300?text=Linear+Search'
        },
        {
            'flowchart_id': 'fc_003',
            'name': 'Binary Search',
            'description': 'ค้นหาข้อมูลโดยการแบ่งครึ่งอย่างต่อเนื่อง',
            'difficulty': 'medium',
            'algorithm_type': 'Searching',
            'steps': 6,
            'image_url': 'https://via.placeholder.com/400x300?text=Binary+Search'
        },
        {
            'flowchart_id': 'fc_004',
            'name': 'Quick Sort',
            'description': 'เรียงข้อมูลโดยการแบ่งและพิชิต',
            'difficulty': 'hard',
            'algorithm_type': 'Sorting',
            'steps': 8,
            'image_url': 'https://via.placeholder.com/400x300?text=Quick+Sort'
        },
        {
            'flowchart_id': 'fc_005',
            'name': 'Fibonacci Sequence',
            'description': 'การหาลำดับ Fibonacci',
            'difficulty': 'medium',
            'algorithm_type': 'Recursion',
            'steps': 5,
            'image_url': 'https://via.placeholder.com/400x300?text=Fibonacci'
        }
    ]
    
    # Insert flowcharts
    for fc_data in flowcharts:
        flowchart = Flowchart(**fc_data, is_active=True)
        db.session.add(flowchart)
        print(f"✅ Added: {fc_data['name']}")
    
    db.session.commit()
    print(f"\n✅ Successfully added {len(flowcharts)} flowcharts!")
