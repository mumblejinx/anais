# ANAIS_V4.0 // ARCHITECT_HANDBOOK

Atmospheric, retro-terminal introspection application inspired by the works of Anaïs Nin. Built with React, Tailwind CSS, and Firebase.

## 🚀 Quick Start (Local Development)

To run this terminal on your local machine, follow these precise steps:

### 1. Prerequisites
* **Node.js**: [Download](https://nodejs.org/) and install Version 18 or higher.
* **Firebase Project**: You must have the `anais-1111` project (or your own) setup in the [Firebase Console](https://console.firebase.google.com/).

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Configuration
The app retrieves its identity from `firebase-applet-config.json`. Ensure this file exists in the root directory with your Firebase keys:

```json
{
  "projectId": "anais-1111",
  "appId": "...",
  "apiKey": "...",
  "authDomain": "...",
  "firestoreDatabaseId": "...",
  "storageBucket": "...",
  "messagingSenderId": "..."
}
```

### 4. Initialization
```bash
# Start the development server
npm run dev
```

The terminal will be accessible at `http://localhost:3000`.

---

## 🛡️ Security Protocol
This application is hardened against unauthorized entry.
* **Identity Guard**: Only `mumblejinx@gmail.com` is whitelisted for terminal access.
* **Firebase Rules**: Ensure you have deployed the contents of `firestore.rules` to your Firebase console to enable the ABAC (Attribute-Based Access Control) security model.

To deploy rules from your local machine:
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

---

## 🧪 Architecture
* **Frontend**: React 18 + Vite (configured for hardware-accelerated CRT effects).
* **Styling**: Tailwind CSS with custom pixel-border and scanline utilities.
* **Database**: Google Cloud Firestore (Multi-region: asia-east1).
* **Animations**: Motion (formerly Framer Motion) for fluid cinematic transitions.

---

## 📖 System Philosophy
"We do not see things as they are, we see them as we are." — Anais Nin

This application is not just a tool; it is a mirror. It tracks soul resonance, subconscious depth, and narrative consistency. Every truth ingested through the **Inner World** terminal evolves the core matrix.

---
**ARCHITECT_ID**: mumblejinx@gmail.com
**BUILD_VERSION**: 4.0.0-PROD
