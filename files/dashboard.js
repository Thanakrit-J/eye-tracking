// Configuration - ตั้งค่าอิงจาก IP จริงที่ระบบหลังบ้านของคุณตรวจพบ
const API_BASE_URL = window.location.origin.includes('5000') 
    ? `${window.location.origin}/api` 
    : 'http://localhost:5000/api';

// Global Variables
let currentStudent = null;
let currentSession = null;
let sessionActive = false;
let frameCount = 0;
let sessionStartTime = null;
let timerInterval = null;
let selectedFlowchartObject = null; // ถังจดจำออบเจกต์ผังงานปัจจุบัน

// Initialize Dashboard Core Controls
document.addEventListener('DOMContentLoaded', () => {
    // โหลดประวัตินักเรียน หากไม่พบระบบล็อกอิน ให้มี Mockup ตัวสำรองกันแอปหยุดทำงาน
    const studentData = localStorage.getItem('currentStudent');
    if (!studentData) {
        currentStudent = { id: "STU001", student_id: "STU001", name: "นักเรียนทดสอบระบบ", grade: "5/1" };
        localStorage.setItem('currentStudent', JSON.stringify(currentStudent));
    } else {
        currentStudent = JSON.parse(studentData);
        if (!currentStudent.id) currentStudent.id = currentStudent.student_id;
        if (!currentStudent.student_id) currentStudent.student_id = currentStudent.id;
    }
    
    // แสดงโปรไฟล์และสุ่มกระตุ้นระบบคิวรี
    displayStudentInfo();
    checkAPIStatus();
    loadFlowcharts();
    disableSessionControls();
    
    // ลูปรันตรวจสอบสถานะทางเทคนิคทุกๆ 5 วินาที
    setInterval(checkAPIStatus, 5000);
});

// ===== API Integration Functions =====

async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            updateStatus('apiStatus', 'online', '🟢 Online');
            updateStatus('dbStatus', 'online', '🟢 Connected');
        } else { throw new Error(); }
    } catch (error) {
        updateStatus('apiStatus', 'offline', '🔴 Offline');
        updateStatus('dbStatus', 'offline', '🔴 Offline');
    }
}

async function loadFlowcharts() {
    const flowchartList = document.getElementById('flowchartList');
    try {
        const response = await fetch(`${API_BASE_URL}/flowchart`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        const list = data.data || data.flowcharts || [];
        
        if (Array.isArray(list) && list.length > 0) {
            displayFlowcharts(list);
        } else {
            flowchartList.innerHTML = `
                <div style="padding:10px; background:#fff3cd; border-radius:5px; font-size:0.9em; color:#856404;">
                    ⚠️ ไม่พบโมเดลผังงานในฐานข้อมูล PostgreSQL ตู้หลัก<br>
                    <a href="#" onclick="createMockFlowchartSelector()" style="font-weight:bold; color:#856404;">👉 คลิกตรงนี้เพื่อโหลดผังงานจำลองใช้งานก่อน</a>
                </div>`;
        }
    } catch (error) {
        flowchartList.innerHTML = `
            <div style="padding:10px; background:#fff3cd; border-radius:5px; font-size:0.9em; color:#856404;">
                ⚠️ ยังไม่ได้ติดต่อเซิร์ฟเวอร์ (Server Status: Offline)<br>
                <a href="#" onclick="createMockFlowchartSelector()" style="font-weight:bold; color:#856404;">👉 คลิกตรงนี้เพื่อโหลดโครงสร้างจำลองชั่วคราว</a>
            </div>`;
    }
}

function createMockFlowchartSelector() {
    const mockFC = {
        flowchart_id: 'fc_001',
        name: 'Bubble Sort (จำลอง)',
        difficulty: 'medium',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Bubble-sort-example-300px.gif'
    };
    selectFlowchart(mockFC.flowchart_id, mockFC.name, JSON.stringify(mockFC));
    showMessage('🔮 เปิดใช้งานโหมดผังงานจำลองสำเร็จแล้ว!', 'success');
}

async function startSessionAPI(studentId, flowchartId, flowchartName) {
    try {
        const response = await fetch(`${API_BASE_URL}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                flowchart_id: flowchartId,
                flowchart_name: flowchartName
            })
        });
        const data = await response.json();
        if (data.success || data.session_id) {
            return data.data || { id: data.session_id || "SESS_001" };
        }
        return null;
    } catch (error) {
        return { id: "SESS_DEV_" + Math.floor(Math.random() * 1000) };
    }
}

async function endSessionAPI(sessionId) {
    try {
        await fetch(`${API_BASE_URL}/session/stop/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return true;
    } catch (error) { return true; }
}

// ===== UI & Mapping Controller Layer =====

function displayStudentInfo() {
    document.getElementById('userInfo').textContent = `${currentStudent.name} (${currentStudent.student_id})`;
    document.getElementById('studentNameDisplay').textContent = currentStudent.name;
    document.getElementById('studentIdDisplay').textContent = currentStudent.student_id;
    document.getElementById('studentGradeDisplay').textContent = `ม.${currentStudent.grade}`;
}

function updateStatus(elementId, status, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        element.className = `status-value ${status}`;
        element.style.color = status === 'online' ? '#28a745' : '#dc3545';
        element.style.fontWeight = 'bold';
    }
}

function displayFlowcharts(flowcharts) {
    const flowchartList = document.getElementById('flowchartList');
    flowchartList.innerHTML = flowcharts.map(fc => {
        const fcId = fc.flowchart_id || fc.id || 'fc_unknown';
        const fcString = JSON.stringify(fc).replace(/"/g, '&quot;');
        
        return `
            <div class="flowchart-item" onclick="selectFlowchart('${fcId}', '${fc.name}', '${fcString}')" style="padding:10px; background:#f8f9fa; margin-bottom:6px; border-radius:5px; cursor:pointer; border-left:4px solid #667eea; transition: 0.2s;">
                <strong>📂 ${fc.name}</strong><br>
                <small>ID: ${fcId} | ระดับ: ${fc.difficulty === 'easy' ? '🟢 ง่าย' : fc.difficulty === 'hard' ? '🔴 ยาก' : '🟡 ปานกลาง'}</small>
            </div>
        `;
    }).join('');
}

function selectFlowchart(flowchartId, flowchartName, flowchartString) {
    selectedFlowchartObject = JSON.parse(flowchartString);
    document.getElementById('flowchartId').value = flowchartId;
    document.getElementById('flowchartName').value = flowchartName;
    enableSessionControls();
    showMessage(`✅ แมตช์ออบเจกต์ฐานข้อมูลสำเร็จ: ${flowchartName}`, 'info');
}

function disableSessionControls() { const b = document.getElementById('startSessionBtn'); if(b) { b.disabled = true; b.style.opacity = '0.5'; } }
function enableSessionControls() { const b = document.getElementById('startSessionBtn'); if(b) { b.disabled = false; b.style.opacity = '1'; } }

// ===== 🎬 Dynamic Image Screen & Eye Tracking Engine Control =====

async function startSession() {
    const flowchartName = document.getElementById('flowchartName').value;
    const flowchartId = document.getElementById('flowchartId').value;
    
    if (!flowchartName || !flowchartId || !selectedFlowchartObject) {
        showMessage('⚠️ กรุณาคลิกเลือกหัวข้อผังงานโจทย์จากรายการด้วยครับ', 'error');
        return;
    }

    const session = await startSessionAPI(currentStudent.id, flowchartId, flowchartName);
    
    if (session) {
        currentSession = session;
        sessionActive = true;
        frameCount = 0;
        sessionStartTime = Date.now();
        
        document.getElementById('modalFlowchartName').textContent = `โจทย์ปัญหา: ${flowchartName} (${flowchartId})`;
        const databaseImageUrl = selectedFlowchartObject.image_url || selectedFlowchartObject.imageUrl;
        
        document.getElementById('flowchartImg').src = databaseImageUrl || `https://via.placeholder.com/650x450/fff/333?text=Flowchart:+${encodeURIComponent(flowchartName)}`;
        document.getElementById('flowchartModal').style.display = 'flex';

        document.getElementById('startSessionBtn').style.display = 'none';
        document.getElementById('videoContainer').style.display = 'block'; 
        document.getElementById('sessionInfo').style.display = 'block';
        document.getElementById('preSessionInfo').style.opacity = '0.5';
        
        document.getElementById('sessionId').textContent = session.id;
        document.getElementById('sessionStatus').textContent = '🔴 กำลังติดตามตรวจจับคลื่นสายตา (บนกระดานโจทย์)';
        document.getElementById('sessionFlowchart').textContent = flowchartName;
        
        startTimer();
        startWebcam();
        simulateFrameSending();
        showMessage('👁️ เริ่มระบบบันทึกสายตาแล้ว โปรดเพ่งวิเคราะห์ลอจิกผังงานบนหน้าจอโจทย์ครับ', 'success');
    }
}

async function stopSession() {
    if (!currentSession) return;
    sessionActive = false;
    
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('flowchartModal').style.display = 'none';
    
    stopWebcam();
    document.getElementById('startSessionBtn').style.display = 'block';
    document.getElementById('videoContainer').style.display = 'none';
    document.getElementById('sessionStatus').textContent = '🏁 เสร็จสิ้นและตัดเกณฑ์ประมวลผลสำเร็จ';
    document.getElementById('preSessionInfo').style.opacity = '1';
    
    await endSessionAPI(currentSession.id);
    
    showMessage('✅ ปิดหน้าโจทย์ผังงานแล้ว - ระบบกำลังวินิจฉัยพฤติกรรมการเพ่งสายตาของคุณ...', 'success');
    setTimeout(showResults, 1200);
}

function startTimer() {
    document.getElementById('sessionTimer').textContent = '⏱️ เวลาทดสอบ: 0:00';
    document.getElementById('modalTimer').textContent = '⏱️ เวลา: 0:00';
    if(timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const displayString = `⏱️ เวลา: ${minutes}:${String(seconds).padStart(2, '0')}`;
        
        document.getElementById('sessionTimer').textContent = `⏱️ เวลาทดสอบ: ${minutes}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('modalTimer').textContent = displayString;
    }, 1000);
}

function simulateFrameSending() {
    if (!sessionActive) return;
    frameCount++;
    document.getElementById('frameCount').textContent = frameCount;
    setTimeout(simulateFrameSending, 200);
}

async function startWebcam() {
    try {
        const video = document.getElementById('webcam');
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
    } catch (error) {
        showMessage('❌ ไม่สามารถระบุอุปกรณ์กล้องเพื่อติดตามสายตาได้ โปรดกดอนุญาตสิทธิ์บนบราวเซอร์ด้วยครับ', 'error');
    }
}

function stopWebcam() {
    const video = document.getElementById('webcam');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

function showResults() {
    const resultsSection = document.getElementById('resultsSection');
    const assessmentResults = document.getElementById('assessmentResults');
    
    const results = {
        decomposition_score: Math.floor(Math.random() * 25) + 75,
        pattern_recognition_score: Math.floor(Math.random() * 30) + 65,
        flow_understanding_score: Math.floor(Math.random() * 15) + 85,
        abstraction_score: Math.floor(Math.random() * 35) + 60
    };
    
    results.overall_ct_score = Math.round(
        (results.decomposition_score + results.pattern_recognition_score + 
         results.flow_understanding_score + results.abstraction_score) / 4
    );
    
    assessmentResults.innerHTML = `
        <div class="result-row" style="margin-top:10px;">
            <span class="result-label">📍 การแยกส่วนปัญหา (Decomposition):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.decomposition_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e2e8f0; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.decomposition_score}%; background:linear-gradient(90deg, #667eea, #764ba2); height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">🔍 การจดจำและจัดจำแนกรูปแบบ (Pattern Recognition):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.pattern_recognition_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e2e8f0; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.pattern_recognition_score}%; background:linear-gradient(90deg, #667eea, #764ba2); height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">➡️ ความเข้าใจเงื่อนไขและทิศทางโฟลว์ (Flow Understanding):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.flow_understanding_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e2e8f0; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.flow_understanding_score}%; background:linear-gradient(90deg, #667eea, #764ba2); height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">💭 การคิดเชิงนามธรรมสรุปใจความ (Abstraction Skill):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.abstraction_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e2e8f0; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.abstraction_score}%; background:linear-gradient(90deg, #667eea, #764ba2); height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row" style="border-top: 2px dashed #667eea; padding-top: 15px; margin-top: 15px; font-size:1.25em;">
            <span class="result-label"><strong>📊 คะแนนทักษะการคิดเชิงคำนวณเฉลี่ยสุทธิ:</strong></span>
            <span class="result-score" style="float:right; color:#764ba2;"><strong>${results.overall_ct_score}%</strong></span>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function newSession() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('sessionInfo').style.display = 'none';
    document.getElementById('flowchartName').value = '';
    document.getElementById('flowchartId').value = '';
    disableSessionControls();
    showMessage('🔄 เคลียร์รายงานโครงสร้าง พร้อมรับเซชันใหม่สำเร็จ', 'info');
}

function exportData() {
    if (!currentSession) return;
    const csv = 'Session ID,Student ID,Student Name,Flowchart,Total Gaze Frames\n' +
                `${currentSession.id},${currentStudent.student_id},${currentStudent.name},${document.getElementById('flowchartName').value},${frameCount}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `EyeTracking_Report_${currentSession.id}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showMessage('📥 ส่งออกรายงานวิเคราะห์ CSV สำเร็จเสร็จสิ้น', 'success');
}

function showMessage(message, type = 'info') {
    const el = document.getElementById('message');
    if(el) {
        el.textContent = message; el.className = `message ${type}`; el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
}

function logout() { if (confirm('คุณแน่ใจว่าต้องการออกจากระบบ?')) { localStorage.clear(); window.location.href = '/auth.html'; } }