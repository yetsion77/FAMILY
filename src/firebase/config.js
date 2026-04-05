import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWQ-U40ReA6EDm_p7hczlOoIbFMjU4vRo",
  authDomain: "family-5e6fd.firebaseapp.com",
  databaseURL: "https://family-5e6fd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "family-5e6fd",
  storageBucket: "family-5e6fd.firebasestorage.app",
  messagingSenderId: "1012035561268",
  appId: "1:1012035561268:web:9e8479832b564bf7716761",
  measurementId: "G-SBX6MZL6GG"
};

let app, db, storage;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  storage = getStorage(app);
} catch (error) {
  console.log("Firebase error:", error);
}

export { db, storage };
