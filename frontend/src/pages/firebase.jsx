import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9L8Dh6-R_ii3AnBlwmQgsDIJuM6CsEpM",
  authDomain: "roomkartz-b3fb4.firebaseapp.com",
  projectId: "roomkartz-b3fb4",
  storageBucket: "roomkartz-b3fb4.appspot.com",
  messagingSenderId: "350483166346",
  appId: "1:350483166346:web:e58755cf1f6c7c9c786973",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };