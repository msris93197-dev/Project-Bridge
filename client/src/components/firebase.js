// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrfA1PnnaToDblVGufbBQkk4uDEXuWDQk",
  authDomain: "project-bridge-413916.firebaseapp.com",
  projectId: "project-bridge-413916",
  storageBucket: "project-bridge-413916.appspot.com",
  messagingSenderId: "619372033245",
  appId: "1:619372033245:web:5de4019cbe3f8a60b21734",
  measurementId: "G-WN4903QEQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;