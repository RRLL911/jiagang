// 公开 API：文章列表 GET /api/articles
import { jsonResponse } from '../_shared.js';

const CREATE_ARTICLES_TABLE = `
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    cover_icon TEXT,
    cover_image_url TEXT,
    category TEXT,
    author TEXT,
    published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published INTEGER NOT NULL DEFAULT 1,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

async function ensureTable(env) {
  await env.DB.prepare(CREATE_ARTICLES_TABLE).run();
}

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || '';
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  try {
    await ensureTable(env);
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
