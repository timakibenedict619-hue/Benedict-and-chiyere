// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBS-rNYTx_nYIgLMaUutOzhgK51LPsVEUk",
  authDomain: "benedict-and-chiyere.firebaseapp.com",
  projectId: "benedict-and-chiyere",
  storageBucket: "benedict-and-chiyere.firebasestorage.app",
  messagingSenderId: "1032547038636",
  appId: "1:1032547038636:web:e73e111445e6345de5f609",
  measurementId: "G-8FQ3ZP8KFH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
