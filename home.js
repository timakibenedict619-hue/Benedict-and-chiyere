// ============================================================
// home.js
// Benedict ❤️ Favour
// ============================================================

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  sendMessage,
  sendPhoto,
  listenForMessages
} from "./chat.js";


// ============================================================
// CALL CONFIGURATION
// ============================================================

// IMPORTANT:
// Replace this with your girlfriend's Firebase Authentication UID.
//
// Example:
// const PARTNER_UID = "abc123xyz";
//
// Do NOT put her email here.
// This must be the Firebase Authentication UID.

const PARTNER_UID = "0Gs3wSpLBYXpWuUIoWMu1baU1xy1";


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;

let unsubscribeMessages = null;

let unsubscribeIncomingCalls = null;
let unsubscribeCurrentCall = null;
let unsubscribeRemoteCandidates = null;

let currentCallRef = null;
let currentCallId = null;

let peerConnection = null;
let localStream = null;

let currentCallType = null;

let microphoneMuted = false;
let cameraDisabled = false;

let isCaller = false;

let callEndedLocally = false;


// ============================================================
// DOM HELPERS
// ============================================================

function getElement(id) {
  return document.getElementById(id);
}


// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;
  }

  currentUser = user;

  console.log(
    "Logged in as:",
    user.uid,
    user.email
  );

  startChatListener();

  startIncomingCallListener();

});


// ============================================================
// LOGOUT
// ============================================================

const logoutBtn = getElement("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await cleanupCall();

        await signOut(auth);

        window.location.href =
          "login.html";

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    }
  );

}


// ============================================================
// COUNTDOWN
// ============================================================

const relationshipDate =
  new Date("2025-02-12T20:00:00");


function updateCountdown() {

  const now =
    new Date();

  const difference =
    now - relationshipDate;


  if (difference < 0) {

    getElement("days").textContent =
      "0";

    getElement("hours").textContent =
      "0";

    getElement("minutes").textContent =
      "0";

    getElement("seconds").textContent =
      "0";

    return;
  }


  const totalSeconds =
    Math.floor(
      difference / 1000
    );


  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;


  getElement("days").textContent =
    days;

  getElement("hours").textContent =
    String(hours).padStart(2, "0");

  getElement("minutes").textContent =
    String(minutes).padStart(2, "0");

  getElement("seconds").textContent =
    String(seconds).padStart(2, "0");

}


updateCountdown();

setInterval(
  updateCountdown,
  1000
);


// ============================================================
// FEATURE PANELS
// ============================================================

const featureButtons =
  document.querySelectorAll(
    ".feature"
  );

const panels =
  document.querySelectorAll(
    ".feature-panel"
  );


featureButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const panelId =
          button.dataset.panel;


        panels.forEach(
          (panel) => {

            panel.classList.remove(
              "active"
            );

          }
        );


        const panel =
          getElement(panelId);


        if (panel) {

          panel.classList.add(
            "active"
          );


          setTimeout(
            () => {

              panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });

            },
            50
          );

        }

      }
    );

  }
);


document
  .querySelectorAll(".close-panel")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const panel =
            getElement(
              button.dataset.close
            );


          if (panel) {

            panel.classList.remove(
              "active"
            );

          }

        }
      );

    }
  );


// ============================================================
// CHAT
// ============================================================

const messages =
  getElement("messages");

const messageInput =
  getElement("messageInput");

const sendBtn =
  getElement("sendBtn");

const photoBtn =
  getElement("photoBtn");

const photoInput =
  getElement("photoInput");

const chatStatus =
  getElement("chatStatus");


function startChatListener() {

  if (!currentUser) {
    return;
  }


  try {

    listenForMessages(
      (allMessages) => {

        renderMessages(
          allMessages
        );

      }
    );

  } catch (error) {

    console.error(
      "Could not start chat listener:",
      error
    );

  }

}


function renderMessages(
  allMessages
) {

  if (!messages) {
    return;
  }


  messages.innerHTML = "";


  if (
    allMessages.length === 0
  ) {

    messages.innerHTML = `
      <div class="empty-chat">
        ❤️<br>
        This is your little space.<br>
        Send your first message.
      </div>
    `;

    return;

  }


  allMessages.forEach(
    (message) => {

      const row =
        document.createElement(
          "div"
        );


      const mine =
        currentUser &&
        message.senderId ===
          currentUser.uid;


      row.className =
        mine
          ? "message-row mine"
          : "message-row theirs";


      const bubble =
        document.createElement(
          "div"
        );


      bubble.className =
        "message-bubble";


      if (
        message.type ===
        "photo"
      ) {

        const image =
          document.createElement(
            "img"
          );


        image.className =
          "message-photo";


        image.src =
          message.photoURL;


        image.alt =
          "Shared photo";


        image.addEventListener(
          "click",
          () => {

            window.open(
              message.photoURL,
              "_blank"
            );

          }
        );


        bubble.appendChild(
          image
        );

      } else {

        const text =
          document.createElement(
            "div"
          );


        text.className =
          "message-text";


        text.textContent =
          message.text || "";


        bubble.appendChild(
          text
        );

      }


      const time =
        document.createElement(
          "span"
        );


      time.className =
        "message-time";


      time.textContent =
        formatTime(
          message.createdAt
        );


      bubble.appendChild(
        time
      );


      row.appendChild(
        bubble
      );


      messages.appendChild(
        row
      );

    }
  );


  messages.scrollTop =
    messages.scrollHeight;

}


function formatTime(
  timestamp
) {

  if (!timestamp) {
    return "Sending...";
  }


  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


// ============================================================
// SEND TEXT MESSAGE
// ============================================================

async function sendCurrentMessage() {

  if (!messageInput) {
    return;
  }


  const text =
    messageInput.value.trim();


  if (!text) {
    return;
  }


  sendBtn.disabled = true;


  try {

    await sendMessage(
      text
    );


    messageInput.value = "";

    if (chatStatus) {
      chatStatus.textContent = "";
    }


  } catch (error) {

    console.error(
      "Message error:",
      error
    );


    if (chatStatus) {

      chatStatus.textContent =
        error.message ||
        "Message could not be sent.";

    }

  }


  sendBtn.disabled = false;

  messageInput.focus();

}


if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendCurrentMessage
  );

}


if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        sendCurrentMessage();

      }

    }
  );

}


// ============================================================
// SEND PHOTO
// ============================================================

if (photoBtn) {

  photoBtn.addEventListener(
    "click",
    () => {

      photoInput.click();

    }
  );

}


if (photoInput) {

  photoInput.addEventListener(
    "change",
    async () => {

      const file =
        photoInput.files[0];


      if (!file) {
        return;
      }


      if (chatStatus) {

        chatStatus.textContent =
          "Uploading photo... 📷";

      }


      photoBtn.disabled = true;


      try {

        await sendPhoto(
          file
        );


        if (chatStatus) {

          chatStatus.textContent =
            "Photo sent ❤️";

        }


      } catch (error) {

        console.error(
          "Photo error:",
          error
        );


        if (chatStatus) {

          chatStatus.textContent =
            error.message ||
            "Photo could not be sent.";

        }

      }


      photoInput.value = "";

      photoBtn.disabled = false;


      setTimeout(
        () => {

          if (chatStatus) {
            chatStatus.textContent = "";
          }

        },
        3000
      );

    }
  );

}


// ============================================================
// CALL DOM ELEMENTS
// ============================================================

const voiceCallBtn =
  getElement("voiceCallBtn");

const videoCallBtn =
  getElement("videoCallBtn");

const endCallBtn =
  getElement("endCallBtn");

const muteCallBtn =
  getElement("muteCallBtn");

const cameraCallBtn =
  getElement("cameraCallBtn");

const startCallButtons =
  getElement("startCallButtons");

const activeCallControls =
  getElement("activeCallControls");

const videoContainer =
  getElement("videoContainer");

const callStatus =
  getElement("callStatus");

const incomingCall =
  getElement("incomingCall");

const incomingCallText =
  getElement("incomingCallText");

const answerCallBtn =
  getElement("answerCallBtn");

const rejectCallBtn =
  getElement("rejectCallBtn");

const remoteVideo =
  getElement("remoteVideo");

const localVideo =
  getElement("localVideo");

const remoteAudio =
  getElement("remoteAudio");


// ============================================================
// FIRESTORE CALL COLLECTION
// ============================================================

const callsCollection =
  collection(
    db,
    "calls"
  );


// ============================================================
// VALIDATE PARTNER
// ============================================================

function validatePartner() {

  if (
    !PARTNER_UID ||
    PARTNER_UID ===
      "PUT_CHIYERE_FIREBASE_UID_HERE"
  ) {

    throw new Error(
      "Set PARTNER_UID in home.js to the other person's Firebase Authentication UID."
    );

  }

}


// ============================================================
// WEBRTC CONFIGURATION
// ============================================================
//
// STUN helps the browsers discover a direct connection.
//
// TURN is recommended for production because some networks
// cannot establish a direct peer-to-peer connection.
//
// You can add your own TURN server later.
//
// ============================================================

const rtcConfiguration = {

  iceServers: [

    {
      urls:
        "stun:stun.l.google.com:19302"
    },

    {
      urls:
        "stun:stun1.l.google.com:19302"
    }

  ]

};


// ============================================================
// GET LOCAL MEDIA
// ============================================================

async function getLocalStream(
  callType
) {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    throw new Error(
      "Your browser does not support microphone/camera access."
    );

  }


  if (callType === "video") {

    localStream =
      await navigator.mediaDevices.getUserMedia({

        audio: true,

        video: true

      });

  } else {

    localStream =
      await navigator.mediaDevices.getUserMedia({

        audio: true,

        video: false

      });

  }


  if (localVideo) {

    localVideo.srcObject =
      localStream;

  }


  return localStream;

}


// ============================================================
// CREATE PEER CONNECTION
// ============================================================

function createPeerConnection(
  callRef,
  caller
) {

  const pc =
    new RTCPeerConnection(
      rtcConfiguration
    );


  peerConnection = pc;


  // ----------------------------------------------------------
  // REMOTE TRACK
  // ----------------------------------------------------------

  pc.ontrack =
    (event) => {

      const stream =
        event.streams[0];


      if (
        currentCallType ===
        "video"
      ) {

        if (remoteVideo) {

          remoteVideo.srcObject =
            stream;

        }

      } else {

        if (remoteAudio) {

          remoteAudio.srcObject =
            stream;

        }

      }

    };


  // ----------------------------------------------------------
  // ICE CANDIDATES
  // ----------------------------------------------------------

  pc.onicecandidate =
    async (event) => {

      if (!event.candidate) {
        return;
      }


      try {

        const candidateCollection =
          collection(
            callRef,
            caller
              ? "callerCandidates"
              : "calleeCandidates"
          );


        await addDoc(
          candidateCollection,
          event.candidate.toJSON()
        );

      } catch (error) {

        console.error(
          "ICE candidate error:",
          error
        );

      }

    };


  // ----------------------------------------------------------
  // CONNECTION STATE
  // ----------------------------------------------------------

  pc.onconnectionstatechange =
    () => {

      console.log(
        "WebRTC connection state:",
        pc.connectionState
      );


      switch (
        pc.connectionState
      ) {

        case "new":

          setCallStatus(
            "Connecting..."
          );

          break;


        case "connecting":

          setCallStatus(
            "Connecting..."
          );

          break;


        case "connected":

          setCallStatus(
            currentCallType ===
            "video"
              ? "Video call connected ❤️"
              : "Voice call connected ❤️"
          );

          showActiveCallUI();

          break;


        case "disconnected":

          setCallStatus(
            "Connection interrupted..."
          );

          break;


        case "failed":

          setCallStatus(
            "Call connection failed."
          );

          break;


        case "closed":

          setCallStatus(
            "Call ended."
          );

          break;

      }

    };


  // ----------------------------------------------------------
  // ICE CONNECTION STATE
  // ----------------------------------------------------------

  pc.oniceconnectionstatechange =
    () => {

      console.log(
        "ICE state:",
        pc.iceConnectionState
      );

    };


  return pc;

}


// ============================================================
// ADD LOCAL TRACKS
// ============================================================

function addLocalTracks(
  stream,
  pc
) {

  if (!stream) {
    return;
  }


  stream
    .getTracks()
    .forEach(
      (track) => {

        pc.addTrack(
          track,
          stream
        );

      }
    );

}


// ============================================================
// START VOICE CALL
// ============================================================

async function startVoiceCall() {

  validatePartner();


  if (!currentUser) {

    throw new Error(
      "You are not logged in."
    );

  }


  await cleanupCall(
    false
  );


  currentCallType =
    "voice";

  isCaller =
    true;

  callEndedLocally =
    false;


  setCallStatus(
    "Requesting microphone..."
  );


  localStream =
    await getLocalStream(
      "voice"
    );


  currentCallRef =
    doc(
      callsCollection
        .withConverter
        ? callsCollection
        : callsCollection,
      crypto.randomUUID()
    );


  currentCallId =
    currentCallRef.id;


  const pc =
    createPeerConnection(
      currentCallRef,
      true
    );


  addLocalTracks(
    localStream,
    pc
  );


  const offer =
    await pc.createOffer();


  await pc.setLocalDescription(
    offer
  );


  await updateDoc(
    currentCallRef,
    {
      offer: {
        type:
          offer.type,
        sdp:
          offer.sdp
      }
    }
  ).catch(
    async () => {

      await addDoc(
        callsCollection,
        {
          callerId:
            currentUser.uid,

          calleeId:
            PARTNER_UID,

          type:
            "voice",

          status:
            "ringing",

          offer: {
            type:
              offer.type,
            sdp:
              offer.sdp
          },

          createdAt:
            serverTimestamp()
        }
      );

    }
  );

}


// ============================================================
// START VIDEO CALL
// ============================================================

async function startVideoCall() {

  validatePartner();


  if (!currentUser) {

    throw new Error(
      "You are not logged in."
    );

  }


  await cleanupCall(
    false
  );


  currentCallType =
    "video";

  isCaller =
    true;

  callEndedLocally =
    false;


  setCallStatus(
    "Requesting camera and microphone..."
  );


  localStream =
    await getLocalStream(
      "video"
    );


  // ----------------------------------------------------------
  // Create call document FIRST.
  // ----------------------------------------------------------

  currentCallRef =
    doc(
      callsCollection,
      crypto.randomUUID()
    );


  currentCallId =
    currentCallRef.id;


  // ----------------------------------------------------------
  // Create peer.
  // ----------------------------------------------------------

  const pc =
    createPeerConnection(
      currentCallRef,
      true
    );


  addLocalTracks(
    localStream,
    pc
  );


  // ----------------------------------------------------------
  // Create offer.
  // ----------------------------------------------------------

  const offer =
    await pc.createOffer();


  await pc.setLocalDescription(
    offer
  );


  // ----------------------------------------------------------
  // Save call.
  // ----------------------------------------------------------

  await import(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
  );


  const { setDoc } =
    await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
    );


  await setDoc(
    currentCallRef,
    {

      callerId:
        currentUser.uid,

      calleeId:
        PARTNER_UID,

      type:
        "video",

      status:
        "ringing",

      offer: {

        type:
          offer.type,

        sdp:
          offer.sdp

      },

      createdAt:
        serverTimestamp()

    }
  );


  listenForCallerAnswer();

}


// ============================================================
// START VOICE CALL - CORRECTED IMPLEMENTATION
// ============================================================

async function createOutgoingCall(
  type
) {

  validatePartner();


  if (!currentUser) {

    throw new Error(
      "You are not logged in."
    );

  }


  await cleanupCall(
    false
  );


  currentCallType =
    type;

  isCaller =
    true;

  callEndedLocally =
    false;


  const stream =
    await getLocalStream(
      type
    );


  currentCallRef =
    doc(
      callsCollection,
      crypto.randomUUID()
    );


  currentCallId =
    currentCallRef.id;


  const pc =
    createPeerConnection(
      currentCallRef,
      true
    );


  addLocalTracks(
    stream,
    pc
  );


  const offer =
    await pc.createOffer();


  await pc.setLocalDescription(
    offer
  );


  const { setDoc } =
    await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
    );


  await setDoc(
    currentCallRef,
    {

      callerId:
        currentUser.uid,

      calleeId:
        PARTNER_UID,

      type:
        type,

      status:
        "ringing",

      offer: {

        type:
          offer.type,

        sdp:
          offer.sdp

      },

      createdAt:
        serverTimestamp()

    }
  );


  listenForCallerAnswer();


  setCallStatus(
    type === "video"
      ? "Calling... 📹"
      : "Calling... 📞"
  );

}


// ============================================================
// LISTEN FOR CALLER ANSWER
// ============================================================

function listenForCallerAnswer() {

  if (
    !currentCallRef
  ) {
    return;
  }


  if (
    unsubscribeCurrentCall
  ) {

    unsubscribeCurrentCall();

  }


  unsubscribeCurrentCall =
    onSnapshot(
      currentCallRef,
      async (snapshot) => {

        if (!snapshot.exists()) {
          return;
        }


        const data =
          snapshot.data();


        // ----------------------------------------------------
        // Answer received
        // ----------------------------------------------------

        if (
          data.answer &&
          peerConnection &&
          !peerConnection.currentRemoteDescription
        ) {

          try {

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(
                data.answer
              )
            );


            setCallStatus(
              currentCallType ===
              "video"
                ? "Connecting video..."
                : "Connecting voice..."
            );

          } catch (error) {

            console.error(
              "Setting remote answer failed:",
              error
            );

          }

        }


        // ----------------------------------------------------
        // Call rejected
        // ----------------------------------------------------

        if (
          data.status ===
          "rejected"
        ) {

          setCallStatus(
            "Call rejected."
          );


          await cleanupCall();

        }


        // ----------------------------------------------------
        // Call ended by remote
        // ----------------------------------------------------

        if (
          data.status ===
          "ended"
        ) {

          setCallStatus(
            "Call ended."
          );


          await cleanupCall();

        }

      },
      (error) => {

        console.error(
          "Caller call listener error:",
          error
        );

      }
    );


  listenForRemoteCandidates(
    currentCallRef,
    "calleeCandidates"
  );

}


// ============================================================
// LISTEN FOR REMOTE ICE CANDIDATES
// ============================================================

function listenForRemoteCandidates(
  callRef,
  collectionName
) {

  if (
    unsubscribeRemoteCandidates
  ) {

    unsubscribeRemoteCandidates();

  }


  const candidatesRef =
    collection(
      callRef,
      collectionName
    );


  unsubscribeRemoteCandidates =
    onSnapshot(
      candidatesRef,
      async (snapshot) => {

        for (
          const change of snapshot.docChanges()
        ) {

          if (
            change.type !==
            "added"
          ) {
            continue;
          }


          if (!peerConnection) {
            continue;
          }


          try {

            const data =
              change.doc.data();


            await peerConnection.addIceCandidate(
              new RTCIceCandidate(
                data
              )
            );


          } catch (error) {

            console.error(
              "Could not add remote ICE candidate:",
              error
            );

          }

        }

      },
      (error) => {

        console.error(
          "ICE candidate listener error:",
          error
        );

      }
    );

}


// ============================================================
// INCOMING CALL LISTENER
// ============================================================

function startIncomingCallListener() {

  if (!currentUser) {
    return;
  }


  if (
    unsubscribeIncomingCalls
  ) {

    unsubscribeIncomingCalls();

  }


  const incomingQuery =
    query(
      callsCollection,

      where(
        "calleeId",
        "==",
        currentUser.uid
      ),

      where(
        "status",
        "==",
        "ringing"
      ),

      limit(1)
    );


  unsubscribeIncomingCalls =
    onSnapshot(
      incomingQuery,
      (snapshot) => {

        snapshot.forEach(
          (callSnapshot) => {

            const data =
              callSnapshot.data();


            if (
              currentCallId
            ) {

              return;

            }


            showIncomingCall(
              callSnapshot.id,
              data
            );

          }
        );

      },
      (error) => {

        console.error(
          "Incoming call listener error:",
          error
        );

        setCallStatus(
          "Could not listen for incoming calls."
        );

      }
    );

}


// ============================================================
// SHOW INCOMING CALL
// ============================================================

function showIncomingCall(
  callId,
  data
) {

  currentCallId =
    callId;


  currentCallType =
    data.type;


  currentCallRef =
    doc(
      db,
      "calls",
      callId
    );


  if (incomingCall) {

    incomingCall.style.display =
      "block";

  }


  if (incomingCallText) {

    incomingCallText.textContent =
      data.type === "video"
        ? "Incoming video call ❤️"
        : "Incoming voice call ❤️";

  }


  if (callStatus) {

    callStatus.textContent =
      "Incoming call...";
  }


  if (
    currentCallType ===
    "video"
  ) {

    if (videoContainer) {

      videoContainer.style.display =
        "block";

    }

  }

}


// ============================================================
// ANSWER CALL
// ============================================================

async function answerIncomingCall() {

  if (
    !currentCallRef
  ) {

    return;

  }


  try {

    isCaller =
      false;

    callEndedLocally =
      false;


    if (answerCallBtn) {

      answerCallBtn.disabled =
        true;

    }


    if (rejectCallBtn) {

      rejectCallBtn.disabled =
        true;

    }


    setCallStatus(
      currentCallType ===
      "video"
        ? "Opening camera..."
        : "Opening microphone..."
    );


    // --------------------------------------------------------
    // Get media
    // --------------------------------------------------------

    localStream =
      await getLocalStream(
        currentCallType
      );


    // --------------------------------------------------------
    // Create peer
    // --------------------------------------------------------

    const pc =
      createPeerConnection(
        currentCallRef,
        false
      );


    addLocalTracks(
      localStream,
      pc
    );


    // --------------------------------------------------------
    // Get caller offer
    // --------------------------------------------------------

    const callSnapshot =
      await new Promise(
        (resolve, reject) => {

          const stop =
            onSnapshot(
              currentCallRef,
              (snapshot) => {

                stop();

                resolve(
                  snapshot
                );

              },
              (error) => {

                stop();

                reject(
                  error
                );

              }
            );

        }
      );


    const callData =
      callSnapshot.data();


    if (
      !callData ||
      !callData.offer
    ) {

      throw new Error(
        "The caller's offer was not found."
      );

    }


    // --------------------------------------------------------
    // Set caller offer
    // --------------------------------------------------------

    await pc.setRemoteDescription(
      new RTCSessionDescription(
        callData.offer
      )
    );


    // --------------------------------------------------------
    // Create answer
    // --------------------------------------------------------

    const answer =
      await pc.createAnswer();


    await pc.setLocalDescription(
      answer
    );


    // --------------------------------------------------------
    // Save answer
    // --------------------------------------------------------

    await updateDoc(
      currentCallRef,
      {

        answer: {

          type:
            answer.type,

          sdp:
            answer.sdp

        },

        status:
          "connected"

      }
    );


    // --------------------------------------------------------
    // Listen to caller's ICE candidates
    // --------------------------------------------------------

    listenForRemoteCandidates(
      currentCallRef,
      "callerCandidates"
    );


    if (incomingCall) {

      incomingCall.style.display =
        "none";

    }


    showActiveCallUI();


    setCallStatus(
      "Connecting..."
    );


  } catch (error) {

    console.error(
      "Answer call error:",
      error
    );


    setCallStatus(
      error.message ||
      "Could not answer call."
    );


    await rejectIncomingCall();

  }

}


// ============================================================
// REJECT INCOMING CALL
// ============================================================

async function rejectIncomingCall() {

  if (
    !currentCallRef
  ) {
    return;
  }


  try {

    await updateDoc(
      currentCallRef,
      {
        status:
          "rejected"
      }
    );

  } catch (error) {

    console.error(
      "Reject call error:",
      error
    );

  }


  if (incomingCall) {

    incomingCall.style.display =
      "none";

  }


  currentCallRef =
    null;

  currentCallId =
    null;

  currentCallType =
    null;

}


// ============================================================
// SHOW ACTIVE CALL UI
// ============================================================

function showActiveCallUI() {

  if (startCallButtons) {

    startCallButtons.style.display =
      "none";

  }


  if (activeCallControls) {

    activeCallControls.style.display =
      "flex";

  }


  if (
    currentCallType ===
    "video"
  ) {

    if (videoContainer) {

      videoContainer.style.display =
        "block";

    }

  }

}


// ============================================================
// RESET CALL UI
// ============================================================

function resetCallUI() {

  if (startCallButtons) {

    startCallButtons.style.display =
      "flex";

  }


  if (activeCallControls) {

    activeCallControls.style.display =
      "none";

  }


  if (videoContainer) {

    videoContainer.style.display =
      "none";

  }


  if (incomingCall) {

    incomingCall.style.display =
      "none";

  }


  if (voiceCallBtn) {

    voiceCallBtn.disabled =
      false;

  }


  if (videoCallBtn) {

    videoCallBtn.disabled =
      false;

  }


  if (answerCallBtn) {

    answerCallBtn.disabled =
      false;

  }


  if (rejectCallBtn) {

    rejectCallBtn.disabled =
      false;

  }


  microphoneMuted =
    false;

  cameraDisabled =
    false;


  if (muteCallBtn) {

    muteCallBtn.textContent =
      "🎤";

  }


  if (cameraCallBtn) {

    cameraCallBtn.textContent =
      "📹";

  }


  if (localVideo) {

    localVideo.srcObject =
      null;

  }


  if (remoteVideo) {

    remoteVideo.srcObject =
      null;

  }


  if (remoteAudio) {

    remoteAudio.srcObject =
      null;

  }

}


// ============================================================
// END CALL
// ============================================================

async function endCall(
  updateRemote = true
) {

  callEndedLocally =
    true;


  if (
    currentCallRef &&
    updateRemote
  ) {

    try {

      await updateDoc(
        currentCallRef,
        {
          status:
            "ended"
        }
      );

    } catch (error) {

      console.error(
        "Could not update call status:",
        error
      );

    }

  }


  await cleanupCall(
    false
  );


  setCallStatus(
    "Call ended. ❤️"
  );

}


// ============================================================
// CLEANUP CALL
// ============================================================

async function cleanupCall(
  resetUI = true
) {

  // ----------------------------------------------------------
  // Stop listeners
  // ----------------------------------------------------------

  if (
    unsubscribeCurrentCall
  ) {

    unsubscribeCurrentCall();

    unsubscribeCurrentCall =
      null;

  }


  if (
    unsubscribeRemoteCandidates
  ) {

    unsubscribeRemoteCandidates();

    unsubscribeRemoteCandidates =
      null;

  }


  // ----------------------------------------------------------
  // Close WebRTC
  // ----------------------------------------------------------

  if (peerConnection) {

    try {

      peerConnection.ontrack =
        null;

      peerConnection.onicecandidate =
        null;

      peerConnection.close();

    } catch (error) {

      console.error(
        "Peer cleanup error:",
        error
      );

    }


    peerConnection =
      null;

  }


  // ----------------------------------------------------------
  // Stop microphone/camera
  // ----------------------------------------------------------

  if (localStream) {

    localStream
      .getTracks()
      .forEach(
        (track) => {

          track.stop();

        }
      );


    localStream =
      null;

  }


  // ----------------------------------------------------------
  // Clear media
  // ----------------------------------------------------------

  if (localVideo) {

    localVideo.srcObject =
      null;

  }


  if (remoteVideo) {

    remoteVideo.srcObject =
      null;

  }


  if (remoteAudio) {

    remoteAudio.srcObject =
      null;

  }


  // ----------------------------------------------------------
  // Clear state
  // ----------------------------------------------------------

  currentCallRef =
    null;

  currentCallId =
    null;

  currentCallType =
    null;

  isCaller =
    false;


  if (resetUI) {

    resetCallUI();

  }

}


// ============================================================
// CALL STATUS
// ============================================================

function setCallStatus(
  text
) {

  if (callStatus) {

    callStatus.textContent =
      text;

  }

}


// ============================================================
// VOICE CALL BUTTON
// ============================================================

if (voiceCallBtn) {

  voiceCallBtn.addEventListener(
    "click",
    async () => {

      try {

        voiceCallBtn.disabled =
          true;

        videoCallBtn.disabled =
          true;


        setCallStatus(
          "Starting voice call... 📞"
        );


        await createOutgoingCall(
          "voice"
        );


      } catch (error) {

        console.error(
          "Voice call error:",
          error
        );


        setCallStatus(
          error.message ||
          "Could not start voice call."
        );


        voiceCallBtn.disabled =
          false;

        videoCallBtn.disabled =
          false;

      }

    }
  );

}


// ============================================================
// VIDEO CALL BUTTON
// ============================================================

if (videoCallBtn) {

  videoCallBtn.addEventListener(
    "click",
    async () => {

      try {

        voiceCallBtn.disabled =
          true;

        videoCallBtn.disabled =
          true;


        setCallStatus(
          "Starting video call... 📹"
        );


        await createOutgoingCall(
          "video"
        );


      } catch (error) {

        console.error(
          "Video call error:",
          error
        );


        setCallStatus(
          error.message ||
          "Could not start video call."
        );


        voiceCallBtn.disabled =
          false;

        videoCallBtn.disabled =
          false;

      }

    }
  );

}


// ============================================================
// ANSWER BUTTON
// ============================================================

if (answerCallBtn) {

  answerCallBtn.addEventListener(
    "click",
    answerIncomingCall
  );

}


// ============================================================
// REJECT BUTTON
// ============================================================

if (rejectCallBtn) {

  rejectCallBtn.addEventListener(
    "click",
    rejectIncomingCall
  );

}


// ============================================================
// END CALL BUTTON
// ============================================================

if (endCallBtn) {

  endCallBtn.addEventListener(
    "click",
    async () => {

      await endCall(
        true
      );

    }
  );

}


// ============================================================
// MUTE MICROPHONE
// ============================================================

if (muteCallBtn) {

  muteCallBtn.addEventListener(
    "click",
    () => {

      if (!localStream) {
        return;
      }


      const audioTracks =
        localStream.getAudioTracks();


      if (
        audioTracks.length === 0
      ) {

        return;

      }


      microphoneMuted =
        !microphoneMuted;


      audioTracks.forEach(
        (track) => {

          track.enabled =
            !microphoneMuted;

        }
      );


      muteCallBtn.textContent =
        microphoneMuted
          ? "🔇"
          : "🎤";

    }
  );

}


// ============================================================
// CAMERA ON / OFF
// ============================================================

if (cameraCallBtn) {

  cameraCallBtn.addEventListener(
    "click",
    () => {

      if (!localStream) {
        return;
      }


      const videoTracks =
        localStream.getVideoTracks();


      if (
        videoTracks.length === 0
      ) {

        setCallStatus(
          "This is a voice call."
        );

        return;

      }


      cameraDisabled =
        !cameraDisabled;


      videoTracks.forEach(
        (track) => {

          track.enabled =
            !cameraDisabled;

        }
      );


      cameraCallBtn.textContent =
        cameraDisabled
          ? "🚫"
          : "📹";

    }
  );

}


// ============================================================
// MUSIC
// ============================================================

const music =
  getElement("ourSong");

const musicBtn =
  getElement("musicBtn");

let playing =
  false;


if (
  music &&
  musicBtn
) {

  musicBtn.addEventListener(
    "click",
    async () => {

      try {

        if (!playing) {

          await music.play();

          playing =
            true;

          musicBtn.textContent =
            "⏸️";

        } else {

          music.pause();

          playing =
            false;

          musicBtn.textContent =
            "▶️";

        }

      } catch (error) {

        console.error(
          "Music error:",
          error
        );

      }

    }
  );

}


// ============================================================
// PAGE UNLOAD
// ============================================================

window.addEventListener(
  "beforeunload",
  () => {

    if (localStream) {

      localStream
        .getTracks()
        .forEach(
          (track) => {

            track.stop();

          }
        );

    }


    if (peerConnection) {

      peerConnection.close();

    }

  }
);


// ============================================================
// DEBUG
// ============================================================

console.log(
  "home.js loaded successfully ❤️"
);
