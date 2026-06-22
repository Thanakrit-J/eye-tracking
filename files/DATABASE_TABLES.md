# Database Tables Schema (โครงสร้างตาราฐานข้อมูล)

## Overview (ภาพรวม)

The Eye Tracking System uses SQLite database with 4 main tables to store student information, eye tracking sessions, gaze point data, and computational thinking assessments.

---

## 💾 DATABASE SCHEMA (รูปแบบฐานข้อมูล)

```
student
├── id (PK, Auto-increment)
├── student_id (UNIQUE, NOT NULL) ★
├── name (NOT NULL) ★
├── grade (1-6, optional)
├── email (optional, for contact)
├── is_active (Boolean, default: True)
├── created_at (timestamp, auto-set)
├── updated_at (timestamp, auto-update)
└── sessions (relationship)

eye_tracking_session
├── id (PK, Auto-increment)
├── student_id (FK → student.id, NOT NULL) ★
├── flowchart_id (optional)
├── flowchart_name (optional)
├── status (pending/in_progress/completed)
├── start_time (timestamp, auto-set)
├── end_time (optional)
├── duration_seconds (calculated or stored)
├── total_frames (default: 0)
├── accuracy (Float, 0-100, optional)
├── notes (optional)
├── created_at (timestamp)
├── updated_at (timestamp)
├── gaze_points (relationship)
└── ct_assessment (relationship)

gaze_point
├── id (PK, Auto-increment)
├── session_id (FK → eye_tracking_session.id, NOT NULL) ★
├── frame_number (NOT NULL, indexed)
├── gaze_x (Float, screen X coordinate)
├── gaze_y (Float, screen Y coordinate)
├── timestamp (DateTime, auto-set, indexed)
├── fixation_duration (Float, >= 0)
├── element_focused (optional, element name)
├── aoi_id (optional, Area of Interest reference)
└── confidence (Float, 0-1)

ct_assessment
├── id (PK, Auto-increment)
├── session_id (FK → eye_tracking_session.id, UNIQUE, NOT NULL) ★
├── decomposition_score (Float, 0-100)
├── pattern_recognition_score (Float, 0-100)
├── flow_understanding_score (Float, 0-100)
├── abstraction_score (Float, 0-100)
├── overall_ct_score (Float, 0-100)
├── reading_efficiency (Float, 0-100)
├── cognitive_load (Float, 0-100)
├── error_count (Integer, >= 0)
├── status (draft/completed/reviewed)
├── assessment_date (DateTime)
├── created_at (timestamp)
├── updated_at (timestamp)
└── assessment_notes (optional)
```

---

## Table 1: `student` (ตารางนักเรียน)

**Purpose:** Store student information and basic profile data

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, Auto-increment | Unique student identifier |
| `student_id` | String(20) | UNIQUE, NOT NULL | Student ID (e.g., 6510001) - ★ Required |
| `name` | String(100) | NOT NULL | Student's full name - ★ Required |
| `grade` | Integer | Optional, Range 1-6 | Student's grade level (มต.1-6) |
| `email` | String(100) | Optional, UNIQUE | Email for contact/notifications |
| `is_active` | Boolean | Default: True | Student status (active/inactive) |
| `created_at` | DateTime | Default: current timestamp | Record creation date and time |
| `updated_at` | DateTime | Auto-update on change | Last modification date and time |

**Relationships:**
- One-to-Many with `eye_tracking_session` (One student can have multiple sessions)

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `student_id`
- UNIQUE on `email` (if exists)

**Example Data:**
```
id | student_id | name       | grade | email              | is_active | created_at
1  | 6510001    | John Doe   | 6     | john@school.com    | True      | 2024-01-15 10:30:00
2  | 6510002    | Jane Smith | 6     | jane@school.com    | True      | 2024-01-15 11:00:00
3  | 6510003    | Bob Walker | 5     | NULL               | False     | 2024-01-14 09:00:00
```

---

## Table 2: `eye_tracking_session` (ตารางเซสชั่นการติดตามสายตา)

**Purpose:** Store information about eye tracking sessions for each student and flowchart

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, Auto-increment | Unique session identifier |
| `student_id` | Integer | FOREIGN KEY (student.id), NOT NULL | Reference to student - ★ Required |
| `flowchart_id` | String(50) | Optional | ID of the flowchart being studied |
| `flowchart_name` | String(200) | Optional | Name/title of the flowchart |
| `status` | String(20) | Default: 'pending' | Session status: pending, in_progress, completed |
| `start_time` | DateTime | Default: current timestamp | Session start date and time - ★ Auto-set |
| `end_time` | DateTime | Optional | Session end date and time |
| `duration_seconds` | Integer | Optional, >= 0 | Session duration in seconds (calculated from end_time - start_time) |
| `total_frames` | Integer | Default: 0, >= 0 | Total number of frames captured |
| `accuracy` | Float | Optional, 0-100 | Eye tracking accuracy percentage (0-100) |
| `notes` | Text | Optional | Additional notes about the session |
| `created_at` | DateTime | Default: current timestamp | Record creation date |
| `updated_at` | DateTime | Auto-update | Last modification date |

**Relationships:**
- Many-to-One with `student` (via `student_id`)
- One-to-Many with `gaze_point` (One session has many gaze points)
- One-to-One with `ct_assessment` (One session has one assessment)

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `student_id`
- INDEX on `status` (for filtering pending/in-progress sessions)
- INDEX on `start_time` (for date range queries)

**Constraints:**
- `accuracy` must be between 0 and 100
- `total_frames` must be >= 0
- `duration_seconds` must be >= 0
- `start_time` must be before or equal to `end_time` (when end_time is set)

**Example Data:**- ★ Required |
| `frame_number` | Integer | NOT NULL, >= 1, Indexed | Frame number in the session sequence (1, 2, 3...) |
| `gaze_x` | Float | Optional | X coordinate of gaze point (pixels, screen position) |
| `gaze_y` | Float | Optional | Y coordinate of gaze point (pixels, screen position) |
| `timestamp` | DateTime | Default: current timestamp, Indexed | Time when gaze point was recorded |
| `fixation_duration` | Float | Optional, >= 0 | Duration of fixation in milliseconds (fixation detection) |
| `element_focused` | String(100) | Optional | Name/ID of UI element being focused on (e.g., "Start_Button", "Decision_Box") |
| `aoi_id` | String(50) | Optional, Indexed | Area of Interest ID (for AOI mapping) |
| `confidence` | Float | Optional, 0-1 | Confidence level of gaze detection (0.0 = low, 1.0 = high) |

**Relationships:**
- Many-to-One with `eye_tracking_session` (via `session_id`)

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `session_id`
- INDEX on `frame_number` (for sequential frame queries)
- INDEX on `session_id` + `frame_number` (for composite queries)
- INDEX on `timestamp` (for time-range queries)
- INDEX on `aoi_id` (for AOI analysis)

**Constraints:**
- `frame_number` must be >= 1
- `gaze_x`, `gaze_y` must be >= 0
- `fixation_duration` must be >= 0
- `confidence` must be between 0 and 1
- `confidence` should NOT be NULL (default 0.0 if detection failed)

**Example Data:**
```
id | session_id | frame_number | gaze_x | gaze_y | fixation_duration | element_focused | aoi_id | confidence
1  | 1          | 1            | 512.5  | 380.2  | 150               | Start_Box       | AOI_01 | 0.95
2  | 1          | 2            | 524.3  | 385.1  | 180               | Start_Box       | AOI_01 | 0.93
3  | 1          | 3            | 548.9  | 400.5  | 200               | Decision_Box    | AOI_02 | 0.92
4  | 1          | 4            | 550.1  | 402.3  | NULL              | NULL            | NULL   | 0.45
| `session_id` | Integer | FOREIGN KEY (eye_tracking_session.id), NOT NULL | Reference to session |
| `frame_number` | Integer | Optional | Frame number in the session |
| `gaze_x` | Float | Optional | X coordinate of gaze point (pixels) |
| `gaze_y` | Float | Optional | Y coordinate of gaze point (pixels) |
| `timestamp` | DateTime | Default: current timestamp | Time when gaze point was recorded |
| `fixation_duration` | Float | Optional | Duration of fixation (milliseconds) |
| `element_focused` | String(100) | Optional | Name of UI element being focused on |
| `confidence` | Float | Optional | Confidence level of gaze detection (0-1) |

**Relationships:**
- Many-to-One with `eye_tracking_session` (via `session_id`)

**Example Data:**UNIQUE, NOT NULL | Reference to session - ★ One assessment per session |
| `decomposition_score` | Float | Optional, 0-100 | Decomposition skill score (breaking problems into parts) |
| `pattern_recognition_score` | Float | Optional, 0-100 | Pattern recognition score (identifying similarities) |
| `flow_understanding_score` | Float | Optional, 0-100 | Flow chart understanding score (logic comprehension) |
| `abstraction_score` | Float | Optional, 0-100 | Abstraction skill score (generalizing solutions) |
| `overall_ct_score` | Float | Optional, 0-100 | Overall Computational Thinking score (average or weighted) |
| `reading_efficiency` | Float | Optional, 0-100 | Reading efficiency percentage (speed + accuracy) |
| `cognitive_load` | Float | Optional, 0-100 | Cognitive load level (mental effort required, 0=low, 100=high) |
| `error_count` | Integer | Optional, >= 0 | Number of errors/mistakes detected |
| `status` | String(20) | Default: 'draft' | Assessment status: draft, completed, reviewed |
| `assessment_date` | DateTime | Default: current timestamp | Date when assessment was performed |
| `created_at` | DateTime | Default: current timestamp | Record creation date |
| `updated_at` | DateTime | Auto-update | Last modification date |
| `assessment_notes` | Text | Optional | Detailed notes and observations from assessment |

**Relationships:**
- One-to-One with `eye_tracking_session` (via `session_id`)

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `session_id`
- UNIQUE on `session_id` (ensures only one assessment per session)
- INDEX on `status` (for filtering draft/completed assessments)

**Constraints:**
- `session_id` is UNIQUE (one assessment per session)
- All score columns (0-100): `decomposition_score`, `pattern_recognition_score`, `flow_understanding_score`, `abstraction_score`, `overall_ct_score`, `reading_efficiency`, `cognitive_load`
- `error_count` must be >= 0
- `status` must be one of: 'draft', 'completed', 'reviewed'

**Scoring Ranges:**
```
0-20:   Very Poor
21-40:  Poor
41-60:  Average
61-80:  Good
81-100: Excellent
```

**Example Data:**
```
id | session_id | decomposition | pattern_recog | flow_under | abstraction | overall_ct | reading_eff | cognitive_load | error_count | status
1  | 1          | 85.5          | 88.0          | 92.3       | 79.5        | 86.3       | 88.0        | 45.0           | 2           | completed
2  | 2          | NULL          | NULL          | NULL       | NULL        | NULL       | NULL        | NULL           | NULL        | draft
| `pattern_recognition_score` | Float | Optional | Pattern recognition score (0-100) |
| `flow_understanding_score` | Float | Optional | Flow chart understanding score (0-100) |
| `abstraction_score` | Float | Optional | Abstraction skill score (0-100) |
| `overall_ct_score` | Float | Optional | Overall CT score (0-100) |
| `reading_efficiency` | Float | Optional | Reading efficiency percentage (0-100) |
| `cognitive_load` | Float | Optional | Cognitive load level (0-100) |
| `error_count` | Integer | Optional | Number of errors detected |
| `created_at` | DateTime | Default: current timestamp | Assessment creation date and time |
| `assessment_notes` | Text | Optional | Detailed notes from assessment |

**Relationships:**
- One-to-One with `eye_tracking_session` (via `session_id`)

**Example Data:**
```
id | session_id | decomposition | pattern_recognition | flow_understanding | abstraction | overall_ct_score
1  | 1          | 85.5          | 88.0                | 92.3               | 79.5        | 86.3
```

---

## Database Relationships Diagram (แผนความสัมพันธ์)

```
┌─────────────┐
│   student   │
└──────┬──────┘
       │ 1:N
       │
       └──────────────────────────┐
                                  │
                    ┌─────────────▼───────────────┐
                    │  eye_tracking_session       │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │ 1:N         │ 1:1          │
                    │             │              │
        ┌───────────▼────────┐   ┌──────────────▼──────────┐
        │   gaze_point       │   │   ct_assessment        │
        └────────────────────┘   └────────────────────────┘
```

---

## SQL Examples (ตัวอย่าง SQL)

### Create Tables (automatically handled by SQLAlchemy)
```sql
-- Student Table
CREATE TABLE student (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    grade INTEGER CHECK(grade >= 1 AND grade <= 6),
    email VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Eye Tracking Session Table
CREATE TABLE eye_tracking_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    flowchart_id VARCHAR(50),
    flowchart_name VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_seconds INTEGER CHECK(duration_seconds >= 0),
    total_frames INTEGER DEFAULT 0 CHECK(total_frames >= 0),
    accuracy FLOAT CHECK(accuracy >= 0 AND accuracy <= 100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    CHECK(end_time IS NULL OR end_time >= start_time)
);

-- Gaze Point Table
CREATE TABLE gaze_point (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    frame_number INTEGER NOT NULL CHECK(frame_number >= 1),
    gaze_x FLOAT CHECK(gaze_x >= 0),
    gaze_y FLOAT CHECK(gaze_y >= 0),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    fixation_duration FLOAT CHECK(fixation_duration >= 0),
    element_focused VARCHAR(100),
    aoi_id VARCHAR(50),
    confidence FLOAT DEFAULT 0.0 CHECK(confidence >= 0 AND confidence <= 1),
    FOREIGN KEY (session_id) REFERENCES eye_tracking_session(id) ON DELETE CASCADE
);
CREATE INDEX idx_gaze_point_session_frame ON gaze_point(session_id, frame_number);
CREATE INDEX idx_gaze_point_timestamp ON gaze_point(timestamp);
CREATE INDEX idx_gaze_point_aoi ON gaze_point(aoi_id);

-- CT Assessment Table
CREATE TABLE ct_assessment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL UNIQUE,
    decomposition_score FLOAT CHECK(decomposition_score >= 0 AND decomposition_score <= 100),
    pattern_recognition_score FLOAT CHECK(pattern_recognition_score >= 0 AND pattern_recognition_score <= 100),
    flow_understanding_score FLOAT CHECK(flow_understanding_score >= 0 AND flow_understanding_score <= 100),
    abstraction_score FLOAT CHECK(abstraction_score >= 0 AND abstraction_score <= 100),
    overall_ct_score FLOAT CHECK(overall_ct_score >= 0 AND overall_ct_score <= 100),
    reading_efficiency FLOAT CHECK(reading_efficiency >= 0 AND reading_efficiency <= 100),
    cognitive_load FLOAT CHECK(cognitive_load >= 0 AND cognitive_load <= 100),
    error_count INTEGER DEFAULT 0 CHECK(error_count >= 0),
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'completed', 'reviewed')),
    assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assessment_notes TEXT,
    FOREIGN KEY (session_id) REFERENCES eye_tracking_session(id) ON DELETE CASCADE
);
CREATE INDEX idx_ct_assessment_status ON ct_assessment(status);
```

---

### Common Queries (คำสั่ง Query ทั่วไป)

**Find all sessions for a student:**
```sql
SELECT * FROM eye_tracking_session 
WHERE student_id = 1
ORDER BY start_time DESC;
```

**Get all gaze points from a session (ordered by frame):**
```sql
SELECT * FROM gaze_point 
WHERE session_id = 1 
ORDER BY frame_number;
```

**Get gaze points with high fixation duration:**
```sql
SELECT * FROM gaze_point 
WHERE session_id = 1 
  AND fixation_duration > 200
ORDER BY timestamp;
```

**Get completed sessions with assessments:**
```sql
SELECT s.name, ets.flowchart_name, ets.status, ets.accuracy, ca.overall_ct_score
FROM eye_tracking_session ets
LEFT JOIN student s ON ets.student_id = s.id
LEFT JOIN ct_assessment ca ON ets.id = ca.session_id
WHERE ets.status = 'completed'
ORDER BY ets.start_time DESC;
```
### Primary Key Enforcement ★
- All tables have auto-incrementing `id` as PRIMARY KEY
- Ensures uniqueness and fast lookups

### Foreign Key Constraints ★
- `eye_tracking_session.student_id` → `student.id` (CASCADING DELETE)
- `gaze_point.session_id` → `eye_tracking_session.id` (CASCADING DELETE)
- `ct_assessment.session_id` → `eye_tracking_session.id` (CASCADING DELETE, UNIQUE)
- Deleting a student automatically removes all their sessions and related data

### Unique Constraints
- `student.student_id` - Each student has unique ID
- `student.email` - Each email is unique (optional, if used)
- `ct_assessment.session_id` - Only one assessment per session

### Range Constraints (CHECK)
- `student.grade` - Must be 1-6 (middle school grades)
- `eye_tracking_session.accuracy` - Must be 0-100
- `eye_tracking_session.total_frames` - Must be >= 0
- `gaze_point.confidence` - Must be 0-1
- `gaze_point.fixation_duration` - Must be >= 0
- All CT scores - Must be 0-100

### Temporal Constraints
- `eye_tracking_session.end_time >= start_time` (when end_time is set)
- `created_at` and `updated_at` timestamps for audit trail

### Data Consistency Rules
1. **Student Status:** Only active students (`is_active = 1`) should have new sessions
2. **Session Status Flow:** pending → in_progress → completed
3. **Assessment Completion:** CT assessment must be completed before session is marked completed
4. **Gaze Point Continuity:** Frame numbers should be sequential in a session (1, 2, 3...)
5. **Confidence Levels:** Should have meaningful values (not 0.0 for successful detections)

### Performance Optimization
- **Indexes created for:**
  - `gaze_point(session_id, frame_number)` - Fast frame queries
  - `gaze_point(timestamp)` - Time-range queries
  - `gaze_point(aoi_id)` - AOI analysis
  - `eye_tracking_session(status)` - Filter pending/completed
  - `eye_tracking_session(start_time)` - Date range queries
  - `ct_assessment(status)` - Filter draft/completed assessments

### Recommended Practices
1. **Regular Backups:** Backup database regularly, especially before production sessions
2. **Data Validation:** Validate all input data before insertion
3. **Archive Old Data:** Archive completed sessions after retention period
4. **Performance Monitoring:** Monitor query performance, especially gaze_point queries (potentially millions of records)
5. **Maintenance:** Periodically run VACUUM to optimize SQLite database

### Cascade Delete Impact ⚠️
**Be careful with deletions!**
- Deleting a `student` deletes ALL sessions, gaze points, and assessments
- Deleting an `eye_tracking_session` deletes ALL gaze points and assessments for that session
- These operations cannot be undone - implement soft deletes (archive flag) if needed

### Migration Considerations
If upgrading database schema:
1. Back up all data first
2. Test migrations on test database
3. Add new columns with DEFAULT values for existing rows
4. Use data migration scripts for complex changes
5. Validate data integrity after migration

---```

**Calculate average scores by grade:**
```sql
SELECT s.grade, 
       AVG(ca.overall_ct_score) as avg_ct_score,
       AVG(ca.reading_efficiency) as avg_reading_eff,
       AVG(ca.cognitive_load) as avg_cognitive_load,
       COUNT(ca.id) as assessment_count
FROM ct_assessment ca
JOIN eye_tracking_session ets ON ca.session_id = ets.id
JOIN student s ON ets.student_id = s.id
WHERE ca.status = 'completed'
GROUP BY s.grade
ORDER BY s.grade;
```

**Get gaze points for specific AOI:**
```sql
SELECT gp.id, gp.frame_number, gp.gaze_x, gp.gaze_y, gp.fixation_duration, gp.confidence
FROM gaze_point gp
WHERE gp.session_id = 1 
  AND gp.aoi_id = 'AOI_01'
ORDER BY gp.frame_number;
```

**Get sessions with errors:**
```sql
SELECT s.student_id, s.name, ets.flowchart_name, ca.error_count, ca.overall_ct_score
FROM ct_assessment ca
JOIN eye_tracking_session ets ON ca.session_id = ets.id
JOIN student s ON ets.student_id = s.id
WHERE ca.error_count > 0
ORDER BY ca.error_count DESC;
```

---

## Data Integrity Notes (หมายเหตุเกี่ยวกับความสมบูรณ์ของข้อมูล)

- **Cascading Delete:** When a student is deleted, all associated sessions, gaze points, and assessments are automatically deleted
- **Foreign Key Constraints:** All foreign keys are enforced
- **Unique Constraints:** `student_id` must be unique across all students
- **Required Fields:** 
  - `student.name`, `student.student_id`
  - `eye_tracking_session.student_id`
  - `gaze_point.session_id`
  - `ct_assessment.session_id`

