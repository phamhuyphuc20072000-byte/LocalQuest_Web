import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, getDocs, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqxzDyKar4Ny_CoOGWbRbtG6pA5t_xk4o",
  authDomain: "localquest2-tourist-web.firebaseapp.com",
  projectId: "localquest2-tourist-web",
  storageBucket: "localquest2-tourist-web.firebasestorage.app",
  messagingSenderId: "770457036399",
  appId: "1:770457036399:web:1d371b975aaeb4ccef8f9a",
  measurementId: "G-K9GQVJ7XF3"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  serverTimestamp
};
