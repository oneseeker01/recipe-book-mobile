// Import the functions you need from the SDKs
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0hytTef8Ifoo0IIylA6Tc_UX7cz_XP14",
  authDomain: "recipe-book-mobile-86ccb.firebaseapp.com",
  projectId: "recipe-book-mobile-86ccb",
  storageBucket: "recipe-book-mobile-86ccb.firebasestorage.app",
  messagingSenderId: "107684327675",
  appId: "1:107684327675:web:cf53112a4d151e53ab005e",
  measurementId: "G-8LDXEQZPP5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app for additional configurations
export default app;
