/* ============================================
   Module: Service Comparison Table
   Usage: <div data-module="comparison"></div>
   ============================================ */

const DEFAULT_DATA = {
    title: 'Why Repair Asap?',
    columns: ['Repair Asap', 'TaskRabbit', 'DIY'],
    highlight: 0, // index of "our" column
    rows: [
        { feature: 'Licensed & Insured', values: ['yes', 'varies', 'no'] },
        { feature: 'Scope-Based Quote', values: ['yes', 'no', 'n/a'] },
        { feature: '1-Year Warranty', values: ['yes', 'no', 'no'] },
        { feature: 'Professional Tools', values: ['yes', 'varies', 'no'] },
        { feature: 'Packaging Breakdown', values: ['yes', 'varies', 'no'] },
        { feature: 'Flexible Scheduling', values: ['yes', 'varies', 'n/a'] },
        { feature: 'Wall Anchoring Review', values: ['yes', 'extra', 'no'] },
        { feature: 'Average 5-Star Rating', values: ['4.9★ avg', 'varies', 'n/a'] }
    ]
};

function renderValue(val) {
    if (val === 'yes') {
        return `<span class="mod-comp__yes" aria-label="Yes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </span>`;
    }
    if (val === 'no') {
        return `<span class="mod-comp__no" aria-label="No">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </span>`;
    }
    // "varies", "extra", "n/a"
    // Star-rating values get a special gold accent
    if (val.includes('★')) {
        return `<span class="mod-comp__rating">${val}</span>`;
    }
    return `<span class="mod-comp__meh">${val}</span>`;
}

export default function comparison(container) {
    let data;
    try {
        data = JSON.parse(container.dataset.config || 'null') || DEFAULT_DATA;
    } catch {
        data = DEFAULT_DATA;
    }

    container.innerHTML = `
        <div class="mod-comp">
            <div class="mod-comp__header">
                <span class="section-tag">Compare</span>
                <h2 class="section-title">${data.title}</h2>
            </div>
            <div class="mod-comp__scroll">
                <table class="mod-comp__table">
                    <thead>
                        <tr>
                            <th class="mod-comp__feature-head"></th>
                            ${data.columns.map((col, i) => `
                                <th class="mod-comp__col-head ${i === data.highlight ? 'mod-comp__col-head--hl' : ''}">
                                    ${i === data.highlight ? '<span class="mod-comp__badge">Our Service</span>' : ''}
                                    ${col}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.rows.map(row => `
                            <tr>
                                <td class="mod-comp__feature">${row.feature}</td>
                                ${row.values.map((val, i) => `
                                    <td class="mod-comp__cell ${i === data.highlight ? 'mod-comp__cell--hl' : ''}">
                                        ${renderValue(val)}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mod-comp__cta-wrap">
                <a href="/#contact" class="btn btn--accent btn--lg">Get Your Free Quote</a>
            </div>
        </div>
    `;
}
