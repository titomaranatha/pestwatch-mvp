const API_URL = 'http://localhost:5000/api';
let currentUser = JSON.parse(localStorage.getItem('pw_user'));

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) showApp();
});

async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    
    // Simulate getting GPS location
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, phone, role: 'farmer', lat, lng })
            });
            const data = await res.json();
            localStorage.setItem('pw_user', JSON.stringify(data));
            currentUser = data;
            showApp();
        } catch (e) {
            alert("Registration failed. Is backend running?");
        }
    }, () => alert("Please allow location access"));
}

function showApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('report-section').style.display = 'block';
    document.getElementById('alerts-section').style.display = 'block';
    loadAlerts();
}

document.getElementById('pest-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('cropType', document.getElementById('crop-type').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('lat', currentUser.lat); // Using stored loc for simplicity
    formData.append('lng', currentUser.lng);
    formData.append('image', document.getElementById('photo').files[0]);

    const statusDiv = document.getElementById('status-msg');
    statusDiv.style.display = 'block';
    statusDiv.className = '';
    statusDiv.innerText = 'Submitting...';

    try {
        const res = await fetch(`${API_URL}/report`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if(res.ok) {
            statusDiv.className = 'success';
            statusDiv.innerText = `Report Sent! Triage Prediction: ${data.triageResult.probablePest}. Waiting for officer verification.`;
            e.target.reset();
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        statusDiv.className = 'error';
        statusDiv.innerText = 'Error submitting report.';
    }
});

async function loadAlerts() {
    // In a real app, we'd poll an endpoint for alerts sent TO this user
    // For MVP demo, we might just log them or have a mock view
    const ul = document.getElementById('alert-list');
    ul.innerHTML = '<li class="alert-item"><strong>No new alerts.</strong><br>Check back after submission.</li>';
}