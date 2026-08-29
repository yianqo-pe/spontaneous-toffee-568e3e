// js/auth.js
import { authInstance, initFirestore } from './firebase-config.js';

let appStarted = false;

// Exponemos las funciones al "window" para que el HTML pueda activarlas con el "onclick"
window.doLogin = function() {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;
  
  if(!email || !pass){ setLoginError("Ingresa tu correo y contraseña."); return; }
  setLoginLoading(true);
  
  authInstance.signInWithEmailAndPassword(email, pass).catch(function(err){
    setLoginLoading(false);
    let msg = "No se pudo iniciar sesión.";
    if(err.code === "auth/invalid-email") msg = "El correo no es válido.";
    else if(err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") msg = "Usuario o contraseña incorrectos.";
    else if(err.code === "auth/wrong-password") msg = "La contraseña es incorrecta.";
    setLoginError(msg);
  });
};

window.doLogout = function() {
  if (confirm("¿Cerrar sesión?")) {
    authInstance.signOut();
  }
};

function showLogin() {
  document.getElementById("loginscreen").style.display = "flex";
  document.getElementById("appwrap").style.display = "none";
}

function showApp(user) {
  document.getElementById("loginscreen").style.display = "none";
  document.getElementById("appwrap").style.display = "flex";
  const badge = document.getElementById("useremail");
  if(badge) badge.textContent = user && user.email ? user.email : "Usuaria";
  
  if(!appStarted){
    appStarted = true;
    if(typeof generarQRsIniciales === "function") generarQRsIniciales();
    if(typeof initNav === "function") initNav();
    if(typeof switchTab === "function") switchTab("home");
    
    // Inicializamos Firestore
    initFirestore();
    if(typeof initFirebase === "function") initFirebase(); // Llama al resto de tu lógica
  }
}

function setLoginError(msg){
  const el = document.getElementById("loginmsg");
  if(!el) return;
  if(!msg){ el.style.display="none"; el.textContent=""; return; }
  el.style.display="block"; el.textContent=msg;
}

function setLoginLoading(loading){
  const btn = document.getElementById("loginbtn");
  const spin = document.getElementById("loginspin");
  if(btn) { btn.disabled=loading; btn.style.opacity=loading?"0.6":"1"; }
  if(spin) spin.style.display=loading?"block":"none";
}

// Iniciar Autenticación
export function initAuth() {
  authInstance.onAuthStateChanged(function(user){
    if(user){
      showApp(user);
    } else {
      showLogin();
    }
  });
}

// Inicia el monitoreo automáticamente
initAuth();