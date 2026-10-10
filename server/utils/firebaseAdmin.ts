import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase applet configuration
const configPath = path.resolve(__dirname, '../../firebase-applet-config.json');
let firebaseConfig: Record<string, any> = {};
if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err: any) {
    console.error('[Firebase Admin] Error parsing firebase-applet-config.json:', err.message);
  }
}

// Configured store administrator email
export const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  firebaseConfig.adminEmail ||
  'rk00614005@gmail.com'
).toLowerCase().trim();

// Initialize singleton Firebase Admin SDK instance
let adminApp: App;
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.GCS_BUCKET ||
    firebaseConfig.storageBucket;

  adminApp = initializeApp({
    projectId,
    storageBucket,
  });
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
export { adminApp, firebaseConfig };
