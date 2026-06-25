# 📷 FramedForever – Wedding Studio Tracker

A full production app for wedding photography studios to manage bookings, track workflow, send WhatsApp messages, and view revenue analytics.

---

## ✨ Features

- 📅 **Event Booking** — multiple events per day, full client details
- 🔄 **8-Stage Workflow** — Booked → Completed → Backup → Gallery → Selection → Editing → Delivered → Paid
- 💬 **WhatsApp Messages** — pre-written templates that open directly in WhatsApp
- 📨 **3 Follow-up System** — auto-escalating follow-ups, then auto-select if no response
- 📊 **Dashboard** — revenue charts, overdue alerts, payment tracking
- 🗓️ **Calendar View** — see all events by date
- 💰 **Payment Tracking** — total, paid, and due amounts per event
- 👥 **Staff Assignment** — assign photographers/editors per event
- ⚠️ **Overdue Alerts** — SLA timers per stage
- 🔐 **Multi-device Login** — Firebase Auth + Firestore, works on phone & laptop

---

## 🚀 Deploy in 4 Steps

### STEP 1 — Set up Firebase

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → give it a name → Create
3. Click **Add App** → choose **Web** (`</>`) → register app → copy the config
4. In the left sidebar → **Firestore Database** → Create database → **Start in production mode** → choose region → Done
5. **Firestore → Rules** tab → replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   → Publish
6. **Authentication** → Get started → **Email/Password** → Enable → Save

---

### STEP 2 — Set up the code on GitHub

```bash
# 1. Clone / download this project folder

# 2. Copy the env file
cp .env.example .env

# 3. Open .env and paste your Firebase values:
#    REACT_APP_FIREBASE_API_KEY=...
#    REACT_APP_FIREBASE_AUTH_DOMAIN=...
#    (fill all 6 lines from your Firebase config)

# 4. Install dependencies
npm install

# 5. Test locally
npm start
# → Opens at http://localhost:3000
# → Register your studio, add a booking, test the workflow

# 6. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/framedforever.git
git push -u origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` (it is by default) — NEVER push your Firebase keys to GitHub

---

### STEP 3 — Deploy on Netlify

1. Go to [https://netlify.com](https://netlify.com) → Sign up / Log in
2. Click **Add new site** → **Import an existing project** → **GitHub**
3. Select your `framedforever` repository
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `build`
5. Click **Show advanced** → **New variable** → Add all 6 Firebase env vars:
   ```
   REACT_APP_FIREBASE_API_KEY          → your value
   REACT_APP_FIREBASE_AUTH_DOMAIN      → your value
   REACT_APP_FIREBASE_PROJECT_ID       → your value
   REACT_APP_FIREBASE_STORAGE_BUCKET   → your value
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID → your value
   REACT_APP_FIREBASE_APP_ID           → your value
   ```
6. Click **Deploy site**
7. In ~2 minutes your app is live at `https://something.netlify.app`

> 💡 Optional: Set a custom domain in Netlify → Domain settings → Add custom domain

---

### STEP 4 — First-time setup in the app

1. Open your Netlify URL
2. Click **New Studio** → fill in studio name, your name, email, password → Create
3. Go to **Settings** → add your studio phone, UPI ID, and staff members
4. Go to **Events** → **+ New Booking** → add your first event
5. Share the URL with your team — they register with the same Firebase project and see all events

---

## 📱 WhatsApp Integration

When you click any "Send Message" button in the workflow:
1. A pre-written message appears (editable)
2. Click **Open in WhatsApp** → opens WhatsApp Web / App with the message pre-filled
3. Just hit Send on WhatsApp
4. Click **Mark as Sent** to log it in the activity log

---

## 🔄 Workflow Stages & SLA Timers

| Stage | Allowed Days | Action |
|-------|-------------|--------|
| Booked | — | Send booking confirmation |
| Event Completed | 3 days | Upload files |
| Backup Created | 1 day | Backup all photos/videos |
| Gallery Link Sent | 2 days | Send gallery to client |
| Awaiting Selection | 7 days | Follow-ups 1→2→3, then auto-select |
| Editing | 5 days | Edit photos |
| Final Delivered | 2 days | Send final delivery message |
| Payment Received | — | Project complete! |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Charts | Recharts |
| Hosting | Netlify |
| CI/CD | GitHub → Netlify auto-deploy |

---

## 🔁 Auto-deploy

Once connected, every `git push` to `main` automatically redeploys the app on Netlify. No manual steps needed.

---

## 💡 Tips

- **Multiple studios**: Each email/password creates a separate studio with its own data
- **Mobile**: The app works on mobile browsers — bookmark it on your phone's home screen
- **Offline**: Firestore caches data locally, so it works briefly without internet
- **Backup**: Firestore automatically backs up your data — no manual backups needed
