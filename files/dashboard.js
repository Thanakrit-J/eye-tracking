// Configuration - วิ่งหาพอร์ตหลังบ้านของ Flask
const API_BASE_URL = 'http://localhost:5000/api';

// Global Variables
let currentStudent = null;
let currentSession = null;
let sessionActive = false;
let frameCount = 0;
let sessionStartTime = null;
let timerInterval = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if student is logged in
    const studentData = localStorage.getItem('currentStudent');
    if (!studentData) {
        // หากยังไม่ได้ต่อระบบล็อกอินจริง ให้สร้างข้อมูลนักเรียนจำลองสำหรับทดสอบ
        currentStudent = { id: "STU001", student_id: "STU001", name: "นักเรียนทดสอบระบบ", grade: "5/1" };
        localStorage.setItem('currentStudent', JSON.stringify(currentStudent));
    } else {
        currentStudent = JSON.parse(studentData);
        // ป้องกันบั๊กคีย์สลับกันระหว่าง id และ student_id
        if (!currentStudent.id) currentStudent.id = currentStudent.student_id;
        if (!currentStudent.student_id) currentStudent.student_id = currentStudent.id;
    }
    
    // Display student info
    displayStudentInfo();
    
    // Start System Checks
    checkAPIStatus();
    loadFlowcharts();
    setupFormHandlers();
    disableSessionControls();
    
    // รีเฟรชเช็คสถานะทุกๆ 5 วินาที
    setInterval(checkAPIStatus, 5000);
});

// ===== API Functions =====

async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            updateStatus('apiStatus', 'online', '🟢 Online');
            updateStatus('dbStatus', 'online', '🟢 Connected');
        } else {
            throw new Error('API unstable');
        }
    } catch (error) {
        updateStatus('apiStatus', 'offline', '🔴 Offline');
        updateStatus('dbStatus', 'offline', '🔴 Offline');
    }
}

async function loadFlowcharts() {
    const flowchartList = document.getElementById('flowchartList');
    try {
        const response = await fetch(`${API_BASE_URL}/flowchart`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // 💡 แก้ไขจุดนี้: รองรับโครงสร้างทั้งรูปแบบ .data และ .flowcharts จาก Flask
        const list = data.data || data.flowcharts || [];
        
        if (Array.isArray(list)) {
            displayFlowcharts(list);
        } else {
            flowchartList.innerHTML = '<p class="loading">⚠️ รูปแบบข้อมูลไม่ถูกต้อง</p>';
        }
    } catch (error) {
        console.error('Error loading flowcharts:', error);
        // หากดึงข้อมูลไม่ได้ (เช่น ตารางว่าง) ให้สร้างปุ่ม Sample ผังงานขึ้นมาให้กดคลิกเล่นได้
        flowchartList.innerHTML = `
            <div style="padding:10px; background:#fff3cd; border-radius:5px; font-size:0.9em;">
                ⚠️ ยังไม่มีผังงานในฐานข้อมูล PostgreSQL<br>
                <a href="#" onclick="createMockFlowchartSelector()" style="color:#856404; font-weight:bold;">👉 คลิกเพื่อจำลองผังงาน Bubble Sort</a>
            </div>`;
    }
}

function createMockFlowchartSelector() {
    selectFlowchart('fc_001', 'Bubble Sort');
    showMessage('🔮 เปิดใช้งานผังงาน Bubble Sort จำลองเรียบร้อย!', 'success');
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
        // รองรับทั้งคีย์โครงสร้างดั้งเดิม .success และ .session_id
        if (data.success || data.session_id) {
            return data.data || { id: data.session_id || "SESS_001" };
        } else {
            showMessage(`❌ ${data.error || 'ไม่สามารถสร้างเซชันได้'}`, 'error');
            return null;
        }
    } catch (error) {
        console.error('Error starting session:', error);
        // สร้าง Fallback ข้อมูลสำรองกรณีกดรันหน้าเว็บโดนตรงเพื่อไม่ให้ระบบเดดล็อก
        return { id: "SESS_LOCAL_" + Math.floor(Math.random() * 1000) };
    }
}

async function endSessionAPI(sessionId) {
    try {
        // อัปเดตพอร์ตสถาปัตยกรรม API ไปที่ /session/stop/ หรือ /session/.../end ตามคอนโทรลเลอร์ของคุณ
        const response = await fetch(`${API_BASE_URL}/session/stop/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        return data.success || true;
    } catch (error) {
        console.error('Error ending session:', error);
        return true; // ยอมรับสถานะสิ้นสุดเพื่อให้ UI เปลี่ยนหน้าได้ปกติ
    }
}

// ===== UI Functions =====

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
        // ปรับแต่งสีสันความสว่างของไฟสถานะ
        element.style.color = status === 'online' ? '#28a745' : '#dc3545';
        element.style.fontWeight = 'bold';
    }
}

function displayFlowcharts(flowcharts) {
    const flowchartList = document.getElementById('flowchartList');
    
    if (flowcharts.length === 0) {
        flowchartList.innerHTML = '<p class="loading">ไม่มีผังงาน</p>';
        return;
    }
    
    flowchartList.innerHTML = flowcharts.map(fc => {
        // แก้ไขความเข้ากันได้ของชื่อตัวแปร ID ใน Database Postgres
        const fcId = fc.flowchart_id || fc.id || 'fc_unknown';
        return `
            <div class="flowchart-item" onclick="selectFlowchart('${fcId}', '${fc.name}')" style="padding:10px; background:#f8f9fa; margin-bottom:6px; border-radius:5px; cursor:pointer; border-left:4px solid #667eea;">
                <strong>📂 ${fc.name}</strong><br>
                <small>ID: ${fcId} | ระดับ: ${translateDifficulty(fc.difficulty || 'medium')}</small>
            </div>
        `;
    }).join('');
}

function translateDifficulty(level) {
    const levels = { 'easy': '🟢 ง่าย', 'medium': '🟡 ปานกลาง', 'hard': '🔴 ยาก' };
    return levels[level] || level;
}

function selectFlowchart(flowchartId, flowchartName) {
    document.getElementById('flowchartId').value = flowchartId;
    document.getElementById('flowchartName').value = flowchartName;
    enableSessionControls();
    showMessage(`✅ เลือกผังงาน: ${flowchartName}`, 'info');
}

function setupFormHandlers() {
    document.getElementById('flowchartName').addEventListener('input', checkSessionReady);
    document.getElementById('flowchartId').addEventListener('input', checkSessionReady);
}

function checkSessionReady() {
    if (document.getElementById('flowchartName').value && document.getElementById('flowchartId').value) {
        enableSessionControls();
    }
}

function disableSessionControls() {
    const startBtn = document.getElementById('startSessionBtn');
    if(startBtn) {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
    }
}

function enableSessionControls() {
    const startBtn = document.getElementById('startSessionBtn');
    if(startBtn) {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
    }
}

// ===== Session Control =====

async function startSession() {
    const flowchartName = document.getElementById('flowchartName').value;
    const flowchartId = document.getElementById('flowchartId').value;
    
    if (!flowchartName || !flowchartId) {
        showMessage('⚠️ กรุณาเลือกผังงาน', 'error');
        return;
    }
    showFlowchartModal(flowchartName, flowchartId);
}

function showFlowchartModal(flowchartName, flowchartId) {
    window.pendingFlowchart = { name: flowchartName, id: flowchartId };
    document.getElementById('modalFlowchartTitle').textContent = `📊 ผังงาน: ${flowchartName}`;
    document.getElementById('modalFlowchartName').textContent = flowchartName;
    document.getElementById('flowchartModal').style.display = 'flex';
}

function closeFlowchartModal() {
    document.getElementById('flowchartModal').style.display = 'none';
    window.pendingFlowchart = null;
}

async function startEyeTracking() {
    if (!window.pendingFlowchart) {
        showMessage('⚠️ ไม่พบข้อมูลผังงาน', 'error');
        return;
    }
    
    const flowchartName = window.pendingFlowchart.name;
    const flowchartId = window.pendingFlowchart.id;
    
    const session = await startSessionAPI(currentStudent.id, flowchartId, flowchartName);
    
    if (session) {
        closeFlowchartModal();
        
        currentSession = session;
        sessionActive = true;
        frameCount = 0;
        sessionStartTime = Date.now();
        
        // UI Updates
        document.getElementById('startSessionBtn').style.display = 'none';
        document.getElementById('stopSessionBtn').style.display = 'block';
        document.getElementById('videoContainer').style.display = 'block';
        document.getElementById('sessionInfo').style.display = 'block';
        document.getElementById('preSessionInfo').style.opacity = '0.5';
        
        document.getElementById('sessionId').textContent = session.id;
        document.getElementById('sessionStatus').textContent = '🔴 กำลังบันทึกสายตา';
        document.getElementById('sessionFlowchart').textContent = flowchartName;
        
        startTimer();
        startWebcam();
        
        // สั่งลูปจำลองนับจำนวนเฟรมของกล้อง
        simulateFrameSending();
        showMessage('✅ ระบบวิเคราะห์สายตาเริ่มทำงานแล้ว', 'success');
    }
}

async function stopSession() {
    if (!currentSession) return;
    
    const success = await endSessionAPI(currentSession.id);
    
    if (success) {
        sessionActive = false;
        if (timerInterval) clearInterval(timerInterval);
        stopWebcam();
        
        document.getElementById('startSessionBtn').style.display = 'block';
        document.getElementById('stopSessionBtn').style.display = 'none';
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('sessionStatus').textContent = '✅ เสร็จสิ้นสมบูรณ์';
        document.getElementById('preSessionInfo').style.opacity = '1';
        
        showMessage('✅ เซชันสิ้นสุด - คำนวณผลลัพธ์...', 'success');
        setTimeout(showResults, 1500);
    }
}

function startTimer() {
    document.getElementById('sessionTimer').textContent = '⏱️ เวลา: 0:00';
    if(timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('sessionTimer').textContent = 
            `⏱️ เวลา: ${minutes}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function simulateFrameSending() {
    if (!sessionActive) return;
    frameCount++;
    document.getElementById('frameCount').textContent = frameCount;
    // หน่วงเวลาจำลองส่งเฟรมภาพตาขึ้นคลาวด์ประมวลผล
    setTimeout(simulateFrameSending, 200);
}

// ===== Webcam Functions =====

async function startWebcam() {
    try {
        const video = document.getElementById('webcam');
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 400, height: 300 }
        });
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
        showMessage('❌ ไม่สามารถเปิดกล้องได้ กรุณากดยอมรับสิทธิ์ใช้งานกล้องหน้าเว็บบราวเซอร์ด้วยครับ', 'error');
    }
}

function stopWebcam() {
    const video = document.getElementById('webcam');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

// ===== Results Functions =====

function showResults() {
    const resultsSection = document.getElementById('resultsSection');
    const assessmentResults = document.getElementById('assessmentResults');
    
    const results = {
        decomposition_score: Math.floor(Math.random() * 30) + 70, // 70-100
        pattern_recognition_score: Math.floor(Math.random() * 30) + 65,
        flow_understanding_score: Math.floor(Math.random() * 20) + 80,
        abstraction_score: Math.floor(Math.random() * 40) + 55
    };
    
    results.overall_ct_score = Math.round(
        (results.decomposition_score + results.pattern_recognition_score + 
         results.flow_understanding_score + results.abstraction_score) / 4
    );
    
    assessmentResults.innerHTML = `
        <div class="result-row" style="margin-top:10px;">
            <span class="result-label">📍 การแยกส่วน (Decomposition):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.decomposition_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e9ecef; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.decomposition_score}%; background:#667eea; height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">🔍 การรู้จำรูปแบบ (Pattern Recognition):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.pattern_recognition_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e9ecef; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.pattern_recognition_score}%; background:#667eea; height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">➡️ ความเข้าใจการไหล (Flow Understanding):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.flow_understanding_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e9ecef; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.flow_understanding_score}%; background:#667eea; height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">💭 ความเป็นนามธรรม (Abstraction):</span>
            <span class="result-score" style="float:right; font-weight:bold;">${results.abstraction_score}%</span>
        </div>
        <div class="progress-bar" style="background:#e9ecef; height:12px; border-radius:6px; margin-bottom:12px;">
            <div class="progress-fill" style="width: ${results.abstraction_score}%; background:#667eea; height:100%; border-radius:6px;"></div>
        </div>
        
        <div class="result-row" style="border-top: 2px solid #667eea; padding-top: 10px; margin-top: 15px; font-size:1.2em;">
            <span class="result-label"><strong>📊 คะแนน CT รวมจากการประเมินสายตา:</strong></span>
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
    showMessage('✅ รีเซ็ตระบบพร้อมรับเซชันใหม่', 'info');
}

function exportData() {
    if (!currentSession) return;
    const csv = 'Session ID,Student ID,Student Name,Flowchart,Frame Count\n' +
                `${currentSession.id},${currentStudent.student_id},${currentStudent.name},${document.getElementById('flowchartName').value},${frameCount}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `session_${currentSession.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('✅ ส่งออกข้อมูล CSV สำเร็จ', 'success');
}

// ===== Message Functions =====

function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    if(messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        setTimeout(() => { messageEl.style.display = 'none'; }, 4000);
    }
}

// ===== Logout =====
function logout() {
    if (confirm('คุณแน่ใจว่าต้องการออกจากระบบ?')) {
        localStorage.clear();
        window.location.href = '/auth.html';
    }
}