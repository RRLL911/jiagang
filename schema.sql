-- 唐山嘉港环保科技有限公司官网数据库结构
-- 适用于 Cloudflare D1

-- 留言表
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
);

-- 管理员表（默认账户可在部署后通过脚本或手动插入）
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 默认管理员由 login.js 在首次登录时自动创建（密码：jiagang2026）
-- 生产环境请立即修改默认密码

-- 产品表
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
);

-- 产品卖点/结构特点
CREATE TABLE IF NOT EXISTS product_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 产品技术参数
CREATE TABLE IF NOT EXISTS product_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 技术资讯/新闻文章
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
);

-- 公司基础配置（键值对）
CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    group_name TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 公司关键数据/荣誉/服务能力/制造流程等
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
);

-- 默认站点配置
INSERT OR IGNORE INTO company_settings (key, value, group_name) VALUES
('company_name', '唐山嘉港环保科技有限公司', 'contact'),
('company_slogan', '选煤选矿装备制造商', 'contact'),
('address', '河北省遵化市新店子镇平东线北侧', 'contact'),
('phone', '0315-0000000', 'contact'),
('email', 'contact@jiagang.cn', 'contact'),
('work_time', '周一至周六 08:00–17:30', 'contact'),
('service_regions', '山西、陕西、内蒙古、河北等产煤带', 'contact'),
('copyright_year', '2026', 'contact'),
('seo_title', '唐山嘉港环保科技有限公司 - 选煤选矿设备研发制造', 'seo'),
('seo_description', '立式刮刀卸料离心脱水机、机械搅拌式浮选机、跳汰机及成套设备，服务山西、陕西、内蒙古、河北等产煤带。', 'seo'),
('hero_title', '选煤选矿装备<br/>研发制造一体化服务商', 'home'),
('hero_subtitle', '立式刮刀卸料离心脱水机、机械搅拌式浮选机、跳汰机及成套设备，服务山西、陕西、内蒙古、河北等产煤带。', 'home'),
('hero_tag', '国家级高新技术企业', 'home'),
('about_intro', '唐山嘉港环保科技有限公司专注于选煤选矿装备的研发、制造与销售。', 'about');

-- 默认公司关键数据
INSERT OR IGNORE INTO company_stats (title, value, unit, description, icon, section, sort_order) VALUES
('高级工程师', '8', '人', '核心研发团队', 'users', 'about_stats', 1),
('技术人员', '40', '人', '制造与技术服务团队', 'wrench', 'about_stats', 2),
('厂区占地', '3', '万㎡', '生产制造基地', 'factory', 'about_stats', 3),
('建筑面积', '1', '万㎡', '现代化厂房', 'building-2', 'about_stats', 4),
('筛篮年产能', '1200', '件', '离心机筛篮', 'gauge', 'parts_capacity', 1),
('不锈钢焊接筛网', '1', '万㎡', '筛网类产品', 'grid-3x3', 'parts_capacity', 2),
('筛板', '4000', '㎡', '筛板类产品', 'layout-grid', 'parts_capacity', 3);

-- 索引
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_company_stats_section ON company_stats(section);
