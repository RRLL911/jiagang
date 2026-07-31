// 管理后台统计 GET /admin/api/stats
import { requireAuth, jsonResponse } from '../../_shared.js';

const CREATE_CONTACTS_TABLE = `
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    type TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

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

async function ensureTables(env) {
  await env.DB.prepare(CREATE_CONTACTS_TABLE).run();
  await env.DB.prepare(CREATE_PRODUCTS_TABLE).run();
  await env.DB.prepare(CREATE_ARTICLES_TABLE).run();
}

export async function onRequestGet(context) {
  const { user, errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;

  const { env } = context;
  try {
    await ensureTables(env);
    const today = new Date().toISOString().split('T')[0];

    const { results: todayResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts WHERE DATE(created_at) = ?`
    ).bind(today).all();

    const { results: pendingResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts WHERE status = 'pending'`
    ).all();

    const { results: totalContactsResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts`
    ).all();

    const { results: totalProductsResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM products`
    ).all();

    const { results: totalArticlesResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM articles`
    ).all();

    const { results: yesterdayResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts WHERE DATE(created_at) = DATE(?, '-1 day')`
    ).bind(today).all();

    return jsonResponse({
      today: todayResult[0]?.count || 0,
      yesterday: yesterdayResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      total: totalContactsResult[0]?.count || 0,
      products: totalProductsResult[0]?.count || 0,
      articles: totalArticlesResult[0]?.count || 0
    });
  } catch (err) {
    return jsonResponse({ error: '统计失败', detail: err.message }, 500);
  }
}
