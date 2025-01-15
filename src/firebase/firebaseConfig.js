import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDYQDBNWLiGmE1qC4OXhcNI-jUiZQLlvGc",
    authDomain: "telsan.firebaseapp.com",
    databaseURL: "https://telsan.firebaseio.com",
    projectId: "telsan",
    storageBucket: "telsan.appspot.com",
    messagingSenderId: "234399782199",
    appId: "1:234399782199:web:b2cd11850ffe6e7404b6b2",
    measurementId: "G-5XRY91SPCN"
};

firebase.initializeApp(firebaseConfig);

export default firebase;

