# 🌿 PestWatch NG: Community-Led Early Warning System (MVP)

**Project Overview:**
PestWatch NG is a lightweight, offline-first mobile web application designed for smallholder farmers in Kwara State, Nigeria. It enables rapid reporting of crop pests/diseases without requiring farmers to know scientific names. The system uses a simple keyword-based triage engine, requires human verification by extension officers, and triggers geofenced SMS alerts to neighboring farms within a 5km radius upon confirmation.

**Based on:** *PestWatch-NG-DL4ALL-Kwara-Submission.docx*

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18 or higher recommended).
2. Modern web browser.

### Installation & Running Locally

1. Install dependencies from the project root:
   ```bash
   npm install
   ```

2. Start the unified application:
   ```bash
   npm start
   ```

3. Open your browser:
   * **Demo Portal / Hub:** [http://localhost:5000/](http://localhost:5000/)
   * **Farmer Mobile App:** [http://localhost:5000/farmer](http://localhost:5000/farmer)
   * **Extension Officer Dashboard:** [http://localhost:5000/admin](http://localhost:5000/admin)

---

## 🌐 Free Cloud Deployment (Render.com)

The project is structured for 1-click or quick deployment on [Render](https://render.com):

1. Push your repository to GitHub.
2. Sign in to **[Render.com](https://render.com)** and click **New +** > **Web Service**.
3. Connect your `pestwatch-mvp` GitHub repository.
4. Render will read `render.yaml` automatically, or you can specify:
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Click **Deploy Web Service**. You will receive a public `.onrender.com` link to share with reviewers!

---

## 🎬 2-Minute Demo Walkthrough Script

### Step 1: Seed Two Neighboring Farmers
The system alerts neighbors within 5km. If only one user exists, no alerts are triggered.
1. In **Browser Window 1**, go to `/farmer` and register as **"Alhaji Musa"** (Phone: `08011111111`).
2. In **Browser Window 2** (Incognito mode), go to `/farmer` and register as **"Baba Sule"** (Phone: `08022222222`).
   *(Mock coordinates near Kwara State are assigned automatically)*.

### Step 2: Farmer Reports an Issue
1. In **Window 1 (Alhaji Musa)**:
   * Select Crop: **Groundnut**.
   * Description: Type `"Leaves turning yellow and stunted"`.
   * Click **Submit Report**.
2. **Result:** The UI displays triage prediction: *"Groundnut Rosette Virus (85% match). Awaiting officer confirmation."*

### Step 3: Officer Verifies
1. Open the **Officer Dashboard** at `/admin`.
2. Alhaji Musa's report will appear in the table with status "Pending".
3. Click **Confirm & Alert**, confirm the pest name, and click OK.

### Step 4: Verify Geofenced Alert Dispatch
1. In **Window 2 (Baba Sule)**: Watch the **Your Geofenced Alerts** box update live with the outbreak alert!
2. In the backend terminal, observe simulated SMS dispatch logs:
   ```text
   [SMS DISPATCH] To: 08022222222
   [SMS CONTENT]: ALERT: Rosette Virus detected nearby (1km away). 
   Action: Scout your field now. Remove infected leaves. Contact nearest agro-dealer if severe.
   ```

---

## 🏗️ Technical Architecture & Folder Structure

```text
pestwatch-mvp/
├── backend/
│   ├── services/
│   │   ├── smsService.js          # SMS dispatcher simulation
│   │   └── triageEngine.js        # Symptom-to-pest prediction
│   ├── uploads/                   # Stored farmer crop photos
│   ├── db.js                      # SQLite database schema (Users, Reports, Alerts)
│   ├── package.json               # Backend package definition
│   └── server.js                  # Express API & static file server
├── frontend/
│   ├── index.html                 # Central Demo Hub / Portal for reviewers
│   ├── farmer/
│   │   ├── index.html             # Farmer reporting mobile view
│   │   ├── style.css              # Farmer interface styles
│   │   └── app.js                 # Geolocation, reporting & alert polling
│   └── admin/
│       └── index.html             # Extension officer verifier dashboard
├── render.yaml                    # Cloud deployment blueprint
├── package.json                   # Root package definition (npm start)
└── .gitignore                     # Ignores node_modules, .db, uploads
```

---

## 📄 License
MIT License - Free for educational, hackathon, and non-commercial community pilot use.
