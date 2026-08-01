// 管理后台 API：页面内容块列表 / 创建
// GET /admin/api/page-blocks
// POST /admin/api/page-blocks
import { requireAuth, jsonResponse } from '../../_shared.js';

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
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;
  const url = new URL(context.request.url);
  const page = url.searchParams.get('page') || '';
  const section = url.searchParams.get('section') || '';

  try {
    await ensureTable(env);
    let sql = `SELECT id, page, section, key, type, value, label, sort_order, is_published FROM page_blocks WHERE 1=1`;
    const params = [];
    if (page) {
      sql += ` AND page = ?`;
      params.push(page);
    }
    if (section) {
      sql += ` AND section = ?`;
      params.push(section);
    }
    sql += ` ORDER BY page, section, sort_order, key`;

    const { results } = await env.DB.prepare(sql).bind(...params).all();
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
    const { page, section, key, type = 'text', value = '', label = '', sort_order = 0, is_published = 1 } = body;

    if (!page || !section || !key) {
      return jsonResponse({ error: '页面、区块和键名不能为空' }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO page_blocks (page, section, key, type, value, label, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(page, section, key, type, value, label, sort_order, is_published ? 1 : 0).run();

    return jsonResponse({ success: true, id: result.meta?.last_row_id });
  } catch (err) {
    return jsonResponse({ error: '创建失败', detail: err.message }, 500);
  }
}
