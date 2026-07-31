// 公开 API：产品详情 GET /api/products/:slug
import { jsonResponse } from '../../_shared.js';

export async function onRequestGet(context) {
  const { env } = context;
  const slug = context.params.slug;
  if (!slug) return jsonResponse({ error: '缺少产品标识' }, 400);

  try {
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
