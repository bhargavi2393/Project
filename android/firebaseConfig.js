// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCT6sQQ9FysEdlJ1YsiZu5VgfhjzTD0QNg",
  authDomain: "hustle-43955.firebaseapp.com",
  projectId: "hustle-43955",
  storageBucket: "hustle-43955.firebasestorage.app",
  messagingSenderId: "478159797409",
  appId: "1:478159797409:web:2ba096774182d7f10284e0",
  measurementId: "G-N8E99XYJD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);