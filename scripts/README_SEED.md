# ELMA Seed Script

This script populates your Firestore database with realistic test data.

## ⚠️ IMPORTANT

**Only run this on a development/test Firebase project. Never on production.**

## Prerequisites

1. Node.js 18+ installed
2. Firebase project created
3. Service account key downloaded

## Setup

### 1. Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `scripts/serviceAccountKey.json`

### 2. Install Dependencies

From the root of the monorepo:

```bash
npm install
```

### 3. Run the Seed Script

```bash
npm run seed
```

## What Gets Created

The seed script creates:

- **50 users** with realistic data
  - Mix of free and Plus users (30% Plus)
  - Random creation dates and last active timestamps
  - All in IST timezone

- **10 therapists** 
  - Indian names
  - Mix of rates (₹800-1500)
  - 80% verified, 90% active
  - Random join dates

- **200 bookings**
  - Distributed across current and previous month
  - 70% completed, 20% scheduled, 10% cancelled
  - Realistic amounts and platform/therapist split
  - Meet links for scheduled sessions

- **200 mood entries**
  - For random subset of users
  - Various mood values and intensities

- **50 journal entries**
  - Encrypted placeholder text
  - Random users and dates

## After Seeding

### Set Admin Claims

To access the admin portal, you need to set custom claims on your user:

```bash
# Using Firebase CLI
firebase auth:set-custom-claims <YOUR_USER_UID> --claims '{"admin":true}'
```

Or use this Node.js snippet:

```javascript
import admin from "firebase-admin";

admin.auth().setCustomUserClaims("YOUR_USER_UID", { admin: true });
```

### Test Credentials

The seed creates users with emails like:
- `user1@elma.test`
- `user2@elma.test`
- etc.

And therapists with IDs like:
- `therapist_00`
- `therapist_01`
- etc.

**Note:** You'll need to create Firebase Auth accounts for these users separately, or modify the seed script to use Firebase Admin SDK's auth creation methods.

## Troubleshooting

**Error: Cannot find serviceAccountKey.json**
- Make sure you downloaded the service account key and placed it in `scripts/serviceAccountKey.json`

**Error: Permission denied**
- Check that your service account has the necessary permissions
- Ensure Firestore is enabled in your project

**Seed runs but no data appears**
- Check Firebase Console → Firestore to verify data
- Ensure you're looking at the correct project
- Check that indexes are created (see firebase/indexes.json)

## Customization

Edit `scripts/seed.js` to:
- Change the number of users, therapists, or bookings
- Adjust data distributions
- Add custom data fields
- Change date ranges

## Cleaning Up

To delete all seed data, you can:

1. Delete the entire collection from Firebase Console
2. Or write a cleanup script that queries and deletes documents
3. Or delete and recreate the Firestore database

**Warning:** Be extremely careful with deletion operations!
