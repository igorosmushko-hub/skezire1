import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let _auth: Auth | null = null;

export function getAdminAuth(): Auth | null {
  if (!_auth) {
    if (getApps().length === 0) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!raw) {
        return null;
      }
      try {
        const serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString());
        initializeApp({ credential: cert(serviceAccount) });
      } catch {
        return null;
      }
    }
    _auth = getAuth();
  }
  return _auth;
}
