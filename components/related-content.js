/**
 * related-content.js
 * Dynamically renders "Recent Work" (case studies) and "Related Articles" (blog)
 * on service pages and blog articles.
 *
 * Usage: add to any page:
 *   <div id="related-content" data-category="tv_mounting" data-blog="/blog/tv-mounting-nyc-apartment/"></div>
 *
 * data-category: maps to CRM category slug
 * data-blog: path to related blog article (optional)
 * data-blog-title: blog article title (optional)
 */

(async function () {
  const el = document.getElementById('related-content');
  if (!el) return;

  const category = el.dataset.category || null;
  const blogUrl = el.dataset.blog || null;
  const blogTitle = el.dataset.blogTitle || null;
  const blogIcon = el.dataset.blogIcon || '📖';

  // ── Fetch case studies ──────────────────────────────────────────
  let studies = [];
  try {
    const url = category
      ? `https://crm.asap.repair/api/public/case-studies?limit=3&category=${category}`
      : `https://crm.asap.repair/api/public/case-studies?limit=3`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      studies = data.studies || [];
    }
  } catch (_) { /* silent — content is optional */ }

  const hasStudies = studies.length > 0;
  const hasBlog = !!blogUrl;

  if (!hasStudies && !hasBlog) return; // nothing to show

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

      /* Case study cards */
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

      /* Blog article card */
      .rc-blog-card { display: flex; gap: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; text-decoration: none; transition: border-color 0.2s; align-items: center; }
      .rc-blog-card:hover { border-color: var(--border-accent); }
      .rc-blog-card__icon { font-size: 36px; flex-shrink: 0; width: 60px; height: 60px; background: var(--bg-elevated); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
      .rc-blog-card__body {}
      .rc-blog-card__label { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
      .rc-blog-card__title { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.4; margin-bottom: 6px; }
      .rc-blog-card__cta { font-size: 13px; color: var(--accent); font-weight: 600; }

      @media (max-width: 600px) {
        .rc-grid { grid-template-columns: 1fr; }
        .rc-blog-card { flex-direction: column; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Build HTML ──────────────────────────────────────────────────
  let html = '<div class="container">';

  // Case studies block
  if (hasStudies) {
    html += `
      <div class="rc-section">
        <div class="rc-header">
          <span class="rc-header__label">Real Work</span>
          <h2 class="rc-header__title">Recent Projects</h2>
          <p class="rc-header__sub">Before &amp; after photos from completed jobs</p>
        </div>
        <div class="rc-grid">
          ${studies.map(s => `
            <a class="rc-card" href="/case-studies/${s.slug}/">
              <div class="rc-card__photo">
                ${s.thumbnail
                  ? `<img src="${s.thumbnail}" alt="${s.title}" loading="lazy">`
                  : `<div class="rc-card__photo-placeholder">📸</div>`}
              </div>
              <div class="rc-card__body">
                <div class="rc-card__meta">
                  <span class="rc-card__tag">Case Study</span>
                  ${s.location ? `<span class="rc-card__loc">📍 ${s.location}</span>` : ''}
                </div>
                <p class="rc-card__title">${s.title}</p>
                <div class="rc-card__footer">
                  ${s.price ? `<span class="rc-card__price">${s.price}</span>` : '<span></span>'}
                  <span class="rc-card__cta">View →</span>
                </div>
              </div>
            </a>`).join('')}
        </div>
        <a href="/case-studies/" class="rc-all-link">See all case studies →</a>
      </div>`;
  }

  // Blog article block
  if (hasBlog) {
    html += `
      <div class="rc-section">
        <div class="rc-header">
          <span class="rc-header__label">From the Blog</span>
          <h2 class="rc-header__title">Related Guide</h2>
          <p class="rc-header__sub">Tips, pricing, and what to expect</p>
        </div>
        <a class="rc-blog-card" href="${blogUrl}">
          <div class="rc-blog-card__icon">${blogIcon}</div>
          <div class="rc-blog-card__body">
            <p class="rc-blog-card__label">Article</p>
            <p class="rc-blog-card__title">${blogTitle || 'Read the guide'}</p>
            <span class="rc-blog-card__cta">Read article →</span>
          </div>
        </a>
      </div>`;
  }

  html += '</div>';

  // Create wrapper section
  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Related content');
  section.innerHTML = html;
  el.replaceWith(section);
})();
