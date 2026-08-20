import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// LOGIN
// ===============================

export async function loginUser(email, secretCode) {

  try {

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      secretCode
    );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    console.error("Login error:", error);

    return {
      success: false,
      error: error
    };

  }

}


// ===============================
// LOGOUT
// ===============================

export async function logoutUser() {

  try {

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {

    console.error("Logout error:", error);

  }

}


// ===============================
// PROTECT PRIVATE PAGES
// ===============================

export function protectPage() {

  onAuthStateChanged(auth, (user) => {

    if (!user) {

      window.location.href = "login.html";

    }

  });

}
