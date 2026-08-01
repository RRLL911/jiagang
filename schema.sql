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

-- 默认产品数据
INSERT OR IGNORE INTO products (name, slug, summary, icon, category, sort_order, is_featured, is_published) VALUES
('LL-A 立式刮刀卸料离心脱水机', 'll-a-centrifuge', '末精煤、末中煤脱水；入料粒度 0–13mm；立式刮刀卸料防堵、独立稀油站强制润滑。', 'refresh-cw', '脱水设备', 1, 1, 1),
('机械搅拌式浮选机', 'mechanical-flotation-machine', '-0.5mm 细粒煤泥分选；自吸矿浆+自吸空气；叶轮-定子组优化，精煤回收率高。', 'droplets', '分选设备', 2, 1, 1),
('跳汰机及跳汰成套设备', 'jig-machine', '粗、中粒煤排矸与分选；单机或成套；电控、排料、风阀按煤质配置。', 'arrow-up-down', '分选设备', 3, 0, 1),
('旋流器及旋流器组', 'hydrocyclone', '分级、浓缩、重介分选三用；耐磨衬里与进料压力段可改型。', 'target', '分选设备', 4, 0, 1),
('高频筛 / 弧形筛', 'high-frequency-screen', '脱水、脱介、分级；常与离心机、旋流器串联形成小段工艺。', 'layout-grid', '筛分设备', 5, 0, 1),
('自产配件', 'spare-parts', '筛篮、不锈钢焊接筛网、筛板、旋流器衬件、浮选机叶轮定子、离心机刮刀。', 'package', '配件', 6, 0, 1);

-- 页面内容块（支持管理每个页面的标题、文字、图片等）
CREATE TABLE IF NOT EXISTS page_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  value TEXT,
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page, section, key)
);

-- 默认首页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('index', 'hero', 'title', 'text', '选煤选矿装备<br/>研发制造一体化服务商', '首页主标题', 1),
('index', 'hero', 'subtitle', 'text', '立式刮刀卸料离心脱水机、机械搅拌式浮选机、跳汰机及成套设备，服务山西、陕西、内蒙古、河北等产煤带。', '首页副标题', 2),
('index', 'hero', 'tag', 'text', '国家级高新技术企业', '首页标签', 3),
('index', 'hero', 'cta_primary', 'text', '浏览产品', '主按钮文字', 4),
('index', 'hero', 'cta_secondary', 'text', '技术咨询', '次按钮文字', 5),
('index', 'hero', 'background_image', 'image', '', '首页背景图', 6),
('index', 'products', 'title', 'text', '核心产品', '产品区标题', 1),
('index', 'products', 'subtitle', 'text', '覆盖选煤厂“分选+脱水”主工艺段', '产品区副标题', 2),
('index', 'stats', 'title', 'text', '关于嘉港环保', '数据区标题', 1),
('index', 'stats', 'intro', 'text', '唐山嘉港环保科技有限公司成立于2018年，位于河北省遵化市新店子镇平东线北侧，注册资金100万元。厂区占地3万平方米、建筑面积1万平方米，现有员工120余人，其中技术人员40人、高级工程师8人。', '数据区简介', 2),
('index', 'stats', 'highlight_1', 'text', '2024 年获评国家级高新技术企业', '数据区亮点1', 3),
('index', 'stats', 'highlight_2', 'text', '2025 年获河北省创新型中小企业认定', '数据区亮点2', 4),
('index', 'stats', 'highlight_3', 'text', '筛篮、筛网、筛板等易耗件自产，年产筛网约1万㎡', '数据区亮点3', 5),
('index', 'stats', 'more_text', 'text', '了解更多', '了解更多按钮', 6),
('index', 'stats', 'stat_1_value', 'text', '8', '数据1数值', 7),
('index', 'stats', 'stat_1_label', 'text', '高级工程师', '数据1标签', 8),
('index', 'stats', 'stat_2_value', 'text', '40', '数据2数值', 9),
('index', 'stats', 'stat_2_label', 'text', '技术人员', '数据2标签', 10),
('index', 'stats', 'stat_3_value', 'text', '3万㎡', '数据3数值', 11),
('index', 'stats', 'stat_3_label', 'text', '厂区占地', '数据3标签', 12),
('index', 'stats', 'stat_4_value', 'text', '1万㎡', '数据4数值', 13),
('index', 'stats', 'stat_4_label', 'text', '建筑面积', '数据4标签', 14),
('index', 'features', 'title', 'text', '服务优势', '优势区标题', 1),
('index', 'features', 'subtitle', 'text', '从研发设计到技改服务，全链路闭环', '优势区副标题', 2),
('index', 'features', 'feature_1_title', 'text', '研发设计', '优势1标题', 3),
('index', 'features', 'feature_1_desc', 'text', '按煤质与现场工况定制设备改型，专利覆盖离心机布料锥、刮刀焊接辅助等核心结构。', '优势1描述', 4),
('index', 'features', 'feature_2_title', 'text', '精密制造', '优势2标题', 5),
('index', 'features', 'feature_2_desc', 'text', '机加工、铆焊、铸造、热处理、动平衡校验全流程自控，确保出厂负载试验合格。', '优势2描述', 6),
('index', 'features', 'feature_3_title', 'text', '技改服务', '优势3标题', 7),
('index', 'features', 'feature_3_desc', 'text', '老厂离心机换代、浮选段扩容、筛网筛篮常年供货，响应快、责任单一。', '优势3描述', 8),
('index', 'cta', 'title', 'text', '需要选型或技改方案？', 'CTA标题', 1),
('index', 'cta', 'subtitle', 'text', '留下您的需求，我们的技术团队将在 24 小时内与您联系。', 'CTA副标题', 2),
('index', 'cta', 'button_text', 'text', '提交', 'CTA按钮文字', 3);

-- 默认产品页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('products', 'hero', 'title', 'text', '产品中心', '产品页标题', 1),
('products', 'hero', 'subtitle', 'text', '覆盖选煤厂“分选+脱水”主工艺段，单机与成套设备可按煤质定制。', '产品页副标题', 2),
('products', 'hero', 'background_image', 'image', '', '产品页背景图', 3),
('products', 'parts', 'title', 'text', '配件供应能力', '配件区标题', 1),
('products', 'parts', 'stat_1_value', 'text', '1200件', '配件数据1数值', 2),
('products', 'parts', 'stat_1_label', 'text', '筛篮年产能', '配件数据1标签', 3),
('products', 'parts', 'stat_2_value', 'text', '1万㎡', '配件数据2数值', 4),
('products', 'parts', 'stat_2_label', 'text', '不锈钢焊接筛网年产能', '配件数据2标签', 5),
('products', 'parts', 'stat_3_value', 'text', '4000㎡', '配件数据3数值', 6),
('products', 'parts', 'stat_3_label', 'text', '筛板年产能', '配件数据3标签', 7);

-- 默认关于我们页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('about', 'hero', 'title', 'text', '关于嘉港环保', '关于页标题', 1),
('about', 'hero', 'subtitle', 'text', '扎根唐山遵化，服务全国选煤选矿行业，以研发设计、精密制造、配件自供、技改服务构建全链路竞争力。', '关于页副标题', 2),
('about', 'intro', 'title', 'text', '企业简介', '简介标题', 1),
('about', 'intro', 'content', 'html', '<p>唐山嘉港环保科技有限公司成立于2018年11月30日，位于河北省遵化市新店子镇平东线北侧，注册资金100万元。公司厂区占地3万平方米、建筑面积1万平方米，现有员工120余人，其中技术人员40人、高级工程师8人。</p><p>公司主营业务覆盖选煤、选矿设备的研发、设计、制造、销售，以及配套配件供应与工程技术服务。产品主要包括LL-A系列立式刮刀卸料离心脱水机、机械搅拌式浮选机、跳汰机及成套设备、旋流器及旋流器组、高频筛与弧形筛等。</p><p>与纯组装型煤机厂最大的区别在于，嘉港环保的筛篮、不锈钢焊接筛网、筛板等易耗件实现自产，拥有两条专业筛网生产线，年产筛网约1万㎡，能够为客户提供更快的配件响应与更稳定的供货保障。</p>', '简介内容', 2),
('about', 'intro', 'image', 'image', '', '简介图片', 3),
('about', 'company', 'title', 'text', '企业信息', '企业信息标题', 1),
('about', 'company', 'label_1', 'text', '公司全称', '信息标签1', 2),
('about', 'company', 'value_1', 'text', '唐山嘉港环保科技有限公司', '信息值1', 3),
('about', 'company', 'label_2', 'text', '成立时间', '信息标签2', 4),
('about', 'company', 'value_2', 'text', '2018年11月30日', '信息值2', 5),
('about', 'company', 'label_3', 'text', '注册资本', '信息标签3', 6),
('about', 'company', 'value_3', 'text', '100万元', '信息值3', 7),
('about', 'company', 'label_4', 'text', '注册地址', '信息标签4', 8),
('about', 'company', 'value_4', 'text', '河北省遵化市新店子镇平东线北侧', '信息值4', 9),
('about', 'company', 'label_5', 'text', '法定代表人', '信息标签5', 10),
('about', 'company', 'value_5', 'text', '杨巧娟', '信息值5', 11),
('about', 'company', 'label_6', 'text', '员工规模', '信息标签6', 12),
('about', 'company', 'value_6', 'text', '120余人', '信息值6', 13),
('about', 'company', 'label_7', 'text', '厂区占地', '信息标签7', 14),
('about', 'company', 'value_7', 'text', '3万平方米', '信息值7', 15),
('about', 'mission', 'title', 'text', '资质荣誉', '资质荣誉标题', 1),
('about', 'honors', 'honor_1_title', 'text', '国家级高新技术企业', '荣誉1标题', 1),
('about', 'honors', 'honor_1_desc', 'text', '2024 年获评，技术实力获国家级认可。', '荣誉1描述', 2),
('about', 'honors', 'honor_2_title', 'text', '河北省创新型中小企业', '荣誉2标题', 3),
('about', 'honors', 'honor_2_desc', 'text', '2025 年认定，持续推动产品迭代。', '荣誉2描述', 4),
('about', 'honors', 'honor_3_title', 'text', '自主知识产权专利', '荣誉3标题', 5),
('about', 'honors', 'honor_3_desc', 'text', '离心机布料锥、刮刀焊接辅助等结构专利。', '荣誉3描述', 6),
('about', 'vision', 'title', 'text', '制造与质控', '制造质控标题', 1),
('about', 'vision', 'content', 'text', '从毛坯到装配，闭环在厂里', '制造质控描述', 2),
('about', 'process', 'process_1_title', 'text', '机加工', '流程1标题', 1),
('about', 'process', 'process_1_desc', 'text', '动平衡试验机、车床、龙门铣、刨插钻磨齐全，关键件一次装夹成型。', '流程1描述', 2),
('about', 'process', 'process_2_title', 'text', '铆焊', '流程2标题', 3),
('about', 'process', 'process_2_desc', 'text', '数控火焰切割、剪板卷板、自动焊，槽体、筛篮、旋流器外壳自主焊接。', '流程2描述', 4),
('about', 'process', 'process_3_title', 'text', '铸造与热处理', '流程3标题', 5),
('about', 'process', 'process_3_desc', 'text', '高频炉、喷丸机，耐磨件热处理自主可控。', '流程3描述', 6),
('about', 'process', 'process_4_title', 'text', '质控链路', '流程4标题', 7),
('about', 'process', 'process_4_desc', 'text', '化学成分分析 → 无损探伤 → 空载/负载试验 → 出厂检验报告。', '流程4描述', 8);

-- 默认技术资讯页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('news', 'hero', 'title', 'text', '技术资讯', '资讯页标题', 1),
('news', 'hero', 'subtitle', 'text', '选煤设备技术解析、维护经验与行业动态。', '资讯页副标题', 2),
('news', 'hero', 'background_image', 'image', '', '资讯页背景图', 3);

-- 默认联系我们页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('contact', 'hero', 'title', 'text', '联系我们', '联系页标题', 1),
('contact', 'hero', 'subtitle', 'text', '无论您需要设备选型、技改方案还是配件报价，欢迎随时与我们联系。', '联系页副标题', 2),
('contact', 'hero', 'background_image', 'image', '', '联系页背景图', 3),
('contact', 'info', 'title', 'text', '在线留言', '联系信息标题', 1),
('contact', 'info', 'form_intro', 'text', '填写以下信息，我们的技术团队将在 24 小时内与您联系。', '表单说明', 2),
('contact', 'info', 'label_name', 'text', '您的称呼 *', '姓名标签', 3),
('contact', 'info', 'label_phone', 'text', '联系电话 *', '电话标签', 4),
('contact', 'info', 'label_company', 'text', '公司名称', '公司标签', 5),
('contact', 'info', 'label_type', 'text', '需求类型', '类型标签', 6),
('contact', 'info', 'label_message', 'text', '需求描述', '描述标签', 7),
('contact', 'info', 'submit_text', 'text', '提交留言', '提交按钮', 8),
('contact', 'info', 'address_title', 'text', '公司地址', '地址标题', 9),
('contact', 'info', 'address_value', 'text', '河北省遵化市新店子镇平东线北侧', '地址内容', 10),
('contact', 'info', 'phone_title', 'text', '联系电话', '电话标题', 11),
('contact', 'info', 'phone_value', 'text', '0315-0000000', '电话内容', 12),
('contact', 'info', 'email_title', 'text', '电子邮箱', '邮箱标题', 13),
('contact', 'info', 'email_value', 'text', 'contact@jiagang.cn', '邮箱内容', 14),
('contact', 'info', 'service_title', 'text', '服务区域', '服务标题', 15),
('contact', 'info', 'service_content', 'text', '嘉港环保设备主要销往山西、陕西、内蒙古、河北等产煤带，同时覆盖铁、金及非金属矿的筛分脱水领域。', '服务内容', 16),
('contact', 'info', 'service_item_1', 'text', '新建选煤厂成套主机供应', '服务项1', 17),
('contact', 'info', 'service_item_2', 'text', '老厂技改与设备换代', '服务项2', 18),
('contact', 'info', 'service_item_3', 'text', '筛网筛篮等易耗件常年供货', '服务项3', 19),
('contact', 'info', 'service_item_4', 'text', '现场技术调试与培训', '服务项4', 20),
('contact', 'info', 'work_time_title', 'text', '工作时间', '工作时间标题', 21),
('contact', 'info', 'work_time', 'text', '周一至周六 08:00–17:30', '工作时间', 22),
('contact', 'info', 'map_embed', 'html', '', '地图嵌入代码', 23);

-- 默认产品详情页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('product-detail', 'overview', 'title', 'text', '产品概述', '概述标题', 1),
('product-detail', 'features', 'title', 'text', '结构特点', '结构特点标题', 1),
('product-detail', 'parameters', 'title', 'text', '典型技术参数', '参数标题', 1),
('product-detail', 'parameters', 'header_item', 'text', '项目', '表头项目', 2),
('product-detail', 'parameters', 'header_value', 'text', '参数', '表头参数', 3),
('product-detail', 'parameters', 'disclaimer', 'text', '* 具体型号参数以实际技术协议为准，可拨打 0315-0000000 获取详细选型手册。', '参数免责声明', 4);

-- 默认文章详情页内容
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('news-detail', 'hero', 'title', 'text', '文章详情', '文章详情标题', 1),
('news-detail', 'common', 'loading_text', 'text', '加载文章中...', '加载提示', 2);

-- 全局站点内容（导航、页脚、面包屑共用文案等）
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('global', 'header', 'nav_home', 'text', '首页', '导航-首页', 1),
('global', 'header', 'nav_about', 'text', '关于我们', '导航-关于我们', 2),
('global', 'header', 'nav_products', 'text', '产品中心', '导航-产品中心', 3),
('global', 'header', 'nav_news', 'text', '技术资讯', '导航-技术资讯', 4),
('global', 'header', 'nav_contact', 'text', '联系我们', '导航-联系我们', 5),
('global', 'footer', 'links_title', 'text', '快速链接', '页脚-链接标题', 1),
('global', 'footer', 'contact_title', 'text', '联系方式', '页脚-联系标题', 2),
('global', 'footer', 'link_home', 'text', '首页', '页脚-首页', 3),
('global', 'footer', 'link_about', 'text', '关于我们', '页脚-关于我们', 4),
('global', 'footer', 'link_products', 'text', '产品中心', '页脚-产品中心', 5),
('global', 'footer', 'link_contact', 'text', '联系我们', '页脚-联系我们', 6),
('global', 'footer', 'copyright_suffix', 'text', '版权所有', '页脚-版权后缀', 7);

-- 首页补充内容块
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('index', 'cta', 'placeholder_name', 'text', '您的称呼', 'CTA表单-姓名占位', 1),
('index', 'cta', 'placeholder_phone', 'text', '联系电话', 'CTA表单-电话占位', 2),
('index', 'products', 'view_detail', 'text', '了解详情', '产品卡片-了解详情', 3);

-- 产品详情页补充内容块
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('product-detail', 'common', 'contact_btn', 'text', '获取报价', '联系按钮', 1),
('product-detail', 'common', 'back_btn', 'text', '返回产品中心', '返回按钮', 2);

-- 联系表单选项
INSERT OR IGNORE INTO page_blocks (page, section, key, type, value, label, sort_order) VALUES
('contact', 'form', 'option_1', 'text', '设备选型咨询', '需求类型1', 1),
('contact', 'form', 'option_2', 'text', '技改方案', '需求类型2', 2),
('contact', 'form', 'option_3', 'text', '配件报价', '需求类型3', 3),
('contact', 'form', 'option_4', 'text', '技术服务', '需求类型4', 4),
('contact', 'form', 'option_5', 'text', '其他', '需求类型5', 5);

-- 索引
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_company_stats_section ON company_stats(section);
CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page);
