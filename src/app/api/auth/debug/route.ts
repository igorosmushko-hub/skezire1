import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwtSecret = process.env.AUTH_JWT_SECRET;
  const fbApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const fbAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const fbProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  let firebaseParsed = 'not_attempted';
  if (firebaseKey) {
    // Try raw JSON first
    if (firebaseKey.trimStart().startsWith('{')) {
      try {
        const json = JSON.parse(firebaseKey);
        firebaseParsed = `ok_raw_json, project_id=${json.project_id}`;
      } catch (err) {
        firebaseParsed = `raw_json_parse_error: ${err instanceof Error ? err.message : String(err)}`;
      }
    } else {
      // Try base64
      try {
        const decoded = Buffer.from(firebaseKey, 'base64').toString();
        const json = JSON.parse(decoded);
        firebaseParsed = `ok_base64, project_id=${json.project_id}`;
      } catch (err) {
        firebaseParsed = `base64_parse_error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
  }

  return NextResponse.json({
    _version: 'v3',
    FIREBASE_SERVICE_ACCOUNT_KEY: firebaseKey
      ? `set (${firebaseKey.length} chars, first20: ${JSON.stringify(firebaseKey.slice(0, 20))})`
      : 'NOT SET',
    FIREBASE_KEY_PARSED: firebaseParsed,
    SUPABASE_URL: supabaseUrl ? `set (${supabaseUrl})` : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey
      ? `set (${supabaseKey.length} chars)`
      : 'NOT SET',
    AUTH_JWT_SECRET: jwtSecret
      ? `set (${jwtSecret.length} chars)`
      : 'NOT SET',
    NEXT_PUBLIC_FIREBASE_API_KEY: fbApiKey || 'NOT SET',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: fbAuthDomain || 'NOT SET',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: fbProjectId || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
