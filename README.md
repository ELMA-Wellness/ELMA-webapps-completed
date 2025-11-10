# ELMA Web - Mental Health Platform

Full-stack monorepo with two React portals (Admin + Psychologist) sharing Firebase infrastructure.

## 🏗 Architecture

```
elma-web/
├── apps/
│   ├── admin-portal/      → admin.elma.ltd (Admin dashboard)
│   └── psych-portal/      → psych.elma.ltd (Therapist portal)
├── packages/
│   ├── shared-core/       → Firebase, auth, metrics
│   └── shared-ui/         → Reusable UI components
├── firebase/              → Firestore rules & indexes
└── scripts/               → Database seeding
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm
- Firebase project with Firestore and Authentication enabled

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd elma-web
npm install
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Email/Password** authentication
4. Create **Firestore** database (start in test mode for now)

#### Get Firebase Config

1. Go to Project Settings → General
2. Scroll to "Your apps" → Add web app
3. Copy the Firebase configuration

#### Configure Apps

For **Admin Portal**:
```bash
cd apps/admin-portal
cp .env.example .env.local
# Edit .env.local and paste your Firebase config
```

For **Psychologist Portal**:
```bash
cd apps/psych-portal
cp .env.example .env.local
# Edit .env.local and paste your Firebase config
```

Both apps use the **same Firebase project**.

#### Deploy Firestore Rules

```bash
# Copy contents of firebase/rules.firestore.txt
# Paste into Firebase Console → Firestore → Rules
```

#### Create Indexes

```bash
# Upload firebase/indexes.json via Firebase Console
# Or use Firebase CLI: firebase deploy --only firestore:indexes
```

### 3. Run Development Servers

**Admin Portal** (port 3000):
```bash
npm run dev:admin
```

**Psychologist Portal** (port 3001):
```bash
npm run dev:psych
```

Visit:
- Admin: http://localhost:3000
- Psych: http://localhost:3001

## 👤 User Setup

### Create Admin User

1. Create a user via Firebase Console → Authentication
2. Note the user's UID
3. Set custom claim:

```bash
# Using Firebase CLI
firebase auth:set-custom-claims <USER_UID> --claims '{"admin":true}'

# Or using Node.js
import admin from "firebase-admin";
admin.auth().setCustomUserClaims("<USER_UID>", { admin: true });
```

### Create Therapist

1. Create user in Firebase Auth
2. Add document in Firestore `therapists` collection:

```javascript
{
  name: "Dr. Name",
  verified: true,
  ratePerSession: 1000,
  active: true,
  joinedAt: <timestamp>
}
```

Use the **same UID** as the document ID.

## 🌱 Seed Test Data

See [scripts/README_SEED.md](scripts/README_SEED.md) for detailed instructions.

Quick start:
```bash
# 1. Download service account key to scripts/serviceAccountKey.json
# 2. Run seed
npm run seed
```

This creates 50 users, 10 therapists, 200 bookings, and test data.

## 📦 Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router 6
- **State**: React Query (TanStack Query)
- **Styling**: Tailwind CSS (ELMA brand colors)
- **Backend**: Firebase (Auth + Firestore)
- **Language**: JavaScript (no TypeScript)

## 🎨 ELMA Brand Colors

```javascript
{
  purple: "#BA92FF",
  pink: "#FFBBD8",
  sky: "#90E0EF",
  white: "#FAFAFF",
  ink: "#0F1020"
}
```

## 📊 Features

### Admin Portal

- **Dashboard**: User metrics, DAU/WAU/MAU, revenue, therapist stats
- **Payouts**: Track therapist earnings and sessions
- **Revenue**: Monthly revenue breakdown by sessions/subscriptions
- **Settings**: Profile management, password change

### Psychologist Portal

- **Dashboard**: Today's sessions, earnings overview
- **Bookings**: Filter sessions by time period with meet links
- **Earnings**: Monthly and lifetime earnings
- **Profile**: Update name, change password

## 🌍 Timezone

All dates use **IST (Indian Standard Time, UTC+5:30)**.

Date calculations (today, month keys) automatically convert to IST.

## 🔒 Security

### Firestore Rules

- **users**: Admin read-only
- **therapists**: Admin or therapist can read/update own doc
- **bookings**: Admin or assigned therapist can read
- **moods**: Admin read-only
- **journals**: No access (encrypted data)

### Authentication

- Email/password only
- Custom claims for admin access
- Therapist access verified via Firestore doc existence

## 📁 Data Models

### users
```javascript
{
  userId: <auth_uid>,
  email: string,
  name: string,
  plus: boolean,
  createdAt: timestamp,
  lastActiveAt: timestamp
}
```

### therapists
```javascript
{
  therapistId: <auth_uid>,
  name: string,
  verified: boolean,
  ratePerSession: number,
  active: boolean,
  joinedAt: timestamp
}
```

### bookings
```javascript
{
  bookingId: <auto>,
  userId: string,
  therapistId: string,
  startAt: timestamp,
  endAt: timestamp,
  status: "scheduled" | "completed" | "cancelled",
  amount: number,
  platformShare: number,
  therapistPayout: number,
  monthKey: "YYYY-MM",
  meetLink: string?
}
```

### moods
```javascript
{
  moodId: <auto>,
  userId: string,
  value: string,
  intensity: 1-10,
  energy: 1-10,
  createdAt: timestamp
}
```

### journals
```javascript
{
  journalId: <auto>,
  userId: string,
  ciphertext: string,
  createdAt: timestamp
}
```

## 🚢 Deployment

### Option 1: Vercel (Recommended)

**Admin Portal:**
1. Create new Vercel project
2. Import `apps/admin-portal`
3. Set environment variables (all `VITE_FIREBASE_*`)
4. Add custom domain: `admin.elma.ltd`
5. Deploy

**Psychologist Portal:**
1. Create another Vercel project
2. Import `apps/psych-portal`
3. Set same Firebase environment variables
4. Add custom domain: `psych.elma.ltd`
5. Deploy

### Option 2: Netlify, Firebase Hosting, etc.

Both apps are static builds, deploy anywhere that supports Vite:

```bash
# Build
cd apps/admin-portal
npm run build  # → dist/

cd apps/psych-portal
npm run build  # → dist/
```

### Environment Variables

Both apps need these Vite variables:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## 🔧 Development

### Workspace Structure

This monorepo uses npm workspaces:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Adding Dependencies

```bash
# To a specific app
npm install <package> --workspace=apps/admin-portal

# To a shared package
npm install <package> --workspace=packages/shared-core
```

### Shared Packages

Import from shared packages in apps:

```javascript
// Admin or Psych portal
import { signIn, signOut } from "shared-core/auth";
import { inr } from "shared-core/money";
import Button from "shared-ui/Button";
```

Vite is configured with aliases to resolve these correctly.

## 📝 Notes

- **Subscriptions revenue** is currently a placeholder (returns 0)
- Journal data is **encrypted** and not accessible via Firestore rules
- All money values are in **Indian Rupees (₹)**
- Charts are placeholder components - add charting library if needed
- Future optimization: Move heavy Firestore queries to Cloud Functions

## 🐛 Troubleshooting

**Can't sign in**
- Check Firebase Auth is enabled
- Verify user exists in Firebase Console
- Check custom claims for admin access

**No data showing**
- Run seed script
- Check Firestore indexes are deployed
- Verify Firestore rules allow your user to read data

**Build errors**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check all environment variables are set

## 📚 Further Reading

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 📄 License

MIT

---

Built with ❤️ for ELMA
