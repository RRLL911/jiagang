// 页面内容块客户端辅助：根据 data-block 属性自动填充 /api/page-blocks 数据
// 用法：在页面加载后调用 applyPageBlocks('index')
// 全局内容块（page='global'）会与页面专属内容块合并，页面块优先级更高。
async function applyPageBlocks(page) {
  try {
    const [globalRes, pageRes] = await Promise.all([
      fetch('/api/page-blocks?page=global'),
      fetch(`/api/page-blocks?page=${encodeURIComponent(page)}`)
    ]);
    const globalBlocks = globalRes.ok ? await globalRes.json() : [];
    const pageBlocks = pageRes.ok ? await pageRes.json() : [];
    const seen = new Set();
    const blocks = [];
    for (const b of globalBlocks) {
      const key = `${b.page}.${b.section}.${b.key}`;
      if (seen.has(key)) continue;
      seen.add(key);
      blocks.push(b);
    }
    for (const b of pageBlocks) {
      const key = `${b.page}.${b.section}.${b.key}`;
      if (seen.has(key)) continue;
      seen.add(key);
      blocks.push(b);
    }

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
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.hasAttribute('placeholder')) {
            el.placeholder = block.value || '';
          } else {
            el.value = block.value || '';
          }
        } else if (el.tagName === 'OPTION') {
          el.textContent = block.value || '';
        } else if (el.tagName === 'TITLE') {
          el.textContent = block.value || '';
        } else {
          el.innerHTML = block.value || '';
        }
      }
    }
  } catch (e) {
    console.error('applyPageBlocks failed', e);
  }
}
