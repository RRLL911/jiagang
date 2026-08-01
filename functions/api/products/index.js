// 公开 API：产品列表 GET /api/products
import { jsonResponse } from '../../_shared.js';

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

const DEFAULT_PRODUCTS = [
  { name: 'LL-A 立式刮刀卸料离心脱水机', slug: 'll-a-centrifuge', summary: '末精煤、末中煤脱水；入料粒度 0–13mm；立式刮刀卸料防堵、独立稀油站强制润滑。', icon: 'refresh-cw', category: '脱水设备', sort_order: 1, is_featured: 1 },
  { name: '机械搅拌式浮选机', slug: 'mechanical-flotation-machine', summary: '-0.5mm 细粒煤泥分选；自吸矿浆+自吸空气；叶轮-定子组优化，精煤回收率高。', icon: 'droplets', category: '分选设备', sort_order: 2, is_featured: 1 },
  { name: '跳汰机及跳汰成套设备', slug: 'jig-machine', summary: '粗、中粒煤排矸与分选；单机或成套；电控、排料、风阀按煤质配置。', icon: 'arrow-up-down', category: '分选设备', sort_order: 3, is_featured: 0 },
  { name: '旋流器及旋流器组', slug: 'hydrocyclone', summary: '分级、浓缩、重介分选三用；耐磨衬里与进料压力段可改型。', icon: 'target', category: '分选设备', sort_order: 4, is_featured: 0 },
  { name: '高频筛 / 弧形筛', slug: 'high-frequency-screen', summary: '脱水、脱介、分级；常与离心机、旋流器串联形成小段工艺。', icon: 'layout-grid', category: '筛分设备', sort_order: 5, is_featured: 0 },
  { name: '自产配件', slug: 'spare-parts', summary: '筛篮、不锈钢焊接筛网、筛板、旋流器衬件、浮选机叶轮定子、离心机刮刀。', icon: 'package', category: '配件', sort_order: 6, is_featured: 0 }
];

async function ensureTables(env) {
  await env.DB.prepare(CREATE_PRODUCTS_TABLE).run();

  // 如果表为空，插入默认产品
  const { results } = await env.DB.prepare(`SELECT COUNT(*) as count FROM products`).all();
  if (results && results[0].count === 0) {
    for (const p of DEFAULT_PRODUCTS) {
      await env.DB.prepare(
        `INSERT INTO products (name, slug, summary, icon, category, sort_order, is_featured, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(p.name, p.slug, p.summary, p.icon, p.category, p.sort_order, p.is_featured).run();
    }
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || '';
  const featured = url.searchParams.get('featured');

  try {
    await ensureTables(env);
    let sql = `SELECT id, name, slug, summary, icon, image_url, category, sort_order, is_featured, is_published, created_at
                 FROM products WHERE is_published = 1`;
    const params = [];
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (featured === '1') {
      sql += ` AND is_featured = 1`;
    }
    sql += ` ORDER BY sort_order ASC, created_at DESC`;

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return jsonResponse(results || []);
  } catch (err) {
    return jsonResponse({ error: '查询失败', detail: err.message }, 500);
  }
}
