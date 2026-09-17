import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Using 'require' bypasses TypeScript's strict JSON import rules
const serviceAccount = require('../serviceAccountKey.json');

// Check if any apps are already initialized (prevents Next.js hot-reload crashes)
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export const db = getFirestore();