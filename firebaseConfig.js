import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 여기에 아까 복사한 내용을 붙여넣으세요!
const firebaseConfig = {
  apiKey: "AIzaSyDRqbQMPdeTzwnMe40HgnqhV-Uvo727834",
  authDomain: "my-baby-essay.firebaseapp.com",
  projectId: "my-baby-essay",
  storageBucket: "my-baby-essay.firebasestorage.app",
  messagingSenderId: "708848692442",
  appId: "1:708848692442:web:6fc6572861c705af73c9e3",
  measurementId: "G-5CB5PXGNH2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
