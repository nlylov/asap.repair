/*
 * Bazas KB content widget — live tenant truth on the public site.
 *
 * Reads the SAME knowledge base the AI channels read
 * (GET /api/knowledge-base?org=<slug>) and renders services / pricing / FAQ
 * into any element marked  data-bazas-kb="services|pricing|faq".
 *
 * Edit a price in the CRM (Settings → Knowledge Base) → it shows here too.
 * No build step, no framework — a single IIFE like chat.js.
 *
 * Fail-safe: if the fetch fails the static HTML already in the container is
 * left untouched, so the page never shows an empty box.
 *
 * Pure renderers are exported via module.exports for Node tests; the browser
 * bootstrap only runs when window/document exist.
 */
(function () {
  'use strict';

  // ── pure helpers (no DOM, unit-tested) ────────────────────────────────────

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Group services [{category, name, priceRange}] → [[category, items[]], ...]
  // preserving first-seen category order. Tolerates a garbage payload
  // (non-array, null items) — a bad KB section must never throw.
  function groupByCategory(services) {
    if (!Array.isArray(services)) return [];
    var order = [];
    var byCat = Object.create(null);            // null-proto → "__proto__" is a safe key
    services.forEach(function (s) {
      if (!s || typeof s !== 'object') return;  // skip non-object items
      var cat = s.category || 'Other';
      if (!byCat[cat]) { byCat[cat] = []; order.push(cat); }
      byCat[cat].push(s);
    });
    return order.map(function (cat) { return [cat, byCat[cat]]; });
  }

  function renderServices(kb) {
    var groups = groupByCategory(kb && kb.services);
    if (!groups.length) return '';
    return groups.map(function (pair) {
      var cat = pair[0], items = pair[1];
      var rows = items.map(function (s) {
        var price = s.priceRange ? '<span class="bk-price">' + esc(s.priceRange) + '</span>' : '';
        return '<li class="bk-service"><span class="bk-service-name">' +
          esc(s.name) + '</span>' + price + '</li>';
      }).join('');
      return '<div class="bk-service-group">' +
        '<h3 class="bk-service-cat">' + esc(cat) + '</h3>' +
        '<ul class="bk-service-list">' + rows + '</ul></div>';
    }).join('');
  }

  // Pricing = the truth-critical block. Driven entirely by policies from the KB
  // (minimum visit / assessment fee / warranty / payment / sales tax) — never a
  // hardcoded fee. salesTax is a long sentence, so it renders as a note, not a row.
  function renderPricing(kb) {
    var p = (kb && kb.policies);
    if (!p || typeof p !== 'object') return '';
    var rows = [];
    if (p.minimumVisit) rows.push(['Minimum visit', p.minimumVisit]);
    if (p.assessmentFee) rows.push(['On-site assessment', p.assessmentFee]);
    if (p.warranty) rows.push(['Warranty', p.warranty]);
    if (p.payment) rows.push(['Payment', p.payment]);
    if (!rows.length && !p.salesTax) return '';
    var body = rows.map(function (r) {
      return '<div class="bk-pricing-row">' +
        '<dt class="bk-pricing-label">' + esc(r[0]) + '</dt>' +
        '<dd class="bk-pricing-value">' + esc(r[1]) + '</dd></div>';
    }).join('');
    var dl = rows.length ? '<dl class="bk-pricing">' + body + '</dl>' : '';
    var note = p.salesTax ? '<p class="bk-pricing-note">' + esc(p.salesTax) + '</p>' : '';
    return dl + note;
  }

  function renderFaq(kb) {
    var faqs = (kb && kb.faqs);
    if (!Array.isArray(faqs) || !faqs.length) return '';
    return faqs.filter(function (f) { return f && typeof f === 'object'; }).map(function (f) {
      return '<details class="bk-faq-item">' +
        '<summary class="bk-faq-q">' + esc(f.question) + '</summary>' +
        '<div class="bk-faq-a">' + esc(f.answer) + '</div></details>';
    }).join('');
  }

  var RENDERERS = {
    services: renderServices,
    pricing: renderPricing,
    faq: renderFaq
  };

  // ── browser bootstrap ─────────────────────────────────────────────────────

  function bootstrap() {
    var containers = document.querySelectorAll('[data-bazas-kb]');
    if (!containers.length) return; // nothing to fill on this page

    // org/endpoint overridable for non-repair-asap tenants reusing this file
    var org =
      (document.currentScript && document.currentScript.getAttribute('data-bazas-kb-org')) ||
      window.BAZAS_KB_ORG ||
      'repair-asap';
    var base = window.BAZAS_KB_ENDPOINT || 'https://crm.asap.repair';
    var url = base + '/api/knowledge-base?org=' + encodeURIComponent(org);

    fetch(url, { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('KB HTTP ' + r.status);
        return r.json();
      })
      .then(function (kb) {
        containers.forEach(function (el) {
          // per-container isolation: a throw in one renderer must not stop the
          // others from going live, and must leave THIS container's static
          // fallback intact.
          try {
            var kind = el.getAttribute('data-bazas-kb');
            var render = RENDERERS[kind];
            if (!render) return;
            var html = render(kb);
            if (html) {
              el.innerHTML = html;        // replace static fallback with live truth
              el.setAttribute('data-bazas-kb-state', 'live');
            }
            // empty render → leave the static HTML fallback in place
          } catch (e) {
            if (window.console && console.warn) console.warn('[bazas-kb] section render failed, keeping static fallback:', e && e.message);
          }
        });
        window.dispatchEvent(new CustomEvent('bazas-kb:loaded', { detail: { org: org } }));
      })
      .catch(function (err) {
        // fail-safe: keep whatever static HTML is already in the containers
        if (window.console && console.warn) console.warn('[bazas-kb] live KB unavailable, using static fallback:', err.message);
      });
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
      bootstrap();
    }
  }

  // ── exports for Node tests ────────────────────────────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { esc: esc, groupByCategory: groupByCategory, renderServices: renderServices, renderPricing: renderPricing, renderFaq: renderFaq };
  }
})();
