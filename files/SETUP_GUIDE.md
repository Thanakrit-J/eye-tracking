# 🚀 Eye Tracking System - Installation Guide

## ขั้นตอนการติดตั้งและใช้งาน

### 📋 ความต้องการ
- Python 3.8+
- Docker & Docker Compose (สำหรับ PostgreSQL)
- Webcam
- Modern Web Browser (Chrome, Firefox, Edge)

---

## 1️⃣ เตรียม Database (Docker)

```bash
# ไปที่ root folder ของ project
cd d:\project_eyetracking_flowchart

# เปิด Docker Desktop ก่อน

# รัน PostgreSQL ใน Docker
docker-compose up -d

# ตรวจสอบว่า PostgreSQL รัน
docker-compose ps
```

✅ ถ้าสำเร็จจะเห็น container `postgres_db` กำลังรัน

---

## 2️⃣ ติดตั้ง Python Dependencies

```bash
# เข้าไปที่ folder files
cd files

# Activate virtual environment (venv ถูกสร้างแล้ว)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# ติดตั้ง dependencies
pip install -r requirements.txt

# ถ้า pip install ล้มเหลว ให้อัปเดต pip ก่อน
python -m pip install --upgrade pip
pip install -r requirements.txt
```

✅ ถ้าสำเร็จจะเห็น "Successfully installed ..." ทั้งหมด

---

## 3️⃣ เริ่มต้น Flask Backend

```bash
# ตรวจสอบว่า virtual environment ยังเปิดอยู่
# (Windows) ควรเห็น (venv) ในด้านหน้า terminal

# รัน Flask app
python main.py
```

✅ ถ้าสำเร็จจะเห็น:
```
WARNING in app.run(), running the development server...
Running on http://0.0.0.0:5000/
```

**⚠️ ถ้าเกิด error เรื่อง database connection:**
- ตรวจสอบว่า Docker PostgreSQL ยังรัน: `docker-compose ps`
- ตรวจสอบ `.env` file มีค่า DB_HOST, DB_PORT, DB_NAME ถูกต้อง

---

## 4️⃣ การทดสอบระบบ

### 1. ตรวจสอบการเชื่อมต่อ Database

```bash
# ใน terminal ใหม่ (ปล่อย Flask รันไว้)
# เข้า PostgreSQL container
docker exec -it postgres_db psql -U admin -d eyetracking_db

# ดู tables ที่สร้าง
\dt

# ออกจาก psql
\q
```

### 2. เทส API

```bash
# ขอ students ทั้งหมด
curl http://localhost:5000/api/students

# หรือใช้ Postman/Thunder Client ใน VS Code
```

---

## 📦 โครงสร้าง Project

```
project_eyetracking_flowchart/
├── docker-compose.yml      # PostgreSQL configuration
├── files/
│   ├── main.py            # Flask entry point
│   ├── config.py          # Flask config (ใช้ .env)
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Database credentials
│   ├── app/               # MVC Application
│   │   ├── models/        # Database models
│   │   ├── controllers/   # Request handlers
│   │   ├── repositories/  # Data access layer
│   │   └── services/      # Business logic
│   ├── venv/              # Virtual environment
│   └── *.md               # Documentation
```

---

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### ❌ Error: "ModuleNotFoundError: No module named 'mediapipe'"

```bash
# ลบ venv และสร้างใหม่
rm -rf venv
python -m venv venv
source venv/bin/activate  # หรือ venv\Scripts\activate บน Windows
pip install -r requirements.txt
```

### ❌ Error: "No module named 'dlib'"

dlib ยากในการติดตั้งบนบางระบบ วิธีแก้ไข:

```bash
# ถ้า Windows ให้ลองใช้ pre-built wheels
pip install dlib --only-binary :all:

# ถ้า macOS
brew install cmake
pip install dlib

# ถ้า Linux (Ubuntu)
sudo apt-get install python3-dev cmake
pip install dlib
```

หรือใช้ MediaPipe แทน (ทำได้ในไฟล์ app.py เดิมแล้ว)

### ❌ Error: CORS Issue

ตรวจสอบว่า Frontend URL ตรงกับ Backend URL:

```python
# app.py
CORS(app)  # รองรับทุก origin
```

สำหรับ production ให้ระบุ origin เฉพาะ:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000", "https://yourdomain.com"]
    }
})
```

### ❌ Error: "Can't open camera"

1. ตรวจสอบการอนุญาต (permissions)
2. ปิดแอป อื่นที่ใช้กล้อง
3. ลองรีสตาร์ท Browser
4. ใช้ HTTPS (บางเบราว์เซอร์ต้องการ)

### ❌ Eye Tracking ไม่ทำงาน

- ตรวจสอบการให้แสงที่ดี
- มองตรงไปที่กล้อง
- ปรับระยะห่างระหว่างหน้ากับกล้อง (30-60 ซม)
- ทำการสอบเทียม (Calibration)

---

## 🌐 Deployment

### ตัวเลือก 1: Heroku

```bash
# ติดตั้ง Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# เข้าสู่ระบบ
heroku login

# สร้างแอป
heroku create your-app-name

# ส่ง code ไปยัง Heroku
git push heroku main

# เช็คสถานะ
heroku open
```

### ตัวเลือก 2: AWS EC2

```bash
# ลงทะเบียน AWS account
# สร้าง EC2 instance (Ubuntu 20.04)

# SSH เข้าไปใน instance
ssh -i your-key.pem ec2-user@your-instance-ip

# ติดตั้ง Python & dependencies
sudo apt update
sudo apt install python3-pip python3-venv
git clone your-repo
cd eye-tracking-system

# ติดตั้ง
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# รัน
python3 app.py
```

### ตัวเลือก 3: Docker

สร้างไฟล์ `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

จากนั้น:

```bash
docker build -t eye-tracking .
docker run -p 5000:5000 eye-tracking
```

---

## 🔒 Security Considerations

1. **ปิด Debug Mode ใน Production**
   ```python
   app.run(debug=False)  # ไม่ใช่ True
   ```

2. **ใช้ Environment Variables สำหรับ Secrets**
   ```python
   from dotenv import load_dotenv
   import os
   
   DATABASE_URL = os.getenv('DATABASE_URL')
   SECRET_KEY = os.getenv('SECRET_KEY')
   ```

3. **บังคับ HTTPS**
   ```python
   from flask_talisman import Talisman
   Talisman(app)
   ```

4. **Validate User Input**
   ```python
   from flask import request
   student_id = request.json.get('student_id')
   if not isinstance(student_id, str) or len(student_id) > 20:
       return {'error': 'Invalid input'}, 400
   ```

---

## 📊 Database Operations

### ดู Database

```bash
# ใช้ SQLite Browser
sqlite3 eye_tracking.db

# คำสั่ง SQL
.tables
.schema
SELECT * FROM student;
SELECT * FROM eye_tracking_session;
```

### ส่วนสำรองข้อมูล

```bash
# Backup
cp eye_tracking.db eye_tracking.backup.db

# Restore
cp eye_tracking.backup.db eye_tracking.db
```

---

## 📈 Performance Optimization

### การเพิ่มความเร็ว

1. **ใช้ Threading สำหรับ Eye Tracking**
   ```python
   from threading import Thread
   
   def process_frames_async():
       t = Thread(target=eye_tracker.process_frame)
       t.daemon = True
       t.start()
   ```

2. **Cache ผลลัพธ์**
   ```python
   from flask_caching import Cache
   
   cache = Cache(app, config={'CACHE_TYPE': 'simple'})
   
   @app.route('/api/...')
   @cache.cached(timeout=300)
   def cached_endpoint():
       ...
   ```

3. **Compress Responses**
   ```python
   from flask_compress import Compress
   Compress(app)
   ```

### ระดับความเร็ว

| Component | FPS | Latency |
|-----------|-----|---------|
| Webcam | 30 | ~33ms |
| MediaPipe | 20-30 | ~50-100ms |
| Eye Tracking | 25-30 | ~100-150ms |
| API | 30+ | ~100-200ms |

---

## 📚 API Documentation

### POST /api/student
```bash
curl -X POST http://localhost:5000/api/student \
  -H "Content-Type: application/json" \
  -d '{
    "name": "สมชาย ใจดี",
    "student_id": "STU001",
    "grade": 8
  }'
```

### POST /api/session/start
```bash
curl -X POST http://localhost:5000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "flowchart_id": "fc_001",
    "flowchart_name": "Bubble Sort"
  }'
```

### POST /api/session/{session_id}/frame
```bash
curl -X POST http://localhost:5000/api/session/1/frame \
  -H "Content-Type: application/json" \
  -d '{
    "frame": "data:image/jpeg;base64,..."
  }'
```

### GET /api/session/{session_id}/export
```bash
curl http://localhost:5000/api/session/1/export > data.csv
```

---

## ✨ ความสามารถเพิ่มเติม

### 1. Real-time Analytics Dashboard
```python
# ใช้ Socket.IO สำหรับ Real-time updates
from flask_socketio import SocketIO, emit

socketio = SocketIO(app)

@socketio.on('connect')
def handle_connect():
    emit('message', {'data': 'Connected'})
```

### 2. Multi-User Support
```python
# ขณะนี้รองรับแล้ว - นักเรียนหลาย ๆ คนสามารถใช้พร้อมกันได้
```

### 3. Advanced CT Assessment
```python
# เพิ่มตรวจสอบ Logic Complexity Analysis
# และ Flow Chart Validation
```

### 4. Integration with LMS
```python
# เชื่อมต่อกับ Moodle, Canvas, Google Classroom
```

---

## 📞 Support & Troubleshooting

### Logs
```bash
# ดู logs จาก Flask
# ผลลัพธ์จะปรากฏ ใน terminal โดยตรง

# หรือบันทึกลง file
# เพิ่ม logging configuration
import logging
logging.basicConfig(filename='app.log', level=logging.INFO)
```

### Debug Mode
```bash
# Flask Debug Mode
FLASK_ENV=development flask run

# แหล่งข้อมูล Browser Console (F12)
# Network tab เพื่อดู API calls
```

---

## 🎓 ความรู้เพิ่มเติม

- **MediaPipe Documentation**: https://google.github.io/mediapipe/
- **Flask Documentation**: https://flask.palletsprojects.com/
- **SQLAlchemy ORM**: https://www.sqlalchemy.org/
- **Eye Tracking Research**: https://en.wikipedia.org/wiki/Eye_tracking

---

## 📝 License & Attribution

โปรเจค Eye Tracking System สำหรับการศึกษา ⏤ อิสระใช้งาน (MIT License)

---

**สำเร็จ! 🎉 ระบบพร้อมใช้แล้ว**

ถ้ามีปัญหาใด ๆ ให้ตรวจสอบ:
1. ✅ Python version >= 3.8
2. ✅ Virtual environment activated
3. ✅ Backend running on port 5000
4. ✅ Frontend accessible on port 8000/8080
5. ✅ Browser allows camera access
