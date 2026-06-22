// Configuration
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
        window.location.href = '/auth.html';
        return;
    }
    
    currentStudent = JSON.parse(studentData);
    
    // Display student info
    displayStudentInfo();
    
    // Check API status
    checkAPIStatus();
    loadFlowcharts();
    setupFormHandlers();
    disableSessionControls();
    
    setInterval(checkAPIStatus, 5000);
});

// ===== API Functions =====

async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            updateStatus('apiStatus', 'online', '🟢 Online');
            updateStatus('dbStatus', 'online', '🟢 Connected');
        }
    } catch (error) {
        updateStatus('apiStatus', 'offline', '🔴 Offline');
        updateStatus('dbStatus', 'offline', '🔴 Offline');
    }
}

async function loadFlowcharts() {
    try {
        const response = await fetch(`${API_BASE_URL}/flowchart`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
            displayFlowcharts(data.data);
        } else {
            showMessage('⚠️ ไม่สามารถโหลด flowcharts', 'error');
        }
    } catch (error) {
        console.error('Error loading flowcharts:', error);
        showMessage('❌ เกิดข้อผิดพลาดในการโหลด flowcharts', 'error');
    }
}

async function startSessionAPI(studentId, flowchartId, flowchartName) {
    try {
        const response = await fetch(`${API_BASE_URL}/session/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: studentId,
                flowchart_id: flowchartId,
                flowchart_name: flowchartName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            showMessage(`❌ ${data.error}`, 'error');
            return null;
        }
    } catch (error) {
        console.error('Error starting session:', error);
        showMessage('❌ เกิดข้อผิดพลาดในการเริ่มเซชัน', 'error');
        return null;
    }
}

async function endSessionAPI(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error ending session:', error);
        return false;
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
    }
}

function displayFlowcharts(flowcharts) {
    const flowchartList = document.getElementById('flowchartList');
    
    if (flowcharts.length === 0) {
        flowchartList.innerHTML = '<p class="loading">ไม่มีผังงาน</p>';
        return;
    }
    
    flowchartList.innerHTML = flowcharts.map(fc => `
        <div class="flowchart-item" onclick="selectFlowchart('${fc.flowchart_id}', '${fc.name}')">
            <strong>${fc.name}</strong><br>
            <small>ID: ${fc.flowchart_id} | ระดับ: ${translateDifficulty(fc.difficulty)} | ${fc.algorithm_type || 'N/A'}</small>
        </div>
    `).join('');
}

function translateDifficulty(level) {
    const levels = {
        'easy': '🟢 ง่าย',
        'medium': '🟡 ปานกลาง',
        'hard': '🔴 ยาก'
    };
    return levels[level] || level;
}

function selectFlowchart(flowchartId, flowchartName) {
    document.getElementById('flowchartId').value = flowchartId;
    document.getElementById('flowchartName').value = flowchartName;
    enableSessionControls();
    showMessage(`✅ เลือกผังงาน: ${flowchartName}`, 'info');
}

function setupFormHandlers() {
    // Auto-enable when flowchart inputs change
    document.getElementById('flowchartName').addEventListener('change', checkSessionReady);
    document.getElementById('flowchartId').addEventListener('change', checkSessionReady);
}

function checkSessionReady() {
    if (document.getElementById('flowchartName').value && document.getElementById('flowchartId').value) {
        enableSessionControls();
    }
}

function disableSessionControls() {
    const startBtn = document.getElementById('startSessionBtn');
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';
}

function enableSessionControls() {
    const startBtn = document.getElementById('startSessionBtn');
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
}

// ===== Session Control =====

async function startSession() {
    const flowchartName = document.getElementById('flowchartName').value;
    const flowchartId = document.getElementById('flowchartId').value;
    
    if (!flowchartName || !flowchartId) {
        showMessage('⚠️ กรุณาเลือกผังงาน', 'error');
        return;
    }
    
    // Show flowchart modal instead of starting directly
    showFlowchartModal(flowchartName, flowchartId);
}

function showFlowchartModal(flowchartName, flowchartId) {
    // Store flowchart info globally for use when confirming
    window.pendingFlowchart = {
        name: flowchartName,
        id: flowchartId
    };
    
    // Display modal
    document.getElementById('modalFlowchartTitle').textContent = `📊 ผังงาน: ${flowchartName}`;
    document.getElementById('modalFlowchartName').textContent = flowchartName;
    document.getElementById('flowchartModal').style.display = 'flex';
}

function closeFlowchartModal() {
    document.getElementById('flowchartModal').style.display = 'none';
    window.pendingFlowchart = null;
    showMessage('✅ ปิดผังงาน - เลือกผังงานใหม่ได้', 'info');
}

async function startEyeTracking() {
    if (!window.pendingFlowchart) {
        showMessage('⚠️ ไม่พบข้อมูลผังงาน', 'error');
        return;
    }
    
    const flowchartName = window.pendingFlowchart.name;
    const flowchartId = window.pendingFlowchart.id;
    
    const session = await startSessionAPI(
        currentStudent.id,
        flowchartId,
        flowchartName
    );
    
    if (session) {
        // Close modal first
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
        document.getElementById('sessionStatus').textContent = '🔴 กำลังบันทึก';
        document.getElementById('sessionFlowchart').textContent = flowchartName;
        
        // Start timer
        startTimer();
        
        // Start webcam
        startWebcam();
        
        showMessage('✅ เซชันเริ่มแล้ว - กรุณามองอ่านผังงาน', 'success');
    }
}

async function stopSession() {
    if (!currentSession) return;
    
    const success = await endSessionAPI(currentSession.id);
    
    if (success) {
        sessionActive = false;
        
        // Stop timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Stop webcam
        stopWebcam();
        
        // UI Updates
        document.getElementById('startSessionBtn').style.display = 'block';
        document.getElementById('stopSessionBtn').style.display = 'none';
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('sessionStatus').textContent = '✅ เสร็จสิ้น';
        
        showMessage('✅ เซชันสิ้นสุด - กำลังคำนวณผลลัพธ์...', 'success');
        
        // Show results after delay
        setTimeout(showResults, 2000);
    }
}

function startTimer() {
    document.getElementById('sessionTimer').textContent = '⏱️ เวลา: 0:00';
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('sessionTimer').textContent = 
            `⏱️ เวลา: ${minutes}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// ===== Webcam Functions =====

async function startWebcam() {
    try {
        const video = document.getElementById('webcam');
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 400, height: 300 }
        });
        
        video.srcObject = stream;
        showMessage('✅ กล้องเปิดแล้ว', 'success');
    } catch (error) {
        console.error('Error accessing webcam:', error);
        showMessage('❌ ไม่สามารถเข้าถึงกล้อง - ให้สิทธิ์กล้องใน browser settings', 'error');
    }
}

function stopWebcam() {
    const video = document.getElementById('webcam');
    const stream = video.srcObject;
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ===== Results Functions =====

function showResults() {
    const resultsSection = document.getElementById('resultsSection');
    const assessmentResults = document.getElementById('assessmentResults');
    
    // Mock data for demonstration
    const results = {
        decomposition_score: Math.floor(Math.random() * 100),
        pattern_recognition_score: Math.floor(Math.random() * 100),
        flow_understanding_score: Math.floor(Math.random() * 100),
        abstraction_score: Math.floor(Math.random() * 100)
    };
    
    results.overall_ct_score = Math.round(
        (results.decomposition_score + results.pattern_recognition_score + 
         results.flow_understanding_score + results.abstraction_score) / 4
    );
    
    const resultsHTML = `
        <div class="result-row">
            <span class="result-label">📍 การแยกส่วน (Decomposition):</span>
            <span class="result-score">${results.decomposition_score}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${results.decomposition_score}%"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">🔍 การรู้จำรูปแบบ (Pattern Recognition):</span>
            <span class="result-score">${results.pattern_recognition_score}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${results.pattern_recognition_score}%"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">➡️ ความเข้าใจการไหล (Flow Understanding):</span>
            <span class="result-score">${results.flow_understanding_score}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${results.flow_understanding_score}%"></div>
        </div>
        
        <div class="result-row">
            <span class="result-label">💭 ความเป็นนามธรรม (Abstraction):</span>
            <span class="result-score">${results.abstraction_score}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${results.abstraction_score}%"></div>
        </div>
        
        <div class="result-row" style="border-top: 2px solid #667eea; padding-top: 10px; margin-top: 10px;">
            <span class="result-label"><strong>📊 คะแนน CT รวม:</strong></span>
            <span class="result-score"><strong>${results.overall_ct_score}%</strong></span>
        </div>
    `;
    
    assessmentResults.innerHTML = resultsHTML;
    resultsSection.style.display = 'block';
}

function newSession() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('preSessionInfo').style.opacity = '1';
    document.getElementById('sessionInfo').style.display = 'none';
    document.getElementById('flowchartName').value = '';
    document.getElementById('flowchartId').value = '';
    disableSessionControls();
    showMessage('✅ เซชันใหม่ - เลือกผังงาน', 'info');
}

function exportData() {
    if (!currentSession) {
        showMessage('⚠️ ไม่มีข้อมูลเซชันที่จะส่งออก', 'error');
        return;
    }
    
    // Mock CSV export
    const csv = 'Session ID,Student ID,Student Name,Flowchart,Duration,Frame Count\n' +
                `${currentSession.id},${currentStudent.id},${currentStudent.name},${currentSession.flowchart_name},300s,${frameCount}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `session_${currentSession.id}_${currentStudent.student_id}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('✅ ส่งออกข้อมูล CSV สำเร็จ', 'success');
}

// ===== Message Functions =====

function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// ===== Logout =====

function logout() {
    if (confirm('คุณแน่ใจว่าต้องการออกจากระบบ?')) {
        localStorage.removeItem('currentStudent');
        window.location.href = '/auth.html';
    }
}
