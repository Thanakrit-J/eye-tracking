# Eye Tracking System - MVC Architecture Documentation

## 📁 Project Structure

```
app/
├── __init__.py                          # Flask app factory
├── models/                              # Database models (M in MVC)
│   ├── __init__.py
│   ├── student.py                       # Student model
│   ├── eye_tracking_session.py          # Session model
│   ├── gaze_point.py                    # Gaze point model
│   └── ct_assessment.py                 # CT assessment model
├── repositories/                        # Data access layer (Repository pattern)
│   ├── __init__.py
│   ├── base_repository.py               # Abstract base repository
│   ├── student_repository.py            # Student data access
│   └── session_repository.py            # Session data access
├── services/                            # Business logic layer
│   ├── __init__.py
│   ├── eye_tracking_service.py          # Eye tracking algorithms
│   └── ct_assessment_service.py         # CT assessment calculations
└── controllers/                         # API controllers (C in MVC)
    ├── __init__.py
    ├── base_controller.py               # Base controller with common methods
    ├── student_controller.py            # Student routes & API
    └── session_controller.py            # Session routes & API

config.py                                 # Configuration management
main.py                                   # Application entry point
index.html                                # Frontend (V in MVC)
```

## 🏗️ Architecture Patterns Used

### 1. **MVC Pattern**
- **Model**: Database models in `app/models/`
- **View**: Frontend HTML/JavaScript in `index.html`
- **Controller**: API endpoints in `app/controllers/`

### 2. **Repository Pattern**
- Abstracts data access logic
- `BaseRepository` provides common CRUD operations
- Specific repositories (`StudentRepository`, `SessionRepository`) handle specialized queries
- Benefits: Testable, maintainable, decoupled from database

### 3. **Service Pattern**
- Business logic separated from controllers
- `EyeTrackingService`: Handles frame processing and gaze detection
- `CTAssessmentService`: Calculates computational thinking scores
- Controllers call services, services use repositories

### 4. **OOP Principles**

#### Encapsulation
- Each class has specific responsibilities
- Private methods (prefixed with `_`) for internal logic
- Public methods for external interfaces

#### Inheritance
- `BaseRepository` provides base functionality for all repositories
- `BaseController` provides common response methods
- All repositories inherit CRUD operations

#### Abstraction
- Services abstract complex algorithms (eye tracking, assessment)
- Repositories abstract database operations
- Controllers abstract HTTP request/response handling

#### Polymorphism
- Multiple repository classes implement same interface
- Services provide consistent API regardless of implementation

## 📋 API Endpoints

### Student Management
```
POST   /api/student                      # Create student
GET    /api/student                      # Get all students
GET    /api/student/<student_id>         # Get specific student
PUT    /api/student/<student_id>         # Update student
DELETE /api/student/<student_id>         # Delete student
```

### Session Management
```
POST   /api/session/start                # Start new session
POST   /api/session/<id>/frame           # Process video frame
POST   /api/session/<id>/end             # End session & calculate assessment
GET    /api/session/<id>/data            # Get session data & assessment
GET    /api/session/<id>/export          # Export as CSV
GET    /api/student/<id>/sessions        # Get all sessions for student
```

### Health Check
```
GET    /api/health                       # Check system status
```

## 🚀 Running the Application

### Using Python directly:
```bash
cd d:\project_eyetracking_flowchart\files
python main.py
```

### Using Flask CLI:
```bash
set FLASK_APP=main.py
set FLASK_ENV=development
flask run
```

## 📦 Key Classes

### Models
- `Student`: Student information and metadata
- `EyeTrackingSession`: Session tracking data
- `GazePoint`: Individual gaze coordinate with metadata
- `CTAssessment`: Computational thinking assessment results

### Services
- `EyeTrackingService`: Face detection, gaze point estimation, AOI detection
- `CTAssessmentService`: Score calculations (decomposition, pattern, flow, abstraction)

### Repositories
- `StudentRepository`: CRUD + custom queries for students
- `SessionRepository`: CRUD + specialized queries for sessions and gaze data

### Controllers
- `StudentController`: Student management endpoints
- `SessionController`: Session and frame processing endpoints

## 🔄 Request Flow Example

```
POST /api/session/start
  ↓
SessionController.start_session()
  ↓
StudentRepository.get_by_id()  [verify student exists]
  ↓
SessionRepository.create()      [create session in DB]
  ↓
EyeTrackingService.reset()      [initialize tracker]
  ↓
Return: {'success': true, 'session_id': 1, ...}
```

## 🧪 Testing Framework Ready

The architecture supports easy testing:
- Mock repositories for unit tests
- Mock services for integration tests
- Separate business logic from HTTP handling

## 🔧 Configuration

Environment variables in `.env`:
- `FLASK_ENV`: development|production|testing
- `DATABASE_URL`: Custom database URL
- Database created automatically in `eye_tracking.db`

## 💡 Advantages of This Architecture

1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Easy to add new features
3. **Testability**: Components can be tested independently
4. **Reusability**: Services can be used by multiple controllers
5. **Flexibility**: Easy to swap implementations
6. **Documentation**: Self-documenting structure

## 📝 Notes

- All models include `.to_dict()` for JSON serialization
- Repositories handle database session management
- Services focus on algorithms, not persistence
- Controllers handle HTTP protocol, not business logic
- Error handling with try-except and logging throughout
