// 管理后台 API：文章详情 / 更新 / 删除
// GET /admin/api/articles/:id
// PATCH /admin/api/articles/:id
// DELETE /admin/api/articles/:id
import { requireAuth, jsonResponse } from '../../../_shared.js';

export async function onRequestGet(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少文章 ID' }, 400);

  try {
    const article = await env.DB.prepare(`SELECT * FROM articles WHERE id = ?`).bind(id).first();
    if (!article) return jsonResponse({ error: '文章不存在' }, 404);
    return jsonResponse(article);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}

export async function onRequestPatch(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { request, env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少文章 ID' }, 400);

  try {
    const body = await request.json();
    const {
      title, summary, content, cover_icon, cover_image_url, category, author,
      published_at, is_published, view_count
    } = body;

    const existing = await env.DB.prepare(`SELECT id FROM articles WHERE id = ?`).bind(id).first();
    if (!existing) return jsonResponse({ error: '文章不存在' }, 404);

    const fields = [];
    const values = [];
    const add = (key, val) => { if (val !== undefined) { fields.push(`${key} = ?`); values.push(val); } };
    add('title', title);
    add('summary', summary);
    add('content', content);
    add('cover_icon', cover_icon);
    add('cover_image_url', cover_image_url);
    add('category', category);
    add('author', author);
    add('published_at', published_at);
    add('view_count', view_count);
    if (is_published !== undefined) fields.push('is_published = ?'), values.push(is_published ? 1 : 0);

    if (fields.length) {
      values.push(id);
      await env.DB.prepare(`UPDATE articles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...values).run();
    }

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
  if (!id) return jsonResponse({ error: '缺少文章 ID' }, 400);

  try {
    await env.DB.prepare(`DELETE FROM articles WHERE id = ?`).bind(id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '删除失败', detail: err.message }, 500);
  }
}
