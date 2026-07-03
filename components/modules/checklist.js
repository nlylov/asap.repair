/* ============================================
   Module: What's Included Checklist
   Usage: <div data-module="checklist" data-items='[...]'></div>
   ============================================ */

const DEFAULT_ITEMS = [
    { text: 'Tools matched to product hardware', icon: 'wrench' },
    { text: 'Unboxing & packaging breakdown', icon: 'package' },
    { text: 'Leveling & anchoring review', icon: 'level' },
    { text: '1-year workmanship warranty', icon: 'shield' },
    { text: 'Flexible scheduling after scope review', icon: 'clock' },
    { text: 'Scope-based quote', icon: 'dollar' },
    { text: 'Insured setup team', icon: 'badge' },
    { text: 'Cleanup matched to building rules', icon: 'sparkle' }
];

const ICONS = {
    wrench: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
    package: '<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    level: '<rect x="1" y="6" width="22" height="12" rx="2"/><line x1="6" y1="12" x2="6" y2="12"/><circle cx="12" cy="12" r="2"/><line x1="18" y1="12" x2="18" y2="12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    badge: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    sparkle: '<path d="M12 3l1.45 4.35L18 9l-4.55 1.65L12 15l-1.45-4.35L6 9l4.55-1.65z"/><path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z"/>'
};

export default function checklist(container) {
    let items;
    try {
        items = JSON.parse(container.dataset.items || 'null') || DEFAULT_ITEMS;
    } catch {
        items = DEFAULT_ITEMS;
    }

    container.innerHTML = `
        <div class="mod-checklist">
            <div class="mod-checklist__header">
                <span class="section-tag">What's Included</span>
                <h2 class="section-title">Every Job <span class="text-accent">Comes With</span></h2>
            </div>
            <div class="mod-checklist__grid">
                ${items.map((item, i) => `
                    <div class="mod-checklist__item" style="--delay: ${i * 100}ms">
                        <div class="mod-checklist__icon-wrap">
                            <svg class="mod-checklist__icon" width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                ${ICONS[item.icon] || ICONS.shield}
                            </svg>
                        </div>
                        <div class="mod-checklist__check">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)"
                                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <span class="mod-checklist__text">${item.text}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Intersection Observer: staggered reveal
    const itemEls = container.querySelectorAll('.mod-checklist__item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('mod-checklist__item--visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    itemEls.forEach(el => observer.observe(el));
}
