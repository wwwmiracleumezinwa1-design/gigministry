import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(profile);
    } else {
      callback(null);
    }
  });
}

export async function signup({ name, email, password, role }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  const profile = {
    id: uid,
    name,
    email,
    role,
    instruments: [],
    bio: "",
    location: "",
    experience: 0,
    availability: "",
    bank: "",
    mediaLink: "",
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), profile);
  return profile;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return await getUserProfile(cred.user.uid);
}

export async function logout() {
  await signOut(auth);
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, "users", uid), updates);
}

// ─── Musicians ────────────────────────────────────────────────────────────────

export async function getMusicians({ instrument, location, minExp } = {}) {
  // Firestore doesn't support multi-field inequality queries on free tier easily,
  // so we fetch all musicians and filter client-side for the MVP.
  const q = query(collection(db, "users"), where("role", "==", "musician"));
  const snap = await getDocs(q);
  let musicians = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (instrument) {
    musicians = musicians.filter(m => (m.instruments || []).includes(instrument));
  }
  if (location) {
    musicians = musicians.filter(m =>
      (m.location || "").toLowerCase().includes(location.toLowerCase())
    );
  }
  if (minExp) {
    musicians = musicians.filter(m => (m.experience || 0) >= parseInt(minExp));
  }

  return musicians;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking({ musicianId, musicianName, clientId, clientName, date, message }) {
  const ref = await addDoc(collection(db, "bookings"), {
    musicianId,
    musicianName,
    clientId,
    clientName,
    date,
    message,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, musicianId, musicianName, clientId, clientName, date, message, status: "pending" };
}

export async function getBookingsForMusician(musicianId) {
  const q = query(collection(db, "bookings"), where("musicianId", "==", musicianId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBookingsForClient(clientId) {
  const q = query(collection(db, "bookings"), where("clientId", "==", clientId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateBookingStatus(bookingId, status) {
  await updateDoc(doc(db, "bookings", bookingId), { status });
}