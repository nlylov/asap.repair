/**
 * related-content.js
 * Renders "Recent Work" (static-first case studies) and "Related Articles".
 *
 * Usage:
 *   <div id="related-content" data-category="painting" data-blog="/blog/.../"></div>
 *
 * Static project data lives at /assets/data/case-studies.json and is generated
 * from _data/case-studies.json. CRM remains an optional enhancement only.
 */

(async function () {
  const el = document.getElementById('related-content');
  if (!el) return;

  const category = el.dataset.category || null;
  const rawBlogUrl = el.dataset.blog || null;
  const blogTitle = el.dataset.blogTitle || null;
  const blogIcon = el.dataset.blogIcon || '📖';
  const isSafePath = (value) => typeof value === 'string' && /^\/[A-Za-z0-9/_#?=&.%+-]*$/.test(value);
  const blogUrl = isSafePath(rawBlogUrl) ? rawBlogUrl : null;

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const normalizeStudy = (study) => ({
    slug: study.slug,
    title: study.title,
    excerpt: study.excerpt,
    thumbnail: study.thumbnail,
    location: study.location,
    price: study.price,
    categories: study.categories || (study.category ? [study.category] : []),
    category: study.category,
  });

  const matchesCategory = (study) => {
    if (!category) return true;
    const categories = study.categories || [];
    return categories.includes(category) || study.category === category;
  };

  // ── Fetch case studies: same-origin static data first ─────────────
  let studies = [];
  try {
    const res = await fetch('/assets/data/case-studies.json');
    if (res.ok) {
      const data = await res.json();
      studies = (data.studies || []).map(normalizeStudy).filter(matchesCategory);
    }
  } catch (_) { /* optional enhancement */ }

  // ── Optional CRM enhancement/fallback ─────────────────────────────
  if (studies.length < 3) {
    try {
      const url = category
        ? `https://crm.asap.repair/api/public/case-studies?org=repair-asap&limit=3&category=${encodeURIComponent(category)}`
        : 'https://crm.asap.repair/api/public/case-studies?org=repair-asap&limit=3';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const existing = new Set(studies.map((s) => s.slug));
        const crmStudies = (data.studies || [])
          .map(normalizeStudy)
          .filter((s) => s.slug && !existing.has(s.slug));
        studies = studies.concat(crmStudies).slice(0, 3);
      }
    } catch (_) { /* silent — content is optional */ }
  } else {
    studies = studies.slice(0, 3);
  }

  const hasStudies = studies.length > 0;
  const hasBlog = !!blogUrl;

  if (!hasStudies && !hasBlog) return;

  // ── Inject styles once ──────────────────────────────────────────
  if (!document.getElementById('rc-styles')) {
    const style = document.createElement('style');
    style.id = 'rc-styles';
    style.textContent = `
      .rc-section { padding: 60px 0; border-top: 1px solid var(--border); }
      .rc-section + .rc-section { padding-top: 0; border-top: none; }
      .rc-header { margin-bottom: 32px; }
      .rc-header__label { display: inline-block; font-size: 11px; font-weight: 600; color: var(--accent); background: var(--accent-subtle); border: 1px solid var(--border-accent); border-radius: 100px; padding: 4px 12px; margin-bottom: 10px; }
      .rc-header__title { font-family: var(--font-heading); font-size: clamp(20px, 3vw, 26px); font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
      .rc-header__sub { font-size: 14px; color: var(--text-muted); }
      .rc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
      .rc-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: border-color 0.2s, transform 0.2s; }
      .rc-card:hover { border-color: var(--border-accent); transform: translateY(-3px); }
      .rc-card__photo { height: 160px; overflow: hidden; background: var(--bg-elevated); flex-shrink: 0; }
      .rc-card__photo img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
      .rc-card:hover .rc-card__photo img { transform: scale(1.05); }
      .rc-card__photo-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: var(--text-muted); }
      .rc-card__body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
      .rc-card__meta { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
      .rc-card__tag { font-size: 10px; font-weight: 600; color: var(--accent); background: var(--accent-subtle); border: 1px solid var(--border-accent); border-radius: 100px; padding: 2px 8px; }
      .rc-card__loc { font-size: 11px; color: var(--text-muted); }
      .rc-card__title { font-family: var(--font-heading); font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1.4; flex: 1; margin-bottom: 10px; }
      .rc-card__footer { display: flex; justify-content: space-between; align-items: center; }
      .rc-card__price { font-size: 12px; font-weight: 600; color: var(--accent); }
      .rc-card__cta { font-size: 12px; font-weight: 600; color: var(--accent); }
      .rc-all-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 20px; font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; }
      .rc-all-link:hover { color: var(--accent-hover); }
      .rc-blog-card { display: flex; gap: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; text-decoration: none; transition: border-color 0.2s; align-items: center; }
      .rc-blog-card:hover { border-color: var(--border-accent); }
      .rc-blog-card__icon { font-size: 36px; flex-shrink: 0; width: 60px; height: 60px; background: var(--bg-elevated); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
      .rc-blog-card__label { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
      .rc-blog-card__title { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.4; margin-bottom: 6px; }
      .rc-blog-card__cta { font-size: 13px; color: var(--accent); font-weight: 600; }
      @media (max-width: 600px) { .rc-grid { grid-template-columns: 1fr; } .rc-blog-card { flex-direction: column; } }
    `;
    document.head.appendChild(style);
  }

  // ── Build HTML with escaped data ─────────────────────────────────
  let html = '<div class="container">';

  if (hasStudies) {
    html += `
      <div class="rc-section">
        <div class="rc-header">
          <span class="rc-header__label">Real Work</span>
          <h2 class="rc-header__title">Recent Projects</h2>
          <p class="rc-header__sub">Before, process, and after photos from completed jobs</p>
        </div>
        <div class="rc-grid">
          ${studies.map((s) => `
            <a class="rc-card" href="/case-studies/${encodeURIComponent(s.slug)}/">
              <div class="rc-card__photo">
                ${s.thumbnail
                  ? `<img src="${escapeHtml(s.thumbnail)}" alt="${escapeHtml(s.title)}" loading="lazy">`
                  : '<div class="rc-card__photo-placeholder">📸</div>'}
              </div>
              <div class="rc-card__body">
                <div class="rc-card__meta">
                  <span class="rc-card__tag">Case Study</span>
                  ${s.location ? `<span class="rc-card__loc">📍 ${escapeHtml(s.location)}</span>` : ''}
                </div>
                <p class="rc-card__title">${escapeHtml(s.title)}</p>
                <div class="rc-card__footer">
                  ${s.price ? `<span class="rc-card__price">${escapeHtml(s.price)}</span>` : '<span></span>'}
                  <span class="rc-card__cta">View →</span>
                </div>
              </div>
            </a>`).join('')}
        </div>
        <a href="/case-studies/" class="rc-all-link">See all case studies →</a>
      </div>`;
  }

  if (hasBlog) {
    html += `
      <div class="rc-section">
        <div class="rc-header">
          <span class="rc-header__label">From the Blog</span>
          <h2 class="rc-header__title">Related Guide</h2>
          <p class="rc-header__sub">Tips, pricing, and what to expect</p>
        </div>
        <a class="rc-blog-card" href="${escapeHtml(blogUrl)}">
          <div class="rc-blog-card__icon">${escapeHtml(blogIcon)}</div>
          <div class="rc-blog-card__body">
            <p class="rc-blog-card__label">Article</p>
            <p class="rc-blog-card__title">${escapeHtml(blogTitle || 'Read the guide')}</p>
            <span class="rc-blog-card__cta">Read article →</span>
          </div>
        </a>
      </div>`;
  }

  html += '</div>';

  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Related content');
  section.innerHTML = html;
  el.replaceWith(section);
})();
