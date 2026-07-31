// 管理后台 API：产品详情 / 更新 / 删除
// GET /admin/api/products/:id
// PATCH /admin/api/products/:id
// DELETE /admin/api/products/:id
import { requireAuth, jsonResponse } from '../../../../_shared.js';

export async function onRequestGet(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少产品 ID' }, 400);

  try {
    const product = await env.DB.prepare(`SELECT * FROM products WHERE id = ?`).bind(id).first();
    if (!product) return jsonResponse({ error: '产品不存在' }, 404);

    const { results: features } = await env.DB.prepare(
      `SELECT id, title, description, icon, sort_order FROM product_features WHERE product_id = ? ORDER BY sort_order ASC`
    ).bind(id).all();

    const { results: parameters } = await env.DB.prepare(
      `SELECT id, label, value, sort_order FROM product_parameters WHERE product_id = ? ORDER BY sort_order ASC`
    ).bind(id).all();

    return jsonResponse({ ...product, features: features || [], parameters: parameters || [] });
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}

export async function onRequestPatch(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { request, env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少产品 ID' }, 400);

  try {
    const body = await request.json();
    const {
      name, slug, summary, description, icon, image_url, category,
      sort_order, is_featured, is_published,
      features, parameters
    } = body;

    const existing = await env.DB.prepare(`SELECT id FROM products WHERE id = ?`).bind(id).first();
    if (!existing) return jsonResponse({ error: '产品不存在' }, 404);

    if (slug && !/^[a-z0-9_-]+$/i.test(slug)) {
      return jsonResponse({ error: '产品标识只能包含字母、数字、下划线和横线' }, 400);
    }

    // 构建动态更新
    const fields = [];
    const values = [];
    const add = (key, val) => { if (val !== undefined) { fields.push(`${key} = ?`); values.push(val); } };
    add('name', name);
    add('slug', slug);
    add('summary', summary);
    add('description', description);
    add('icon', icon);
    add('image_url', image_url);
    add('category', category);
    add('sort_order', sort_order);
    if (is_featured !== undefined) fields.push('is_featured = ?'), values.push(is_featured ? 1 : 0);
    if (is_published !== undefined) fields.push('is_published = ?'), values.push(is_published ? 1 : 0);

    if (fields.length) {
      values.push(id);
      await env.DB.prepare(`UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...values).run();
    }

    // 全量替换 features
    if (Array.isArray(features)) {
      await env.DB.prepare(`DELETE FROM product_features WHERE product_id = ?`).bind(id).run();
      for (const f of features) {
        if (!f.title) continue;
        await env.DB.prepare(
          `INSERT INTO product_features (product_id, title, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)`
        ).bind(id, f.title, f.description || '', f.icon || '', f.sort_order || 0).run();
      }
    }

    // 全量替换 parameters
    if (Array.isArray(parameters)) {
      await env.DB.prepare(`DELETE FROM product_parameters WHERE product_id = ?`).bind(id).run();
      for (const p of parameters) {
        if (!p.label || p.value === undefined) continue;
        await env.DB.prepare(
          `INSERT INTO product_parameters (product_id, label, value, sort_order) VALUES (?, ?, ?, ?)`
        ).bind(id, p.label, p.value, p.sort_order || 0).run();
      }
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '更新失败', detail: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const { errorResponse } = await requireAuth(context);
  if (errorResponse) return errorResponse;
  const { env } = context;
  const id = context.params.id;
  if (!id) return jsonResponse({ error: '缺少产品 ID' }, 400);

  try {
    await env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: '删除失败', detail: err.message }, 500);
  }
}
