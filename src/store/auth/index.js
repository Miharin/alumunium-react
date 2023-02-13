import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// -------------------------------Database---------------------------------
import { create } from 'zustand';
// -------------------------------Config---------------------------------
import { firebaseConfig } from '../../config/firebaseConfig';
// -------------------------------Config---------------------------------
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const authLogin = create((set) => ({
  auth: {
    Username: '',
    Password: '',
  },
  userCredentials: {},
  errorCode: '',
  errorMessage: '',
  setAuth: (event) =>
    set((state) =>
      event.name === 'Username' && event.value === 'admin'
        ? { auth: { ...state.auth, [event.name]: `${event.value}@alujaya.com` } }
        : event.name === 'Username'
        ? { auth: { ...state.auth, [event.name]: `${event.value}@gmail.com` } }
        : { auth: { ...state.auth, [event.name]: event.value } }
    ),
  setUserCred: (event) =>
    set(() => ({
      userCredentials: event,
    })),
  setErrorCode: (event) =>
    set(() => ({
      errorCode: event,
    })),
  setErrorMessage: (event) =>
    set(() => ({
      errorMessage: event,
    })),
}));
