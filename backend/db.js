// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'pestwatch.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create Tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT UNIQUE,
        role TEXT CHECK(role IN ('farmer', 'officer')), -- farmer or verifier
        lat REAL,
        lng REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        crop_type TEXT,
        symptom_description TEXT,
        image_path TEXT,
        lat REAL,
        lng REAL,
        status TEXT DEFAULT 'pending', -- pending, verified, rejected
        probable_pest TEXT,
        confidence_level INTEGER, -- 0-100
        verified_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS alerts_sent (
        id TEXT PRIMARY KEY,
        report_id TEXT,
        recipient_user_id TEXT,
        message_text TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        acknowledged BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(report_id) REFERENCES reports(id),
        FOREIGN KEY(recipient_user_id) REFERENCES users(id)
    )`);
});

module.exports = db;