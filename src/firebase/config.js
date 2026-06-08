import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyDNBnxwodqXK3PRl5lwTt1KuOAYps9uBMg",
    authDomain: "blood-bank-kodakara.firebaseapp.com",
    projectId: "blood-bank-kodakara",
    storageBucket: "blood-bank-kodakara.firebasestorage.app",
    messagingSenderId: "444806052816",
    appId: "1:444806052816:web:87ff699c4e32fa8316d7d5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
