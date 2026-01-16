// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "youtask-1fc2d.firebaseapp.com",
  projectId: "youtask-1fc2d",
  storageBucket: "youtask-1fc2d.firebasestorage.app",
  messagingSenderId: "62292773866",
  appId: "1:62292773866:web:1712a7922453c08b190093",
  measurementId: "G-6KZ5JFNDN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);