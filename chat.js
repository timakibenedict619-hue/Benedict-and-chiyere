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
    throw new Error("You must be logged in.");
  }

  return user;
}


// ==========================================
// SEND TEXT MESSAGE
// ==========================================

export async function sendMessage(text) {

  const user = getCurrentUser();

  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  await addDoc(messagesCollection, {

    type: "text",

    text: cleanText,

    senderId: user.uid,

    senderEmail: user.email,

    createdAt: serverTimestamp()

  });

}


// ==========================================
// SEND PHOTO
// ==========================================

export async function sendPhoto(file) {

  const user = getCurrentUser();

  if (!file) {
    return;
  }


  if (!file.type.startsWith("image/")) {

    throw new Error(
      "Please select an image file."
    );

  }


  // Maximum photo size: 10 MB

  if (file.size > 10 * 1024 * 1024) {

    throw new Error(
      "Photo must be smaller than 10 MB."
    );

  }


  const fileName =
    `${Date.now()}_${user.uid}_${file.name}`;


  const storageRef =
    ref(
      storage,
      `chat/photos/${fileName}`
    );


  // Upload photo

  await uploadBytes(
    storageRef,
    file
  );


  // Get photo URL

  const photoURL =
    await getDownloadURL(storageRef);


  // Create chat message

  await addDoc(messagesCollection, {

    type: "photo",

    photoURL: photoURL,

    fileName: file.name,

    senderId: user.uid,

    senderEmail: user.email,

    createdAt: serverTimestamp()

  });

}


// ==========================================
// LISTEN FOR NEW MESSAGES
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


  unsubscribeMessages =
    onSnapshot(
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
