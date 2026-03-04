import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let _auth: Auth | null = null;

export function getAdminAuth(): Auth | null {
  if (!_auth) {
    if (getApps().length === 0) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!raw) {
        console.error('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY is not set');
        return null;
      }
      try {
        console.log('[Firebase Admin] Key length:', raw.length);
        // Support both raw JSON and base64-encoded JSON
        let serviceAccount;
        if (raw.trimStart().startsWith('{')) {
          serviceAccount = JSON.parse(raw);
        } else {
          serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString());
        }
        console.log('[Firebase Admin] Parsed project_id:', serviceAccount.project_id);
        initializeApp({ credential: cert(serviceAccount) });
      } catch (err) {
        console.error('[Firebase Admin] Init failed:', err);
        return null;
      }
    }
    _auth = getAuth();
  }
  return _auth;
}
