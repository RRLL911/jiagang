// 管理后台 API：文章列表 / 创建
// GET /admin/api/articles
// POST /admin/api/articles
import { requireAuth, jsonResponse } from '../../_shared.js';

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
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;

  try {
    await ensureTable(env);
    const { results } = await env.DB.prepare(
      `SELECT id, title, summary, cover_icon, cover_image_url, category, author, published_at, is_published, view_count, created_at, updated_at
       FROM articles ORDER BY published_at DESC LIMIT 200`
    ).all();
    return jsonResponse(results || []);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { request, env } = context;

  try {
    await ensureTable(env);
    const body = await request.json();
    const {
      title, summary, content, cover_icon, cover_image_url, category, author,
      published_at, is_published = 1
    } = body;

    if (!title) {
      return jsonResponse({ error: '文章标题不能为空' }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO articles (title, summary, content, cover_icon, cover_image_url, category, author, published_at, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      title, summary || '', content || '', cover_icon || '', cover_image_url || '',
      category || '', author || '', published_at || new Date().toISOString(), is_published ? 1 : 0
    ).run();

    return jsonResponse({ success: true, id: result.meta?.last_row_id });
  } catch (err) {
    return jsonResponse({ error: '创建失败', detail: err.message }, 500);
  }
}
