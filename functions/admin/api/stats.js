// 管理后台统计 GET /admin/api/stats
import { requireAuth, jsonResponse } from '../../../_shared.js';

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
