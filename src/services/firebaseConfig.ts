import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBvOQIE6uU0RqSK2uu2o_wQEFHYzqK5Qk8",
  authDomain: "fresherhub-2025.firebaseapp.com",
  projectId: "fresherhub-2025",
  storageBucket: "fresherhub-2025.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;