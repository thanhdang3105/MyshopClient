// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyDfMxKCDl49Zll1oqjSNstirkc_4y3k9rU',
    authDomain: 'myshop-f370b.firebaseapp.com',
    projectId: 'myshop-f370b',
    storageBucket: 'myshop-f370b.appspot.com',
    messagingSenderId: '552529156561',
    appId: '1:552529156561:web:020d164eaed8139d0ca8f0',
    measurementId: 'G-L4QD7VWYB3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
