// 管理后台 API：站点配置
// GET /admin/api/settings
// PUT /admin/api/settings
import { requireAuth, jsonResponse } from '../../_shared.js';

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
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;

  try {
    await ensureTables(env);
    const { results: settingsRows } = await env.DB.prepare(`SELECT key, value, group_name FROM company_settings`).all();
    const { results: stats } = await env.DB.prepare(
      `SELECT id, title, value, unit, description, icon, section, sort_order, is_published FROM company_stats ORDER BY section, sort_order`
    ).all();

    const settings = {};
    for (const row of settingsRows || []) {
      settings[row.key] = row.value;
    }

    return jsonResponse({ settings, stats: stats || [] });
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}

export async function onRequestPut(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { request, env } = context;

  try {
    await ensureTables(env);
    const body = await request.json();
    const { settings = {}, stats = [] } = body;

    // 更新/插入 settings
    for (const [key, value] of Object.entries(settings)) {
      await env.DB.prepare(
        `INSERT INTO company_settings (key, value, group_name) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(key, value == null ? '' : String(value), 'custom').run();
    }

    // 全量替换 stats（按 id 更新，新增没有 id 的）
    const existingIds = [];
    for (const s of stats) {
      if (s.id) {
        existingIds.push(s.id);
        await env.DB.prepare(
          `UPDATE company_stats SET title = ?, value = ?, unit = ?, description = ?, icon = ?, section = ?, sort_order = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(s.title, s.value || '', s.unit || '', s.description || '', s.icon || '', s.section || 'about_stats', s.sort_order || 0, s.is_published ? 1 : 0, s.id).run();
      } else {
        await env.DB.prepare(
          `INSERT INTO company_stats (title, value, unit, description, icon, section, sort_order, is_published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(s.title, s.value || '', s.unit || '', s.description || '', s.icon || '', s.section || 'about_stats', s.sort_order || 0, s.is_published ? 1 : 0).run();
      }
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '保存失败', detail: err.message }, 500);
  }
}
