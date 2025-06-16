// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoDoa4CoBDgfRds57Y32-E5MItEnM12Og",
  authDomain: "foresight-studio.firebaseapp.com",
  projectId: "foresight-studio",
  storageBucket: "foresight-studio.firebasestorage.app",
  messagingSenderId: "201849975293",
  appId: "1:201849975293:web:f40b95cea76370a476a994",
  measurementId: "G-M7CK6KN3WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };