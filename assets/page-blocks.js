// 页面内容块客户端辅助：根据 data-block 属性自动填充 /api/page-blocks 数据
// 用法：在页面加载后调用 applyPageBlocks('index')
async function applyPageBlocks(page) {
  try {
    const res = await fetch(`/api/page-blocks?page=${encodeURIComponent(page)}`);
    if (!res.ok) return;
    const blocks = await res.json();
    for (const block of blocks) {
      const selector = `[data-block="${block.section}.${block.key}"]`;
      const els = document.querySelectorAll(selector);
      if (!els.length) continue;
      for (const el of els) {
        if (block.type === 'html') {
          el.innerHTML = block.value || '';
        } else if (block.type === 'image') {
          if (el.tagName === 'IMG') {
            el.src = block.value || '';
          } else {
            el.style.backgroundImage = block.value ? `url(${block.value})` : '';
          }
        } else {
          el.innerHTML = block.value || '';
        }
      }
    }
  } catch (e) {
    console.error('applyPageBlocks failed', e);
  }
}
