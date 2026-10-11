import { NextRequest } from 'next/server';

export async function datingAuth(req: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const access = req.cookies.get('sp_access')?.value;
  if (!url || !anon || !service) return null;
  if (!access) return null;
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${access}` }, cache: 'no-store' });
  if (!response.ok) return null;
  const user = await response.json();
  if (!user.id || !user.email_confirmed_at) return null;
  return { id: user.id as string, url, service };
}

export function database(auth: { url: string; service: string }, path: string, init: RequestInit = {}) {
  return fetch(`${auth.url}/rest/v1/${path}`, { ...init, headers: { apikey: auth.service, Authorization: `Bearer ${auth.service}`, 'Content-Type': 'application/json', ...init.headers }, cache: 'no-store' });
}

export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  return origin === new URL(req.url).origin;
}
