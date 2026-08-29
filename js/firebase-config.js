// js/firebase-config.js

export const firebaseConfig = {
  apiKey: "AIzaSyDs-cRPMdBjqXAuEtLNf8SKFwsPZ8cP9UM",
  authDomain: "belle-co-7f7c3.firebaseapp.com",
  projectId: "belle-co-7f7c3",
  storageBucket: "belle-co-7f7c3.firebasestorage.app",
  messagingSenderId: "705237280908",
  appId: "1:705237280908:web:3b4e6f92decc5649ed33a9"
};

// Inicializamos la app y exportamos la base de datos para que otros archivos la usen
export const fbApp = firebase.initializeApp(firebaseConfig);
export const authInstance = firebase.auth();

// Exponemos "db" de forma global temporalmente para que el resto del sistema antiguo siga funcionando
window.db = null;
window.docRef = null;

export function initFirestore() {
    window.db = firebase.firestore();
    // Intentamos activar persistencia offline
    window.db.enablePersistence({synchronizeTabs:true}).catch(function(err){
        console.warn("Error persistencia offline:", err);
    });
}