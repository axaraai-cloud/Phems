# Elite Music Studio (EMS) Platform

EMS is a production-grade studio management suite designed for high-end recording facilities. It features autonomous maintenance systems, real-time analytics, and a specialized "Hardware" aesthetic.

## 🚀 Features

- **Autonomous Studio Bot**: Background maintenance and auditing systems.
- **Production Pipeline**: Kanban-style track lifecycle management.
- **Artist Roster**: Comprehensive talent database with role-based access.
- **Financial Hub**: Revenue tracking, expense logging, and professional invoicing.
- **Equipment Inventory**: Asset tracking with status and maintenance logs.
- **Studio Calendar**: Master schedule for session bookings.
- **AI Manager**: Intelligent studio assistant powered by Gemini.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend**: Express.js (Full-stack), Firebase (Auth & Firestore).
- **AI**: Google Gemini API.

## 📦 Deployment

### 1. Export to GitHub
Use the **Export to GitHub** feature in the AI Studio Build settings menu to push this code to a new repository.

### 2. Environment Variables
Ensure the following secrets are configured in your deployment environment (e.g., GitHub Actions Secrets, Vercel, or Cloud Run):

```env
GEMINI_API_KEY=your_api_key_here
# Firebase config is loaded from firebase-applet-config.json
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Start the full-stack dev server
npm run dev
```

### 4. Production Build

```bash
# Build the frontend
npm run build

# Start the production server
NODE_ENV=production npm start
```

## 🐳 Docker Deployment

A `Dockerfile` is included for containerized deployment (e.g., Google Cloud Run, AWS Fargate).

```bash
docker build -t ems-platform .
docker run -p 3000:3000 ems-platform
```
