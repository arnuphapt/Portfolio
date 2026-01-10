import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMEnqN0lXdppBADxFGN5TMovBHG3jqd54",
  authDomain: "my-portfolio-6f0b4.firebaseapp.com",
  projectId: "my-portfolio-6f0b4",
  storageBucket: "my-portfolio-6f0b4.firebasestorage.app",
  messagingSenderId: "1046084722692",
  appId: "1:1046084722692:web:f85016fa643af9822f5551",
  measurementId: "G-KQKT63089F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL };