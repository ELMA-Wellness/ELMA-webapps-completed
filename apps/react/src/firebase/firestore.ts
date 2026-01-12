import { db } from "./config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

export const addData = async (path: string, data: any) =>
  await addDoc(collection(db, path), data);

export const getAll = async (path: string) => {
  const snapshot = await getDocs(collection(db, path));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getById = async (path: string, id: string) => {
  const docRef = doc(db, path, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const updateById = async (path: string, id: string, data: any) =>
  await updateDoc(doc(db, path, id), data);

export const deleteById = async (path: string, id: string) =>
  await deleteDoc(doc(db, path, id));
