// 共享工具函数

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function verifyToken(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const secret = env.JWT_SECRET || 'jiagang-default-secret-change-in-production';
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = await hmacSha256(`${header}.${body}`, secret);
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) {
    return { errorResponse: jsonResponse({ error: '未授权' }, 401) };
  }
  return { user };
}

async function hmacSha256(message, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)));
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str += new Array((4 - (str.length % 4)) % 4 + 1).join('=');
  return atob(str.replace(/\-/g, '+').replace(/\_/g, '/'));
}
