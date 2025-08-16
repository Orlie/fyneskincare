// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTzNzAnlq1_Gzzu8-3fPRXZIb-bb0OY7o",
  authDomain: "fyne-affiliate.firebaseapp.com",
  databaseURL: "https://fyne-affiliate-default-rtdb.firebaseio.com",
  projectId: "fyne-affiliate",
  storageBucket: "fyne-affiliate.firebasestorage.app",
  messagingSenderId: "851062670683",
  appId: "1:851062670683:web:f89dba1c03f14aabdd867e",
  measurementId: "G-L08TTDYEW1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, db, rtdb };
