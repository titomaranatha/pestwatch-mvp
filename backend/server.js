// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = require('./db');
const { analyzeSymptoms } = require('./services/triageEngine');
const { sendSms } = require('./services/smsService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config for Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. Register User (Seed Data Helper)
app.post('/api/register', (req, res) => {
    const { name, phone, role, lat, lng } = req.body;
    const id = uuidv4();
    
    db.run(
        `INSERT INTO users (id, name, phone, role, lat, lng) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, phone, role, lat, lng],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id, message: "User registered successfully" });
        }
    );
});

// 2. Farmer Submits Report (Step 1 & 2 from Doc)
app.post('/api/report', upload.single('image'), async (req, res) => {
    const { userId, cropType, description, lat, lng } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const reportId = uuidv4();

    // Run Triage Engine (Step 2)
    const analysis = analyzeSymptoms(cropType, description);

    db.run(
        `INSERT INTO reports (id, user_id, crop_type, symptom_description, image_path, lat, lng, probable_pest, confidence_level) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [reportId, userId, cropType, description, imagePath, parseFloat(lat), parseFloat(lng), analysis.probablePest, analysis.confidence],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Auto-trigger alert check if confidence is high? 
            // Per Doc: Verification happens FIRST. So we just save as 'pending'.
            res.json({ 
                reportId, 
                status: 'pending_verification',
                triageResult: analysis 
            });
        }
    );
});

// 3. Officer Verifies Report (Step 3) -> Triggers Alert (Step 4)
app.post('/api/verify/:reportId', async (req, res) => {
    const { reportId } = req.params;
    const { officerId, action, confirmedPestName } = req.body; // action: 'confirm' | 'reject'

    db.get(`SELECT * FROM reports WHERE id = ?`, [reportId], async (err, report) => {
        if (err || !report) return res.status(404).json({ error: "Report not found" });

        if (action === 'confirm') {
            // Update Report Status
            db.run(`UPDATE reports SET status = 'verified', verified_by = ?, probable_pest = ? WHERE id = ?`,
                [officerId, confirmedPestName || report.probable_pest, reportId]);

            // TRIGGER GEO-FENCED ALERTS
            await triggerGeofencedAlerts(report, confirmedPestName || report.probable_pest);
            
            res.json({ message: "Verified and Alerts Dispatched", reportId });
        } else {
            db.run(`UPDATE reports SET status = 'rejected', verified_by = ? WHERE id = ?`, [officerId, reportId]);
            res.json({ message: "Report Rejected" });
        }
    });
});

// Helper: Calculate Distance & Send SMS
async function triggerGeofencedAlerts(sourceReport, pestName) {
    const RADIUS_KM = 5; // Alert radius
    
    // Get all farmers who are NOT the reporter
    db.all(`SELECT * FROM users WHERE role = 'farmer' AND id != ?`, [sourceReport.user_id], async (err, neighbors) => {
        if (err) return;

        for (let neighbor of neighbors) {
            const distance = calculateDistance(
                sourceReport.lat, sourceReport.lng,
                neighbor.lat, neighbor.lng
            );

            if (distance <= RADIUS_KM) {
                // Construct Message per Doc Section 4.1
                const msg = `ALERT: ${pestName} detected nearby (${Math.round(distance)}km away). 
Action: Scout your field now. Remove infected leaves. Contact nearest agro-dealer if severe.`;

                // Send SMS
                const smsRes = await sendSms(neighbor.phone, msg);
                
                // Log Alert
                const alertId = uuidv4();
                db.run(`INSERT INTO alerts_sent (id, report_id, recipient_user_id, message_text) VALUES (?, ?, ?, ?)`,
                    [alertId, sourceReport.id, neighbor.id, msg]);
            }
        }
    });
}

// Haversine Formula for Distance in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth’s radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// 4. Get Pending Reports for Admin Dashboard
app.get('/api/reports/pending', (req, res) => {
    db.all(`SELECT r.*, u.name as farmer_name, u.phone as farmer_phone 
            FROM reports r JOIN users u ON r.user_id = u.id 
            WHERE r.status = 'pending' ORDER BY r.created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`PestWatch Backend running on http://localhost:${PORT}`);
});