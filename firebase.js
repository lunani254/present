import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM9jKx7xVI5TAEG_1shrORUIa1OnWk9wk",
  authDomain: "main-69858.firebaseapp.com",
  projectId: "main-69858",
  storageBucket: "main-69858.appspot.com",
  messagingSenderId: "878913735943",
  appId: "1:878913735943:web:7f41e31b1bf77f3b9c09a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firebase Realtime Database
const database = getDatabase(app);

export { auth, database };
