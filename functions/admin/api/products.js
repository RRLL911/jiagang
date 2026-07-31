// 管理后台 API：产品列表 / 创建
// GET /admin/api/products
// POST /admin/api/products
import { requireAuth, jsonResponse } from '../../_shared.js';

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

const CREATE_FEATURES_TABLE = `
  CREATE TABLE IF NOT EXISTS product_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )
`;

const CREATE_PARAMETERS_TABLE = `
  CREATE TABLE IF NOT EXISTS product_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )
`;

async function ensureTables(env) {
  await env.DB.prepare(CREATE_PRODUCTS_TABLE).run();
  await env.DB.prepare(CREATE_FEATURES_TABLE).run();
  await env.DB.prepare(CREATE_PARAMETERS_TABLE).run();
}

export async function onRequestGet(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;

  try {
    await ensureTables(env);
    const { results } = await env.DB.prepare(
      `SELECT id, name, slug, summary, icon, image_url, category, sort_order, is_featured, is_published, created_at, updated_at
       FROM products ORDER BY sort_order ASC, created_at DESC LIMIT 200`
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
    await ensureTables(env);
    const body = await request.json();
    const {
      name, slug, summary, description, icon, image_url, category,
      sort_order = 0, is_featured = 0, is_published = 1,
      features = [], parameters = []
    } = body;

    if (!name || !slug) {
      return jsonResponse({ error: '产品名称和标识不能为空' }, 400);
    }
    if (!/^[a-z0-9_-]+$/i.test(slug)) {
      return jsonResponse({ error: '产品标识只能包含字母、数字、下划线和横线' }, 400);
    }

    const result = await env.DB.prepare(
      `INSERT INTO products (name, slug, summary, description, icon, image_url, category, sort_order, is_featured, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(name, slug, summary || '', description || '', icon || '', image_url || '', category || '', sort_order, is_featured ? 1 : 0, is_published ? 1 : 0).run();

    const productId = result.meta?.last_row_id;

    if (productId && features.length) {
      for (const f of features) {
        await env.DB.prepare(
          `INSERT INTO product_features (product_id, title, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)`
        ).bind(productId, f.title, f.description || '', f.icon || '', f.sort_order || 0).run();
      }
    }
    if (productId && parameters.length) {
      for (const p of parameters) {
        await env.DB.prepare(
          `INSERT INTO product_parameters (product_id, label, value, sort_order) VALUES (?, ?, ?, ?)`
        ).bind(productId, p.label, p.value, p.sort_order || 0).run();
      }
    }

    return jsonResponse({ success: true, id: productId });
  } catch (err) {
    return jsonResponse({ error: '创建失败', detail: err.message }, 500);
  }
}
