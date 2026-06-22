// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Auth Functions
function switchTab(tab) {
    // Hide all forms
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    
    // Remove active class from all tabs
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    
    // Show selected form
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
    }
}

// Initialize Auth Page
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบว่าเข้า login page หรือไม่
    if (window.location.pathname.includes('auth.html') || window.location.pathname === '/') {
        // Check if already logged in
        const currentStudent = localStorage.getItem('currentStudent');
        if (currentStudent) {
            window.location.href = '/dashboard.html';
        }
    }
    
    // Setup form handlers
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('loginStudentId').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/student/${studentId}`);
        const data = await response.json();
        
        if (data.success) {
            // Save student info to localStorage
            localStorage.setItem('currentStudent', JSON.stringify(data.data));
            showAuthMessage('✅ เข้าสู่ระบบสำเร็จ!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showAuthMessage('❌ ไม่พบนักเรียนนี้ในระบบ', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAuthMessage('❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const studentId = document.getElementById('regStudentId').value;
    const grade = document.getElementById('regGrade').value;
    
    if (!name || !studentId || !grade) {
        showAuthMessage('⚠️ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                student_id: studentId,
                grade: parseInt(grade)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAuthMessage('✅ สมัครสมาชิกสำเร็จ! เข้าสู่ระบบอัตโนมัติ...', 'success');
            
            // Save student info and redirect
            localStorage.setItem('currentStudent', JSON.stringify(data.data));
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        } else {
            showAuthMessage(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAuthMessage('❌ เกิดข้อผิดพลาดในการสมัครสมาชิก', 'error');
    }
}

function showAuthMessage(message, type = 'info') {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}
