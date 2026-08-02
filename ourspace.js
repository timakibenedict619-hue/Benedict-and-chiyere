// ourspace.js

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// DOM ELEMENTS
// =========================

const welcomeTitle = document.getElementById("welcomeTitle");
const userName = document.getElementById("userName");
const profileName = document.getElementById("profileName");
const logoutBtn = document.getElementById("logoutBtn");

// =========================
// AUTH STATE
// =========================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const userRef = doc(db, "users", user.uid);

        const snap = await getDoc(userRef);

        if (snap.exists()) {

            const data = snap.data();

            const firstName = data.name.split(" ")[0];

            welcomeTitle.innerHTML =
                `Welcome Back, ${firstName} ❤️`;

            userName.innerHTML =
                data.email;

            profileName.innerHTML =
                data.name;

        } else {

            welcomeTitle.innerHTML =
                "Welcome ❤️";

            userName.innerHTML =
                user.email;

            profileName.innerHTML =
                user.email;

        }

    }

    catch (error) {

        console.error(error);

    }

});

// =========================
// LOGOUT
// =========================

logoutBtn.addEventListener("click", async () => {

    const leave = confirm(
        "Are you sure you want to logout?"
    );

    if (!leave) return;

    try {

        await signOut(auth);

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

});

// =========================
// SMOOTH SECTION SCROLL
// =========================

document.querySelectorAll(".sidebar a").forEach(link => {

    link.addEventListener("click", function(e) {

        const href = this.getAttribute("href");

        if (!href.startsWith("#")) return;

        e.preventDefault();

        document.querySelector(href).scrollIntoView({

            behavior: "smooth"

        });

    });

});

// =========================
// ACTIVE MENU
// =========================

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll(".sidebar a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const top = section.offsetTop - 120;

        if (window.scrollY >= top) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

// =========================
// GREETING
// =========================

const hour = new Date().getHours();

let greeting = "Welcome ❤️";

if (hour < 12) {

    greeting = "Good Morning ☀️";

}
else if (hour < 17) {

    greeting = "Good Afternoon 🌸";

}
else {

    greeting = "Good Evening 🌙";

}

console.log(greeting);

// =========================
// SIMPLE FADE-IN
// =========================

const cards = document.querySelectorAll(

".card,.hero-card,.content-section"

);

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";

            entry.target.style.transform =
                "translateY(0px)";

        }

    });

});

cards.forEach(card => {

    card.style.opacity = "0";

    card.style.transform =
        "translateY(40px)";

    card.style.transition =
       
