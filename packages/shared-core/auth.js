import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "./firebase.js";

export function listen(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function changePassword(newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getClaims() {
  try {
    const user = auth.currentUser;
    if (!user) return { admin: false };
    const tokenResult = await getIdTokenResult(user);
    return {
      admin: tokenResult.claims.admin === true,
    };
  } catch (error) {
    console.error("Error getting claims:", error);
    return { admin: false };
  }
}
