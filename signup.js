// signup.js

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Change this to your own secret code
const SECRET_CODE = "MyLove2026";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const secretCode =
        document.getElementById("secretCode").value.trim();

    const signupBtn =
        document.getElementById("signupBtn");

    if(password !== confirmPassword){

        alert("Passwords do not match.");

        return;

    }

    if(secretCode !== SECRET_CODE){

        alert("Incorrect secret code.");

        return;

    }

    signupBtn.disabled = true;

    signupBtn.innerHTML = "Creating Account...";

    try{

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        await setDoc(doc(db,"users",user.uid),{

            uid:user.uid,

            name:name,

            email:email,

            createdAt:serverTimestamp(),

            role:"member"

        });

        alert("Account created successfully ❤️");

        window.location.href="ourspace.html";

    }

    catch(error){

        alert(error.message);

        signupBtn.disabled=false;

        signupBtn.innerHTML="Create Account ❤️";

    }

});
