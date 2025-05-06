import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, addDoc } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDMEnqN0lXdppBADxFGN5TMovBHG3jqd54",
    authDomain: "my-portfolio-6f0b4.firebaseapp.com",
    projectId: "my-portfolio-6f0b4",
    storageBucket: "my-portfolio-6f0b4.firebasestorage.app",
    messagingSenderId: "1046084722692",
    appId: "1:1046084722692:web:f85016fa643af9822f5551",
    measurementId: "G-KQKT63089F"
};

// Initialize with a unique name
const app = initializeApp(firebaseConfig, 'comments-app');
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc };