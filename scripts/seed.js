// ELMA Seed Script
// Run this to populate your Firestore with test data

import admin from "firebase-admin";
import { readFileSync } from "fs";

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
// and save it as scripts/serviceAccountKey.json
try {
  const serviceAccount = JSON.parse(
    readFileSync("./scripts/serviceAccountKey.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error("Error initializing Firebase Admin:");
  console.error("Make sure you have serviceAccountKey.json in the scripts/ folder");
  console.error("Download it from Firebase Console > Project Settings > Service Accounts");
  process.exit(1);
}

const db = admin.firestore();

// Helper: IST timezone offset
function toIST(date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60 * 1000);
}

function getMonthKey(date) {
  const ist = toIST(date);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function randomDate(daysBack) {
  const now = new Date();
  return new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000 * Math.random());
}

async function seed() {
  console.log("🌱 Starting seed...\n");

  // Seed Users
  console.log("👥 Creating 50 users...");
  const userIds = [];
  const batch1 = db.batch();
  
  for (let i = 1; i <= 50; i++) {
    const userId = `user_${i.toString().padStart(3, "0")}`;
    userIds.push(userId);
    
    const createdAt = randomDate(60);
    const lastActiveAt = randomDate(7);
    
    batch1.set(db.collection("users").doc(userId), {
      email: `user${i}@elma.test`,
      name: `User ${i}`,
      plus: Math.random() > 0.7, // 30% Plus users
      createdAt: admin.firestore.Timestamp.fromDate(createdAt),
      lastActiveAt: admin.firestore.Timestamp.fromDate(lastActiveAt),
    });
  }
  
  await batch1.commit();
  console.log("✅ Users created\n");

  // Seed Therapists
  console.log("👨‍⚕️ Creating 10 therapists...");
  const therapistIds = [];
  const therapistNames = [
    "Dr. Priya Sharma",
    "Dr. Rajesh Kumar",
    "Dr. Anita Patel",
    "Dr. Vikram Singh",
    "Dr. Meera Reddy",
    "Dr. Arjun Mehta",
    "Dr. Kavita Desai",
    "Dr. Sanjay Gupta",
    "Dr. Neha Kapoor",
    "Dr. Rahul Verma",
  ];
  
  const batch2 = db.batch();
  
  for (let i = 0; i < 10; i++) {
    const therapistId = `therapist_${i.toString().padStart(2, "0")}`;
    therapistIds.push(therapistId);
    
    batch2.set(db.collection("therapists").doc(therapistId), {
      name: therapistNames[i],
      verified: Math.random() > 0.2, // 80% verified
      ratePerSession: 800 + Math.floor(Math.random() * 700), // ₹800-1500
      active: Math.random() > 0.1, // 90% active
      joinedAt: admin.firestore.Timestamp.fromDate(randomDate(180)),
    });
  }
  
  await batch2.commit();
  console.log("✅ Therapists created\n");

  // Seed Bookings
  console.log("📅 Creating 200 bookings...");
  const statuses = ["scheduled", "completed", "cancelled"];
  const currentMonth = getMonthKey(new Date());
  const lastMonth = getMonthKey(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  
  const batches = [db.batch(), db.batch(), db.batch(), db.batch()];
  let batchIndex = 0;
  
  for (let i = 0; i < 200; i++) {
    const bookingRef = db.collection("bookings").doc();
    const therapistId = therapistIds[Math.floor(Math.random() * therapistIds.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    
    // 60% current month, 40% last month
    const isCurrentMonth = Math.random() > 0.4;
    const monthKey = isCurrentMonth ? currentMonth : lastMonth;
    const daysBack = isCurrentMonth ? Math.random() * 30 : 30 + Math.random() * 30;
    
    const startAt = randomDate(daysBack);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000); // 1 hour session
    
    // Status distribution: 70% completed, 20% scheduled, 10% cancelled
    const rand = Math.random();
    const status = rand < 0.7 ? "completed" : rand < 0.9 ? "scheduled" : "cancelled";
    
    const amount = 1000 + Math.floor(Math.random() * 500); // ₹1000-1500
    const platformShare = Math.floor(amount * 0.3); // 30% platform
    const therapistPayout = amount - platformShare;
    
    batches[batchIndex % 4].set(bookingRef, {
      userId,
      therapistId,
      startAt: admin.firestore.Timestamp.fromDate(startAt),
      endAt: admin.firestore.Timestamp.fromDate(endAt),
      status,
      amount,
      platformShare,
      therapistPayout,
      monthKey,
      meetLink: status === "scheduled" ? `https://meet.elma.ltd/${bookingRef.id}` : null,
    });
    
    batchIndex++;
  }
  
  await Promise.all(batches.map(batch => batch.commit()));
  console.log("✅ Bookings created\n");

  // Seed Moods
  console.log("😊 Creating mood entries...");
  const batch3 = db.batch();
  const moodValues = ["happy", "sad", "anxious", "calm", "excited", "tired"];
  
  for (let i = 0; i < 200; i++) {
    const moodRef = db.collection("moods").doc();
    const userId = userIds[Math.floor(Math.random() * 10)]; // Only for first 10 users
    
    batch3.set(moodRef, {
      userId,
      value: moodValues[Math.floor(Math.random() * moodValues.length)],
      intensity: 1 + Math.floor(Math.random() * 10),
      energy: 1 + Math.floor(Math.random() * 10),
      createdAt: admin.firestore.Timestamp.fromDate(randomDate(30)),
    });
  }
  
  await batch3.commit();
  console.log("✅ Moods created\n");

  // Seed Journals (encrypted)
  console.log("📝 Creating journal entries...");
  const batch4 = db.batch();
  
  for (let i = 0; i < 50; i++) {
    const journalRef = db.collection("journals").doc();
    const userId = userIds[Math.floor(Math.random() * 20)]; // First 20 users
    
    batch4.set(journalRef, {
      userId,
      ciphertext: `ENCRYPTED_${journalRef.id}_PLACEHOLDER`, // In production, this would be actual encrypted text
      createdAt: admin.firestore.Timestamp.fromDate(randomDate(60)),
    });
  }
  
  await batch4.commit();
  console.log("✅ Journals created\n");

  console.log("🎉 Seed completed successfully!");
  console.log("\nSummary:");
  console.log("- 50 users");
  console.log("- 10 therapists");
  console.log("- 200 bookings");
  console.log("- 200 mood entries");
  console.log("- 50 journal entries");
  console.log("\n⚠️  Remember to set custom claims for admin users:");
  console.log('   firebase auth:set-custom-claims <admin-uid> --claims \'{"admin":true}\'');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  });
