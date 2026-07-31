// 公开 API：文章详情 GET /api/articles/:id
import { jsonResponse } from '../../_shared.js';

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
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少文章 ID' }, 400);

  try {
    await ensureTable(env);
    const article = await env.DB.prepare(
      `SELECT * FROM articles WHERE id = ? AND is_published = 1`
    ).bind(id).first();

    if (!article) return jsonResponse({ error: '文章不存在' }, 404);

    // 异步增加浏览量，不阻塞响应
    env.DB.prepare(`UPDATE articles SET view_count = view_count + 1 WHERE id = ?`).bind(id).run().catch(() => {});

    return jsonResponse(article);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
