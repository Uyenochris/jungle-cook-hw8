// Jungle Cook: Firebase Authentication from the Homework 7 Firebase project.
// This Firebase web app configuration is public; passwords are handled by Firebase.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDWcDlrgOstgBe7QEh1SXxwpjkB_0fz4UY',
  authDomain: 'jungle-cook-hw7.firebaseapp.com',
  projectId: 'jungle-cook-hw7',
  storageBucket: 'jungle-cook-hw7.firebasestorage.app',
  messagingSenderId: '160131585783',
  appId: '1:160131585783:web:6936409ec3d3340fb6e5f2',
  measurementId: 'G-7KB66BLYX8'
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { onAuthStateChanged };

const accountLink = document.querySelector('.main-menu .login-link');
const yourRecipesLink = document.querySelector('.main-menu .your-recipes-link');

onAuthStateChanged(auth, user => {
  if (accountLink) {
    accountLink.textContent = user ? 'Logout' : 'Login';
    accountLink.href = user ? '#' : 'login.html';
    if (user) accountLink.removeAttribute('aria-current');
  }
  if (yourRecipesLink) yourRecipesLink.hidden = !user;
}, error => {
  window.showNotice?.('Could not check login status. Please reload the page.', 'error');
  console.error('Firebase auth:', error);
});

accountLink?.addEventListener('click', async event => {
  if (!auth.currentUser) return;
  event.preventDefault();
  try {
    window.showNotice?.('Signing out...');
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    window.showNotice?.('Logout failed. Please try again.', 'error');
  }
});

function readableError(error) {
  const errors = {
    'auth/email-already-in-use': 'This email already has an account. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Please use a password with at least 6 characters.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/operation-not-allowed': 'Email/Password authentication must be enabled in Firebase.'
  };
  return errors[error.code] || 'Authentication failed. ' + (error.code || 'Please try again.');
}

for (const form of document.querySelectorAll('[data-demo-form]')) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const signup = form.dataset.demoForm === 'signup';
    const message = form.querySelector('.form-message');
    const button = form.querySelector('button[type="submit"]');
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (password.length < 6) { message.textContent = 'Password needs at least 6 characters.'; return; }
    button.disabled = true;
    message.textContent = signup ? 'Creating your account...' : 'Logging in...';
    try {
      if (signup) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const first = form.elements.firstName.value.trim();
        const last = form.elements.lastName.value.trim();
        if (first || last) await updateProfile(result.user, { displayName: `${first} ${last}`.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      message.textContent = signup ? 'Account created!' : 'Logged in!';
      try { sessionStorage.setItem('jungle-cook-message', message.textContent); } catch {}
      window.location.href = 'index.html';
    } catch (error) {
      message.textContent = readableError(error);
      window.showNotice?.(message.textContent, 'error');
    } finally {
      button.disabled = false;
    }
  });
}
