// 公开 API：文章列表 GET /api/articles
import { jsonResponse } from '../_shared.js';

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || '';
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  try {
    let sql = `SELECT id, title, summary, cover_icon, cover_image_url, category, author, published_at, view_count, created_at
                 FROM articles WHERE is_published = 1`;
    const params = [];
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    sql += ` ORDER BY published_at DESC LIMIT ?`;
    params.push(Math.min(limit, 200));

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return jsonResponse(results || []);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
