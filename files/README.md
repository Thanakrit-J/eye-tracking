# 👁️ Eye Tracking System - วินิจฉัยการคิดเชิงคำนวณ

ระบบการติดตามสายตา (Eye Tracking) เพื่อวินิจฉัยความสามารถในการคิดเชิงคำนวณของนักเรียนระดับมัธยมศึกษาจากการอ่านผังงาน

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ ความสามารถ

### 👁️ Eye Tracking
- ✅ ติดตามสายตาผ่าน Webcam ด้วย MediaPipe
- ✅ ตรวจจับจุด Fixation และ Saccade
- ✅ บันทึกข้อมูลการมองตาแบบ Real-time
- ✅ ความแม่นยำ 40-70 pixels

### 📊 การประเมิน CT (Computational Thinking)
- ✅ วัด 4 ด้าน:
  - 📍 การแยกส่วน (Decomposition)
  - 🔍 การรู้จำรูปแบบ (Pattern Recognition)
  - ➡️ ความเข้าใจการไหล (Flow Understanding)
  - 💭 ความเป็นนามธรรม (Abstraction)
- ✅ คะแนนรวม 0-100

### 📈 ฟีเจอร์อื่น ๆ
- ✅ ระบบจัดการนักเรียน
- ✅ Flowchart Analysis
- ✅ ส่งออกข้อมูล CSV
- ✅ Dashboard สรุปผล
- ✅ Support หลาย Flowchart difficulty levels

---

## 🚀 Quick Start

### ข้อกำหนด
- Python 3.8+
- Docker & Docker Compose
- Webcam
- Modern Web Browser

### การติดตั้ง (3 ขั้นตอน)

#### 1️⃣ เตรียม Database (Docker)
```bash
# ไปที่ root folder ของ project
cd project_eyetracking_flowchart

# เปิด Docker Desktop ก่อน

# รัน PostgreSQL
docker-compose up -d

# ตรวจสอบว่า database รัน
docker-compose ps
```

#### 2️⃣ ติดตั้ง Dependencies
```bash
# เข้า folder files
cd files

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# ติดตั้ง packages
pip install -r requirements.txt
```

#### 3️⃣ รัน Flask Backend
```bash
# ตรวจสอบว่า venv ยังเปิด
python main.py
```

### ทดสอบระบบ
```bash
# Health check
curl http://localhost:5000/api/health

# สร้าง student
curl -X POST http://localhost:5000/api/student \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "student_id": "STU001", "grade": 8}'
```

---

## 📋 โครงสร้างโปรเจค

```
project_eyetracking_flowchart/
├── docker-compose.yml              # PostgreSQL configuration
│
├── files/                           # Main application
│   ├── main.py                     # Flask entry point
│   ├── config.py                   # Configuration (reads .env)
│   ├── .env                        # Environment variables
│   ├── requirements.txt            # Python dependencies
│   │
│   ├── app/                        # MVC Application
│   │   ├── __init__.py            # Flask app factory
│   │   ├── models/                # Database models
│   │   │   ├── student.py
│   │   │   ├── eye_tracking_session.py
│   │   │   ├── gaze_point.py
│   │   │   └── ct_assessment.py
│   │   │
│   │   ├── controllers/            # Request handlers
│   │   │   ├── base_controller.py
│   │   │   ├── student_controller.py
│   │   │   └── session_controller.py
│   │   │
│   │   ├── repositories/           # Data access layer
│   │   │   ├── base_repository.py
│   │   │   ├── student_repository.py
│   │   │   └── session_repository.py
│   │   │
│   │   └── services/               # Business logic
│   │       ├── eye_tracking_service.py
│   │       └── ct_assessment_service.py
│   │
│   ├── venv/                       # Virtual environment
│   │
│   └── Documentation/
│       ├── README.md              # This file
│       ├── SETUP_GUIDE.md
│       ├── PROJECT_STRUCTURE.md
│       ├── DATABASE_TABLES.md
│       └── USAGE_EXAMPLES.md
```

---

## 🔧 Architecture

### System Flow
```
🎥 Webcam Input
      ↓
💻 Frontend (HTML/JS)
      ↓ (HTTP POST)
🐍 Flask Backend (MVC)
      ↓
📊 MediaPipe Eye Tracker
      ↓
🗄️ PostgreSQL Database
      ↓
📈 CT Assessment Engine
      ↓
📋 Report & Export
```

### Database Schema (PostgreSQL)
```
Student
├── id (PK)
├── name
├── student_id (UNIQUE)
├── grade
└── sessions → EyeTrackingSession

EyeTrackingSession
├── id (PK)
├── student_id (FK)
├── flowchart_id
├── flowchart_name
├── start_time
├── end_time
├── total_frames
└── gaze_points → GazePoint
└── assessment → CTAssessment

GazePoint
├── id (PK)
├── session_id (FK)
├── frame_number
├── gaze_x, gaze_y
├── fixation_duration
├── element_focused
└── confidence

CTAssessment
├── id (PK)
├── session_id (FK)
├── decomposition_score (0-100)
├── pattern_recognition_score
├── flow_understanding_score
├── abstraction_score
├── overall_ct_score
├── reading_efficiency
├── cognitive_load
└── error_count
```

---

## 📡 API Documentation

### Health Check
```bash
GET /api/health
```

### Student Management
```bash
# Create Student
POST /api/student
{
  "name": "สมชาย ใจดี",
  "student_id": "STU001",
  "grade": 8
}

# Get Student
GET /api/student/<student_id>
```

### Session Management
```bash
# Start Session
POST /api/session/start
{
  "student_id": 1,
  "flowchart_id": "fc_001",
  "flowchart_name": "Bubble Sort",
  "aoi_regions": { ... }
}

# Process Frame
POST /api/session/<session_id>/frame
{
  "frame": "data:image/jpeg;base64,..."
}

# End Session
POST /api/session/<session_id>/end

# Export Data
GET /api/session/<session_id>/export
```

### Reports
```bash
# Get Student Report
GET /api/student/<student_id>/report
```

---

## 💡 วิธีใช้งาน

### 1. ลงทะเบียนนักเรียน
- กรอก: รหัส, ชื่อ, ชั้นเรียน
- คลิก "ลงทะเบียนนักเรียน"

### 2. เตรียมการ
- เลือกชื่อและความยากของ Flowchart
- คลิก "เริ่มเซชันใหม่"

### 3. การใช้ Eye Tracking
- คลิก "เปิดกล้อง" (อนุญาตกล้อง)
- คลิก "สอบเทียม" (ปรับสอบเทียมสายตา)
- ดูผังงานและตอบคำถาม

### 4. ผลลัพธ์
- คลิก "สิ้นสุด" เมื่อจบ
- ดูผลการประเมิน CT
- ส่งออกข้อมูลเป็น CSV

---

## 📊 Computational Thinking Assessment

### คะแนนแต่ละด้าน (0-100)

#### 1. Decomposition (การแยกส่วน)
- วัด: จำนวนองค์ประกอบที่มองและการกระจายของ fixation
- ผลดี: นักเรียนมองทุกส่วนของผังงาน
- ผลไม่ดี: มองเพียงส่วนเดียว

#### 2. Pattern Recognition (การรู้จำรูปแบบ)
- วัด: ความสม่ำเสมอของ fixation duration
- ผลดี: เวลาการมองตรงมีความสม่ำเสมอ
- ผลไม่ดี: เวลาการมองตรงผันผวน

#### 3. Flow Understanding (ความเข้าใจการไหล)
- วัด: ลำดับการมองตรงตามตรรกะของผังงาน
- ผลดี: ตามลำดับเหตุและผล
- ผลไม่ดี: ลำดับไม่สอดคล้องกับตรรกะ

#### 4. Abstraction (ความเป็นนามธรรม)
- วัด: จำนวนครั้งที่ revisit องค์ประกอบ
- ผลดี: ไม่ต้องกลับมามองซ้ำ
- ผลไม่ดี: มองซ้ำ ๆ อย่างบ้าคลั่ง

### Overall CT Score
```
Overall = (Decomposition × 0.25) +
          (Pattern Recognition × 0.25) +
          (Flow Understanding × 0.25) +
          (Abstraction × 0.25)
```

---

## ⚙️ Configuration

### ปรับแต่ง AOI (Area of Interest)
ใน `app.py`:
```python
aoi_regions = {
    'START': {'x': 200, 'y': 20, 'w': 240, 'h': 60},
    'Input': {'x': 200, 'y': 100, 'w': 240, 'h': 100},
    'Decision': {'x': 200, 'y': 220, 'w': 240, 'h': 80},
    # ...
}
```

### ปรับแต่ง Thresholds
ใน `app.py`:
```python
FIXATION_DISTANCE_THRESHOLD = 50  # pixels
FIXATION_MIN_DURATION = 100  # ms
```

---

## 🔍 Troubleshooting

### ❌ "Cannot open camera"
- ตรวจสอบการอนุญาต Browser
- ปิดแอปอื่นที่ใช้กล้อง
- รีสตาร์ท Browser

### ❌ "ModuleNotFoundError"
```bash
# ลบและสร้าง virtual environment ใหม่
rm -rf venv
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate บน Windows
pip install -r requirements.txt
```

### ❌ CORS Error
- ตรวจสอบ Frontend URL ตรงกับ Backend
- ส่วนใหญ่ CORS setting ปิดแล้ว (ดูที่ app.py)

### ❌ Eye Tracking ไม่ทำงาน
- ตรวจสอบแสงที่ดี
- ปรับระยะห่างหน้า-กล้อง (30-60 ซม)
- ทำการสอบเทียม

### ❌ Database Error
```bash
# ลบ database เดิม
rm eye_tracking.db

# สร้างใหม่
python3 -c "from app import app, db; app.app_context().push(); db.create_all()"
```

---

## 📚 Documentation

- **[Installation Guide](./SETUP_GUIDE.md)** - ขั้นตอนติดตั้งรายละเอียด
- **[API Reference](./SETUP_GUIDE.md#-api-documentation)** - API endpoints
- **[Troubleshooting](./SETUP_GUIDE.md#-การแก้ไขปัญหาที่พบบ่อย)** - การแก้ไขปัญหา

---

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku open
```

### AWS EC2
```bash
# See SETUP_GUIDE.md for details
```

### Docker
```bash
docker build -t eye-tracking .
docker run -p 5000:5000 eye-tracking
```

---

## 📊 Performance

| Component | FPS | Latency |
|-----------|-----|---------|
| Webcam | 30 | ~33ms |
| MediaPipe | 25-30 | ~50-100ms |
| Eye Tracking | 25-30 | ~100-150ms |
| Total | 20-25 | ~200-300ms |

---

## 🔐 Security

- ✅ CORS enabled (ปรับเปลี่ยนสำหรับ Production)
- ✅ Database validation
- ⚠️ ปิด Debug mode ใน Production
- ⚠️ ใช้ HTTPS สำหรับ Production

---

## 📈 ความสามารถในอนาคต

- [ ] Real-time dashboard
- [ ] Multi-student simultaneous testing
- [ ] Advanced CT metrics
- [ ] LMS integration (Moodle, Canvas)
- [ ] Mobile app
- [ ] Offline support
- [ ] Machine learning predictions

---

## 📝 License

MIT License - สามารถใช้งานแบบอิสระ

---

## 👥 Author

ระบบ Eye Tracking สำหรับวินิจฉัยการคิดเชิงคำนวณ

---

## 💬 Support

หากมีข้อสงสัยหรือปัญหา:
1. ดู [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. ตรวจสอบ Logs ใน Terminal
3. ลองแก้ไขจาก Troubleshooting section

---

## 🎯 Quick Reference

### การเริ่มต้น
```bash
# Terminal 1: Backend
source venv/bin/activate  # หรือ venv\Scripts\activate บน Windows
python app.py

# Terminal 2: Frontend
python -m http.server 8000

# เปิดบ้านน: http://localhost:8000/index.html
```

### การส่งออกข้อมูล
```bash
# CSV export (automatic)
# จะดาวน์โหลดเมื่อสิ้นสุดเซชัน

# Manual export
curl http://localhost:5000/api/session/1/export > data.csv
```

### Database
```bash
# ดู data
sqlite3 eye_tracking.db
.tables
SELECT * FROM student;

# Backup
cp eye_tracking.db eye_tracking.backup.db
```

---

**สำหรับการให้ความสำคัญกับการศึกษา ระบบนี้เป็นเครื่องมือที่มีประโยชน์สำหรับครูและนักศึกษา** 🎓

---

**Last Updated**: 2024
**Version**: 1.0.0
