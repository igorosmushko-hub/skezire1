import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let initialized = false;

/**
 * Lazily initialize Firebase only when needed (login modal).
 * This keeps ~218KB of Firebase JS out of the initial page bundle.
 */
export async function getFirebaseAuth(): Promise<Auth | null> {
  if (initialized) return auth;
  initialized = true;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');

    app = getApps().length === 0
      ? initializeApp({
          apiKey,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        })
      : getApps()[0];

    auth = getAuth(app);
    return auth;
  } catch {
    return null;
  }
}
