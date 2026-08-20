import { auth, db, storage } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// ==========================================
// CHAT CONFIGURATION
// ==========================================

const messagesCollection = collection(db, "messages");

let unsubscribeMessages = null;


// ==========================================
// CURRENT USER
// ==========================================

function getCurrentUser() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in before sending messages.");
  }

  return user;
}


// ==========================================
// SEND TEXT MESSAGE
// ==========================================

export async function sendMessage(text) {

  const user = getCurrentUser();

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    return;
  }

  try {

    await addDoc(messagesCollection, {

      type: "text",

      text: cleanText,

      senderId: user.uid,

      senderEmail: user.email || "",

      createdAt: serverTimestamp()

    });

  } catch (error) {

    console.error("Text message error:", error);

    throw new Error(
      `Could not send message: ${error.message}`
    );

  }

}


// ==========================================
// SEND PHOTO
// ==========================================

export async function sendPhoto(file) {

  const user = getCurrentUser();

  if (!file) {
    throw new Error("No photo was selected.");
  }


  // Check file type

  if (!file.type || !file.type.startsWith("image/")) {

    throw new Error(
      "Please select a valid image."
    );

  }


  // Maximum size: 10 MB

  if (file.size > 10 * 1024 * 1024) {

    throw new Error(
      "Photo must be smaller than 10 MB."
    );

  }


  // Create a safe unique filename

  const extension =
    file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "jpg";


  const uniqueFileName =
    `${Date.now()}_${user.uid}_${crypto.randomUUID()}.${extension}`;


  // Firebase Storage location

  const storageRef = ref(
    storage,
    `chat/photos/${uniqueFileName}`
  );


  console.log(
    "Starting photo upload:",
    storageRef.fullPath
  );


  try {

    // ==========================================
    // STEP 1 — UPLOAD PHOTO
    // ==========================================

    const snapshot = await uploadBytes(
      storageRef,
      file,
      {
        contentType: file.type
      }
    );


    console.log(
      "Photo uploaded successfully:",
      snapshot.metadata.fullPath
    );


    // ==========================================
    // STEP 2 — GET DOWNLOAD URL
    // ==========================================

    const photoURL =
      await getDownloadURL(snapshot.ref);


    console.log(
      "Photo URL created:",
      photoURL
    );


    // ==========================================
    // STEP 3 — SAVE MESSAGE TO FIRESTORE
    // ==========================================

    const messageData = {

      type: "photo",

      photoURL: photoURL,

      fileName: file.name,

      fileSize: file.size,

      mimeType: file.type,

      senderId: user.uid,

      senderEmail: user.email || "",

      createdAt: serverTimestamp()

    };


    const messageRef =
      await addDoc(
        messagesCollection,
        messageData
      );


    console.log(
      "Photo message saved:",
      messageRef.id
    );


    // Return useful information to chat.html

    return {

      id: messageRef.id,

      ...messageData,

      photoURL: photoURL

    };


  } catch (error) {

    console.error(
      "PHOTO SEND ERROR:",
      error
    );


    // Firebase Storage errors

    if (error.code === "storage/unauthorized") {

      throw new Error(
        "Firebase Storage rejected the upload. Check your Storage Rules."
      );

    }


    if (error.code === "storage/canceled") {

      throw new Error(
        "The photo upload was cancelled."
      );

    }


    if (error.code === "storage/object-not-found") {

      throw new Error(
        "Firebase could not find the uploaded photo."
      );

    }


    // Firestore permission error

    if (
      error.code === "permission-denied" ||
      error.code === "firestore/permission-denied"
    ) {

      throw new Error(
        "The photo uploaded, but Firestore refused to save the chat message. Check your Firestore Rules."
      );

    }


    throw new Error(
      `Photo could not be sent: ${error.message}`
    );

  }

}


// ==========================================
// LISTEN FOR MESSAGES
// ==========================================

export function listenForMessages(callback) {

  const messagesQuery = query(
    messagesCollection,
    orderBy("createdAt", "asc")
  );


  // Remove previous listener

  if (unsubscribeMessages) {

    unsubscribeMessages();

  }


  unsubscribeMessages = onSnapshot(

    messagesQuery,

    (snapshot) => {

      const messages = [];


      snapshot.forEach((doc) => {

        messages.push({

          id: doc.id,

          ...doc.data()

        });

      });


      callback(messages);

    },

    (error) => {

      console.error(
        "Chat listener error:",
        error
      );

    }

  );


  return unsubscribeMessages;

}


// ==========================================
// STOP LISTENING
// ==========================================

export function stopListeningForMessages() {

  if (unsubscribeMessages) {

    unsubscribeMessages();

    unsubscribeMessages = null;

  }

      }
