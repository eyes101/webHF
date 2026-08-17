// src/firestore.js — shared Admin SDK Firestore handle used by every route.
import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export { admin };
