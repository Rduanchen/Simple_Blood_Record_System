import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp: admin.app.App;

// check environment variables
if (process.env.FIREBASE_CONFIG === undefined) {
  throw new Error('FIREBASE_CONFIG is not defined in .env file');
}
if (process.env.FIREBASE_CONFIG === '') {
  throw new Error('FIREBASE_CONFIG is empty in .env file');
}

export const initFirebase = (): void => {
  if (admin.apps.length === undefined || admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG!);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    firebaseApp = admin.app();
  }
};

export const getFirebaseAuth = (): admin.auth.Auth => {
  if (admin.apps.length === undefined || admin.apps.length === 0) {
    initFirebase();
  }
  return admin.auth();
};

export const getFirebaseMessaging = (): admin.messaging.Messaging => {
  if (admin.apps.length === undefined || admin.apps.length === 0) {
    initFirebase();
  }
  return admin.messaging();
};
