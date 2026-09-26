# 🌿 PestWatch NG: Community-Led Early Warning System (MVP)

**Project Overview:**
PestWatch NG is a lightweight, offline-first mobile web application designed for smallholder farmers in Kwara State, Nigeria. It enables rapid reporting of crop pests/diseases without requiring farmers to know scientific names. The system uses a simple keyword-based triage engine, requires human verification by extension officers, and triggers geofenced SMS alerts to neighboring farms within a 5km radius upon confirmation.

**Based on:** *PestWatch-NG-DL4ALL-Kwara-Submission.docx*

## 🚀 Quick Start Guide

### Prerequisites
1.  **Node.js** (v14 or higher) installed.
2.  **Git** (optional, for cloning).
3.  A modern web browser (Chrome/Firefox recommended for Geolocation support).

### Installation & Running

#### 1. Set Up the Backend
Open your terminal and navigate to the backend directory:

```bash
cd pestwatch-mvp/backend
npm install
node server.js
```
*   ✅ **Success Indicator:** You should see `✅ PestWatch Backend running on http://localhost:5000`.
*   ⚠️ **Keep this terminal window open.** This is where you will see the simulated SMS logs during the demo.

#### 2. Launch the Frontend Applications
You do not need to install anything for the frontends. They are static HTML/JS files.

*   **Farmer App:** Open `pestwatch-mvp/frontend-farmer/index.html` in your browser.
    *   *Tip:* Use Chrome DevTools (F12) -> Toggle Device Toolbar to simulate a mobile phone screen.
*   **Admin/Verifier Dashboard:** Open `pestwatch-mvp/frontend-admin/index.html` in a separate browser tab.

---

## 🎬 Demo Walkthrough Script

To demonstrate the full lifecycle described in the documentation:

### Step 1: Seed Test Data (Crucial for Geofencing)
The system alerts neighbors. If only one user exists, no alerts are sent. Register two users via the Farmer App or use cURL:

**Via Browser (Easiest):**
1.  In **Farmer Tab 1**, register as **"Alhaji Musa"** (Phone: `08011111111`).
2.  In **Farmer Tab 2** (Incognito mode), register as **"Baba Sule"** (Phone: `08022222222`).
    *   *Note:* Both users are assigned mock coordinates `(8.9, 4.5)` which are <5km apart, ensuring they trigger each other's alerts.

### Step 2: Farmer Reports an Issue
1.  Go to **Tab 1 (Alhaji Musa)**.
2.  Select Crop: **Groundnut**.
3.  Description: Type `"Leaves turning yellow and stunted"`.
4.  Upload any image (optional).
5.  Click **Submit Report**.
6.  **Result:** The UI displays: *"Report Sent! Triage Prediction: Groundnut Rosette Virus."*

### Step 3: Officer Verifies
1.  Switch to the **Admin Dashboard Tab**.
2.  Wait ~5 seconds for auto-refresh. You will see Alhaji Musa’s report with status "Pending".
3.  Click **Confirm & Alert**.
4.  Enter Verified Pest Name: `Rosette Virus` (or leave blank to accept AI guess).
5.  Click OK.

### Step 4: Verify Geofenced Alert Dispatch
1.  Look at the **Backend Terminal** (`node server.js`).
2.  You should see logs similar to:
    ```text
    [MOCK SMS DISPATCH] To: +2348022222222
    [SMS CONTENT]: ALERT: Rosette Virus detected nearby (1km away). Action: Scout your field now.
    ----------------------------
    ```
3.  This proves the system successfully identified the neighbor (Baba Sule) within the 5km radius and triggered the alert workflow.

---

## 🏗️ Technical Architecture

### Stack
*   **Backend:** Node.js, Express, SQLite3 (Lightweight, zero-config DB).
*   **Frontend (Farmer):** Vanilla JS, HTML5, CSS3 (Mobile-first, PWA-ready structure).
*   **Frontend (Admin):** Vanilla JS, Fetch API.
*   **Communication:** RESTful JSON APIs.
*   **Simulation:** Mock SMS Service (Logs to console instead of real Twilio/Africa's Talking integration for MVP cost-saving).

### Key Modules
| Module | Path | Function |
| :--- | :--- | :--- |
| **Database** | `backend/db.js` | Initializes SQLite tables for Users, Reports, and Alerts. |
| **Triage Engine** | `backend/services/triageEngine.js` | Simple keyword matching logic to predict pests based on symptoms (e.g., "yellow leaf" → "Rosette"). |
| **SMS Service** | `backend/services/smsService.js` | Simulates sending SMS. Prints payload to console for demonstration. |
| **Server Logic** | `backend/server.js` | Handles API routes, file uploads (Multer), and Geofencing calculation (Haversine formula). |
| **Farmer Client** | `frontend-farmer/app.js` | Manages local state, form submission, and display of triage results. |
| **Admin Client** | `frontend-admin/index.html` | Polls pending reports and allows verification actions. |

---

## 💡 Core Features Implemented (From Docx)

1.  **No Naming Required:** Farmers describe symptoms in plain language; the system suggests probable causes.
2.  **Human-in-the-Loop Verification:** Alerts are **not** sent automatically. An Extension Officer must verify the report first to prevent false positives.
3.  **Geofenced Broadcasting:** Alerts are restricted to a **5km radius** around the source farm using Haversine distance calculation.
4.  **Offline-First Design:** The frontend stores user sessions locally (`localStorage`) and handles network errors gracefully, preparing for areas with poor connectivity.
5.  **Actionable Payloads:** The generated SMS includes specific advice (e.g., "Scout your field," "Remove affected plants") rather than just a notification.

---

## 🔧 Troubleshooting

*   **CORS Errors:** Ensure the backend is running on port `5000`. If you change ports, update `API_URL` in both `frontend-farmer/app.js` and `frontend-admin/index.html`.
*   **No SMS Logs:** Did you register more than one farmer? The system excludes the reporter from receiving their own alert. Ensure you have at least two users registered within the 5km mock radius.
*   **Image Upload Fails:** Ensure the `backend/uploads` folder exists. The script creates it automatically, but manual creation may be needed if permissions are strict.

---

## 📄 License
MIT License - Free for educational and hackathon use.
