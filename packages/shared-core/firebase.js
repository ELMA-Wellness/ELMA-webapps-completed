import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- ELMA Portals Firebase (hard-coded) ---
const firebaseConfig = {
  apiKey: "AIzaSyDbStWjx4zKIF9L2Wc3J3dJA8zKQymfOUI",
  authDomain: "elma-portals.firebaseapp.com",
  projectId: "elma-portals",
  storageBucket: "elma-portals.firebasestorage.app",
  messagingSenderId: "1006086294343",
  appId: "1:1006086294343:web:aac0900d17ce39c53f5a62",
};

// Initialize once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helpful boot log
console.log("✅ Firebase initialized (project: elma-portals)");
