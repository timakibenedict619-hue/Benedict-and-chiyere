// ============================================================
// home.js
// Benedict ❤️ Chiyere
// ============================================================

import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  sendMessage,
  sendPhoto,
  listenForMessages
} from "./chat.js";


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const logoutBtn =
  document.getElementById("logoutBtn");

const messages =
  document.getElementById("messages");

const messageInput =
  document.getElementById("messageInput");

const sendBtn =
  document.getElementById("sendBtn");

const photoBtn =
  document.getElementById("photoBtn");

const photoInput =
  document.getElementById("photoInput");

const chatStatus =
  document.getElementById("chatStatus");

const music =
  document.getElementById("ourSong");

const musicBtn =
  document.getElementById("musicBtn");


// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;
  }

  currentUser = user;

  // Start listening for chat messages
  startChatListener();

});


// ============================================================
// LOGOUT
// ============================================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

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

/*
  CHANGE THIS DATE TO YOUR REAL
  RELATIONSHIP START DATE.

  Example:

  const relationshipDate =
    new Date("2026-08-10T20:00:00");

*/

const relationshipDate =
  new Date("2026-08-10T20:00:00");


function updateCountdown() {

  const now =
    new Date();

  const difference =
    now - relationshipDate;


  const daysElement =
    document.getElementById("days");

  const hoursElement =
    document.getElementById("hours");

  const minutesElement =
    document.getElementById("minutes");

  const secondsElement =
    document.getElementById("seconds");


  if (
    !daysElement ||
    !hoursElement ||
    !minutesElement ||
    !secondsElement
  ) {
    return;
  }


  if (difference < 0) {

    daysElement.textContent = "0";
    hoursElement.textContent = "0";
    minutesElement.textContent = "0";
    secondsElement.textContent = "0";

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


  daysElement.textContent =
    days;


  hoursElement.textContent =
    String(hours).padStart(
      2,
      "0"
    );


  minutesElement.textContent =
    String(minutes).padStart(
      2,
      "0"
    );


  secondsElement.textContent =
    String(seconds).padStart(
      2,
      "0"
    );

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
          document.getElementById(
            panelId
          );


        if (!panel) {
          return;
        }


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
    );

  }
);


// ============================================================
// CLOSE PANELS
// ============================================================

document
  .querySelectorAll(
    ".close-panel"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const panel =
            document.getElementById(
              button.dataset.close
            );


          if (!panel) {
            return;
          }


          panel.classList.remove(
            "active"
          );

        }
      );

    }
  );


// ============================================================
// CHAT
// ============================================================

function startChatListener() {

  if (!messages) {
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
      "Chat listener error:",
      error
    );

    if (chatStatus) {

      chatStatus.textContent =
        "Unable to load messages.";

    }

  }

}


// ============================================================
// RENDER MESSAGES
// ============================================================

function renderMessages(
  allMessages
) {

  if (!messages) {
    return;
  }


  messages.innerHTML = "";


  if (
    !allMessages ||
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


      // --------------------------------------------------------
      // PHOTO MESSAGE
      // --------------------------------------------------------

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

      }


      // --------------------------------------------------------
      // TEXT MESSAGE
      // --------------------------------------------------------

      else {

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


      // --------------------------------------------------------
      // MESSAGE TIME
      // --------------------------------------------------------

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


// ============================================================
// FORMAT MESSAGE TIME
// ============================================================

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
// SEND MESSAGE
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


  if (!currentUser) {

    if (chatStatus) {

      chatStatus.textContent =
        "Please wait for authentication.";

    }

    return;
  }


  sendBtn.disabled = true;


  if (chatStatus) {

    chatStatus.textContent =
      "Sending...";

  }


  try {

    await sendMessage(
      text
    );


    messageInput.value = "";


    if (chatStatus) {

      chatStatus.textContent =
        "";

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


// ============================================================
// SEND BUTTON
// ============================================================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendCurrentMessage
  );

}


// ============================================================
// ENTER TO SEND
// ============================================================

if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        sendCurrentMessage();

      }

    }
  );

}


// ============================================================
// PHOTO BUTTON
// ============================================================

if (photoBtn) {

  photoBtn.addEventListener(
    "click",
    () => {

      if (photoInput) {

        photoInput.click();

      }

    }
  );

}


// ============================================================
// PHOTO UPLOAD
// ============================================================

if (photoInput) {

  photoInput.addEventListener(
    "change",
    async () => {

      const file =
        photoInput.files[0];


      if (!file) {
        return;
      }


      if (!currentUser) {

        if (chatStatus) {

          chatStatus.textContent =
            "Please wait for authentication.";

        }

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

            chatStatus.textContent =
              "";

          }

        },
        3000
      );

    }
  );

}


// ============================================================
// CALL SYSTEM
// ============================================================

const voiceCallBtn =
  document.getElementById(
    "voiceCallBtn"
  );


const videoCallBtn =
  document.getElementById(
    "videoCallBtn"
  );


const endCallBtn =
  document.getElementById(
    "endCallBtn"
  );


const muteCallBtn =
  document.getElementById(
    "muteCallBtn"
  );


const cameraCallBtn =
  document.getElementById(
    "cameraCallBtn"
  );


const startCallButtons =
  document.getElementById(
    "startCallButtons"
  );


const activeCallControls =
  document.getElementById(
    "activeCallControls"
  );


const videoContainer =
  document.getElementById(
    "videoContainer"
  );


const callStatus =
  document.getElementById(
    "callStatus"
  );


// ============================================================
// CALL STATE
// ============================================================

let localStream = null;

let peerConnection = null;

let microphoneMuted = false;

let cameraDisabled = false;


// ============================================================
// GET LOCAL STREAM
// ============================================================

function getLocalStream() {

  return localStream;

}


// ============================================================
// VOICE CALL
// ============================================================

async function startVoiceCall() {

  /*
    This obtains the user's microphone.

    Real two-user calling still needs
    WebRTC signaling through Firebase.
  */

  localStream =
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false
      });


  const remoteAudio =
    document.getElementById(
      "remoteAudio"
    );


  if (remoteAudio) {

    remoteAudio.srcObject =
      null;

  }


  microphoneMuted = false;

  cameraDisabled = false;


  if (muteCallBtn) {

    muteCallBtn.textContent =
      "🎤";

  }


  if (cameraCallBtn) {

    cameraCallBtn.style.display =
      "none";

  }


  /*
    IMPORTANT:

    The microphone is now available.

    Firebase/WebRTC signaling must be
    connected here to communicate with
    Chiyere's browser.
  */

  return localStream;

}


// ============================================================
// VIDEO CALL
// ============================================================

async function startVideoCall() {

  localStream =
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true
      });


  const localVideo =
    document.getElementById(
      "localVideo"
    );


  if (localVideo) {

    localVideo.srcObject =
      localStream;

  }


  microphoneMuted = false;

  cameraDisabled = false;


  if (muteCallBtn) {

    muteCallBtn.textContent =
      "🎤";

  }


  if (cameraCallBtn) {

    cameraCallBtn.textContent =
      "📹";

    cameraCallBtn.style.display =
      "block";

  }


  /*
    IMPORTANT:

    Real remote video requires
    Firebase/WebRTC signaling.
  */

  return localStream;

}


// ============================================================
// END CALL
// ============================================================

function endCall() {

  if (localStream) {

    localStream
      .getTracks()
      .forEach(
        (track) => {

          track.stop();

        }
      );

    localStream = null;

  }


  if (peerConnection) {

    peerConnection.close();

    peerConnection = null;

  }


  const localVideo =
    document.getElementById(
      "localVideo"
    );


  const remoteVideo =
    document.getElementById(
      "remoteVideo"
    );


  const remoteAudio =
    document.getElementById(
      "remoteAudio"
    );


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


  microphoneMuted = false;

  cameraDisabled = false;


  if (muteCallBtn) {

    muteCallBtn.textContent =
      "🎤";

  }


  if (cameraCallBtn) {

    cameraCallBtn.textContent =
      "📹";

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

        callStatus.textContent =
          "Starting voice call... 📞";


        voiceCallBtn.disabled =
          true;


        videoCallBtn.disabled =
          true;


        await startVoiceCall();


        startCallButtons.style.display =
          "none";


        activeCallControls.style.display =
          "flex";


        callStatus.textContent =
          "Microphone ready. Connecting... ❤️";

      } catch (error) {

        console.error(
          "Voice call error:",
          error
        );


        callStatus.textContent =
          error.message ||
          "Could not start voice call.";


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

        callStatus.textContent =
          "Starting video call... 📹";


        voiceCallBtn.disabled =
          true;


        videoCallBtn.disabled =
          true;


        await startVideoCall();


        startCallButtons.style.display =
          "none";


        activeCallControls.style.display =
          "flex";


        videoContainer.style.display =
          "block";


        callStatus.textContent =
          "Camera ready. Connecting... ❤️";

      } catch (error) {

        console.error(
          "Video call error:",
          error
        );


        callStatus.textContent =
          error.message ||
          "Could not start video call.";


        voiceCallBtn.disabled =
          false;


        videoCallBtn.disabled =
          false;

      }

    }
  );

}


// ============================================================
// END CALL BUTTON
// ============================================================

if (endCallBtn) {

  endCallBtn.addEventListener(
    "click",
    () => {

      endCall();


      startCallButtons.style.display =
        "flex";


      activeCallControls.style.display =
        "none";


      videoContainer.style.display =
        "none";


      voiceCallBtn.disabled =
        false;


      videoCallBtn.disabled =
        false;


      callStatus.textContent =
        "Call ended. ❤️";

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

      const stream =
        getLocalStream();


      if (!stream) {
        return;
      }


      const audioTracks =
        stream.getAudioTracks();


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

      const stream =
        getLocalStream();


      if (!stream) {
        return;
      }


      const videoTracks =
        stream.getVideoTracks();


      if (
        videoTracks.length === 0
      ) {

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
// INCOMING CALL BUTTONS
// ============================================================

const incomingCall =
  document.getElementById(
    "incomingCall"
  );


const answerCallBtn =
  document.getElementById(
    "answerCallBtn"
  );


const rejectCallBtn =
  document.getElementById(
    "rejectCallBtn"
  );


if (answerCallBtn) {

  answerCallBtn.addEventListener(
    "click",
    async () => {

      /*
        Real incoming-call answering
        will be connected to Firebase
        WebRTC signaling.
      */

      if (incomingCall) {

        incomingCall.style.display =
          "none";

      }

    }
  );

}


if (rejectCallBtn) {

  rejectCallBtn.addEventListener(
    "click",
    () => {

      if (incomingCall) {

        incomingCall.style.display =
          "none";

      }

    }
  );

}


// ============================================================
// MUSIC
// ============================================================

let playing = false;


if (musicBtn && music) {

  musicBtn.addEventListener(
    "click",
    async () => {

      try {

        if (!playing) {

          await music.play();


          playing = true;


          musicBtn.textContent =
            "⏸️";

        } else {

          music.pause();


          playing = false;


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
// CLEANUP WHEN LEAVING PAGE
// ============================================================

window.addEventListener(
  "beforeunload",
  () => {

    endCall();

  }
);
