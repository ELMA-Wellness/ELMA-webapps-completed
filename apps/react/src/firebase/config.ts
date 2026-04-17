import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBejQqWxd6Q4dHx41RqZW0BUk1wiC6sFKE",
  authDomain: "elma-react-native-app.firebaseapp.com",
  projectId: "elma-react-native-app",
  storageBucket: "elma-react-native-app.appspot.com",
  messagingSenderId: "697733851259",
  appId: "1:697733851259:web:019952fc893491f4905ade",
  measurementId: "G-J6LCMDKT76"
};

console.log("config",firebaseConfig)

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);

// optional (explicit persistence)
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
