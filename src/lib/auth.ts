import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'dev-secret-change-me';

export interface SessionUser {
  userId: string;
  phone: string;
}

export function signSessionToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}

export function getSessionUser(req: NextRequest): SessionUser | null {
  const token = req.cookies.get('sb-session')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}
