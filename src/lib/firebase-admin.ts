import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let _auth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (!_auth) {
    if (getApps().length === 0) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is required');
      }
      const serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString());
      initializeApp({ credential: cert(serviceAccount) });
    }
    _auth = getAuth();
  }
  return _auth;
}
