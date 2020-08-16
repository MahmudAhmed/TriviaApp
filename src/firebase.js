import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBiWxaJgjEpjjqMBYM8gmAKH7wnj1YW3Kc",
  databaseURL: "https://trivia-app-76ac3.firebaseio.com",
  projectId: "trivia-app-76ac3",
});

const db = firebaseApp.firestore();

export { db };