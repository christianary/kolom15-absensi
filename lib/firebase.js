// Firebase Realtime Database client configuration
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAjf7eq9lpwLLPzWFbAI_KtxL-YYv_SnW0",
  authDomain: "kolom15-absensi.firebaseapp.com",
  databaseURL: "https://kolom15-absensi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kolom15-absensi",
  storageBucket: "kolom15-absensi.firebasestorage.app",
  messagingSenderId: "1039041889844",
  appId: "1:1039041889844:web:91a704daf4a84ca462ec61",
  measurementId: "G-VQ7DZ02XM8"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
