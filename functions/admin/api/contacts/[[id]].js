// 管理后台留言接口
// GET /admin/api/contacts      列表
// PATCH /admin/api/contacts/:id 更新状态
// DELETE /admin/api/contacts/:id 删除
import { requireAuth, jsonResponse } from '../../../_shared.js';

const CREATE_CONTACTS_TABLE = `
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    type TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

async function ensureTable(env) {
  await env.DB.prepare(CREATE_CONTACTS_TABLE).run();
}

export async function onRequestGet(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;

  const { env } = context;
  try {
    await ensureTable(env);
    const { results } = await env.DB.prepare(
      `SELECT id, name, phone, company, type, message, status, created_at FROM contacts ORDER BY created_at DESC LIMIT 200`
    ).all();
    return jsonResponse(results || []);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}

export async function onRequestPatch(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;

  const { request, env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少留言 ID' }, 400);

  try {
    await ensureTable(env);
    const body = await request.json();
    const status = body.status;
    if (!['pending', 'done'].includes(status)) {
      return jsonResponse({ error: '状态值无效' }, 400);
    }

    await env.DB.prepare(
      `UPDATE contacts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(status, id).run();

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '更新失败', detail: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;

  const { env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少留言 ID' }, 400);

  try {
    await env.DB.prepare(`DELETE FROM contacts WHERE id = ?`).bind(id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '删除失败', detail: err.message }, 500);
  }
}
