import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  const currentPath = window.location.pathname;

  if (user) {
    // User sudah login
    sessionStorage.setItem('userLoggedIn', 'true');
    if (currentPath === "/masuk/") {
      window.location.href = "/profil";
    }
  } else {
    sessionStorage.removeItem('userLoggedIn');
    if (currentPath !== "/masuk/" && currentPath !== "/daftar/") {
      window.location.href = "/masuk/";
    }
  }
});