# Electives Explorer — IIM Sambalpur

A glassmorphism student dashboard to browse and filter MBA elective courses.

## Quick Start

```bash
cd elective-dashboard

# Install all dependencies (once)
npm install
npm install --prefix client

# Start both server + client
npm run dev
```

Open **http://localhost:6173** in your browser.

## Features
- 🔍 Live search by course name, faculty, or area
- 🏷 Specialization filter (Finance, GMPP, ISM, Marketing, OB/HR, Operations, Strategy, Inter-Area)
- 💳 Credits toggle (All / 1.5 / 3)
- 👤 Faculty dropdown with full faculty list
- 📱 Fully responsive — adapts from mobile to 4-column desktop
- ✨ Glassmorphism UI with deep navy background and gold accents

## Tech Stack
- **Backend**: Node.js + Express (port 6000)
- **Frontend**: React 19 + Vite (port 6173)
- **Data**: `server/data/courses.json` — 91 courses across 8 areas
