import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayRemove
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5_fiIGrdMr_hgfycHCMek1_Hj60aw3v0",
  authDomain: "appnovios-bed0c.firebaseapp.com",
  projectId: "appnovios-bed0c",
  storageBucket: "appnovios-bed0c.firebasestorage.app",
  messagingSenderId: "1058797232721",
  appId: "1:1058797232721:web:2eefb67d911661a7ec4e70",
  measurementId: "G-V793NWK2EP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export async function registerUser(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with display name
  await updateProfile(userCredential.user, { displayName });
  
  // Create user document
  await createUserDocument(userCredential.user);
  
  return userCredential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  
  // Check if this is a new user
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  if (!userDoc.exists()) {
    await createUserDocument(userCredential.user);
  }
  
  return userCredential.user;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

// Firestore functions
export async function createUserDocument(user: User) {
  const userRef = doc(db, 'users', user.uid);
  
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: new Date(),
    partnerId: null,
    partnerEmail: null,
    partnerRequest: null,
    calendarId: null,
  };
  
  await setDoc(userRef, userData);
}

export async function sendPartnerRequest(currentUserEmail: string, partnerEmail: string) {
  // Find partner by email
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', partnerEmail));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Usuario no encontrado');
  }
  
  const partnerDoc = querySnapshot.docs[0];
  const partnerData = partnerDoc.data();
  
  // Check if partner already has a partner
  if (partnerData.partnerId) {
    throw new Error('El usuario ya tiene una pareja');
  }
  
  // Update partner with request
  await updateDoc(doc(db, 'users', partnerDoc.id), {
    partnerRequest: currentUserEmail
  });
}

export async function acceptPartnerRequest(currentUserId: string, partnerEmail: string) {
  // Find partner by email
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', partnerEmail));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Pareja no encontrada');
  }
  
  const partnerDoc = querySnapshot.docs[0];
  const partnerId = partnerDoc.id;
  
  // Create a new calendar ID
  const calendarId = `${currentUserId}_${partnerId}`;
  
  // Update current user
  await updateDoc(doc(db, 'users', currentUserId), {
    partnerId,
    partnerEmail,
    partnerRequest: null,
    calendarId
  });
  
  // Update partner
  await updateDoc(doc(db, 'users', partnerId), {
    partnerId: currentUserId,
    partnerEmail: auth.currentUser?.email || '',
    partnerRequest: null,
    calendarId
  });
  
  // Create calendar document
  await setDoc(doc(db, 'calendars', calendarId), {
    owners: [currentUserId, partnerId],
    createdAt: new Date(),
    events: []
  });
  
  return calendarId;
}

export async function deleteCalendarEvent(calendarId: string, eventId: string) {
  const calendarRef = doc(db, 'calendars', calendarId);
  const calendarDoc = await getDoc(calendarRef);
  
  if (!calendarDoc.exists()) {
    throw new Error('Calendario no encontrado');
  }
  
  const events = calendarDoc.data().events;
  const eventToDelete = events.find((event: any) => event.id === eventId);
  
  if (!eventToDelete) {
    throw new Error('Evento no encontrado');
  }
  
  await updateDoc(calendarRef, {
    events: arrayRemove(eventToDelete)
  });
}

export { auth, db };