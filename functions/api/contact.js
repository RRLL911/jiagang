// 处理官网留言提交 POST /api/contact
import { jsonResponse } from '../_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 确保表存在（首次部署自动建表）
    await env.DB.prepare(`
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
    `).run();

    const body = await request.json();
    const { name, phone, company, type, message } = body;

    if (!name || !phone || !type) {
      return jsonResponse({ error: '姓名、电话和需求类型为必填项' }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO contacts (name, phone, company, type, message) VALUES (?, ?, ?, ?, ?)`
    ).bind(name, phone, company || '', type, message || '').run();

    return jsonResponse({ success: true, message: '留言已提交' });
  } catch (err) {
    return jsonResponse({ error: '提交失败', detail: err.message }, 500);
  }
}
