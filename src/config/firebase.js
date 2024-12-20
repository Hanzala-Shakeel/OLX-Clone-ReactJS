import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage();

export { db, collection, addDoc, setDoc, deleteDoc, doc, getDoc, getDocs, updateDoc, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, storage, ref, uploadBytes, getDownloadURL, deleteObject };