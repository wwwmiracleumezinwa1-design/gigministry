import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC25s6FSFbnT2U988cAg_esJDEf_LaDGXI",
  authDomain: "gigministry-76581.firebaseapp.com",
  projectId: "gigministry-76581",
  storageBucket: "gigministry-76581.firebasestorage.app",
  messagingSenderId: "735902228212",
  appId: "1:735902228212:web:a0dbfd7b129d1bf6ec08a1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);