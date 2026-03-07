import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getSupabase } from '@/lib/supabase';
import { signSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { idToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { idToken } = body;
  if (!idToken) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  try {
    // 1. Verify Firebase ID token
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: 'auth_not_configured' }, { status: 503 });
    }
    const decoded = await adminAuth.verifyIdToken(idToken);
    const phone = decoded.phone_number;
    if (!phone) {
      return NextResponse.json({ error: 'no_phone' }, { status: 400 });
    }

    // 2. Upsert user in Supabase
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
    }
    const { data: existing } = await supabase
      .from('users')
      .select('id, phone, usage_count, paid_generations')
      .eq('phone', phone)
      .single();

    let user;
    if (existing) {
      user = existing;
    } else {
      const { data: created, error } = await supabase
        .from('users')
        .insert({ phone })
        .select('id, phone, usage_count, paid_generations')
        .single();
      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: 'db_error' }, { status: 500 });
      }
      user = created;
    }

    // 3. Sign JWT session token
    const sessionToken = signSessionToken({ userId: user.id, phone: user.phone });

    // 4. Set httpOnly cookie and return user
    const res = NextResponse.json({ user: { id: user.id, phone: user.phone } });
    res.cookies.set('sb-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    return res;
  } catch (err) {
    console.error('Auth verify error:', err);
    return NextResponse.json({ error: 'auth_error' }, { status: 401 });
  }
}
