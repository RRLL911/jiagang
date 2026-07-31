// 管理员登录 POST /admin/api/login

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'jiagang2026';
const SALT = new TextEncoder().encode('jiagang-salt-2026');

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return jsonResponse(
      { error: '数据库未绑定', detail: '请在 wrangler.toml 中配置有效的 database_id 并重新部署，或检查 D1 绑定名称是否为 DB。' },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: '请求体必须是 JSON' }, 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return jsonResponse({ error: '用户名和密码不能为空' }, 400);
  }

  try {
    // 如果没有管理员账户，自动创建默认账户
    let admin = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
    if (!admin && username === DEFAULT_ADMIN_USERNAME) {
      const hash = await hashPassword(password);
      await env.DB.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').bind(username, hash).run();
      admin = { username, password_hash: hash };
    }

    if (!admin) {
      return jsonResponse({ error: '用户名或密码错误' }, 401);
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return jsonResponse({ error: '用户名或密码错误' }, 401);
    }

    const token = await createToken({ username }, env);
    return jsonResponse({ success: true, token });
  } catch (err) {
    return jsonResponse({ error: '登录失败', detail: err.message }, 500);
  }
}

async function hashPassword(password) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: SALT, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

async function createToken(payload, env) {
  const secret = env.JWT_SECRET || 'jiagang-default-secret-change-in-production';
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + 60 * 60 * 24 }; // 24小时有效
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signingInput = `${encodedHeader}.${encodedBody}`;
  const signature = await hmacSha256(signingInput, secret);
  return `${signingInput}.${signature}`;
}

async function hmacSha256(message, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bytesToBase64(new Uint8Array(sig)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncode(str) {
  return bytesToBase64(new TextEncoder().encode(str))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function bytesToBase64(bytes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    const b2 = i < bytes.length ? bytes[i++] : null;
    const b3 = i < bytes.length ? bytes[i++] : null;
    const bitmap = (b1 << 16) | ((b2 ?? 0) << 8) | (b3 ?? 0);
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += b2 !== null ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += b3 !== null ? chars.charAt(bitmap & 63) : '=';
  }
  return result;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
