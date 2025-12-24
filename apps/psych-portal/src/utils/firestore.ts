import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  Query,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/config";


/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type FirestoreResponse<T> =
  | { success: true; data: T }
  | { success: false; error: any };

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */

export const createDoc = async <T extends DocumentData>(
  collectionName: string,
  data: T,
  id?: string
): Promise<FirestoreResponse<string>> => {
  try {
    if (id) {
      await setDoc(doc(db, collectionName, id), data);
      return { success: true, data: id };
    }

    const ref = await addDoc(collection(db, collectionName), data);
    return { success: true, data: ref.id };
  } catch (error) {
    console.log("createDoc error", error);
    return { success: false, error };
  }
};

/* -------------------------------------------------------------------------- */
/*                              READ - SINGLE DOC                             */
/* -------------------------------------------------------------------------- */

export const getDocById = async <T = any>(
  collectionName: string,
  id: string
): Promise<FirestoreResponse<T | null>> => {
  try {
    const snapshot = await getDoc(doc(db, collectionName, id));

    if (!snapshot.exists()) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: { id: snapshot.id, ...snapshot.data() } as T,
    };
  } catch (error) {
    return { success: false, error };
  }
};

/* -------------------------------------------------------------------------- */
/*                           READ - COLLECTION LIST                            */
/* -------------------------------------------------------------------------- */

export const getDocsList = async <T = any>(
  collectionName: string
): Promise<FirestoreResponse<T[]>> => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as T)
    );

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

/* -------------------------------------------------------------------------- */
/*                          QUERY DOCS (WHERE, ORDER)                          */
/* -------------------------------------------------------------------------- */

/**
 * Usage example:
 *
 * queryDocs("users", (ref) =>
 *   query(ref, where("email", "==", "test@gmail.com"))
 * )
 */
export const queryDocs = async <T = any>(
  collectionName: string,
  queryFn?: (ref: CollectionReference<DocumentData>) => Query<DocumentData>
): Promise<FirestoreResponse<T[]>> => {
  try {
    const baseRef = collection(db, collectionName);
    const q = queryFn ? queryFn(baseRef) : query(baseRef);

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as T)
    );

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

/* -------------------------------------------------------------------------- */
/*                                   UPDATE                                   */
/* -------------------------------------------------------------------------- */

export const updateDocById = async (
  collectionName: string,
  id: string,
  data: Partial<any>
): Promise<FirestoreResponse<boolean>> => {
  try {
    await updateDoc(doc(db, collectionName, id), data);
    return { success: true, data: true };
  } catch (error) {
    console.log("updateDocById error", error);
    return { success: false, error };
  }
};

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export const deleteDocById = async (
  collectionName: string,
  id: string
): Promise<FirestoreResponse<boolean>> => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error };
  }
};
