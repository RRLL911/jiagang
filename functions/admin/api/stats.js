// 管理后台统计 GET /admin/api/stats
import { requireAuth, jsonResponse } from '../../_shared.js';

export async function onRequestGet(context) {
  const { user, errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;

  const { env } = context;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { results: todayResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts WHERE DATE(created_at) = ?`
    ).bind(today).all();

    const { results: pendingResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts WHERE status = 'pending'`
    ).all();

    const { results: totalResult } = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM contacts`
    ).all();

    return jsonResponse({
      today: todayResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      total: totalResult[0]?.count || 0
    });
  } catch (err) {
    return jsonResponse({ error: '统计失败', detail: err.message }, 500);
  }
}
