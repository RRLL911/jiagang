// 公开 API：产品详情 GET /api/products/:slug（同时兜底处理 /api/products 根路径列表）
import { jsonResponse } from '../../_shared.js';
import { onRequestGet as onRequestGetList } from './index.js';

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
  const { env } = context;
  const slug = context.params.slug;
  if (!slug) return onRequestGetList(context);

  try {
    await ensureTables(env);
    const product = await env.DB.prepare(
      `SELECT * FROM products WHERE slug = ? AND is_published = 1`
    ).bind(slug).first();

    if (!product) return jsonResponse({ error: '产品不存在' }, 404);

    const { results: features } = await env.DB.prepare(
      `SELECT id, title, description, icon, sort_order FROM product_features WHERE product_id = ? ORDER BY sort_order ASC`
    ).bind(product.id).all();

    const { results: parameters } = await env.DB.prepare(
      `SELECT id, label, value, sort_order FROM product_parameters WHERE product_id = ? ORDER BY sort_order ASC`
    ).bind(product.id).all();

    return jsonResponse({ ...product, features: features || [], parameters: parameters || [] });
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
