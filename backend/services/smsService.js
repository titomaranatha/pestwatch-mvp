// backend/services/smsService.js
const crypto = require('crypto');

async function sendSms(phoneNumber, message) {
    // SIMULATION: Log to console instead of calling Twilio/Africa's Talking
    console.log(`[SMS DISPATCH] To: ${phoneNumber}`);
    console.log(`[SMS CONTENT]: ${message}`);
    console.log("----------------------------");
    
    // Return success ID for database tracking
    return {
        id: crypto.randomUUID(),
        status: 'sent_simulated',
        timestamp: new Date().toISOString()
    };
}

module.exports = { sendSms };