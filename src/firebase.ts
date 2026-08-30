import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query,
  where,
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  addDoc,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App with active applet configuration
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export { 
  app,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query,
  where,
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  addDoc,
  runTransaction,
  writeBatch
};

