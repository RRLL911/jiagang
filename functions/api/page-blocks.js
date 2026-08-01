// 公开 API：页面内容块 GET /api/page-blocks?page=...
// 只返回已发布的内容块，供前端页面自动填充。
import { jsonResponse } from '../_shared.js';

const CREATE_PAGE_BLOCKS_TABLE = `
  CREATE TABLE IF NOT EXISTS page_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    value TEXT,
    label TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page, section, key)
  )
`;

async function ensureTable(env) {
  await env.DB.prepare(CREATE_PAGE_BLOCKS_TABLE).run();
}

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const page = url.searchParams.get('page') || '';

  try {
    await ensureTable(env);
    let sql = `SELECT page, section, key, type, value, label, sort_order FROM page_blocks WHERE is_published = 1`;
    const params = [];
    if (page) {
      sql += ` AND page = ?`;
      params.push(page);
    }
    sql += ` ORDER BY page, section, sort_order, key`;

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return jsonResponse(results || []);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
