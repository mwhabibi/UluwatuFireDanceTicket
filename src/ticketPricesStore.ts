import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "./firebase";

export const db = firebaseApp ? getFirestore(firebaseApp) : null;
