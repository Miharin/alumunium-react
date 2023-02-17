import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBQqcBAF1MC9NQ2ux2D_WE5tS1fYef-hqs',
  authDomain: 'alumunium-react.firebaseapp.com',
  projectId: 'alumunium-react',
  storageBucket: 'alumunium-react.appspot.com',
  messagingSenderId: '1070250961958',
  appId: '1:1070250961958:web:f6d702fa63ccd0fc294ae7',
  measurementId: 'G-EF6N3DLTM5',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
