import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCtpv-xV61GPIJBPHCABSPmdEmQy4YjCGA",
  authDomain: "qrmedia-bf3f2.firebaseapp.com",
  projectId: "qrmedia-bf3f2",
  storageBucket: "qrmedia-bf3f2.firebasestorage.app",
  messagingSenderId: "487809309292",
  appId: "1:487809309292:web:f04757469598cbb3da5649",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
