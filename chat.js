// =====================================
// chat.js - Part 1
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===============================
// DOM
// ===============================

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;

// ===============================
// CHECK LOGIN
// ===============================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser = user;

    loadMessages();

});

// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages(){

    chatBox.innerHTML = "";

    const q = query(

        collection(db,"messages"),

        orderBy("createdAt","asc")

    );

    const snapshot = await getDocs(q);

    snapshot.forEach(doc=>{

        const message = doc.data();

        createMessage(message);

    });

    scrollBottom();

}

// ===============================
// SEND MESSAGE
// ===============================

sendBtn.addEventListener("click",sendMessage);

messageInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendMessage();

    }

});

async function sendMessage(){

    const text = messageInput.value.trim();

    if(text==="") return;

    sendBtn.disabled = true;

    try{

        await addDoc(

            collection(db,"messages"),

            {

                uid:currentUser.uid,

                email:currentUser.email,

                text:text,

                createdAt:serverTimestamp()

            }

        );

        messageInput.value="";

        loadMessages();

    }

    catch(error){

        alert(error.message);

    }

    sendBtn.disabled=false;

}

// ===============================
// CREATE MESSAGE
// ===============================

function createMessage(message){

    const div=document.createElement("div");

    if(message.uid===currentUser.uid){

        div.className="message sent";

    }

    else{

        div.className="message received";

    }

    div.innerHTML=`

        <strong>${message.email}</strong>

        <br><br>

        ${message.text}

    `;

    chatBox.appendChild(div);

}

// ===============================
// AUTO SCROLL
// ===============================

function scrollBottom(){

    chatBox.scrollTop=chatBox.scrollHeight;

}
