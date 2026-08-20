call.js

// ==========================================
// CALL.JS
// Voice + Video Calling
// ==========================================
//
// This file uses WebRTC for the actual
// microphone/camera connection.
//
// IMPORTANT:
// WebRTC still needs a signaling system.
// We will use Firebase Firestore for signaling
// in the next step.
//
// ==========================================

import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// CALL STATE
// ==========================================

let localStream = null;
let peerConnection = null;

let currentCallId = null;
let unsubscribeCall = null;


// ==========================================
// WEBRTC CONFIGURATION
// ==========================================

const rtcConfiguration = {

  iceServers: [

    {
      urls: "stun:stun.l.google.com:19302"
    },

    {
      urls: "stun:stun1.l.google.com:19302"
    }

  ]

};


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

  const user = auth.currentUser;

  if (!user) {

    throw new Error(
      "You must be logged in before making a call."
    );

  }

  return user;

}


// ==========================================
// GET MICROPHONE
// ==========================================

export async function getAudioStream() {

  try {

    return await navigator.mediaDevices.getUserMedia({

      audio: true,
      video: false

    });

  } catch (error) {

    console.error(
      "Microphone error:",
      error
    );

    throw new Error(
      "Could not access your microphone. Please allow microphone permission."
    );

  }

}


// ==========================================
// GET CAMERA + MICROPHONE
// ==========================================

export async function getVideoStream() {

  try {

    return await navigator.mediaDevices.getUserMedia({

      audio: true,
      video: true

    });

  } catch (error) {

    console.error(
      "Camera error:",
      error
    );

    throw new Error(
      "Could not access your camera and microphone. Please allow permission."
    );

  }

}


// ==========================================
// CREATE PEER CONNECTION
// ==========================================

function createPeerConnection() {

  peerConnection =
    new RTCPeerConnection(
      rtcConfiguration
    );


  // ----------------------------------------
  // ICE CANDIDATES
  // ----------------------------------------

  peerConnection.onicecandidate =
    async (event) => {

      if (
        !event.candidate ||
        !currentCallId
      ) {

        return;

      }


      const callRef =
        doc(
          db,
          "calls",
          currentCallId
        );


      const callSnapshot =
        await getDoc(callRef);


      if (!callSnapshot.exists()) {

        return;

      }


      const callData =
        callSnapshot.data();


      const collectionName =
        callData.callerId === auth.currentUser.uid
          ? "callerCandidates"
          : "calleeCandidates";


      await addDoc(

        collection(
          callRef,
          collectionName
        ),

        event.candidate.toJSON()

      );

    };


  // ----------------------------------------
  // REMOTE STREAM
  // ----------------------------------------

  peerConnection.ontrack =
    (event) => {

      const remoteVideo =
        document.getElementById(
          "remoteVideo"
        );


      const remoteAudio =
        document.getElementById(
          "remoteAudio"
        );


      if (remoteVideo) {

        remoteVideo.srcObject =
          event.streams[0];

      }


      if (remoteAudio) {

        remoteAudio.srcObject =
          event.streams[0];

      }

    };


  return peerConnection;

}


// ==========================================
// START VOICE CALL
// ==========================================

export async function startVoiceCall() {

  const user =
    getCurrentUser();


  console.log(
    "Starting voice call..."
  );


  // Get microphone

  localStream =
    await getAudioStream();


  // Create WebRTC connection

  createPeerConnection();


  // Add microphone tracks

  localStream
    .getTracks()
    .forEach(
      (track) => {

        peerConnection.addTrack(
          track,
          localStream
        );

      }
    );


  // Create offer

  const offer =
    await peerConnection.createOffer();


  await peerConnection.setLocalDescription(
    offer
  );


  // Create call document

  const callRef =
    await addDoc(
      collection(db, "calls"),
      {

        type: "voice",

        callerId: user.uid,

        callerEmail:
          user.email || "",

        offer: {

          type: offer.type,

          sdp: offer.sdp

        },

        status: "ringing",

        createdAt:
          serverTimestamp()

      }
    );


  currentCallId =
    callRef.id;


  console.log(
    "Voice call created:",
    currentCallId
  );


  // Listen for answer

  unsubscribeCall =
    onSnapshot(
      callRef,
      async (snapshot) => {

        const data =
          snapshot.data();


        if (!data) {

          return;

        }


        if (
          data.answer &&
          !peerConnection.currentRemoteDescription
        ) {

          const answer =
            new RTCSessionDescription(
              data.answer
            );


          await peerConnection.setRemoteDescription(
            answer
          );

        }

      }
    );


  return currentCallId;

}


// ==========================================
// START VIDEO CALL
// ==========================================

export async function startVideoCall() {

  const user =
    getCurrentUser();


  console.log(
    "Starting video call..."
  );


  // Get camera + microphone

  localStream =
    await getVideoStream();


  // Show local camera

  const localVideo =
    document.getElementById(
      "localVideo"
    );


  if (localVideo) {

    localVideo.srcObject =
      localStream;

  }


  // Create WebRTC connection

  createPeerConnection();


  // Add camera + microphone

  localStream
    .getTracks()
    .forEach(
      (track) => {

        peerConnection.addTrack(
          track,
          localStream
        );

      }
    );


  // Create offer

  const offer =
    await peerConnection.createOffer();


  await peerConnection.setLocalDescription(
    offer
  );


  // Create call

  const callRef =
    await addDoc(
      collection(db, "calls"),
      {

        type: "video",

        callerId: user.uid,

        callerEmail:
          user.email || "",

        offer: {

          type: offer.type,

          sdp: offer.sdp

        },

        status: "ringing",

        createdAt:
          serverTimestamp()

      }
    );


  currentCallId =
    callRef.id;


  console.log(
    "Video call created:",
    currentCallId
  );


  // Listen for answer

  unsubscribeCall =
    onSnapshot(
      callRef,
      async (snapshot) => {

        const data =
          snapshot.data();


        if (!data) {

          return;

        }


        if (
          data.answer &&
          !peerConnection.currentRemoteDescription
        ) {

          const answer =
            new RTCSessionDescription(
              data.answer
            );


          await peerConnection.setRemoteDescription(
            answer
          );

        }

      }
    );


  return currentCallId;

}


// ==========================================
// END CALL
// ==========================================

export function endCall() {

  console.log(
    "Ending call..."
  );


  // Stop microphone/camera

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


  // Close WebRTC

  if (peerConnection) {

    peerConnection.close();

    peerConnection = null;

  }


  // Stop Firestore listener

  if (unsubscribeCall) {

    unsubscribeCall();

    unsubscribeCall = null;

  }


  currentCallId =
    null;


  // Clear local video

  const localVideo =
    document.getElementById(
      "localVideo"
    );


  if (localVideo) {

    localVideo.srcObject =
      null;

  }


  // Clear remote video

  const remoteVideo =
    document.getElementById(
      "remoteVideo"
    );


  if (remoteVideo) {

    remoteVideo.srcObject =
      null;

  }


  // Clear remote audio

  const remoteAudio =
    document.getElementById(
      "remoteAudio"
    );


  if (remoteAudio) {

    remoteAudio.srcObject =
      null;

  }

}


// ==========================================
// GET CURRENT CALL ID
// ==========================================

export function getCurrentCallId() {

  return currentCallId;

}


// ==========================================
// GET LOCAL STREAM
// ==========================================

export function getLocalStream() {

  return localStream;

}


// ==========================================
// GET PEER CONNECTION
// ==========================================

export function getPeerConnection() {

  return peerConnection;

      }
