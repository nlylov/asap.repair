#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ASSET_VERSION = '20260710c';
const LOADER_ASSET_VERSION = '20260710c';
const ROOT = new URL('..', import.meta.url).pathname;

const serviceLinks = {
  apartmentSetup: { name: 'New apartment setup', url: '/new-apartment-setup/' },
  furniture: { name: 'Furniture assembly', url: '/services/furniture-assembly/' },
  tvMounting: { name: 'TV and wall mounting', url: '/services/tv-wall-mounting/' },
  appliances: { name: 'Appliance installation', url: '/services/appliance-services/' },
  applianceRepair: { name: 'Appliance repair help', url: '/services/appliance-services/appliance-repair/' },
  ac: { name: 'AC installation and cleaning', url: '/services/ac-installation-cleaning/' },
  plumbing: { name: 'Plumbing fixture work', url: '/services/plumbing/' },
  electrical: { name: 'Electrical fixture and device work', url: '/services/electrical/' },
  painting: { name: 'Painting and wall finishes', url: '/services/painting/' },
  drywall: { name: 'Drywall and general repairs', url: '/services/general-repairs/' },
  flooring: { name: 'Flooring installation and repair', url: '/services/flooring-installation/' },
  locks: { name: 'Lock installation', url: '/services/general-repairs/lock-installation/' },
};

const pages = [
  {
    slug: 'handyman-manhattan',
    areaName: 'Manhattan',
    title: 'Handyman Manhattan NYC | Repair ASAP',
    description: 'Insured Manhattan handyman for apartments, co-ops, condos and offices: TV mounting, furniture assembly, repairs, fixtures, AC and move-in setup.',
    ogTitle: 'Handyman Services in Manhattan, NYC | Repair ASAP',
    heroImage: '/assets/services/service-tv-mounting.webp',
    badge: 'Manhattan Handyman',
    h1: 'Handyman Services in Manhattan',
    subtitle: 'COI-ready handyman help for Manhattan apartments, co-ops, condos, offices, doorman buildings, pre-war walls, and high-rise move-ins.',
    localContext: 'Manhattan jobs often need tight elevator windows, doorman or super coordination, COI paperwork, wall-type checks, and careful scheduling around building work hours. Repair ASAP reviews photos, access details, and building rules before confirming the visit.',
    neighborhoods: ['Upper East Side', 'Upper West Side', 'Midtown', 'Chelsea', 'Greenwich Village', 'Financial District', 'Tribeca', 'SoHo', 'Hell\'s Kitchen', 'Lower East Side', 'Harlem', 'Washington Heights'],
    services: ['tvMounting', 'furniture', 'apartmentSetup', 'painting', 'electrical', 'plumbing', 'ac', 'drywall', 'applianceRepair'],
    proofLinks: [
      { label: 'Crown Royal Barbershop renovation in Manhattan', url: '/case-studies/crown-royal-barbershop-renovation-manhattan/' },
      { label: 'Lower Manhattan fence project on the homepage', url: '/#portfolio' },
    ],
    faq: [
      ['Do you provide handyman service in Manhattan co-ops and condos?', 'Yes. Repair ASAP works with Manhattan apartments, co-ops, condos, rentals, offices, and doorman buildings after scope review. COI paperwork can be prepared when a building requires it.'],
      ['What are common Manhattan handyman requests?', 'Common requests include TV mounting, furniture assembly, shelves, curtain rods, art hanging, drywall repair, painting, light fixture or smart-device setup, faucet or toilet fixture work, AC installation, and move-in setup.'],
      ['What should I send for a Manhattan quote?', 'Send photos, product links or model numbers, wall type if known, building address or neighborhood, elevator or loading rules, COI requirements, parking or access notes, and preferred timing.'],
      ['Can you handle same-day Manhattan handyman jobs?', 'Sometimes, depending on location, scope, parts, building rules, and route availability. Send photos first so the team can confirm whether the job can be scheduled quickly.'],
    ],
  },
  {
    slug: 'handyman-brooklyn',
    areaName: 'Brooklyn',
    title: 'Handyman Brooklyn NYC | Repair ASAP',
    description: 'Brooklyn handyman for apartments, brownstones, condos and offices: repairs, mounting, furniture, appliances, AC, painting and fixture work.',
    ogTitle: 'Handyman Services in Brooklyn, NYC | Repair ASAP',
    heroImage: '/assets/services/service-home-repairs.webp',
    badge: 'Brooklyn Handyman',
    h1: 'Handyman Services in Brooklyn',
    subtitle: 'Insured handyman help for Brooklyn apartments, brownstones, condos, rentals, storefronts, and punch-list repairs after photo and scope review.',
    localContext: 'Brooklyn work can range from older plaster walls and brownstone details to newer condo finishes, roof decks, storefront build-outs, and tight parking. Repair ASAP checks the wall, access, materials, and building requirements before scheduling.',
    neighborhoods: ['Williamsburg', 'Park Slope', 'Bed-Stuy', 'Bushwick', 'Bay Ridge', 'DUMBO', 'Carroll Gardens', 'Brooklyn Heights', 'Greenpoint', 'Crown Heights', 'Flatbush', 'Fort Greene'],
    services: ['tvMounting', 'drywall', 'furniture', 'appliances', 'painting', 'locks', 'ac', 'plumbing', 'applianceRepair'],
    proofLinks: [
      { label: 'Drywall repair after mini-split installation in Brooklyn', url: '/case-studies/drywall-repair-after-mini-split-installation-brooklyn/' },
      { label: 'Plastic wall panel installation in Bedford-Stuyvesant', url: '/case-studies/plastic-wall-panel-installation-bedford-stuyvesant-brooklyn/' },
    ],
    faq: [
      ['Do you serve Brooklyn apartments and brownstones?', 'Yes. Repair ASAP serves Brooklyn apartments, brownstones, condos, co-ops, rentals, and light commercial spaces when scope and scheduling fit.'],
      ['Which Brooklyn handyman services are most common?', 'Common Brooklyn requests include TV and shelf mounting, drywall patching, furniture assembly, lock and door work, painting, appliance installation, window AC installation, and minor plumbing fixture work.'],
      ['Can you work with Brooklyn building COI requirements?', 'Yes. If a building, management company, condo, or co-op requires a Certificate of Insurance, send the building requirements before scheduling so the paperwork can be prepared.'],
      ['What details help quote a Brooklyn job faster?', 'Send clear photos, measurements, product links, wall type if known, access or parking notes, floor/elevator details, building rules, and preferred timing.'],
    ],
  },
  {
    slug: 'handyman-queens',
    areaName: 'Queens',
    title: 'Handyman Queens NYC | Repair ASAP',
    description: 'Queens handyman based near Rego Park for furniture assembly, TV mounting, AC, appliance installation, repairs, painting and fixture work.',
    ogTitle: 'Handyman Services in Queens, NYC | Repair ASAP',
    heroImage: '/assets/services/service-ac.webp',
    badge: 'Queens Handyman',
    h1: 'Handyman Services in Queens',
    subtitle: 'Local Queens handyman help for apartments, co-ops, condos, single-family homes, storefronts, and move-in punch lists.',
    localContext: 'Repair ASAP is based in Rego Park, so Queens is a primary service area. Queens jobs often include apartment move-ins, window AC installs, furniture assembly, TV mounting, appliance setup, small plumbing fixture work, and repairs across many building types.',
    neighborhoods: ['Forest Hills', 'Rego Park', 'Astoria', 'Long Island City', 'Flushing', 'Bayside', 'Jackson Heights', 'Elmhurst', 'Jamaica', 'Woodside', 'Sunnyside', 'Howard Beach'],
    services: ['apartmentSetup', 'furniture', 'tvMounting', 'ac', 'appliances', 'plumbing', 'electrical', 'drywall', 'applianceRepair'],
    proofLinks: [
      { label: 'Bathroom build-out from rough plumbing to tiled shower in Queens', url: '/case-studies/bathroom-build-out-rough-plumbing-to-tiled-shower-queens/' },
      { label: 'Wood table refinishing in Astoria, Queens', url: '/case-studies/astoria-wood-table-refinishing-sticky-polyurethane/' },
      { label: 'Queens handyman pricing guide', url: '/blog/handyman-queens-nyc/' },
    ],
    faq: [
      ['Is Queens a primary Repair ASAP service area?', 'Yes. Repair ASAP is based in Rego Park and serves Queens neighborhoods such as Forest Hills, Astoria, Long Island City, Flushing, Bayside, Jackson Heights, Elmhurst, Jamaica, Woodside, Sunnyside, and Howard Beach.'],
      ['What Queens handyman jobs are a good fit?', 'Good-fit requests include furniture assembly, TV mounting, window AC installation, appliance installation, faucet or toilet fixture work, light fixture or smart device setup, drywall repair, painting, and move-in setup.'],
      ['Can you quote Queens jobs from photos?', 'Yes. Photos, product links, model numbers, measurements, building rules, and access details usually make the first quote faster and more accurate.'],
      ['Do you handle Queens co-op and condo requirements?', 'Yes. Send COI instructions, building work-hour rules, elevator requirements, and management contact details before the appointment if the building requires them.'],
    ],
  },
  {
    slug: 'handyman-bronx',
    areaName: 'the Bronx',
    title: 'Handyman Bronx NYC | Repair ASAP',
    description: 'Bronx handyman for apartments, co-ops, condos and homes: mounting, assembly, AC, repairs, painting, plumbing and electrical fixture work.',
    ogTitle: 'Handyman Services in the Bronx, NYC | Repair ASAP',
    heroImage: '/assets/services/service-home-repairs.webp',
    badge: 'Bronx Handyman',
    h1: 'Handyman Services in the Bronx',
    subtitle: 'Insured handyman service for Bronx apartments, co-ops, condos, homes, and light commercial punch-list work after scope review.',
    localContext: 'Bronx jobs can involve large apartment buildings, co-ops, older walls, elevator scheduling, building management rules, and residential repairs. Repair ASAP confirms scope, timing, and travel before booking so the visit is realistic.',
    neighborhoods: ['Riverdale', 'Kingsbridge', 'Fordham', 'Pelham Bay', 'Throgs Neck', 'Morris Park', 'Mott Haven', 'Soundview', 'Concourse', 'Norwood', 'Parkchester', 'Wakefield'],
    services: ['drywall', 'furniture', 'tvMounting', 'ac', 'plumbing', 'electrical', 'painting', 'locks', 'applianceRepair'],
    proofLinks: [
      { label: 'General repair services', url: '/services/general-repairs/' },
      { label: 'All handyman service categories', url: '/services/' },
    ],
    faq: [
      ['Does Repair ASAP serve the Bronx?', 'Yes. Repair ASAP serves the Bronx when scope, timing, and travel fit, including apartments, co-ops, condos, homes, and light commercial spaces.'],
      ['Which Bronx handyman services can be scheduled?', 'Common requests include furniture assembly, TV mounting, AC installation, drywall repair, door or lock work, painting, plumbing fixture work, electrical fixture or smart-device setup, and general repairs.'],
      ['What do you need before confirming a Bronx appointment?', 'Send photos, product links or model numbers, address or neighborhood, building access notes, parking or loading details, COI requirements, and preferred timing.'],
      ['Can you bundle multiple Bronx repair tasks in one visit?', 'Yes. Bundled punch-list work is often the best fit: furniture, mounting, repairs, fixture swaps, caulking, blinds, hardware, and small wall repairs can be reviewed together.'],
    ],
  },
  {
    slug: 'handyman-staten-island',
    areaName: 'Staten Island',
    title: 'Handyman Staten Island | Repair ASAP',
    description: 'Staten Island handyman for homes, apartments and punch lists: repairs, mounting, assembly, AC, appliance setup, painting and fixture work.',
    ogTitle: 'Handyman Services in Staten Island | Repair ASAP',
    heroImage: '/assets/services/service-flooring.webp',
    badge: 'Staten Island Handyman',
    h1: 'Handyman Services in Staten Island',
    subtitle: 'Handyman help for Staten Island homes, apartments, rentals, and larger bundled repair lists when scope and travel fit.',
    localContext: 'Staten Island appointments work best when tasks are bundled: mounting, assembly, repairs, flooring touch-ups, painting, AC, fixtures, and punch-list work. Repair ASAP confirms the route, materials, access, and job size before scheduling.',
    neighborhoods: ['St. George', 'Tompkinsville', 'New Dorp', 'Great Kills', 'Tottenville', 'West Brighton', 'Dongan Hills', 'Annadale', 'Huguenot', 'Eltingville', 'Rosebank', 'Westerleigh'],
    services: ['drywall', 'flooring', 'painting', 'tvMounting', 'furniture', 'appliances', 'plumbing', 'ac', 'applianceRepair'],
    proofLinks: [
      { label: 'All repair and installation services', url: '/services/' },
      { label: 'General repair services', url: '/services/general-repairs/' },
    ],
    faq: [
      ['Does Repair ASAP serve Staten Island?', 'Yes. Staten Island work is accepted when scope, timing, and travel fit. Larger bundled lists are usually the strongest fit for route planning.'],
      ['What Staten Island jobs are a good fit?', 'Good-fit jobs include bundled handyman repairs, furniture assembly, TV or shelf mounting, painting, drywall, flooring touch-ups, appliance installation, AC service, and plumbing or electrical fixture work after review.'],
      ['Can you do a full punch-list visit in Staten Island?', 'Yes. Send the full list with photos and measurements so the team can confirm expected time, materials, routing, and whether the work fits one visit.'],
      ['How do you price Staten Island service?', 'Pricing depends on scope, travel, access, materials, urgency, and the number of tasks. A quote is confirmed before booking, and photo review helps avoid surprises.'],
    ],
  },
  {
    slug: 'handyman-long-island',
    areaName: 'Western Long Island and Nassau County',
    title: 'Handyman Long Island & Nassau | Repair ASAP',
    description: 'Western Long Island and Nassau handyman for larger repairs, assembly, mounting, outdoor projects, apartment setup and installations when scope fits.',
    ogTitle: 'Handyman Services in Western Long Island and Nassau | Repair ASAP',
    heroImage: '/assets/services/service-gazebo.png',
    badge: 'Long Island Handyman',
    h1: 'Handyman Services in Western Long Island',
    subtitle: 'Repair ASAP accepts Western Long Island and Nassau County work when the project scope, schedule, and travel fit.',
    localContext: 'Long Island and Nassau appointments are strongest for larger or bundled work: outdoor assembly, gazebo and patio-related projects, appliance or fixture setup, repairs, painting, flooring, mounting, and home punch lists. Scope and travel are confirmed before booking.',
    neighborhoods: ['Great Neck', 'Port Washington', 'Manhasset', 'Mineola', 'Garden City', 'New Hyde Park', 'Roslyn', 'Glen Cove', 'Hempstead', 'Valley Stream', 'Long Beach', 'Locust Valley'],
    services: ['drywall', 'flooring', 'painting', 'tvMounting', 'furniture', 'appliances', 'plumbing', 'ac', 'applianceRepair'],
    proofLinks: [
      { label: 'Gazebo and outdoor kitchen installation in Nassau County', url: '/case-studies/gazebo-outdoor-kitchen-installation-lattingtown-long-island/' },
      { label: 'All handyman service categories', url: '/services/' },
    ],
    faq: [
      ['Does Repair ASAP serve Long Island?', 'Repair ASAP serves Western Long Island and accepts Nassau County work when the project scope, route, and travel fit. Send the address or town with the task list before booking.'],
      ['What Long Island projects are the best fit?', 'Best-fit requests include larger bundled repairs, gazebo or outdoor assembly, TV and wall mounting, furniture assembly, appliance installation, painting, flooring, AC service, and fixture-level plumbing or electrical work after scope review.'],
      ['Can you handle outdoor assembly or larger residential projects?', 'Yes, when the site conditions and scope fit. Repair ASAP has a Nassau County gazebo and outdoor kitchen project case study, and larger work is quoted after photos, measurements, and site details.'],
      ['How should I request a Nassau County quote?', 'Send the town, photos, measurements, product links, delivery status, access details, parking notes, materials on site, and preferred timing so travel and scope can be confirmed.'],
    ],
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function jsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll('</', '<\\/');
}

function serviceCard(key) {
  const service = serviceLinks[key];
  return `                    <a class="area-link-card" href="${service.url}">
                        <span>${escapeHtml(service.name)}</span>
                        <small>View service page</small>
                    </a>`;
}

function neighborhoodPill(name) {
  return `                    <span class="area-pill">${escapeHtml(name)}</span>`;
}

function faqItem([question, answer], index) {
  return `                    <details class="svc-faq__item"${index === 0 ? ' open' : ''}>
                        <summary class="svc-faq__question">
                            <span>${escapeHtml(question)}</span>
                            <svg class="svc-faq__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </summary>
                        <div class="svc-faq__answer">
                            <p>${escapeHtml(answer)}</p>
                        </div>
                    </details>`;
}

function schemaFor(page) {
  const canonical = `https://asap.repair/${page.slug}/`;
  const provider = {
    '@type': 'LocalBusiness',
    name: 'Repair Asap LLC',
    telephone: '+1-775-310-7770',
    url: 'https://asap.repair',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '99-60 64th Ave',
      addressLocality: 'Rego Park',
      addressRegion: 'NY',
      postalCode: '11374',
      addressCountry: 'US',
    },
  };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://asap.repair/' },
        { '@type': 'ListItem', position: 2, name: 'Service Areas', item: 'https://asap.repair/service-areas/' },
        { '@type': 'ListItem', position: 3, name: page.areaName, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Handyman services in ${page.areaName}`,
      serviceType: 'Handyman, repair, installation, assembly, mounting, AC, appliance, painting, minor plumbing fixture, and electrical fixture/device work after scope review',
      url: canonical,
      description: page.subtitle,
      provider,
      areaServed: {
        '@type': 'AdministrativeArea',
        name: page.areaName,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `Repair ASAP services in ${page.areaName}`,
        itemListElement: page.services.map((key) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: serviceLinks[key].name,
            url: `https://asap.repair${serviceLinks[key].url}`,
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Priority handyman services in ${page.areaName}`,
      url: canonical,
      itemListElement: page.services.map((key, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: serviceLinks[key].name,
        url: `https://asap.repair${serviceLinks[key].url}`,
      })),
    },
  ];
}

function renderPage(page) {
  const canonical = `https://asap.repair/${page.slug}/`;
  const schemas = schemaFor(page).map((schema) => `    <script type="application/ld+json">\n${jsonLd(schema)}\n    </script>`).join('\n');
  const proofLinks = page.proofLinks.map((link) => `                    <a class="area-proof__link" href="${link.url}">${escapeHtml(link.label)}</a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <script defer src="/analytics.js?v=${ASSET_VERSION}"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${escapeHtml(page.ogTitle)}">
    <meta property="og:description" content="${escapeHtml(page.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="https://asap.repair/assets/images/og-image.png">
    <meta property="og:image:alt" content="Repair Asap LLC handyman services in New York City">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://asap.repair/assets/images/og-image.png">
    <meta name="theme-color" content="#0a0f1c">
    <link rel="icon" type="image/x-icon" href="/assets/favicons/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap">
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet" media="print" onload="this.media='all'">
    <noscript>
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap">
    </noscript>
    <link rel="preload" as="image" type="${page.heroImage.endsWith('.png') ? 'image/png' : 'image/webp'}" href="${page.heroImage}">
    <link rel="stylesheet" href="/styles.css?v=${ASSET_VERSION}">
    <style>
        .area-page .svc-hero { min-height: 420px; padding: 12px 0 18px; }
        .area-page .svc-hero__inner { max-width: 820px; }
        .area-page .svc-hero__subtitle { max-width: 690px; }
        .area-section { padding: 68px 0; }
        .area-section--muted { background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .area-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 40px; align-items: start; }
        .area-copy p { color: var(--text-secondary); line-height: 1.75; margin-bottom: 16px; }
        .area-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
        .area-panel h2, .area-panel h3 { font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 12px; }
        .area-panel p { color: var(--text-secondary); line-height: 1.65; margin-bottom: 16px; }
        .area-link-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
        .area-link-card { display: flex; flex-direction: column; gap: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; text-decoration: none; min-height: 112px; }
        .area-link-card:hover { border-color: var(--border-accent); }
        .area-link-card span { color: var(--text-primary); font-weight: 700; line-height: 1.35; }
        .area-link-card small { color: var(--text-secondary); font-size: 13px; }
        .area-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
        .area-pill { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 999px; color: var(--text-secondary); padding: 8px 12px; font-size: 14px; }
        .area-proof { display: grid; gap: 12px; margin-top: 18px; }
        .area-proof__link { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; font-weight: 600; line-height: 1.45; }
        @media (max-width: 960px) { .area-layout { grid-template-columns: 1fr; } .area-link-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .area-section { padding: 48px 0; } .area-link-grid { grid-template-columns: 1fr; } .area-panel { padding: 20px; } }
    </style>
${schemas}
</head>

<body class="area-page">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <div id="site-header"></div>

    <nav class="breadcrumbs" aria-label="Breadcrumb">
        <div class="container">
            <ol class="breadcrumbs__list">
                <li class="breadcrumbs__item"><a href="/" class="breadcrumbs__link">Home</a><svg
                        class="breadcrumbs__sep" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg></li>
                <li class="breadcrumbs__item"><a href="/service-areas/" class="breadcrumbs__link">Service Areas</a><svg
                        class="breadcrumbs__sep" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg></li>
                <li class="breadcrumbs__item breadcrumbs__item--current" aria-current="page">${escapeHtml(page.areaName)}</li>
            </ol>
        </div>
    </nav>

    <main id="main-content">
        <section class="svc-hero" aria-label="${escapeHtml(page.h1)}">
            <div class="svc-hero__bg">
                <img src="${page.heroImage}" alt="${escapeHtml(page.h1)}"
                    class="svc-hero__img" loading="eager" fetchpriority="high" width="640" height="640">
                <div class="svc-hero__overlay"></div>
            </div>
            <div class="container svc-hero__inner">
                <div class="svc-hero__badge">${escapeHtml(page.badge)}</div>
                <h1 class="svc-hero__title">${escapeHtml(page.h1)}<br><span class="text-accent">Repair ASAP</span></h1>
                <p class="svc-hero__subtitle">${escapeHtml(page.subtitle)}</p>
                <div class="svc-hero__actions">
                    <a href="/#contact" class="btn btn--accent btn--lg">Request a Free Quote</a>
                    <a href="sms:+17753107770" class="btn btn--outline btn--lg">Text Photos</a>
                </div>
                <div class="svc-hero__trust">
                    <div class="trust-item">Insured Business</div>
                    <div class="trust-item">COI Support</div>
                    <div class="trust-item">Photo-Based Quotes</div>
                    <div class="trust-item">NYC Apartments &amp; Homes</div>
                </div>
            </div>
        </section>

        <section class="area-section" aria-label="${escapeHtml(page.areaName)} service overview">
            <div class="container area-layout">
                <div class="area-copy">
                    <span class="section-tag">Service Area</span>
                    <h2 class="section-title">Handyman Help Built for ${escapeHtml(page.areaName)}</h2>
                    <p>${escapeHtml(page.localContext)}</p>
                    <p>For the fastest estimate, text photos, measurements, product links or model numbers, timing, address or neighborhood, parking or access notes, and any building or COI requirements. Repair ASAP confirms the quote before work begins.</p>
                </div>
                <aside class="area-panel" aria-label="Quote checklist">
                    <h2>Fast Quote Checklist</h2>
                    <p>Send these details before scheduling:</p>
                    <ul class="svc-checklist__list">
                        <li>Clear photos of the task area</li>
                        <li>Product link, model number, or hardware photo</li>
                        <li>Measurements and wall or floor type if known</li>
                        <li>Building, elevator, parking, or COI rules</li>
                        <li>Preferred day and appointment window</li>
                    </ul>
                </aside>
            </div>
        </section>

        <section class="area-section area-section--muted" aria-label="Priority services">
            <div class="container">
                <span class="section-tag">High-Intent Services</span>
                <h2 class="section-title">Most Requested Services in ${escapeHtml(page.areaName)}</h2>
                <p class="section-subtitle">These service pages give customers, search engines, and AI assistants a direct answer for common ${escapeHtml(page.areaName)} repair and installation searches.</p>
                <div class="area-link-grid">
${page.services.map(serviceCard).join('\n')}
                </div>
            </div>
        </section>

        <section class="area-section" aria-label="${escapeHtml(page.areaName)} neighborhoods and proof">
            <div class="container area-layout">
                <div>
                    <span class="section-tag">Neighborhoods</span>
                    <h2 class="section-title">Areas Covered</h2>
                    <p class="section-subtitle">Repair ASAP serves ${escapeHtml(page.areaName)} neighborhoods when scope, schedule, and route fit.</p>
                    <div class="area-pills">
${page.neighborhoods.map(neighborhoodPill).join('\n')}
                    </div>
                </div>
                <aside class="area-panel">
                    <h3>Related Work</h3>
                    <p>Use these pages as proof points and nearby examples when comparing scope.</p>
                    <div class="area-proof">
${proofLinks}
                    </div>
                </aside>
            </div>
        </section>

        <section class="svc-faq area-section area-section--muted" id="faq" aria-label="${escapeHtml(page.areaName)} handyman FAQ">
            <div class="container">
                <span class="section-tag">Local FAQ</span>
                <h2 class="section-title">${escapeHtml(page.areaName)} Handyman Questions</h2>
                <div class="svc-faq__accordion">
${page.faq.map(faqItem).join('\n')}
                </div>
            </div>
        </section>

        <section class="svc-cta" aria-label="Get a free quote">
            <div class="container">
                <div class="svc-cta__inner">
                    <h2 class="svc-cta__title">Need a Handyman in ${escapeHtml(page.areaName)}?</h2>
                    <p class="svc-cta__text">Send photos and a short task list. Repair ASAP will review the scope, confirm the quote, and schedule the work when the route and timing fit.</p>
                    <div class="svc-cta__actions">
                        <a href="/#contact" class="btn btn--accent btn--lg">Request a Free Quote</a>
                        <a href="/services/" class="btn btn--outline btn--lg">Browse All Services</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <div id="site-footer"></div>
    <script src="/components/loader.js?v=${LOADER_ASSET_VERSION}"></script>
    <script src="/main.js?v=${ASSET_VERSION}"></script>
</body>

</html>
`;
}

for (const page of pages) {
  const dir = join(ROOT, page.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), renderPage(page));
}

console.log(`Generated ${pages.length} area landing pages.`);

// Re-bake static header/footer into the freshly generated pages
execSync(`node ${new URL('./bake-components.mjs', import.meta.url).pathname}`, { stdio: 'inherit' });
