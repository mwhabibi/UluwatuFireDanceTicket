import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "./firebase";

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
