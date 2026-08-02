// auth.js

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ============================
// Login
// ============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const loginBtn = document.getElementById("loginBtn");

        loginBtn.disabled = true;
        loginBtn.innerHTML = "Logging in...";

        try {

            await signInWithEmailAndPassword(auth, email, password);

            window.location.href = "ourspace.html";

        } catch (error) {

            alert(error.message);

            loginBtn.disabled = false;
            loginBtn.innerHTML = "Login ❤️";

        }

    });

}

// ============================
// Protect Private Pages
// ============================

onAuthStateChanged(auth, (user) => {

    const protectedPages = [
        "ourspace.html",
        "admin.html"
    ];

    const currentPage =
        window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage) && !user) {

        window.location.href = "login.html";

    }

});

// ============================
// Logout
// ============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "login.html";

    });

}
