import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAqmRgdjbjd4N5uqiVVWdhYCMtarP3rT0",
  authDomain: "jolab-14e57.firebaseapp.com",
  projectId: "jolab-14e57",
  storageBucket: "jolab-14e57.firebasestorage.app",
  messagingSenderId: "119243464423",
  appId: "1:119243464423:web:433ffad2bbae8d8c998c42",
  measurementId: "G-P5SBRSYF2Y",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);