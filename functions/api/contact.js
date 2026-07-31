// 处理官网留言提交 POST /api/contact
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { name, phone, company, type, message } = body;

    if (!name || !phone || !type) {
      return jsonResponse({ error: '姓名、电话和需求类型为必填项' }, 400);
    }

    const stmt = await env.DB.prepare(
      `INSERT INTO contacts (name, phone, company, type, message) VALUES (?, ?, ?, ?, ?)`
    ).bind(name, phone, company || '', type, message || '');
    
    await stmt.run();

    return jsonResponse({ success: true, message: '留言已提交' });
  } catch (err) {
    return jsonResponse({ error: '提交失败', detail: err.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
