// frontend/farmer/app.js
const API_URL = window.location.origin.startsWith('http') ? '/api' : 'http://localhost:5000/api';
let currentUser = JSON.parse(localStorage.getItem('pw_user'));

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showApp();
    }
});

async function registerUser() {
    const nameInput = document.getElementById('reg-name');
    const phoneInput = document.getElementById('reg-phone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        alert("Please enter both your name and phone number.");
        return;
    }

    const submitBtn = document.querySelector('#auth-section button');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Registering...";
    }

    const completeRegistration = async (lat, lng) => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, role: 'farmer', lat, lng })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            currentUser = { id: data.id, name, phone, role: 'farmer', lat, lng };
            localStorage.setItem('pw_user', JSON.stringify(currentUser));
            showApp();
        } catch (e) {
            alert("Registration failed. Please verify the backend service is running.");
            console.error(e);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Register/Login";
            }
        }
    };

    // Try geolocation; fallback to Kwara State pilot coordinates if unavailable
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => completeRegistration(pos.coords.latitude, pos.coords.longitude),
            () => {
                // Mock coordinate pair near Ifelodun/Kaiama (8.90, 4.50)
                const mockOffset = (Math.random() - 0.5) * 0.02;
                completeRegistration(8.9000 + mockOffset, 4.5000 + mockOffset);
            },
            { timeout: 5000 }
        );
    } else {
        completeRegistration(8.9000, 4.5000);
    }
}

function showApp() {
    const authSec = document.getElementById('auth-section');
    const reportSec = document.getElementById('report-section');
    const alertsSec = document.getElementById('alerts-section');

    if (authSec) authSec.style.display = 'none';
    if (reportSec) reportSec.style.display = 'block';
    if (alertsSec) alertsSec.style.display = 'block';

    // Show farmer info bar
    let userBar = document.getElementById('user-bar');
    if (!userBar) {
        userBar = document.createElement('div');
        userBar.id = 'user-bar';
        userBar.style.cssText = 'background: #e8f5e9; border: 1px solid #c8e6c9; padding: 10px; border-radius: 6px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 14px;';
        reportSec.parentNode.insertBefore(userBar, reportSec);
    }
    userBar.innerHTML = `
        <div>
            <strong>👨‍🌾 ${currentUser.name || 'Farmer'}</strong><br>
            <small style="color: #555;">📱 ${currentUser.phone || ''}</small>
        </div>
        <button onclick="logoutUser()" style="width: auto; margin: 0; padding: 6px 12px; font-size: 12px; background: #c62828;">Switch</button>
    `;

    loadAlerts();
}

function logoutUser() {
    localStorage.removeItem('pw_user');
    currentUser = null;
    window.location.reload();
}

document.getElementById('pest-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('cropType', document.getElementById('crop-type').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('lat', currentUser.lat);
    formData.append('lng', currentUser.lng);

    const photoInput = document.getElementById('photo');
    if (photoInput.files && photoInput.files[0]) {
        formData.append('image', photoInput.files[0]);
    }

    const statusDiv = document.getElementById('status-msg');
    statusDiv.style.display = 'block';
    statusDiv.className = '';
    statusDiv.innerText = 'Submitting report to extension officers...';

    try {
        const res = await fetch(`${API_URL}/report`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (res.ok) {
            statusDiv.className = 'success';
            const pestGuess = data.triageResult?.probablePest || 'Under Evaluation';
            const confidence = data.triageResult?.confidence ? `(${data.triageResult.confidence}% match)` : '';
            statusDiv.innerText = `✅ Report Sent! Automated Triage Guess: ${pestGuess} ${confidence}. Awaiting officer confirmation before neighbor alerts.`;
            e.target.reset();
        } else {
            throw new Error(data.error || 'Submission failed');
        }
    } catch (err) {
        statusDiv.className = 'error';
        statusDiv.innerText = `Error submitting report: ${err.message || 'Please check backend connection.'}`;
    }
});

async function loadAlerts() {
    if (!currentUser || !currentUser.id) return;
    const ul = document.getElementById('alert-list');
    if (!ul) return;

    try {
        const res = await fetch(`${API_URL}/alerts/${currentUser.id}`);
        if (!res.ok) throw new Error("Could not fetch alerts");
        const alerts = await res.json();

        if (alerts && alerts.length > 0) {
            ul.innerHTML = alerts.map(a => `
                <li class="alert-item">
                    <strong style="color: #b71c1c;">⚠️ GEOFENCED OUTBREAK ALERT:</strong><br>
                    <span style="font-size: 13px;">${(a.message_text || '').replace(/\n/g, '<br>')}</span>
                    <br><small style="color: #666; font-size: 11px;">Sent: ${new Date(a.sent_at).toLocaleTimeString()}</small>
                </li>
            `).join('');
        } else {
            ul.innerHTML = '<li class="alert-item" style="background:#f9f9f9; border-left: 4px solid #bbb;"><strong>No new alerts.</strong><br><small style="color: #666;">You will automatically receive SMS alerts here when pests are confirmed within 5km of your farm.</small></li>';
        }
    } catch (e) {
        // Silent catch for background refresh
    }
}

// Poll alerts every 5 seconds so neighbor receives the alert in real time during demos
setInterval(() => {
    if (currentUser) {
        loadAlerts();
    }
}, 5000);