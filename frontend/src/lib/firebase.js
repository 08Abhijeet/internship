import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:"AIzaSyApfEoiwCa8EHe3wphIg-4QvOkUj2u-Gps",
  authDomain: "youtask-1fc2d.firebaseapp.com",
  projectId: "youtask-1fc2d",
  storageBucket: "youtask-1fc2d.firebasestorage.app",
  messagingSenderId: "62292773866",
  appId: "1:62292773866:web:1712a7922453c08b190093",
  measurementId: "G-6KZ5JFNDN1"
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Analytics (Conditionally)
// ✅ FIX: Check if we are in the browser before running analytics
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// 3. Initialize Auth (Required for your UserProvider)
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 4. Export everything
export { app, analytics, auth, provider };