// 管理后台 API：页面内容块详情 / 更新 / 删除
// PATCH /admin/api/page-blocks/:id
// DELETE /admin/api/page-blocks/:id
import { requireAuth, jsonResponse } from '../../../_shared.js';

export async function onRequestPatch(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { request, env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少内容块 ID' }, 400);

  try {
    const body = await request.json();
    const { value, label, sort_order, is_published } = body;

    const fields = [];
    const values = [];
    const add = (key, val) => { if (val !== undefined) { fields.push(`${key} = ?`); values.push(val); } };
    add('value', value);
    add('label', label);
    add('sort_order', sort_order);
    if (is_published !== undefined) fields.push('is_published = ?'), values.push(is_published ? 1 : 0);

    if (!fields.length) {
      return jsonResponse({ error: '没有要更新的字段' }, 400);
    }

    values.push(id);
    await env.DB.prepare(`UPDATE page_blocks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...values).run();
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
  if (!id) return jsonResponse({ error: '缺少内容块 ID' }, 400);

  try {
    await env.DB.prepare(`DELETE FROM page_blocks WHERE id = ?`).bind(id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '删除失败', detail: err.message }, 500);
  }
}
