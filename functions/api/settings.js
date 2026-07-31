// 公开 API：站点配置 GET /api/settings
import { jsonResponse } from '../_shared.js';

const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    group_name TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const CREATE_STATS_TABLE = `
  CREATE TABLE IF NOT EXISTS company_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    value TEXT,
    unit TEXT,
    description TEXT,
    icon TEXT,
    section TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

async function ensureTables(env) {
  await env.DB.prepare(CREATE_SETTINGS_TABLE).run();
  await env.DB.prepare(CREATE_STATS_TABLE).run();
}

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const group = url.searchParams.get('group') || '';

  try {
    await ensureTables(env);
    let sql = `SELECT key, value, group_name FROM company_settings`;
    const params = [];
    if (group) {
      sql += ` WHERE group_name = ?`;
      params.push(group);
    }
    const { results } = await env.DB.prepare(sql).bind(...params).all();

    const settings = {};
    for (const row of results || []) {
      settings[row.key] = row.value;
    }

    // 常用分组数据
    const { results: stats } = await env.DB.prepare(
      `SELECT title, value, unit, description, icon, section, sort_order FROM company_stats WHERE is_published = 1 ORDER BY section, sort_order`
    ).all();

    return jsonResponse({ settings, stats: stats || [] });
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
