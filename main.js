/* ============================================
   REPAIR ASAP LLC — Main JavaScript
   ============================================ */

// ---- Analytics helpers ----
const REPAIR_ASAP_VISITOR_KEY = 'repair_asap_visitor_id';
const REPAIR_ASAP_THREAD_KEY = 'repair_asap_thread_id';
const REPAIR_ASAP_ATTRIBUTION_KEY = 'repair_asap_attribution';
const REPAIR_ASAP_ATTRIBUTION_VERSION = 2;
const REPAIR_ASAP_GA4_ID = 'G-1ZRVGCMZ43';
const REPAIR_ASAP_GA_CLIENT_TIMEOUT_MS = 2200;
const REPAIR_ASAP_GA_CLIENT_PRIME_DELAY_MS = 2600;
const REPAIR_ASAP_PHONE_CLICK_ENDPOINT = 'https://crm.asap.repair/api/widget/phone-click?org=repair-asap';
const REPAIR_ASAP_SMS_CLICK_ENDPOINT = 'https://crm.asap.repair/api/widget/sms-click?org=repair-asap';
const REPAIR_ASAP_TRACKING_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'ttclid'];
const REPAIR_ASAP_TRACKING_VALUE_MAX_LENGTH = 120;
const REPAIR_ASAP_URL_CONTEXT_MAX_LENGTH = 2000;
const REPAIR_ASAP_ATTRIBUTION_CONTEXT_KEYS = ['landingPage', 'landingPath', 'firstReferrer', 'firstTouchAt', 'latestPage', 'latestPath', 'latestReferrer', 'latestTouchAt'];
const REPAIR_ASAP_ATTRIBUTION_STORAGE_KEYS = new Set([
  'version',
  ...REPAIR_ASAP_ATTRIBUTION_CONTEXT_KEYS,
  ...REPAIR_ASAP_TRACKING_PARAM_KEYS,
  ...REPAIR_ASAP_TRACKING_PARAM_KEYS.map((name) => `latest_${name}`),
]);
const REPAIR_ASAP_CRM_TAXONOMY_VERSION = '2026-07-29';

/* Version of the price table behind the window-AC calculator that lives further down this
   file. Bump it on any edit to a figure that calculator can show — the data-lo / data-hi /
   data-surcharge / data-price attributes in the window-AC markup. The lead keeps the
   version that was live when the estimate was on screen, so a later price change never
   rewrites what the customer was told.
   components/modules/calculator.js owns a second price table (CONFIGS / VISIT_CONFIGS) and
   carries its own CALC_PRICE_VERSION; both are written into the same custom field, and
   calculator_config says which table produced the number. */
const REPAIR_ASAP_CALC_PRICE_VERSION = 'calc-2026-08-01';

/* The four outcomes a calculator can put in front of a customer. Anything else is a bug,
   not a new path — the CRM is allowed to treat this list as closed. */
const REPAIR_ASAP_QUOTE_PATHS = ['range', 'single', 'assessment_99', 'photo_estimate'];

/* Of those four, the two that put a PRICE FOR THE WORK on screen. Only these carry
   estimated_low / estimated_high / estimated_range.
   The other two are paths, not prices, and the difference is not cosmetic:
   - photo_estimate renders "FREE"; estimated_low: 0 would read downstream as free work.
   - assessment_99 renders "$99", but $99 buys an on-site assessment visit — no repair is
     performed for it and it is credited toward the job if the customer proceeds. The work
     minimum is $150. Sending estimated_low: 99 states a $99 job price that nobody quoted,
     and the CRM then binds the AI reply to it: lib/shown-price-snapshot.ts reads the
     numeric fields before the prose, returns outcome 'single' at $99 instead of
     'assessment_fee', and buildShownPricePromptSection emits "the customer's price
     expectation is $99. If you state a price, it must be that figure or a narrower band
     inside it." That is the $99-as-the-work-minimum mistake, restated to the model as a
     hard rule. The fee itself is not lost: it stays in calculator_estimate verbatim
     ("$99 on-site assessment, credited toward the work") and calculator_path names the
     branch. */
const REPAIR_ASAP_PRICED_QUOTE_PATHS = ['range', 'single'];

/* Every calculator on the site records its estimate through THIS function, so the CRM gets
   the same key names whichever calculator the customer used and never has to read a price
   out of prose.

   Rules, in order of importance:
   1. It is a record of what was DISPLAYED, not a recompute. low/high are the figures that
      were on screen; rangeText and displayText are those figures as the customer read them.
   2. A path that quoted no price FOR THE WORK sends NO price keys — see
      REPAIR_ASAP_PRICED_QUOTE_PATHS above. The free photo estimate renders "FREE" and the
      $99 assessment renders a visit fee; neither is an estimate of the job, and both land
      in the CRM as a job price if they are written into estimated_low.
   3. Scalars only. app/api/widget/quote/route.ts:112 drops any value that is not a string,
      number or boolean, so a nested object would disappear without a trace.
   4. Nothing is truncated here. The CRM applies one 240-char rule to every custom field
      (route.ts:116) and marks what it cut with an ellipsis; clipping first would hide that. */
function repairAsapBuildQuoteSnapshot(input) {
  const options = input || {};
  const path = REPAIR_ASAP_QUOTE_PATHS.includes(options.path) ? options.path : '';
  const snapshot = {
    calculator_config: String(options.configKey || ''),
    calculator_path: path,
    calculator_selection: String(options.selectionText || ''),
    calculator_estimate: String(options.displayText || ''),
    // Each calculator names the price table it read; a caller that owns its own table
    // (components/modules/calculator.js) passes that table's version.
    calculator_price_version: String(options.priceVersion || REPAIR_ASAP_CALC_PRICE_VERSION),
  };

  const low = Number(options.low);
  const high = Number(options.high);
  const showedAPrice = REPAIR_ASAP_PRICED_QUOTE_PATHS.includes(path)
    && Number.isFinite(low) && Number.isFinite(high);
  if (showedAPrice) {
    snapshot.estimated_low = low;
    snapshot.estimated_high = high;
    snapshot.estimated_range = String(options.rangeText || '');
  }

  return snapshot;
}

const REPAIR_ASAP_SERVICE_TAXONOMY = {
  'dishwasher-installation': {
    serviceCode: 'dishwasher_installation',
    label: 'Dishwasher Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'dishwasher',
    publicRoute: '/services/appliance-services/dishwasher-installation/',
    complianceFlags: ['new_plumbing_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'dryer-installation': {
    serviceCode: 'dryer_installation',
    label: 'Dryer Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'dryer',
    publicRoute: '/services/appliance-services/dryer-installation/',
    complianceFlags: ['gas_scope_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'microwave-installation': {
    serviceCode: 'microwave_installation',
    label: 'Microwave Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'microwave',
    publicRoute: '/services/appliance-services/microwave-installation/',
    complianceFlags: ['new_electrical_possible', 'permit_scope_possible'],
  },
  'range-installation': {
    serviceCode: 'range_installation',
    label: 'Range & Oven Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'range_oven',
    publicRoute: '/services/appliance-services/range-installation/',
    complianceFlags: ['gas_scope_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'refrigerator-installation': {
    serviceCode: 'refrigerator_installation',
    label: 'Refrigerator Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'refrigerator',
    publicRoute: '/services/appliance-services/refrigerator-installation/',
    complianceFlags: ['new_plumbing_possible', 'permit_scope_possible'],
  },
  'washer-dryer-installation': {
    serviceCode: 'washer_dryer_installation',
    label: 'Washer & Dryer Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'washer_dryer_combo',
    publicRoute: '/services/appliance-services/washer-dryer-installation/',
    complianceFlags: ['gas_scope_possible', 'new_plumbing_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'washer-installation': {
    serviceCode: 'washer_installation',
    label: 'Washer Installation',
    vertical: 'appliance_installation',
    intent: 'installation',
    quickbooksItem: 'Appliance Replacement Setup',
    marketSegment: 'residential',
    applianceType: 'washer',
    publicRoute: '/services/appliance-services/washer-installation/',
    complianceFlags: ['new_plumbing_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'appliance-repair': {
    serviceCode: 'appliance_diagnostic_visit',
    label: 'Appliance Diagnostic Visit',
    vertical: 'appliance_repair',
    intent: 'diagnostic',
    quickbooksItem: 'Appliance Diagnostic Visit',
    marketSegment: 'residential',
    publicRoute: '/services/appliance-services/appliance-repair/',
  },
  'refrigerator-repair': {
    serviceCode: 'refrigerator_repair_help',
    label: 'Refrigerator Repair Help',
    vertical: 'appliance_repair',
    intent: 'repair_or_replace',
    quickbooksItem: 'Refrigerator Repair Help',
    marketSegment: 'residential',
    applianceType: 'refrigerator',
    publicRoute: '/services/appliance-services/refrigerator-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'manufacturer_authorized_required'],
  },
  'dishwasher-repair': {
    serviceCode: 'dishwasher_repair_help',
    label: 'Dishwasher Repair Help',
    vertical: 'appliance_repair',
    intent: 'repair_or_replace',
    quickbooksItem: 'Dishwasher Repair Help',
    marketSegment: 'residential',
    applianceType: 'dishwasher',
    publicRoute: '/services/appliance-services/dishwasher-repair/',
    complianceFlags: ['new_plumbing_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'washer-repair': {
    serviceCode: 'washer_repair_help',
    label: 'Washer Repair Help',
    vertical: 'appliance_repair',
    intent: 'repair_or_replace',
    quickbooksItem: 'Washer Repair Help',
    marketSegment: 'residential',
    applianceType: 'washer',
    publicRoute: '/services/appliance-services/washer-repair/',
  },
  'dryer-repair': {
    serviceCode: 'dryer_repair_help',
    label: 'Dryer Repair Help',
    vertical: 'appliance_repair',
    intent: 'repair_or_replace',
    quickbooksItem: 'Dryer Repair Help',
    marketSegment: 'residential',
    applianceType: 'dryer',
    publicRoute: '/services/appliance-services/dryer-repair/',
    complianceFlags: ['gas_scope_possible', 'new_electrical_possible', 'permit_scope_possible'],
  },
  'oven-range-repair': {
    serviceCode: 'oven_range_repair_help',
    label: 'Oven & Range Repair Help',
    vertical: 'appliance_repair',
    intent: 'repair_or_replace',
    quickbooksItem: 'Oven & Range Repair Help',
    marketSegment: 'residential',
    applianceType: 'range_oven',
    publicRoute: '/services/appliance-services/oven-range-repair/',
    complianceFlags: ['gas_scope_possible', 'new_electrical_possible', 'manufacturer_authorized_required'],
  },
  'dryer-vent-cleaning': {
    serviceCode: 'dryer_vent_cleaning',
    label: 'Dryer Vent Cleaning',
    vertical: 'appliance_repair',
    intent: 'cleaning_maintenance',
    quickbooksItem: 'Dryer Vent Cleaning',
    marketSegment: 'residential',
    applianceType: 'dryer',
    publicRoute: '/services/appliance-services/dryer-vent-cleaning/',
  },
  'commercial-refrigeration': {
    serviceCode: 'commercial_refrigeration_triage',
    label: 'Commercial Refrigeration Triage',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Triage',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'commercial_refrigeration',
    publicRoute: '/services/appliance-services/commercial-refrigeration/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'reach-in-cooler-repair': {
    serviceCode: 'reach_in_cooler_repair_help',
    label: 'Reach-In Cooler Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'reach_in_cooler',
    publicRoute: '/services/appliance-services/reach-in-cooler-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'walk-in-cooler-repair': {
    serviceCode: 'walk_in_cooler_repair_help',
    label: 'Walk-In Cooler Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'walk_in_cooler',
    publicRoute: '/services/appliance-services/walk-in-cooler-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'prep-table-refrigerator-repair': {
    serviceCode: 'prep_table_refrigerator_repair_help',
    label: 'Prep Table Refrigerator Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'prep_table_refrigerator',
    publicRoute: '/services/appliance-services/prep-table-refrigerator-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'beverage-cooler-repair': {
    serviceCode: 'beverage_cooler_repair_help',
    label: 'Beverage Cooler Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'beverage_cooler',
    publicRoute: '/services/appliance-services/beverage-cooler-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'commercial-freezer-repair': {
    serviceCode: 'commercial_freezer_repair_help',
    label: 'Commercial Freezer Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'commercial_freezer',
    publicRoute: '/services/appliance-services/commercial-freezer-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'restaurant-refrigeration-repair': {
    serviceCode: 'restaurant_refrigeration_repair_help',
    label: 'Restaurant Refrigeration Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Commercial Refrigeration Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'restaurant_refrigeration',
    publicRoute: '/services/appliance-services/restaurant-refrigeration-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'ice-machine-repair': {
    serviceCode: 'ice_machine_repair_help',
    label: 'Ice Machine Repair Help',
    vertical: 'commercial_refrigeration',
    intent: 'diagnostic',
    quickbooksItem: 'Ice Machine Diagnostic',
    marketSegment: 'commercial_food_service',
    equipmentFamily: 'ice_machine',
    publicRoute: '/services/appliance-services/ice-machine-repair/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required', 'partner_referral_required', 'manufacturer_authorized_required'],
  },
  'ice-machine-cleaning': {
    serviceCode: 'ice_machine_cleaning',
    label: 'Ice Machine Cleaning',
    vertical: 'commercial_refrigeration',
    intent: 'cleaning_maintenance',
    quickbooksItem: 'Ice Machine Cleaning',
    marketSegment: 'commercial_food_service',
    applianceType: 'ice_machine',
    publicRoute: '/services/appliance-services/ice-machine-cleaning/',
    complianceFlags: ['refrigerant_work_possible', 'epa_608_required', 'partner_referral_required'],
  },
  'ac-repair-help': {
    serviceCode: 'ac_repair_help',
    label: 'AC Repair Help',
    vertical: 'ac_install_cleaning',
    intent: 'repair_or_replace',
    quickbooksItem: 'AC Repair Help',
    marketSegment: 'residential',
    applianceType: 'window_ac',
    publicRoute: '/services/ac-installation-cleaning/ac-repair-help/',
    complianceFlags: ['refrigerant_work_possible', 'sealed_system_possible', 'epa_608_required'],
  },
  'ac-deep-cleaning': {
    serviceCode: 'ac_deep_cleaning',
    label: 'AC Deep Cleaning',
    vertical: 'ac_install_cleaning',
    intent: 'cleaning_maintenance',
    quickbooksItem: 'AC Deep Cleaning',
    marketSegment: 'residential',
    applianceType: 'window_ac',
    publicRoute: '/services/ac-installation-cleaning/ac-deep-cleaning/',
  },
};
const REPAIR_ASAP_SERVICE_LABEL_TO_SLUG = Object.keys(REPAIR_ASAP_SERVICE_TAXONOMY).reduce((acc, slug) => {
  const label = REPAIR_ASAP_SERVICE_TAXONOMY[slug].label;
  acc[label.toLowerCase()] = slug;
  return acc;
}, {
  'appliance services': 'appliance-repair',
  'ac installation & cleaning': 'ac-deep-cleaning',
});
let repairAsapGaClientIdPromise = null;
let repairAsapGaClientIdCached = '';
let repairAsapVolatileAttribution = {};

function repairAsapTrackEvent(eventName, params) {
  const safeParams = params || {};

  if (typeof window.repairAsapLoadAnalyticsVendors === 'function') {
    window.repairAsapLoadAnalyticsVendors();
  }

  if (typeof gtag === 'function') {
    gtag('event', eventName, safeParams);
  }

  // Microsoft Clarity exposes a global `clarity()` function after its tag is installed.
  // This is intentionally event-name only so no phone, email, address, or message text is sent.
  if (typeof clarity === 'function') {
    clarity('event', eventName);
  }
}

function repairAsapBuildLeadEventParams(payload, result, formType) {
  const params = {
    event_category: 'lead',
    event_label: payload?.service || 'unknown',
    form_type: formType,
    lead_source: 'website',
    booking_status: result?.booked ? 'booked' : 'lead_only',
  };

  if (result?.contactId) params.crm_contact_id = result.contactId;
  if (result?.conversationId) params.crm_conversation_id = result.conversationId;
  if (result?.appointmentId) params.crm_appointment_id = result.appointmentId;
  if (result?.jobId) params.crm_job_id = result.jobId;
  if (result?.startTime) params.appointment_start = result.startTime;
  if (payload?.date) params.requested_date = payload.date;

  return params;
}

function repairAsapBuildPageServiceContext(pathname) {
  const ctx = {};
  const path = typeof pathname === 'string' && pathname ? pathname : window.location.pathname;
  if (path && path !== '/') {
    ctx.source_page = path.slice(0, 240);
  }

  const svc = path.match(/^\/services\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?$/);
  if (svc) {
    ctx.service_category = svc[1];
    if (svc[2]) ctx.sub_service = svc[2];
  }

  return ctx;
}

function repairAsapBuildServiceLeadContext(options = {}) {
  const serviceLabel = typeof options.service === 'string' ? options.service.trim() : '';
  const path = typeof options.path === 'string' ? options.path : window.location.pathname;
  const ctx = {
    crm_taxonomy_version: REPAIR_ASAP_CRM_TAXONOMY_VERSION,
    ...repairAsapBuildPageServiceContext(path),
  };

  if (serviceLabel) {
    ctx.requested_service_label = serviceLabel.slice(0, 160);
  }

  const serviceSlug = ctx.sub_service || REPAIR_ASAP_SERVICE_LABEL_TO_SLUG[serviceLabel.toLowerCase()];
  const taxonomy = serviceSlug ? REPAIR_ASAP_SERVICE_TAXONOMY[serviceSlug] : null;
  if (!taxonomy) return ctx;

  ctx.service_code = taxonomy.serviceCode;
  ctx.service_label = taxonomy.label;
  ctx.service_vertical = taxonomy.vertical;
  ctx.lead_intent = taxonomy.intent;
  ctx.market_segment = taxonomy.marketSegment;
  ctx.quickbooks_item = taxonomy.quickbooksItem;
  ctx.crm_public_route = taxonomy.publicRoute;

  if (taxonomy.applianceType) {
    ctx.appliance_type = taxonomy.applianceType;
  }
  if (taxonomy.equipmentFamily) {
    ctx.equipment_family = taxonomy.equipmentFamily;
  }
  if (taxonomy.complianceFlags?.length) {
    ctx.compliance_flags = taxonomy.complianceFlags.join('|');
    taxonomy.complianceFlags.forEach((flag) => {
      ctx[flag] = 'possible';
    });
  }

  return ctx;
}

function repairAsapGetOrCreateVisitorId() {
  try {
    let visitorId = localStorage.getItem(REPAIR_ASAP_VISITOR_KEY);
    if (!visitorId) {
      const random = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      visitorId = `v_${random}`;
      localStorage.setItem(REPAIR_ASAP_VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch (_) {
    return `volatile_${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function repairAsapGetStoredThreadId() {
  try {
    return localStorage.getItem(REPAIR_ASAP_THREAD_KEY) || '';
  } catch (_) {
    return '';
  }
}

function repairAsapReadStoredJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function repairAsapNormalizeStoredAttribution(record) {
  const stored = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
  Object.keys(stored).forEach((name) => {
    if (!REPAIR_ASAP_ATTRIBUTION_STORAGE_KEYS.has(name)) delete stored[name];
  });
  // Paths are never trusted independently: they are regenerated only from the
  // corresponding sanitized same-record URL during page-load capture.
  delete stored.landingPath;
  delete stored.latestPath;
  REPAIR_ASAP_TRACKING_PARAM_KEYS.forEach((name) => {
    [name, `latest_${name}`].forEach((field) => {
      if (typeof stored[field] !== 'string') {
        delete stored[field];
        return;
      }
      const value = stored[field].trim().slice(0, REPAIR_ASAP_TRACKING_VALUE_MAX_LENGTH);
      if (value) stored[field] = value;
      else delete stored[field];
    });
  });
  ['firstTouchAt', 'latestTouchAt'].forEach((field) => {
    if (typeof stored[field] !== 'string' || !stored[field].trim()) {
      delete stored[field];
      return;
    }
    const timestamp = new Date(stored[field]);
    if (Number.isNaN(timestamp.getTime())) delete stored[field];
    else stored[field] = timestamp.toISOString();
  });
  return stored;
}

function repairAsapCollectTrackingParams() {
  const out = {};
  try {
    const params = new URLSearchParams(window.location.search);
    REPAIR_ASAP_TRACKING_PARAM_KEYS.forEach((name) => {
      const value = params.get(name)?.trim();
      if (value) out[name] = value.slice(0, REPAIR_ASAP_TRACKING_VALUE_MAX_LENGTH);
    });
  } catch (_) {}
  return out;
}

function repairAsapSanitizeAttributionUrl(input, keepTrackingParams = false) {
  if (typeof input !== 'string' || !input.trim()) return { url: '', path: '', origin: '' };
  try {
    const parsed = new URL(input, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return { url: '', path: '', origin: '' };
    const safe = new URL(`${parsed.origin}${parsed.pathname}`);
    if (keepTrackingParams) {
      REPAIR_ASAP_TRACKING_PARAM_KEYS.forEach((name) => {
        const value = parsed.searchParams.get(name)?.trim();
        if (value) safe.searchParams.set(name, value.slice(0, REPAIR_ASAP_TRACKING_VALUE_MAX_LENGTH));
      });
    }
    return {
      url: safe.href.slice(0, REPAIR_ASAP_URL_CONTEXT_MAX_LENGTH),
      path: safe.pathname.slice(0, REPAIR_ASAP_URL_CONTEXT_MAX_LENGTH),
      origin: safe.origin,
    };
  } catch (_) {
    return { url: '', path: '', origin: '' };
  }
}

function repairAsapCaptureAttribution() {
  const stored = repairAsapNormalizeStoredAttribution(repairAsapReadStoredJson(REPAIR_ASAP_ATTRIBUTION_KEY));
  let rawPage = '';
  let rawReferrer = '';
  try { rawPage = window.location.href; } catch (_) {}
  try { rawReferrer = document.referrer || ''; } catch (_) {}
  const page = repairAsapSanitizeAttributionUrl(rawPage, true);
  const referrer = repairAsapSanitizeAttributionUrl(rawReferrer, false);
  const now = new Date().toISOString();
  const params = repairAsapCollectTrackingParams();

  // Sanitize legacy v1 values in place so arbitrary query strings or hashes are
  // never carried forward after this version loads.
  if (stored.landingPage) {
    const legacyLanding = repairAsapSanitizeAttributionUrl(stored.landingPage, true);
    if (legacyLanding.url && legacyLanding.origin === page.origin) {
      stored.landingPage = legacyLanding.url;
      stored.landingPath = legacyLanding.path;
    } else {
      delete stored.landingPage;
      delete stored.landingPath;
    }
  }
  if (stored.firstReferrer) {
    stored.firstReferrer = repairAsapSanitizeAttributionUrl(stored.firstReferrer, false).url;
  }
  const hasCompleteFirstTouch = Boolean(stored.landingPage && stored.firstTouchAt);
  // First touch is an atomic, immutable snapshot. An explicitly empty referrer
  // records a direct visit and prevents a later same-origin referrer from
  // rewriting the original acquisition context.
  if (!hasCompleteFirstTouch) {
    ['landingPage', 'landingPath', 'firstReferrer', 'firstTouchAt', ...REPAIR_ASAP_TRACKING_PARAM_KEYS]
      .forEach((name) => delete stored[name]);
    stored.landingPage = page.url;
    stored.landingPath = page.path;
    stored.firstReferrer = referrer.url;
    stored.firstTouchAt = now;
    REPAIR_ASAP_TRACKING_PARAM_KEYS.forEach((name) => {
      if (params[name]) stored[name] = params[name];
    });
  } else if (!Object.prototype.hasOwnProperty.call(stored, 'firstReferrer')) {
    stored.firstReferrer = '';
  }

  // Latest touch means the latest acquisition touch, not every internal page
  // view. Current-page context is already carried separately as `page`.
  if (stored.latestPage) {
    const legacyLatest = repairAsapSanitizeAttributionUrl(stored.latestPage, true);
    if (legacyLatest.url && legacyLatest.origin === page.origin) {
      stored.latestPage = legacyLatest.url;
      stored.latestPath = legacyLatest.path;
    } else {
      delete stored.latestPage;
      delete stored.latestPath;
    }
  }
  if (stored.latestReferrer) {
    stored.latestReferrer = repairAsapSanitizeAttributionUrl(stored.latestReferrer, false).url;
  }
  const hasCompleteLatestTouch = Boolean(stored.latestPage && stored.latestTouchAt);
  if (!hasCompleteLatestTouch) {
    ['latestPage', 'latestPath', 'latestReferrer', 'latestTouchAt', ...REPAIR_ASAP_TRACKING_PARAM_KEYS.map((name) => `latest_${name}`)]
      .forEach((name) => delete stored[name]);
  }
  const hasCampaignSignal = REPAIR_ASAP_TRACKING_PARAM_KEYS.some((name) => Boolean(params[name]));
  const hasExternalReferrer = Boolean(referrer.origin && page.origin && referrer.origin !== page.origin);
  const shouldReplaceLatest = !hasCompleteLatestTouch || hasCampaignSignal || hasExternalReferrer;
  if (shouldReplaceLatest) {
    stored.latestPage = page.url;
    stored.latestPath = page.path;
    stored.latestReferrer = referrer.url;
    stored.latestTouchAt = now;
    REPAIR_ASAP_TRACKING_PARAM_KEYS.forEach((name) => {
      const latestName = `latest_${name}`;
      if (params[name]) stored[latestName] = params[name];
      else delete stored[latestName];
    });
  }

  stored.version = REPAIR_ASAP_ATTRIBUTION_VERSION;
  repairAsapVolatileAttribution = { ...stored };
  try {
    localStorage.setItem(REPAIR_ASAP_ATTRIBUTION_KEY, JSON.stringify(stored));
  } catch (_) {}
  return stored;
}

function repairAsapGetAttributionContext() {
  const storedValue = repairAsapReadStoredJson(REPAIR_ASAP_ATTRIBUTION_KEY);
  const stored = storedValue.firstTouchAt ? storedValue : repairAsapVolatileAttribution;
  const out = {};
  REPAIR_ASAP_ATTRIBUTION_CONTEXT_KEYS.forEach((name) => {
    if (typeof stored[name] === 'string' && stored[name]) out[name] = stored[name];
  });
  REPAIR_ASAP_TRACKING_PARAM_KEYS.forEach((name) => {
    if (stored[name]) out[name] = stored[name];
    const latestName = `latest_${name}`;
    if (stored[latestName]) out[latestName] = stored[latestName];
  });
  return out;
}

// Capture before a visitor can navigate away and lose the landing query string.
repairAsapCaptureAttribution();

function repairAsapCacheGaClientId(clientId) {
  const value = typeof clientId === 'string' ? clientId.trim() : '';
  if (value) repairAsapGaClientIdCached = value;
  return value;
}

function repairAsapGetGaClientId() {
  try {
    const cookie = document.cookie
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith('_ga='));
    if (!cookie) return repairAsapGaClientIdCached;
    const value = decodeURIComponent(cookie.slice(4));
    const match = value.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
    return match ? repairAsapCacheGaClientId(match[1]) : repairAsapGaClientIdCached;
  } catch (_) {
    return repairAsapGaClientIdCached;
  }
}

function repairAsapGetGaClientIdAsync() {
  const cookieClientId = repairAsapGetGaClientId();
  if (cookieClientId) return Promise.resolve(cookieClientId);
  if (repairAsapGaClientIdPromise) return repairAsapGaClientIdPromise;

  repairAsapGaClientIdPromise = new Promise((resolve) => {
    let settled = false;
    const finish = (clientId = '') => {
      if (settled) return;
      settled = true;
      resolve(repairAsapCacheGaClientId(clientId) || '');
    };
    const timer = setTimeout(() => finish(''), REPAIR_ASAP_GA_CLIENT_TIMEOUT_MS);

    try {
      if (typeof window.repairAsapLoadAnalyticsVendors === 'function') {
        window.repairAsapLoadAnalyticsVendors();
      }

      if (typeof gtag !== 'function') {
        clearTimeout(timer);
        finish('');
        return;
      }

      gtag('get', REPAIR_ASAP_GA4_ID, 'client_id', (clientId) => {
        clearTimeout(timer);
        finish(typeof clientId === 'string' ? clientId : '');
      });
    } catch (_) {
      clearTimeout(timer);
      finish('');
    }
  }).then((clientId) => {
    const resolvedClientId = repairAsapCacheGaClientId(clientId) || repairAsapGetGaClientId();
    if (!resolvedClientId) repairAsapGaClientIdPromise = null;
    return resolvedClientId;
  });

  return repairAsapGaClientIdPromise;
}

function repairAsapPrimeGaClientId() {
  if (repairAsapGetGaClientId()) return;
  repairAsapGetGaClientIdAsync().catch(() => {});
}

function repairAsapInstallGaClientPriming() {
  try {
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((eventName) => {
      window.addEventListener(eventName, repairAsapPrimeGaClientId, { once: true, passive: true });
    });

    const schedulePrime = () => {
      window.setTimeout(repairAsapPrimeGaClientId, REPAIR_ASAP_GA_CLIENT_PRIME_DELAY_MS);
    };

    if (document.readyState === 'complete') {
      schedulePrime();
    } else {
      window.addEventListener('load', schedulePrime, { once: true });
    }
  } catch (_) {}
}

function repairAsapBuildSessionContext() {
  const sessionContext = {};
  try {
    sessionContext.page = repairAsapSanitizeAttributionUrl(window.location.href, true).url;
  } catch (_) {}
  try {
    sessionContext.referrer = repairAsapSanitizeAttributionUrl(document.referrer || '', false).url;
  } catch (_) {}
  try { sessionContext.language = navigator.language || ''; } catch (_) {}
  try { sessionContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}
  sessionContext.visitorId = repairAsapGetOrCreateVisitorId();
  Object.assign(sessionContext, repairAsapGetAttributionContext());
  return sessionContext;
}

function repairAsapGetSessionContext() {
  const sessionContext = repairAsapBuildSessionContext();
  try {
    const gaClientId = repairAsapGetGaClientId();
    if (gaClientId) sessionContext.gaClientId = gaClientId;
  } catch (_) {}
  return sessionContext;
}

async function repairAsapGetSessionContextAsync() {
  const sessionContext = repairAsapGetSessionContext();
  // Compatibility API only: callers receive immediately available context.
  // GA retrieval continues in the background and can enrich later actions,
  // but can never delay or prevent the current customer action.
  repairAsapPrimeGaClientId();
  return Promise.resolve(sessionContext);
}

function repairAsapPostJsonBeacon(url, payload) {
  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'text/plain' });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch (_) {}

  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch (_) {}
}

function repairAsapTrackPhoneClickToCrm(telLink) {
  if (!telLink) return;

  const sessionContext = repairAsapGetSessionContext();
  const payload = {
    threadId: repairAsapGetStoredThreadId(),
    phoneHref: telLink.href || '',
    phoneLabel: (telLink.textContent || '').trim(),
    sessionContext,
  };

  repairAsapPostJsonBeacon(REPAIR_ASAP_PHONE_CLICK_ENDPOINT, payload);
}

function repairAsapTrackSmsClickToCrm(smsLink) {
  if (!smsLink) return;

  const sessionContext = repairAsapGetSessionContext();
  const payload = {
    threadId: repairAsapGetStoredThreadId(),
    smsHref: smsLink.href || '',
    smsLabel: (smsLink.textContent || '').trim(),
    sessionContext,
  };

  repairAsapPostJsonBeacon(REPAIR_ASAP_SMS_CLICK_ENDPOINT, payload);
}

window.repairAsapTrackEvent = repairAsapTrackEvent;

/* --------------------------------------------------
   CONVERSION-BLOCK VISIBILITY (GA4)
   Fires once per block per pageview when a conversion
   element scrolls into view, so we can tell which of
   the new blocks (pricing panel, calculator, gallery,
   reviews) actually precede a submitted quote.
   -------------------------------------------------- */
function repairAsapTrackConversionBlocks() {
  if (!('IntersectionObserver' in window)) return;
  const BLOCKS = [
    ['#pricing', 'pricing_panel'],
    ['[data-module="calculator"]', 'calculator'],
    ['.svc-gallery', 'photo_gallery'],
    ['.svc-testimonials, .review-card', 'reviews'],
  ];
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const name = entry.target.dataset.conversionBlock;
      if (!name || seen.has(name)) return;
      seen.add(name);
      io.unobserve(entry.target);
      repairAsapTrackEvent('conversion_block_view', {
        event_category: 'engagement',
        block: name,
        page_path: window.location.pathname,
      });
    });
  }, { threshold: 0.4 });

  BLOCKS.forEach(([selector, name]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.dataset.conversionBlock = name;
    io.observe(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', repairAsapTrackConversionBlocks);
} else {
  repairAsapTrackConversionBlocks();
}
document.addEventListener('components-loaded', repairAsapTrackConversionBlocks);

window.repairAsapBuildLeadEventParams = repairAsapBuildLeadEventParams;
window.repairAsapBuildServiceLeadContext = repairAsapBuildServiceLeadContext;
window.repairAsapBuildQuoteSnapshot = repairAsapBuildQuoteSnapshot;
window.REPAIR_ASAP_CALC_PRICE_VERSION = REPAIR_ASAP_CALC_PRICE_VERSION;
window.repairAsapGetStoredThreadId = repairAsapGetStoredThreadId;
window.repairAsapGetSessionContext = repairAsapGetSessionContext;
window.repairAsapGetSessionContextAsync = repairAsapGetSessionContextAsync;
window.repairAsapPrimeGaClientId = repairAsapPrimeGaClientId;
window.repairAsapTrackPhoneClickToCrm = repairAsapTrackPhoneClickToCrm;
window.repairAsapTrackSmsClickToCrm = repairAsapTrackSmsClickToCrm;

repairAsapInstallGaClientPriming();

// ---- Google Places Autocomplete ----
function getAddressComponentValue(components, type, preferShort = false) {
  const component = components?.find(c => c.types?.includes(type));
  if (!component) return '';
  return preferShort
    ? (component.shortText || component.short_name || component.longText || component.long_name || '')
    : (component.longText || component.long_name || component.shortText || component.short_name || '');
}

function applySelectedAddress(input, zip, formattedAddress, components) {
  if (!input) return;

  input.value = formattedAddress || input.value || '';
  input.classList.remove('error');
  input.classList.add('success');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));

  const zipValue = getAddressComponentValue(components, 'postal_code', true);
  if (zipValue && zip) {
    zip.value = zipValue;
    zip.classList.remove('error');
    zip.classList.add('success');
    zip.dispatchEvent(new Event('input', { bubbles: true }));
    zip.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function initPlaceAutocompleteElementField(input, zip) {
  const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
    includedRegionCodes: ['US'],
  });
  const label = input.closest('.form-group')?.querySelector('.form-label')?.textContent?.trim();
  const currentValue = input.value;
  const shouldRestoreFocus = document.activeElement === input;

  autocompleteElement.id = `${input.id}-autocomplete`;
  autocompleteElement.classList.add('places-autocomplete-element');
  autocompleteElement.placeholder = input.getAttribute('placeholder') || 'Service address';
  if (currentValue) autocompleteElement.value = currentValue;
  if (label) autocompleteElement.setAttribute('aria-label', label);

  autocompleteElement.addEventListener('input', () => {
    if (typeof autocompleteElement.value === 'string') {
      input.value = autocompleteElement.value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  autocompleteElement.addEventListener('change', () => {
    if (typeof autocompleteElement.value === 'string') {
      input.value = autocompleteElement.value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  autocompleteElement.addEventListener('gmp-select', async ({ placePrediction }) => {
    if (!placePrediction) return;
    const place = placePrediction.toPlace();
    await place.fetchFields({ fields: ['formattedAddress', 'addressComponents'] });
    applySelectedAddress(input, zip, place.formattedAddress, place.addressComponents);
  });

  autocompleteElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  const syncStateClasses = () => {
    autocompleteElement.classList.toggle('error', input.classList.contains('error'));
    autocompleteElement.classList.toggle('success', input.classList.contains('success'));
  };
  new MutationObserver(syncStateClasses).observe(input, { attributes: true, attributeFilter: ['class'] });

  input.before(autocompleteElement);
  input.classList.add('places-autocomplete-source');
  input.setAttribute('aria-hidden', 'true');
  input.tabIndex = -1;
  input._placesWidget = autocompleteElement;

  if (shouldRestoreFocus) {
    requestAnimationFrame(() => autocompleteElement.focus?.());
  }
}

function initLegacyPlacesAutocompleteField(input, zip) {
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['address'],
    componentRestrictions: { country: 'us' },
    fields: ['address_components', 'formatted_address'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.address_components) return;
    applySelectedAddress(input, zip, place.formatted_address, place.address_components);
  });

  // Prevent form submission when pressing Enter in autocomplete dropdown
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && pacContainer.style.display !== 'none') {
        e.preventDefault();
      }
    }
  });
}

function clearPlacesAutocompleteField(input) {
  if (!input) return;
  input.value = '';
  input.classList.remove('error', 'success');
  if (input._placesWidget) {
    input._placesWidget.value = '';
    input._placesWidget.classList.remove('error', 'success');
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function loadPlacesAutocomplete() {
  if (window.google?.maps?.places) {
    initPlacesAutocomplete();
    return Promise.resolve();
  }

  if (window.__repairAsapPlacesLoadingPromise) {
    return window.__repairAsapPlacesLoadingPromise;
  }

  const src = window.__repairAsapPlacesScriptSrc;
  if (!src) return Promise.resolve();

  window.__repairAsapPlacesLoadingPromise = new Promise((resolve, reject) => {
    const fail = (error) => {
      error?.target?.remove?.();
      window.__repairAsapPlacesLoadingPromise = null;
      reject(error);
    };

    const existing = document.querySelector('script[data-repair-asap-places]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.repairAsapPlaces = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', fail, { once: true });
    document.head.appendChild(script);
  });

  return window.__repairAsapPlacesLoadingPromise;
}

function initPlacesAutocomplete() {
  if (!window.google?.maps?.places) return;

  const addressFields = [
    { input: document.getElementById('inline-address'), zip: document.getElementById('zip') },
    { input: document.getElementById('modal-address'), zip: document.getElementById('modal-zip') },
  ];

  addressFields.forEach(({ input, zip }) => {
    if (!input || input._placesInitialized) return;

    if (google.maps.places.PlaceAutocompleteElement) {
      initPlaceAutocompleteElementField(input, zip);
    } else if (google.maps.places.Autocomplete) {
      initLegacyPlacesAutocompleteField(input, zip);
    }

    input._placesInitialized = true;
  });
}
// Make helpers global for the deferred Google Maps loader, callback, and modal/date reset code.
window.loadPlacesAutocomplete = loadPlacesAutocomplete;
window.initPlacesAutocomplete = initPlacesAutocomplete;
window.clearPlacesAutocompleteField = clearPlacesAutocompleteField;

// If the async Google callback fired before this file loaded, or Google finished
// loading before this helper was defined, initialize now from the real function.
if (window.google?.maps?.places) {
  initPlacesAutocomplete();
}

/* --------------------------------------------------
   PAGE-SPECIFIC INIT (runs immediately on DOMContentLoaded)
   These features don't depend on the dynamically loaded
   header/footer components.
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  // ---- Email Link Hydration ----
  // Keep raw email addresses out of static HTML so Cloudflare email protection
  // does not create crawler-visible /cdn-cgi/l/email-protection links.
  function hydrateEmailLinks(root = document) {
    root.querySelectorAll('.js-email-link[data-email-user][data-email-domain]').forEach(link => {
      const email = `${link.dataset.emailUser}@${link.dataset.emailDomain}`;
      link.href = `mailto:${email}`;
      link.textContent = email;
    });
  }

  hydrateEmailLinks();
  document.addEventListener('components-loaded', () => hydrateEmailLinks());

  // ---- GA4 / Clarity Conversion Event Tracking ----
  function trackEvent(eventName, params) {
    window.repairAsapTrackEvent?.(eventName, params);
  }

  // Track first form interaction without capturing field values.
  const trackedFormStarts = new WeakSet();
  document.addEventListener('input', (e) => {
    const form = e.target.closest('form');
    if (!form || trackedFormStarts.has(form)) return;

    const formType = form.id === 'quoteForm' ? 'inline' : (form.id || 'unknown');
    trackedFormStarts.add(form);
    trackEvent('form_start', {
      event_category: 'lead',
      form_type: formType,
      page_path: window.location.pathname,
    });
  }, true);

  // Track all phone link clicks
  document.addEventListener('click', (e) => {
    const telLink = e.target.closest('a[href^="tel:"]');
    if (telLink) {
      trackEvent('phone_click', {
        event_category: 'contact',
        event_label: telLink.textContent.trim(),
        link_url: telLink.href,
      });
      window.repairAsapTrackPhoneClickToCrm?.(telLink);
    }

    // Track SMS link clicks
    const smsLink = e.target.closest('a[href^="sms:"]');
    if (smsLink) {
      trackEvent('sms_click', {
        event_category: 'contact',
        event_label: smsLink.textContent.trim(),
        link_url: smsLink.href,
      });
      window.repairAsapTrackSmsClickToCrm?.(smsLink);
    }
  });

  // Load Google Places only when a customer is about to enter an address.
  function bindDeferredPlacesLoader(root = document) {
    const selectors = '#inline-address, #modal-address, #inlineAddressGroup input, #addressGroup input';
    root.querySelectorAll(selectors).forEach((field) => {
      if (field._placesLoaderBound) return;
      field._placesLoaderBound = true;
      ['focus', 'pointerdown'].forEach((eventName) => {
        field.addEventListener(eventName, () => {
          window.loadPlacesAutocomplete?.().catch(() => {});
        }, { passive: true });
      });
    });
  }

  bindDeferredPlacesLoader();
  document.addEventListener('components-loaded', () => bindDeferredPlacesLoader());

  // ---- Mobile Sticky CTA Bar (hide when footer visible) ----
  function bindMobileStickyCta() {
    const stickyBar = document.getElementById('mobileStickyCtaBar');
    if (!stickyBar || stickyBar.dataset.bound === 'true') return;

    const footerEl = document.querySelector('.footer') || document.getElementById('site-footer');
    if (!footerEl) return;

    stickyBar.dataset.bound = 'true';
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        stickyBar.classList.toggle('hidden', entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    stickyObserver.observe(footerEl);
  }

  bindMobileStickyCta();
  document.addEventListener('components-loaded', bindMobileStickyCta);

  // ---- Scroll Reveal (Intersection Observer) ----
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        const i = Array.from(siblings).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));




  // ---- Animated Counters ----
  const counters = document.querySelectorAll('.stat-number[data-target]');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) counterObserver.observe(statsSection);

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const startTime = performance.now();

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.round(easedProgress * target);

        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ---- FAQ Accordion ----
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(faq => {
        faq.classList.remove('active');
        faq.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if wasn't already open)
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- Form Validation & Submit ----
  const form = document.getElementById('quoteForm');
  const submitBtn = document.getElementById('submitBtn');

  // Inline form calendar picker elements
  const inlineDateInput = form?.querySelector('#date');
  const inlineTimeSlotGroup = document.getElementById('inlineTimeSlotGroup');
  const inlineTimeSlotsEl = document.getElementById('inlineTimeSlots');
  const inlineTimeInput = document.getElementById('inline-time');
  const inlineAddressGroup = document.getElementById('inlineAddressGroup');
  const inlineAddressInput = document.getElementById('inline-address');
  const inlineDateClear = document.getElementById('inlineDateClear');
  const SLOTS_API = 'https://crm.asap.repair/api/calendar/slots?org=repair-asap';
  let inlineSlotsLoadFailed = false; // true when the slots API errored for the selected date

  // Date change → fetch time slots
  if (inlineDateInput) {
    const today = new Date().toISOString().split('T')[0];
    inlineDateInput.setAttribute('min', today);

    inlineDateInput.addEventListener('change', async () => {
      const date = inlineDateInput.value;
      if (inlineDateClear) inlineDateClear.style.display = date ? 'block' : 'none';
      if (!date || !inlineTimeSlotGroup || !inlineTimeSlotsEl) return;

      inlineTimeInput.value = '';
      inlineSlotsLoadFailed = false;
      inlineTimeSlotGroup.style.display = 'block';
      if (inlineAddressGroup) inlineAddressGroup.style.display = 'block';
      // Mark ZIP as required for booking
      const zipLabel = form?.querySelector('#zip')?.closest('.form-group')?.querySelector('.form-label');
      if (zipLabel && !zipLabel.querySelector('.zip-required')) {
        zipLabel.innerHTML = zipLabel.innerHTML.replace('(optional)', '<span class="zip-required" style="color:var(--accent);font-weight:500">*</span>');
      }
      inlineTimeSlotsEl.innerHTML = '<div class="time-slots__loading"><span class="spinner-sm"></span> Loading available times...</div>';

      try {
        const resp = await fetch(`${SLOTS_API}&date=${date}`);
        if (!resp.ok) throw new Error(`slots request failed: ${resp.status}`);
        const data = await resp.json();

        if (!data.slots || data.slots.length === 0) {
          inlineTimeSlotsEl.innerHTML = '<p class="time-slots__empty">No available times on this date. Please try another day.</p>';
          return;
        }

        inlineTimeSlotsEl.innerHTML = data.slots.map((slot, i) => {
          const raw = data.raw?.[i] || slot;
          return `<button type="button" class="time-slot" data-time="${raw}" data-label="${slot}">${slot}</button>`;
        }).join('');

        inlineTimeSlotsEl.querySelectorAll('.time-slot').forEach(btn => {
          btn.addEventListener('click', () => {
            inlineTimeSlotsEl.querySelectorAll('.time-slot').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            inlineTimeInput.value = btn.dataset.time;
            if (inlineTimeSlotGroup) inlineTimeSlotGroup.classList.remove('has-error');
          });
        });
      } catch (err) {
        inlineSlotsLoadFailed = true;
        inlineTimeSlotsEl.innerHTML = '<p class="time-slots__empty">Failed to load times. You can still submit without a time selection.</p>';
        // Not in booking mode anymore: restore ZIP as optional
        const zipLbl = form?.querySelector('#zip')?.closest('.form-group')?.querySelector('.form-label');
        if (zipLbl && zipLbl.querySelector('.zip-required')) {
          zipLbl.innerHTML = 'ZIP Code <span style="color:var(--text-muted);font-weight:400">(optional)</span>';
        }
      }
    });
  }

  // Clear date button
  if (inlineDateClear && inlineDateInput) {
    inlineDateClear.addEventListener('click', () => {
      inlineDateInput.value = '';
      inlineDateClear.style.display = 'none';
      if (inlineTimeSlotGroup) inlineTimeSlotGroup.style.display = 'none';
      if (inlineTimeSlotsEl) inlineTimeSlotsEl.innerHTML = '';
      if (inlineTimeInput) inlineTimeInput.value = '';
      if (inlineAddressGroup) inlineAddressGroup.style.display = 'none';
      if (inlineAddressInput) clearPlacesAutocompleteField(inlineAddressInput);
      // Restore ZIP as optional
      const zipLabel = form?.querySelector('#zip')?.closest('.form-group')?.querySelector('.form-label');
      if (zipLabel && zipLabel.querySelector('.zip-required')) {
        zipLabel.innerHTML = 'ZIP Code <span style="color:var(--text-muted);font-weight:400">(optional)</span>';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
      });
      form.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error', 'success');
      });

      let isValid = true;

      // Validate required text inputs
      form.querySelectorAll('.form-input[required]').forEach(input => {
        if (!input.value.trim()) {
          showError(input);
          isValid = false;
        } else {
          input.classList.add('success');
        }
      });

      // Validate email (optional, but check format if provided)
      const email = form.querySelector('#email');
      if (email && email.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          showError(email);
          isValid = false;
        } else {
          email.classList.add('success');
        }
      }

      // Validate phone
      const phone = form.querySelector('#phone');
      if (phone && phone.value.trim()) {
        const phoneDigits = phone.value.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          showError(phone);
          isValid = false;
        } else {
          phone.classList.add('success');
        }
      }

      // Validate service
      const service = form.querySelector('#service');
      if (!service.value) {
        showError(service);
        isValid = false;
      } else {
        service.classList.add('success');
      }

      // Booking mode = date chosen and slots actually loaded; if the slots API
      // failed, degrade to a plain quote with a preferred-date note.
      const inlineBookingMode = Boolean(inlineDateInput && inlineDateInput.value && !inlineSlotsLoadFailed);

      // Validate ZIP code (optional normally, REQUIRED when booking)
      const zip = form.querySelector('#zip');
      if (inlineBookingMode) {
        // Booking mode: ZIP is required
        if (!zip?.value.trim() || !/^\d{5}$/.test(zip.value.trim())) {
          showError(zip);
          isValid = false;
        } else {
          zip.classList.add('success');
        }
      } else if (zip && zip.value.trim()) {
        // Optional mode: validate format only if provided
        if (!/^\d{5}$/.test(zip.value.trim())) {
          showError(zip);
          isValid = false;
        } else {
          zip.classList.add('success');
        }
      }

      // Validate consent checkbox (required)
      const consent = form.querySelector('#contact-consent');
      if (consent && !consent.checked) {
        const consentGroup = consent.closest('.form-group');
        if (consentGroup) consentGroup.classList.add('has-error');
        isValid = false;
      }

      // Address required when date selected — must be real address
      if (inlineBookingMode && inlineAddressInput) {
        const addr = inlineAddressInput.value.trim();
        if (!addr || addr.length < 10 || !/[a-zA-Z]/.test(addr)) {
          showError(inlineAddressInput);
          isValid = false;
          const errSpan = inlineAddressInput.closest('.form-group')?.querySelector('.form-error');
          if (errSpan) errSpan.textContent = addr.length < 10 ? 'Please enter a full street address (e.g., 123 Main St, Apt 4B, New York)' : 'Address must include a street name';
        } else {
          inlineAddressInput.classList.add('success');
        }
      }

      // Time slot required when date is selected (unless slots failed to load)
      if (inlineBookingMode && inlineTimeInput && !inlineTimeInput.value) {
        if (inlineTimeSlotGroup) inlineTimeSlotGroup.classList.add('has-error');
        isValid = false;
      }

      if (isValid) {
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        const sessionContext = window.repairAsapGetSessionContext?.() || null;

        let inlineMessage = form.querySelector('#message')?.value.trim() || '';
        let inlineDate = form.querySelector('#date')?.value || '';
        let inlineTime = inlineTimeInput?.value || '';
        if (inlineDate && !inlineBookingMode) {
          // Slots API failed: degrade to a plain quote request so the server
          // doesn't reject a date without a bookable time slot.
          inlineMessage = `${inlineMessage ? inlineMessage + '\n' : ''}Preferred date: ${inlineDate} (time slots unavailable at submission)`;
          inlineDate = '';
          inlineTime = '';
        }
        const payload = {
          name: form.querySelector('#name').value.trim(),
          phone: form.querySelector('#phone').value.trim(),
          email: email?.value.trim() || '',
          zip: zip?.value.trim() || '',
          service: service.value,
          date: inlineDate,
          message: inlineMessage,
          photos: [],
          time: inlineTime,
          address: inlineAddressInput?.value?.trim() || '',
          // Spam honeypot: hidden field humans never fill; CRM rejects non-empty.
          website: form.querySelector('#contact-website')?.value || '',
          threadId: window.repairAsapGetStoredThreadId?.() || '',
          sessionContext,
          // Consent evidence (checkbox is client-required on every submission)
          custom_fields: {
            ...(window.repairAsapBuildServiceLeadContext?.({ service: service.value }) || {}),
            consent_sms: 'granted',
            consent_at: new Date().toISOString(),
            consent_policy: 'privacy-policy+tos 2026',
          },
        };

        try {
          const response = await fetch('https://crm.asap.repair/api/widget/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            const leadEventParams = window.repairAsapBuildLeadEventParams
              ? window.repairAsapBuildLeadEventParams(payload, result, 'inline')
              : {
                  event_category: 'lead',
                  event_label: payload.service || 'unknown',
                  form_type: 'inline',
                };
            // GA4: Track successful form submission
            trackEvent('quote_form_submit', leadEventParams);
            trackEvent('generate_lead', leadEventParams);
            // Dynamic success screen with booking details
            let successHtml = '';
            if (result.booked && payload.time) {
              const activeSlot = inlineTimeSlotsEl?.querySelector('.time-slot.active');
              const timeLabel = activeSlot?.dataset?.label || payload.time;
              successHtml = `
                <div style="text-align:center; padding:40px 20px;">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:20px">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <h3 style="font-size:24px; margin-bottom:12px;">Appointment Confirmed! 📅</h3>
                  <p style="color:var(--text-secondary); font-size:16px; line-height:1.7; margin-bottom:16px;">Your visit has been scheduled. Our technician will text you 30 minutes before arrival.</p>
                  <div class="booking-details">
                    <div class="booking-detail"><span>📅</span> <strong>${payload.date}</strong> at <strong>${timeLabel}</strong></div>
                    ${payload.address ? `<div class="booking-detail"><span>📍</span> ${payload.address}</div>` : ''}
                    <div class="booking-detail"><span>🔧</span> ${payload.service || 'Handyman Service'}</div>
                  </div>
                </div>
              `;
            } else {
              successHtml = `
                <div style="text-align:center; padding:40px 20px;">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:20px">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <h3 style="font-size:24px; margin-bottom:12px;">Quote Request Received</h3>
                  <p style="color:var(--text-secondary); font-size:16px; line-height:1.7;">Thank you! We'll review your request and get back to you during business hours.</p>
                </div>
              `;
            }
            form.innerHTML = successHtml;
          } else {
            const errMsg = result.error || 'Something went wrong.';
            if (errMsg.includes('slot') || errMsg.includes('Booking failed') || errMsg.includes('409')) {
              alert('That time slot was just taken! Please select another time.');
              if (inlineDateInput?.value) inlineDateInput.dispatchEvent(new Event('change'));
            } else {
              alert(errMsg + ' Please try again or call us.');
            }
          }
        } catch (err) {
          console.error('Quote submission error:', err);
          alert('Network error. Please try again or call us at +1 (775) 310-7770.');
        } finally {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      }
    });

    // Real-time validation on blur
    form.querySelectorAll('.form-input[required]').forEach(input => {
      input.addEventListener('blur', function () {
        if (this.value.trim()) {
          this.classList.remove('error');
          this.closest('.form-group').classList.remove('has-error');
          this.classList.add('success');
        }
      });

      input.addEventListener('input', function () {
        if (this.classList.contains('error') && this.value.trim()) {
          this.classList.remove('error');
          this.closest('.form-group').classList.remove('has-error');
        }
      });
    });
  }

  function showError(input) {
    input.classList.add('error');
    input.closest('.form-group').classList.add('has-error');
  }

  // ---- Set min date for date input ----
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // ---- Parallax effect on hero gradient ----
  const heroGradient = document.querySelector('.hero__gradient');
  if (heroGradient && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroGradient.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    }, { passive: true });
  }

  // ---- Video Lightbox ----
  const lightbox = document.getElementById('videoLightbox');
  const lightboxIframe = document.getElementById('lightboxIframe');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(videoId) {
    lightboxIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Delay clearing src so fade-out animation completes
    setTimeout(() => { lightboxIframe.src = ''; }, 350);
  }

  // Attach to all portfolio play buttons
  document.querySelectorAll('.portfolio-card__video[data-video-id]').forEach(btn => {
    btn.addEventListener('click', () => openLightbox(btn.dataset.videoId));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  // Close on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) closeLightbox();
  });

  // ---- AC Installation Pricing Calculator (Smart) ----
  const calcWidget = document.querySelector('.svc-calculator__widget');
  if (calcWidget) {
    const btuSel = calcWidget.querySelector('#calc-btu');
    const qtySel = calcWidget.querySelector('#calc-qty');
    const windowSel = calcWidget.querySelector('#calc-window');
    const floorSel = calcWidget.querySelector('#calc-floor');
    const buildingSel = calcWidget.querySelector('#calc-building');
    const toggles = Array.from(calcWidget.querySelectorAll('.svc-calculator__toggle'));
    const priceEl = document.getElementById('calc-price');
    const labelEl = document.getElementById('calc-label');
    const badgeEl = document.getElementById('calc-badge');
    const hintsEl = document.getElementById('calc-hints');
    const ctaBtn = document.getElementById('calc-cta');
    let hasUserInteractedWithAcCalculator = false;
    let hasTrackedAcCalculatorResult = false;
    /* What the price box is showing right now. Set by updateCalc(), read by the CTA.
       The CTA used to recover the numbers by stripping characters out of the rendered
       string, which mis-read the multi-unit layout ("$300–$400 ($150–$200/unit)" parsed
       as low 300 / high 400150). The figures are already known here, so carry them. */
    let acDisplayedQuote = null;

    if (!btuSel || !priceEl) return;

    function selOpt(el) { return el ? el.options[el.selectedIndex] : null; }
    function oNum(el, attr) { return Number(selOpt(el)?.dataset[attr] || 0); }
    function isOn(name) { return toggles.some(b => b.dataset.name === name && b.classList.contains('active')); }
    function tPrice(name) {
      const b = toggles.find(t => t.dataset.name === name);
      return (b && b.classList.contains('active')) ? Number(b.dataset.price || 0) : 0;
    }
    function roundNearest5(n) { return Math.round(n / 5) * 5; }

    function computeComplexity() {
      let score = 0;
      // BTU complexity
      score += oNum(btuSel, 'complexity');
      // Window type complexity
      if (windowSel) score += oNum(windowSel, 'complexity');
      // Floor complexity
      if (floorSel) score += oNum(floorSel, 'complexity');
      // Building type
      if (buildingSel) score += oNum(buildingSel, 'complexity');
      // Toggles
      toggles.forEach(b => {
        if (b.classList.contains('active')) score += Number(b.dataset.complexity || 0);
      });
      return score;
    }

    function getSmartHints() {
      const hints = [];
      const windowVal = selOpt(windowSel)?.value;
      const floorVal = selOpt(floorSel)?.value;
      const btuVal = selOpt(btuSel)?.value;
      const buildingVal = selOpt(buildingSel)?.value;
      const qty = Number(selOpt(qtySel)?.value || 1);

      if (windowVal === 'casement')
        hints.push({ icon: '⚠️', text: 'Casement installs often require custom framing or panel kits. Final quote requires photo review.' });
      if (windowVal === 'top-section')
        hints.push({ icon: '💡', text: 'Top-section installs work around radiators or bulky furniture below the sill — we do this regularly.' });
      if (floorVal === '6+')
        hints.push({ icon: '⚠️', text: 'High-floor installs may require stricter building rules or COI review — confirm with your management.' });
      if (btuVal === '24k')
        hints.push({ icon: '⚠️', text: 'Large 24,000+ BTU units usually require a 2-person install. Consider adding that toggle above.' });
      if (buildingVal === 'coop-condo')
        hints.push({ icon: '🏢', text: 'Co-op / condo buildings typically require COI and written approval before scheduling. We can provide the COI.' });
      if (qty >= 3)
        hints.push({ icon: '✅', text: `${qty} units — your multi-unit discount is applied automatically to the estimate.` });
      if (isOn('plexiglass'))
        hints.push({ icon: '🔲', text: 'Custom plexiglass/panel fitments may require an on-site measurement. Photo review recommended.' });
      if (isOn('deep-frame'))
        hints.push({ icon: '📐', text: 'Non-standard or deep window frames may need custom blocking. Confirm with a photo before booking.' });

      return hints;
    }

    function updateCalc() {
      // Base price from BTU
      const lo_base = oNum(btuSel, 'lo');
      const hi_base = oNum(btuSel, 'hi');

      // Surcharges
      const windowSurcharge = windowSel ? Number(selOpt(windowSel)?.dataset.surcharge || 0) : 0;
      const floorSurcharge = floorSel ? Number(selOpt(floorSel)?.dataset.surcharge || 0) : 0;

      // Toggle add-ons
      const toggleTotal = toggles.reduce((s, b) => {
        return s + (b.classList.contains('active') ? Number(b.dataset.price || 0) : 0);
      }, 0);

      const subtotalLo = lo_base + windowSurcharge + floorSurcharge + toggleTotal;
      const subtotalHi = hi_base + windowSurcharge + floorSurcharge + toggleTotal;

      // Multi-unit quantity
      const qty = Number(selOpt(qtySel)?.value || 1);
      const discount = Number(selOpt(qtySel)?.dataset.discount || 0) / 100;

      const perUnitLo = roundNearest5(subtotalLo * (1 - discount));
      const perUnitHi = roundNearest5(subtotalHi * (1 - discount));
      const totalLo = roundNearest5(perUnitLo * qty);
      const totalHi = roundNearest5(perUnitHi * qty);

      // Complexity
      const score = computeComplexity();
      let tier, badgeColor;
      if (score <= 2) {
        tier = 'Standard Install'; badgeColor = '#15803d';
      } else if (score <= 5) {
        tier = 'Advanced Install'; badgeColor = '#b45309';
      } else {
        tier = 'Photo Review Required'; badgeColor = '#dc2626';
      }

      // Update price
      const rangeText = `$${totalLo}–$${totalHi}`;
      if (qty > 1) {
        labelEl.textContent = `Planning Estimate (${qty} units)`;
        priceEl.innerHTML = `$${totalLo}&ndash;$${totalHi} <span style="font-size:0.55em;opacity:0.7;">($${perUnitLo}&ndash;$${perUnitHi}/unit)</span>`;
      } else {
        labelEl.textContent = 'Planning Estimate';
        priceEl.innerHTML = `$${totalLo}&ndash;$${totalHi}`;
      }
      // Record the figures exactly as rendered above, for the lead snapshot.
      acDisplayedQuote = {
        low: totalLo,
        high: totalHi,
        rangeText,
        perUnitText: qty > 1 ? `$${perUnitLo}–$${perUnitHi}/unit` : '',
      };

      // Complexity badge
      badgeEl.textContent = tier;
      badgeEl.style.background = badgeColor;
      badgeEl.style.display = 'inline-block';

      // Smart hints
      const hints = getSmartHints();
      if (hints.length) {
        hintsEl.innerHTML = hints.map(h =>
          `<div class="svc-calculator__hint"><span class="svc-calculator__hint-icon">${h.icon}</span><span>${h.text}</span></div>`
        ).join('');
        hintsEl.style.display = 'block';
      } else {
        hintsEl.innerHTML = '';
        hintsEl.style.display = 'none';
      }

      if (hasUserInteractedWithAcCalculator && !hasTrackedAcCalculatorResult) {
        hasTrackedAcCalculatorResult = true;
        trackEvent('calculator_result', {
          event_category: 'calculator',
          calculator_config: 'window_ac',
          service: 'AC Installation & Cleaning',
          btu_size: selOpt(btuSel)?.value || '',
          qty: selOpt(qtySel)?.value || '1',
          window_type: selOpt(windowSel)?.value || '',
          floor: selOpt(floorSel)?.value || '',
          building: selOpt(buildingSel)?.value || '',
          estimate_low: totalLo,
          estimate_high: totalHi,
          page_path: window.location.pathname,
        });
      }
    }

    // Wire up event handlers
    [btuSel, qtySel, windowSel, floorSel, buildingSel].forEach(el => {
      if (el) el.addEventListener('change', () => {
        hasUserInteractedWithAcCalculator = true;
        updateCalc();
      });
    });

    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        hasUserInteractedWithAcCalculator = true;
        btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        updateCalc();
      });
    });

    // CTA: open the quote popup modal and pre-fill the message with calculator selections
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        // Build human-readable summary for the message field
        const btuLabel = selOpt(btuSel)?.text?.split(' (')[0] || '';
        const qtyLabel = selOpt(qtySel)?.text || '1 unit';
        const windowLabel = selOpt(windowSel)?.text?.split(' (+')[0] || '';
        const floorLabel = selOpt(floorSel)?.text?.split(' (+')[0] || '';
        const buildingLabel = selOpt(buildingSel)?.text || '';
        const activeToggles = toggles
          .filter(b => b.classList.contains('active') && b.dataset.price !== '0')
          .map(b => b.textContent.trim().replace(/\s+/g, ' ').split(' (+')[0]);
        const price = priceEl.innerText || '';
        // The figures the price box is actually showing (set in updateCalc), not a re-parse
        // of the rendered string. updateCalc() runs on load, so this is always populated.
        const shown = acDisplayedQuote || { low: NaN, high: NaN, rangeText: price, perUnitText: '' };

        const summary = [
          'Window AC Installation — Calculator Summary',
          '',
          `AC Size: ${btuLabel}`,
          `Quantity: ${qtyLabel}`,
          `Window Type: ${windowLabel}`,
          `Floor Level: ${floorLabel}`,
          `Building: ${buildingLabel}`,
          activeToggles.length ? `Add-ons: ${activeToggles.join(', ')}` : '',
          '',
          `Estimated Range: ${price}`,
        ].filter(s => s !== undefined).join('\n');

        /* Store structured data for CRM custom fields (picked up by quote-modal.js).
           The window-AC calculator always shows a priced range — it has no free-photo or
           $99-assessment path — so it reports 'range', or 'single' if the low and high
           figures collapsed onto one number.
           calculator_selection / calculator_estimate use the option text the customer read,
           never the internal option values.
           source_page was removed here: it sent the bare slug 'window-ac-installation' and,
           because calculator keys are merged last, it overwrote the real page path that
           repairAsapBuildServiceLeadContext had already put in the same field. No prod lead
           ever carried it (the AC calculator has never produced one), and sub_service
           already records the same slug. */
        const acSelectionText = [
          btuLabel && `AC Size: ${btuLabel}`,
          qtyLabel && `Quantity: ${qtyLabel}`,
          windowLabel && `Window Type: ${windowLabel}`,
          floorLabel && `Floor Level: ${floorLabel}`,
          buildingLabel && `Building: ${buildingLabel}`,
          activeToggles.length && `Add-ons: ${activeToggles.join(', ')}`,
        ].filter(Boolean).join(' · ');
        const acShownPrice = shown.perUnitText
          ? `${shown.rangeText} (${shown.perUnitText})`
          : shown.rangeText;
        window._calcQuoteData = {
          ...(window.repairAsapBuildQuoteSnapshot?.({
            configKey: 'window_ac',
            path: shown.high > shown.low ? 'range' : 'single',
            low: shown.low,
            high: shown.high,
            rangeText: shown.rangeText,
            selectionText: acSelectionText,
            /* The page labels this figure "Planning Estimate" and discloses tax separately;
               the sentence recorded here says only what the page said.
               The PRICE COMES FIRST, before the selection list, because this string is
               capped at 240 characters when the CRM stores it
               (MAX_WIDGET_CUSTOM_FIELD_VALUE_CHARS, app/api/widget/quote/route.ts) and this
               calculator's selection list is long. Counted against the real option table in
               services/ac-installation-cleaning/window-ac-installation/index.html — 4 BTU ×
               5 quantity × 4 window × 3 floor × 3 building × 2^7 toggle states = 92,160
               reachable states (46,080 distinct sentences; the COI toggle is priced $0, so
               it changes neither the price nor the add-on list) — with the price trailing
               the list 91,960 of them (99.78%) were over the cap and 89,254 (96.85%) were
               cut before the figure, losing the one part of the sentence that is evidence of
               what the customer was promised.
               Leading with the price means no state can lose it: the longest prefix through
               "…added separately" is 104 characters ("…estimate $1010–$1090 ($505–$545/unit)
               — NYC sales tax added separately"), well inside the 240 cap. The selection
               tail is what gets cut instead, and it is carried separately and in full by
               calculator_selection and by the btu_size/qty/window_type/floor/building/addons
               fields. The exhaustive check lives in
               tests/calculator-quote-snapshot.test.js. */
            displayText: `Window AC Installation — planning estimate ${acShownPrice} — NYC sales tax added separately — ${acSelectionText}`,
          }) || {}),
          btu_size: selOpt(btuSel)?.value || '',
          qty: selOpt(qtySel)?.value || '1',
          window_type: selOpt(windowSel)?.value || '',
          floor: selOpt(floorSel)?.value || '',
          building: selOpt(buildingSel)?.value || '',
          addons: activeToggles.join(', '),
        };

        // Open the quote modal (selects "AC Installation & Cleaning" service automatically)
        if (typeof window.openQuoteModal === 'function') {
          trackEvent('calculator_quote_click', {
            event_category: 'calculator',
            calculator_config: 'window_ac',
            service: 'AC Installation & Cleaning',
            btu_size: selOpt(btuSel)?.value || '',
            qty: selOpt(qtySel)?.value || '1',
            window_type: selOpt(windowSel)?.value || '',
            floor: selOpt(floorSel)?.value || '',
            building: selOpt(buildingSel)?.value || '',
            page_path: window.location.pathname,
          });
          window.openQuoteModal('AC Installation & Cleaning', { preserveCalcData: true });
          // Fill the message field after the modal opens (400ms matches animation)
          setTimeout(() => {
            const msgField = document.getElementById('modal-message');
            if (msgField && !msgField.value.trim()) {
              msgField.value = summary;
              msgField.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 450);
        } else {
          // Fallback if modal script hasn't loaded yet
          sessionStorage.setItem('quoteRequest', summary);
          window.location.href = '/#contact';
        }
      });
    }

    // Initial render
    updateCalc();
  }


  // ---- Gallery v2: Filters, Show More, Lightbox with Arrows ----
  const gallerySection = document.querySelector('.svc-gallery');
  if (gallerySection) {
    const allCards = Array.from(gallerySection.querySelectorAll('.svc-gallery__card'));
    const filterBtns = gallerySection.querySelectorAll('.svc-gallery__filter-btn');
    const moreBtn = gallerySection.querySelector('.svc-gallery__more-btn');
    const INITIAL_LIMIT = 12;
    // If no "Show All" button exists, show all cards immediately
    let expanded = !moreBtn;
    let activeFilter = 'all';

    // --- Filter Tabs ---
    function applyFilters() {
      let visibleCount = 0;
      allCards.forEach(card => {
        const type = card.dataset.type || 'after';
        const matchesFilter = activeFilter === 'all' || type === activeFilter;

        if (matchesFilter) {
          visibleCount++;
          if (!expanded && visibleCount > INITIAL_LIMIT) {
            card.classList.add('hidden');
          } else {
            card.classList.remove('hidden');
          }
        } else {
          card.classList.add('hidden');
        }
      });

      // Update show-more button
      const totalMatching = allCards.filter(c => {
        const t = c.dataset.type || 'after';
        return activeFilter === 'all' || t === activeFilter;
      }).length;

      if (moreBtn) {
        const moreWrap = moreBtn.closest('.svc-gallery__more-wrap');
        if (totalMatching <= INITIAL_LIMIT) {
          moreWrap.style.display = 'none';
        } else {
          moreWrap.style.display = '';
          const remaining = totalMatching - INITIAL_LIMIT;
          if (expanded) {
            moreBtn.innerHTML = 'Show Less <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 15 12 9 18 15"/></svg>';
            moreBtn.classList.add('expanded');
          } else {
            moreBtn.innerHTML = `Show All ${totalMatching} Photos <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
            moreBtn.classList.remove('expanded');
          }
        }
      }
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        expanded = false;
        applyFilters();
      });
    });

    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        expanded = !expanded;
        applyFilters();
        if (!expanded) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Initial filter apply
    applyFilters();

    // --- Lightbox with Prev/Next ---
    const BADGE_COLORS = {
      before: 'rgba(239,68,68,0.85)',
      process: 'rgba(245,158,11,0.85)',
      after: 'rgba(34,197,94,0.85)',
      result: 'rgba(34,197,94,0.85)',
      detail: 'rgba(59,130,246,0.85)',
    };
    const BADGE_LABELS = {
      before: 'Before', process: 'In Progress', after: 'After',
      result: 'Result', detail: 'Detail',
    };

    const glBox = document.createElement('div');
    glBox.className = 'custom-lightbox';
    glBox.innerHTML = `
      <button class="custom-lightbox__close" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <button class="custom-lightbox__arrow custom-lightbox__arrow--prev" aria-label="Previous">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="custom-lightbox__content">
        <span class="custom-lightbox__badge" style="display:none"></span>
        <img class="custom-lightbox__img" src="" alt="">
        <div class="custom-lightbox__caption"></div>
      </div>
      <button class="custom-lightbox__arrow custom-lightbox__arrow--next" aria-label="Next">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    `;
    document.body.appendChild(glBox);

    const glImg = glBox.querySelector('.custom-lightbox__img');
    const glCap = glBox.querySelector('.custom-lightbox__caption');
    const glBadge = glBox.querySelector('.custom-lightbox__badge');
    const glClose = glBox.querySelector('.custom-lightbox__close');
    const glPrev = glBox.querySelector('.custom-lightbox__arrow--prev');
    const glNext = glBox.querySelector('.custom-lightbox__arrow--next');
    let currentIndex = -1;

    function getVisibleCards() {
      return allCards.filter(c => !c.classList.contains('hidden'));
    }

    function showLightboxAt(idx) {
      const visible = getVisibleCards();
      if (idx < 0 || idx >= visible.length) return;
      currentIndex = idx;
      const card = visible[idx];
      const wrap = card.querySelector('.svc-gallery__img-wrap');
      const fullSrc = wrap?.dataset?.full || '';
      const caption = wrap?.dataset?.caption || '';
      const type = card.dataset.type || 'after';

      glImg.src = fullSrc;
      glImg.alt = caption;
      glCap.textContent = caption;

      // Badge
      glBadge.textContent = BADGE_LABELS[type] || type;
      glBadge.style.background = BADGE_COLORS[type] || BADGE_COLORS.after;
      glBadge.style.color = '#fff';
      glBadge.style.display = '';

      // Arrow visibility
      glPrev.style.display = idx === 0 ? 'none' : '';
      glNext.style.display = idx === visible.length - 1 ? 'none' : '';
    }

    function openGalleryLightbox(e) {
      e.preventDefault();
      const card = e.currentTarget.closest('.svc-gallery__card');
      const visible = getVisibleCards();
      const idx = visible.indexOf(card);
      if (idx === -1) return;
      showLightboxAt(idx);
      glBox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeGalleryLightbox() {
      glBox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { glImg.src = ''; }, 300);
    }

    // Attach click to all image wrappers
    allCards.forEach(card => {
      const wrap = card.querySelector('.svc-gallery__img-wrap');
      if (wrap) wrap.addEventListener('click', openGalleryLightbox);
    });

    glClose.addEventListener('click', closeGalleryLightbox);
    glPrev.addEventListener('click', () => showLightboxAt(currentIndex - 1));
    glNext.addEventListener('click', () => showLightboxAt(currentIndex + 1));

    glBox.addEventListener('click', (e) => {
      if (e.target === glBox) closeGalleryLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!glBox.classList.contains('active')) return;
      if (e.key === 'Escape') closeGalleryLightbox();
      if (e.key === 'ArrowLeft') showLightboxAt(currentIndex - 1);
      if (e.key === 'ArrowRight') showLightboxAt(currentIndex + 1);
    });
  }
});


/* --------------------------------------------------
   HEADER-DEPENDENT INIT (runs after components-loaded)
   These features require the dynamically loaded header
   to be present in the DOM.
   -------------------------------------------------- */
document.addEventListener('components-loaded', () => {

  // ---- Sticky Header ----
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ---- Mobile Navigation ----
  const burger = document.getElementById('burger');
  let overlay = null;

  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');

      if (burger.classList.contains('active')) {
        // Create overlay
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        overlay.innerHTML = `
          <nav class="header__nav" style="display:flex">
            <div class="mobile-services">
              <button class="nav-link mobile-services__toggle" type="button">
                Services
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.3s ease"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="mobile-services__list">
                <a href="/services/furniture-assembly/" class="mobile-services__link">Furniture Assembly</a>
                <a href="/services/tv-wall-mounting/" class="mobile-services__link">TV & Wall Mounting</a>
                <a href="/services/appliance-services/" class="mobile-services__link">Appliance Services</a>
                <a href="/services/flooring-installation/" class="mobile-services__link">Flooring Installation</a>
                <a href="/services/painting/" class="mobile-services__link">Painting & Wall Finishes</a>
                <a href="/services/ac-installation-cleaning/" class="mobile-services__link">AC Installation & Cleaning</a>
                <a href="/services/plumbing/" class="mobile-services__link">Plumbing</a>
                <a href="/services/electrical/" class="mobile-services__link">Electrical</a>
                <a href="/services/general-repairs/" class="mobile-services__link">General Repairs</a>
              </div>
            </div>
            <a href="/reviews/" class="nav-link">Reviews</a>
            <a href="/faq/" class="nav-link">FAQ</a>
            <a href="/case-studies/" class="nav-link">Case Studies</a>
            <a href="/blog/" class="nav-link">Blog</a>
            <button type="button" class="btn btn--accent" style="margin-top:16px" data-open-quote>Get a Free Quote</button>
          </nav>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Mobile services accordion
        const mobileToggle = overlay.querySelector('.mobile-services__toggle');
        const mobileList = overlay.querySelector('.mobile-services__list');
        mobileToggle.addEventListener('click', () => {
          const isOpen = mobileList.classList.contains('open');
          mobileList.classList.toggle('open');
          mobileToggle.classList.toggle('active');
          const chevron = mobileToggle.querySelector('svg');
          chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        });

        // Trigger animation
        requestAnimationFrame(() => overlay.classList.add('active'));

        // Close on link click
        overlay.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', closeMenu);
        });
      } else {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    if (burger) burger.classList.remove('active');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        overlay = null;
      }, 400);
    }
    document.body.style.overflow = '';
  }

  // ---- Smooth Scroll for same-page anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
});
