// 公开 API：产品列表 GET /api/products
import { jsonResponse } from '../_shared.js';

const CREATE_PRODUCTS_TABLE = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    category TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

async function ensureTables(env) {
  await env.DB.prepare(CREATE_PRODUCTS_TABLE).run();
}

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || '';
  const featured = url.searchParams.get('featured');

  try {
    await ensureTables(env);
    let sql = `SELECT id, name, slug, summary, icon, image_url, category, sort_order, is_featured, is_published, created_at
                 FROM products WHERE is_published = 1`;
    const params = [];
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (featured === '1') {
      sql += ` AND is_featured = 1`;
    }
    sql += ` ORDER BY sort_order ASC, created_at DESC`;

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return jsonResponse(results || []);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
