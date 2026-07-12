#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSET_VERSION = '20260710c';
const CSS_VERSION = '20260706c';
const ROOT = new URL('..', import.meta.url).pathname;
const BASE_URL = 'https://asap.repair';

const provider = {
  '@type': 'LocalBusiness',
  name: 'Repair Asap LLC',
  telephone: '+1-775-310-7770',
  url: BASE_URL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '99-60 64th Ave',
    addressLocality: 'Rego Park',
    addressRegion: 'NY',
    postalCode: '11374',
    addressCountry: 'US',
  },
};

const areaServed = [
  { '@type': 'City', name: 'New York City' },
  { '@type': 'AdministrativeArea', name: 'Queens' },
  { '@type': 'AdministrativeArea', name: 'Manhattan' },
  { '@type': 'AdministrativeArea', name: 'Brooklyn' },
  { '@type': 'AdministrativeArea', name: 'Bronx' },
  { '@type': 'AdministrativeArea', name: 'Staten Island' },
  { '@type': 'Place', name: 'Western Long Island' },
  { '@type': 'AdministrativeArea', name: 'Nassau County' },
];

const pages = [
  {
    "slug": "refrigerator-repair",
    "crumb": "Refrigerator Repair",
    "title": "Refrigerator Repair Help NYC | Cooling & Leak Triage",
    "description": "Fridge not cooling in NYC? Free photo estimate, $99 on-site assessment credited toward the fix, honest repair-or-replace advice. Same-day when available.",
    "ogTitle": "Refrigerator Repair Help in NYC | Repair Asap LLC",
    "ogDescription": "Fridge not cooling in NYC? Free photo estimate, $99 on-site assessment credited toward the fix, honest repair-or-replace advice. Same-day when available.",
    "badge": "Refrigerator Repair Help",
    "h1": "Refrigerator Repair Help in NYC",
    "accent": "Cooling, Leak & Airflow Triage",
    "subtitle": "Fridge not cooling? Text photos now and get a real answer for free \u2014 honest repair-or-replace advice, same-day visits when available, all five boroughs.",
    "serviceType": "Refrigerator Repair Help",
    "serviceName": "Refrigerator Repair Help in NYC",
    "serviceDescription": "Photo-reviewed refrigerator repair help in New York City for not-cooling, ice buildup, leaking, noisy operation, dirty condenser, airflow, leveling, water-line observations, and repair-or-replace decisions when scope fits handyman service limits.",
    "intro": [
      "A refrigerator problem is urgent in an NYC apartment, rental, office or small business because food, schedules and tenant expectations are involved. Repair Asap LLC reviews the model number, photos, current temperature, timing of the symptom, water-line condition and access before booking a practical diagnostic or cleaning visit.",
      "Good-fit refrigerator repair help includes dirty condenser coils, airflow restrictions, ice buildup observations, uneven leveling, door gasket observations, visible leaks around supply connections, noisy fan or vibration review, temperature confirmation, and deciding whether repair or replacement makes more financial sense.",
      "Sealed-system work, refrigerant, compressor replacement, board-level electronics and manufacturer warranty service may require an EPA Section 608 certified technician, specialized appliance technician or manufacturer-authorized company. We flag that before scheduling instead of promising the wrong visit."
    ],
    "goodFit": [
      [
        "Refrigerator not holding temperature consistently",
        "We check actual fridge and freezer readings against settings, then trace airflow, coils and gasket condition."
      ],
      [
        "Dirty condenser coils or blocked airflow",
        "Dust-packed coils force the compressor to overwork; we clean accessible coils and clear vents the same visit."
      ],
      [
        "Ice buildup, frost or drain/airflow symptoms",
        "Frost patterns point to door seals, drain blockage or airflow gaps; photos help us narrow the cause first."
      ],
      [
        "Water-line, shutoff or visible leak observations",
        "We observe the supply line, shutoff valve and floor around the unit to locate where water actually escapes."
      ],
      [
        "Door gasket, leveling, vibration or noise checks",
        "A worn gasket or unlevel unit wastes cooling and causes rattles; we adjust feet and review seals."
      ],
      [
        "Repair-or-replace decision before buying a new unit",
        "We weigh the unit's age, symptom and repair scope against replacement, then quote installation if replacing wins."
      ]
    ],
    "outOfScope": [
      [
        "Refrigerant charging or recovery",
        "Handling refrigerant requires an EPA Section 608 certified technician; we flag it and route you before scheduling."
      ],
      [
        "Compressor or sealed-system replacement",
        "Sealed-system failures belong with a specialized appliance technician; we tell you honestly when the symptoms point there."
      ],
      [
        "Board-level electronic repair",
        "Control-board diagnostics and soldering go to an electronics specialist or the manufacturer, not a handyman visit."
      ],
      [
        "Manufacturer warranty-authorized repair",
        "If your unit is under warranty, the manufacturer's authorized servicer should handle it so coverage stays intact."
      ],
      [
        "New hidden plumbing lines or permit-level work",
        "Running new lines inside walls may require a Licensed Master Plumber or DOB permit; we flag that first."
      ]
    ],
    "intake": [
      [
        "Brand and model number",
        "The model tag tells us the unit's age, layout and common failure points before we book anything."
      ],
      [
        "Current refrigerator and freezer temperature",
        "Actual readings versus set points show whether cooling is failing entirely or drifting in one compartment."
      ],
      [
        "Photos of the appliance, back/bottom access and any water connection",
        "Access photos confirm we can reach coils and connections in your kitchen without moving cabinetry."
      ],
      [
        "Exact symptom and when it started",
        "Timing separates a sudden failure from gradual decline, which changes what we check first on site."
      ],
      [
        "Any error code, noise video or leak photo",
        "Codes and short videos often identify the failing component before the visit, saving a diagnostic round-trip."
      ],
      [
        "Warranty status, building access and COI requirements",
        "Warranty coverage may change who should service the unit, and NYC buildings often need COI paperwork upfront."
      ]
    ],
    "offers": [
      "Temperature check and symptom review",
      "Accessible condenser and airflow cleaning",
      "Water-line and visible leak observation",
      "Leveling and door/gasket observation",
      "Replacement planning and installation quote"
    ],
    "relatedInstall": {
      "label": "Refrigerator Installation",
      "url": "/services/appliance-services/refrigerator-installation/"
    },
    "faq": [
      [
        "Do you repair refrigerators in NYC?",
        "Repair Asap LLC helps with refrigerator symptoms that fit photo-reviewed diagnostics, cleaning, airflow, visible connection, leveling, and repair-or-replace scope. Refrigerant, compressor, sealed-system, board-level and warranty-authorized work may require a specialized technician."
      ],
      [
        "Can you fix a refrigerator that is not cooling?",
        "We can review temperature readings, airflow, dirty condenser coils, ice buildup, fan/noise observations, leveling and visible conditions. If the issue points to refrigerant, compressor or sealed-system failure, we route that correctly before scheduling."
      ],
      [
        "What should I send before booking refrigerator help?",
        "Send the brand and model number, current refrigerator/freezer temperatures, photos of the unit and rear or lower access area, water-line photos if relevant, the exact symptom, any error code, warranty status, and building access details."
      ],
      [
        "Can you install a replacement refrigerator if repair is not worth it?",
        "Yes. If replacement is the smarter option, Repair Asap LLC can quote refrigerator installation, leveling, door reversal when supported, old-unit move-out, and existing water-line hookup after scope review."
      ]
    ]
  },
  {
    "slug": "dishwasher-repair",
    "crumb": "Dishwasher Repair",
    "title": "Dishwasher Repair Help NYC | Leak & Drain Triage",
    "description": "Dishwasher leaking or not draining in NYC? Free photo estimate, $99 assessment credited toward the job, honest repair-or-replace advice. Book online today.",
    "ogTitle": "Dishwasher Repair Help in NYC | Repair Asap LLC",
    "ogDescription": "Dishwasher leaking or not draining in NYC? Free photo estimate, $99 assessment credited toward the job, honest repair-or-replace advice. Book online today.",
    "badge": "Dishwasher Repair Help",
    "h1": "Dishwasher Repair Help in NYC",
    "accent": "Leak, Drain & Hookup Triage",
    "subtitle": "Leaking or not draining? Send photos and get a real price for free \u2014 fast, insured dishwasher help for NYC kitchens, quoted before anyone shows up.",
    "serviceType": "Dishwasher Repair Help",
    "serviceName": "Dishwasher Repair Help in NYC",
    "serviceDescription": "Photo-reviewed dishwasher repair help in New York City for leaks, not draining, supply and drain hookup issues, leveling, odor, visible connection problems, and repair-or-replace decisions when scope fits handyman service limits.",
    "intro": [
      "Dishwasher problems often overlap with appliance, plumbing and electrical conditions. Repair Asap LLC reviews the model, under-sink photos, supply line, drain hose, air gap or high loop, outlet or hardwire condition, leak location and building rules before confirming the right visit.",
      "Good-fit dishwasher repair help includes visible leaks at accessible connections, drain hose or high-loop review, clogged filter or drain observations, leveling, mounting clips, loose trim, odor or standing-water checks, and deciding whether a replacement dishwasher is the better move.",
      "New plumbing lines, hidden piping, new outlets, new circuits, hardwired changes, cabinet modifications and permit-level work may require a Licensed Master Plumber, Licensed Master Electrician or DOB permit. We separate that scope before scheduling."
    ],
    "goodFit": [
      [
        "Dishwasher leaking from an accessible connection",
        "We trace the drip to a supply fitting, drain clamp or door edge and tighten or adjust what's reachable."
      ],
      [
        "Dishwasher not draining or leaving standing water",
        "Standing water usually means a clogged filter, kinked drain hose or missing high loop we can observe directly."
      ],
      [
        "Loose drain hose, missing high loop or hookup concern",
        "A drain hose without a high loop lets sink water back-flow; we review and correct the routing."
      ],
      [
        "Filter, odor, residue or cleaning issue",
        "Trapped food in the filter and sump causes smells and cloudy dishes; we clean and advise on upkeep."
      ],
      [
        "Leveling, mounting clips or door alignment review",
        "An unsecured or tilted dishwasher rocks, leaks at the door and strains hoses; we level and re-anchor it."
      ],
      [
        "Repair-or-replace decision and replacement quote",
        "When repairs approach a new unit's value, we say so and quote installation using your existing hookups."
      ]
    ],
    "outOfScope": [
      [
        "Hidden plumbing line replacement",
        "Pipes behind walls or under floors are Licensed Master Plumber territory; we identify the boundary before scheduling."
      ],
      [
        "New electrical circuit or new outlet location",
        "Adding circuits or relocating outlets may require a Licensed Master Electrician, and we route that work accordingly."
      ],
      [
        "Board-level control repair",
        "Failed control boards need a specialist partner or manufacturer parts service; we help you confirm that diagnosis."
      ],
      [
        "Warranty-authorized manufacturer repair",
        "Units still under manufacturer warranty go to the brand's authorized network so your coverage isn't voided."
      ],
      [
        "Cabinet rebuild or permit-level alterations",
        "Structural cabinet work and permit-level changes route to a contractor or DOB-permitted trade; we flag it early."
      ]
    ],
    "intake": [
      [
        "Dishwasher brand and model number",
        "Model details reveal hookup type, filter design and door geometry so we arrive with the right plan."
      ],
      [
        "Photos under the sink, drain hose, supply line and shutoff",
        "Under-sink photos show us the shutoff, hose routing and connection condition before anyone opens your cabinet."
      ],
      [
        "Photo or video of the leak or standing water",
        "Where the water sits or drips tells us whether the source is the door, pump area or a fitting."
      ],
      [
        "Error code and when the issue happens",
        "A code plus cycle stage \u2014 fill, wash or drain \u2014 narrows the fault dramatically before we arrive."
      ],
      [
        "Outlet or hardwire photo if accessible",
        "Knowing whether the unit plugs in or is hardwired sets what we can safely touch during triage."
      ],
      [
        "Building rules, COI requirements and warranty status",
        "Co-op and condo boards often require COI approval days ahead; sharing rules early keeps your slot."
      ]
    ],
    "offers": [
      "Leak and accessible connection review",
      "Drain hose, high-loop and filter observation",
      "Leveling and mounting-clip check",
      "Odor and standing-water triage",
      "Replacement planning and installation quote"
    ],
    "relatedInstall": {
      "label": "Dishwasher Installation",
      "url": "/services/appliance-services/dishwasher-installation/"
    },
    "faq": [
      [
        "Do you repair leaking dishwashers in NYC?",
        "Repair Asap LLC can review dishwasher leaks when the issue appears to involve accessible supply, drain, hookup, leveling, mounting or visible conditions. Hidden plumbing, new wiring or permit-level work may require a licensed trade."
      ],
      [
        "Can you help with a dishwasher that is not draining?",
        "Yes, when the scope fits accessible filter, drain hose, high-loop, connection, standing-water or replacement triage. Send under-sink photos and the model number before scheduling."
      ],
      [
        "What should I send before booking dishwasher repair help?",
        "Send the brand and model number, photos under the sink, drain hose, supply line, shutoff, leak location, error code, outlet or hardwire condition if visible, warranty status, and building requirements."
      ],
      [
        "Can you replace the dishwasher if repair is not worth it?",
        "Yes. Repair Asap LLC can quote dishwasher replacement and installation when existing supply, drain, outlet or hardwire conditions, access and building rules fit."
      ]
    ]
  },
  {
    "slug": "washer-repair",
    "crumb": "Washer Repair",
    "title": "Washer Repair Help NYC | Drain, Leak & Vibration Triage",
    "description": "Washer not draining, leaking or shaking in NYC? Free photo estimate, $99 assessment credited toward the fix, honest advice. Same-day visits when available.",
    "ogTitle": "Washer Repair Help in NYC | Repair Asap LLC",
    "ogDescription": "Washer not draining, leaking or shaking in NYC? Free photo estimate, $99 assessment credited toward the fix, honest advice. Same-day visits when available.",
    "badge": "Washer Repair Help",
    "h1": "Washer Repair Help in NYC",
    "accent": "Drain, Leak & Vibration Triage",
    "subtitle": "Shaking, leaking or not draining? Get a free photo estimate first \u2014 you only pay when real work is booked, and every price is confirmed up front.",
    "serviceType": "Washer Repair Help",
    "serviceName": "Washer Repair Help in NYC",
    "serviceDescription": "Photo-reviewed washer repair help in New York City for drain issues, visible leaks, vibration, supply hose conditions, leveling, setup concerns, and repair-or-replace decisions when scope fits handyman service limits.",
    "intro": [
      "Washer problems in NYC apartments often come from a mix of appliance condition, hoses, drain setup, floor level, tight closets and building rules. Repair Asap LLC reviews photos, model details, access, drain, shutoffs, supply hoses and symptom timing before confirming a visit.",
      "Good-fit washer repair help includes vibration and leveling checks, supply hose observations, visible leak triage, drain hose setup, standpipe or sink-drain observations, error code review, and deciding whether a new washer or washer/dryer setup is more practical.",
      "Hidden plumbing, drain-line alterations, new outlets, new circuits, hardwired changes and manufacturer warranty repairs may require the building, a licensed trade or a specialized appliance technician. We flag those limits before scheduling."
    ],
    "goodFit": [
      [
        "Washer not draining or drain hose issue",
        "We inspect the drain hose path, standpipe height and accessible pump filter to find where water stops."
      ],
      [
        "Washer shaking, walking or vibrating",
        "Many walking washers just need feet adjusted, shipping bolts removed or loads balanced; we check each cause."
      ],
      [
        "Visible leak at supply hoses or accessible connections",
        "Aging rubber hoses and loose fittings cause most laundry leaks; we observe, tighten and recommend replacements."
      ],
      [
        "Leveling, stacking or closet-clearance concern",
        "Tight NYC laundry closets need correct clearances and a secure stacking kit; we measure and adjust on site."
      ],
      [
        "Error code and repair-or-replace review",
        "We decode the error against your model's known faults and tell you plainly whether repair makes sense."
      ],
      [
        "Replacement planning for washer or washer/dryer setup",
        "We plan the new unit around your existing supply, drain, power and door path, then quote installation."
      ]
    ],
    "outOfScope": [
      [
        "Hidden drain or plumbing line work",
        "Anything inside walls or below the floor may require a Licensed Master Plumber; we flag it before scheduling."
      ],
      [
        "New electrical circuit or outlet location",
        "New circuits and outlet moves are Licensed Master Electrician work; we coordinate the handoff when needed."
      ],
      [
        "Internal control-board repair",
        "Electronic board faults route to a specialized appliance technician or the manufacturer's parts channel, not our visit."
      ],
      [
        "Manufacturer warranty-authorized repair",
        "In-warranty machines should see the manufacturer's authorized servicer first; we help you verify status before booking."
      ],
      [
        "Structural floor or major laundry-room alteration",
        "Floor reinforcement and room reconfiguration route to a general contractor, often with DOB permits; we flag that upfront."
      ]
    ],
    "intake": [
      [
        "Washer brand and model number",
        "The model determines drain pump access, error-code meanings and stacking compatibility before we schedule anything."
      ],
      [
        "Photos of the washer, hoses, shutoffs and drain",
        "Photos show whether shutoff valves still turn, hoses are aging and the drain sits at correct height."
      ],
      [
        "Video of vibration or noise if relevant",
        "A short clip during spin distinguishes an unbalanced load from worn suspension or an unlevel floor."
      ],
      [
        "Error code and when the issue happens",
        "Codes that repeat at the same cycle point reveal more than intermittent ones; note the pattern for us."
      ],
      [
        "Stacking kit or closet-clearance details",
        "Stacked pairs and tight closets change how we access the unit and what tools the visit needs."
      ],
      [
        "Building access, COI requirements and warranty status",
        "Freight elevator bookings, doorman rules and COI paperwork are common in NYC; flagging them early avoids rescheduling."
      ]
    ],
    "offers": [
      "Drain and supply hose observation",
      "Visible leak triage",
      "Leveling and vibration check",
      "Stacking and clearance review",
      "Replacement planning and installation quote"
    ],
    "relatedInstall": {
      "label": "Washer Installation",
      "url": "/services/appliance-services/washer-installation/"
    },
    "faq": [
      [
        "Do you repair washers in NYC apartments?",
        "Repair Asap LLC helps with washer symptoms that fit visible drain, supply, hose, leveling, vibration, setup and replacement triage. Internal electronic repair or warranty-authorized service may require a specialized technician."
      ],
      [
        "Can you fix a washer that shakes or walks?",
        "We can review floor level, feet adjustment, stacking setup, load behavior, closet clearance and visible installation conditions. If the issue is internal suspension or manufacturer warranty scope, we will flag that before scheduling."
      ],
      [
        "What should I send before booking washer repair help?",
        "Send the brand and model number, photos of hoses, shutoffs, drain path and laundry closet, a video of vibration or noise, any error code, warranty status, and building or COI requirements."
      ],
      [
        "Can you install a replacement washer?",
        "Yes. If replacement is the better route, Repair Asap LLC can quote washer installation or washer/dryer setup when existing supply, drain, power, access and building rules fit."
      ]
    ]
  },
  {
    "slug": "dryer-repair",
    "crumb": "Dryer Repair",
    "title": "Dryer Repair Help NYC | Vent, Heat & Connection Triage",
    "description": "Dryer not heating or drying slowly in NYC? Often it's the vent. Free photo estimate, $99 assessment credited toward the fix, vent cleaning from $150.",
    "ogTitle": "Dryer Repair Help in NYC | Repair Asap LLC",
    "ogDescription": "Dryer not heating or drying slowly in NYC? Often it's the vent. Free photo estimate, $99 assessment credited toward the fix, vent cleaning from $150.",
    "badge": "Dryer Repair Help",
    "h1": "Dryer Repair Help in NYC",
    "accent": "Vent, Heat & Connection Triage",
    "subtitle": "Not heating or drying forever? It's often just the vent \u2014 free photo triage tells you what's wrong before you pay anyone a dollar.",
    "serviceType": "Dryer Repair Help",
    "serviceName": "Dryer Repair Help in NYC",
    "serviceDescription": "Photo-reviewed dryer repair help in New York City for not-heating symptoms, vent restriction, lint buildup, vibration, dryer connection review, electric or gas-ready setup observations, and repair-or-replace decisions when scope fits handyman service limits.",
    "intro": [
      "Dryer issues can be appliance-related, vent-related, electrical, gas-ready setup related or building-related. Repair Asap LLC reviews the dryer model, vent path, lint condition, plug or cord, gas shutoff photo when relevant, closet access and symptom before confirming a practical visit.",
      "Good-fit dryer repair help includes vent and lint observations, accessible duct connection checks, leveling and vibration review, electric cord or plug observations, gas-ready setup review when the existing location is code-ready, and replacement planning when repair is not worth it.",
      "Gas piping, gas corrections, new 240V outlets, new circuits, hardwired changes, internal control repair and permit-level work may require a Licensed Master Plumber, Licensed Master Electrician, DOB permit or specialized appliance technician. We do not blur those lines."
    ],
    "goodFit": [
      [
        "Dryer not heating and vent restriction is possible",
        "A blocked vent mimics heater failure; we check exhaust flow first because it's the most common culprit."
      ],
      [
        "Lint buildup or loose accessible vent connection",
        "Lint-choked ducts slow drying and create fire risk; we clean accessible runs and reseat loose connections."
      ],
      [
        "Dryer vibration, leveling or closet-clearance issue",
        "Rumble and rocking usually trace to uneven feet or tight clearances; we level and reposition the unit."
      ],
      [
        "Electric cord, plug or outlet compatibility observation",
        "We observe whether your cord, plug style and existing outlet match the dryer \u2014 mismatches get flagged, not forced."
      ],
      [
        "Gas-ready dryer replacement scope review",
        "If your location already has a code-ready gas setup, we review whether a swap fits handyman scope."
      ],
      [
        "Repair-or-replace decision and replacement quote",
        "Dryers with heavy internal wear often cost more to fix than replace; we assess honestly and quote installation."
      ]
    ],
    "outOfScope": [
      [
        "Gas piping changes or gas corrections",
        "All gas piping, valve and leak work goes to a Licensed Master Plumber \u2014 no exceptions, flagged before scheduling."
      ],
      [
        "New 240V outlet, circuit or electrical panel work",
        "Panel work and new 240V circuits require a Licensed Master Electrician; we help you scope that handoff."
      ],
      [
        "Internal control-board repair",
        "Board and sensor electronics are a job for the manufacturer or a specialist partner we can point you toward."
      ],
      [
        "Manufacturer warranty-authorized repair",
        "Warranty claims must run through the brand's authorized service network; using us first could jeopardize your coverage."
      ],
      [
        "Permit-level alterations",
        "Work that triggers DOB permits routes to the appropriate licensed trade; we identify that line during photo review."
      ]
    ],
    "intake": [
      [
        "Dryer brand and model number",
        "Model info tells us the heat source, vent outlet position and door swing before we plan the visit."
      ],
      [
        "Photos of vent path, lint condition and rear connection",
        "Vent photos reveal crushed ducts, lint accumulation and loose rear joints \u2014 the usual suspects behind weak drying."
      ],
      [
        "Plug, cord or outlet photo for electric dryers",
        "Cord and outlet photos confirm compatibility ahead of time, since dryer plug types vary across NYC buildings."
      ],
      [
        "Gas shutoff photo for gas-ready dryer requests",
        "A clear shutoff photo shows whether the existing gas setup is code-ready or needs a Licensed Master Plumber."
      ],
      [
        "Exact symptom, timing and any error code",
        "No heat, long cycles and mid-cycle stops each point to different causes; describe precisely what you see."
      ],
      [
        "Building access, COI requirements and warranty status",
        "Tell us about elevators, service entrances and insurance certificates your building demands so the visit isn't turned away."
      ]
    ],
    "offers": [
      "Vent and lint observation",
      "Accessible connection review",
      "Leveling and vibration check",
      "Electric or gas-ready setup scope review",
      "Replacement planning and installation quote"
    ],
    "relatedInstall": {
      "label": "Dryer Installation",
      "url": "/services/appliance-services/dryer-installation/"
    },
    "faq": [
      [
        "Do you repair dryers in NYC?",
        "Repair Asap LLC helps with dryer symptoms that fit visible vent, lint, connection, leveling, vibration, setup and replacement triage. Gas piping, new circuits, internal electronics and warranty-authorized work may require licensed or specialized service."
      ],
      [
        "Can you help if my dryer is not heating?",
        "We can review vent restriction, lint buildup, accessible duct connections, model details, error codes, electric or gas-ready setup conditions, and whether repair or replacement makes sense. Internal heating components or gas work may require specialized service."
      ],
      [
        "What should I send before booking dryer repair help?",
        "Send the brand and model number, vent path photos, rear connection photos, plug or gas shutoff photo when relevant, exact symptom, any error code, warranty status, and building or COI requirements."
      ],
      [
        "Can you install a replacement dryer?",
        "Yes. Repair Asap LLC can quote electric or gas-ready dryer replacement when existing venting, power or gas-ready conditions, access and building rules fit. Licensed trade work is flagged if required."
      ]
    ]
  },
  {
    "slug": "oven-range-repair",
    "crumb": "Oven & Range Repair",
    "title": "Oven & Range Repair Help NYC | Burner & Door Triage",
    "description": "Oven or range trouble in NYC? Burners, doors, knobs, leveling and anti-tip fixed with honest gas/electric routing. Free photo estimate \u2014 text us today.",
    "ogTitle": "Oven & Range Repair Help in NYC | Repair Asap LLC",
    "ogDescription": "Oven or range trouble in NYC? Burners, doors, knobs, leveling and anti-tip fixed with honest gas/electric routing. Free photo estimate \u2014 text us today.",
    "badge": "Oven & Range Repair Help",
    "h1": "Oven & Range Repair Help in NYC",
    "accent": "Burner, Door & Leveling Triage",
    "subtitle": "Burner won't light? Door won't close? Free photo estimate first, then a $99 assessment that's credited toward the fix \u2014 honest gas and electric routing always.",
    "serviceType": "Oven & Range Repair Help",
    "serviceName": "Oven & Range Repair Help in NYC",
    "serviceDescription": "Photo-reviewed oven, stove, range and cooktop repair help in New York City for not-heating symptoms, burners not lighting, clicking igniters, door hinge and gasket issues, knob replacement, leveling, anti-tip brackets, hood filter cleaning, and repair-or-replace decisions when scope fits handyman service limits.",
    "intro": [
      "A range that will not heat or a burner that only clicks stops dinner plans, holiday cooking and apartment turnovers alike, and in an NYC rental it becomes a tenant complaint fast. Repair Asap LLC reviews the brand and model number, photos, whether the unit is gas or electric, the exact symptom and when it started, plus building access, before booking a practical triage or cleaning visit.",
      "Good-fit oven and range repair help includes burner and igniter surface cleaning when grease or debris blocks ports and tips, oven door hinge, gasket and handle review when heat escapes or the door will not close, model-matched knob replacement, range leveling and anti-tip bracket checks, range hood filter cleaning, and honest repair-or-replace guidance backed by a replacement installation quote.",
      "Gas piping, gas valves and suspected gas leaks may require a Licensed Master Plumber; new 240V circuits or outlets may require a Licensed Master Electrician; internal heating elements, hidden igniters, thermostats and control boards may require a specialized appliance technician or the manufacturer. We flag that before scheduling instead of promising the wrong visit."
    ],
    "goodFit": [
      [
        "Burner and igniter surface cleaning",
        "Grease and food debris around burner ports and igniter tips cause weak flames and endless clicking; accessible surface cleaning often restores a clean light."
      ],
      [
        "Oven door hinge, gasket and handle review",
        "A door that will not close, a torn gasket or a loose handle leaks heat and throws off baking temperature; we review and adjust what is accessible."
      ],
      [
        "Broken or stripped knob replacement",
        "Cracked, melted or free-spinning knobs get replaced with model-matched parts once the model number confirms the correct fit."
      ],
      [
        "Range leveling and anti-tip bracket check",
        "An unlevel range bakes unevenly, and a missing anti-tip bracket is a real safety gap; we level the unit and secure the bracket where conditions allow."
      ],
      [
        "Range hood filter cleaning",
        "Saturated hood filters push smoke and grease back into the kitchen; we clean or plan replacement of accessible filters during the same visit."
      ],
      [
        "Repair-or-replace decision and replacement quote",
        "When a fix stops making financial sense for the unit's age, we say so and quote a compatible replacement range installation instead."
      ]
    ],
    "outOfScope": [
      [
        "Gas piping, valves or suspected gas leaks",
        "Anything involving the gas line, shutoff valve or a possible leak may require a Licensed Master Plumber or the utility. We flag that before scheduling."
      ],
      [
        "New 240V circuits or outlet locations",
        "Adding or relocating a 240V range outlet or circuit may require a Licensed Master Electrician; we work around existing connections only."
      ],
      [
        "Internal heating elements and control boards",
        "Bake elements, hidden igniters, thermostats and control-board faults may require a specialized appliance technician or the manufacturer."
      ],
      [
        "Manufacturer warranty-authorized repair",
        "A range still under manufacturer warranty may require an authorized service company so coverage is not voided; we confirm status first."
      ],
      [
        "Permit-level relocations or alterations",
        "Moving a range to a new spot or altering gas or electrical infrastructure is permit-level work and gets routed before any visit is booked."
      ]
    ],
    "intake": [
      [
        "Brand and model number",
        "The model plate \u2014 usually inside the door frame, behind the storage drawer or on the back \u2014 confirms knob fit, parts and gas versus electric."
      ],
      [
        "Photos of the range and problem area",
        "Wide and close-up photos of the burners, igniter, oven door, knobs and surrounding counters help confirm scope before booking."
      ],
      [
        "Exact symptom and when it started",
        "Not heating, clicking without lighting, uneven baking or a door that will not shut \u2014 the specific symptom and its timing steer the triage."
      ],
      [
        "Gas or electric, plus any error code",
        "Tell us the fuel type and photograph any code on the display so the visit is scoped for the right kind of unit."
      ],
      [
        "Photo of the plug or gas shutoff if visible",
        "A photo of the existing 240V plug or the shutoff behind the range shows whether the setup fits handyman scope or needs a licensed trade."
      ],
      [
        "Building access, COI and warranty status",
        "Doorman rules, freight elevator booking, COI paperwork and warranty status decide who should do the work and how it gets scheduled."
      ]
    ],
    "offers": [
      "Oven and range symptom review",
      "Burner and igniter surface cleaning",
      "Door hinge, gasket and knob review",
      "Leveling and anti-tip bracket check",
      "Replacement planning and installation quote"
    ],
    "relatedInstall": {
      "label": "Range Installation",
      "url": "/services/appliance-services/range-installation/"
    },
    "crossLinks": [
      {
        "label": "Electrical Troubleshooting",
        "url": "/services/electrical/electrical-troubleshooting/"
      },
      {
        "label": "Cabinet Hardware Installation",
        "url": "/services/general-repairs/cabinet-hardware-installation/"
      },
      {
        "label": "COI Handyman",
        "url": "/services/general-repairs/coi-handyman/"
      }
    ],
    "crossSubtitle": "Oven and range symptoms often overlap with outlet, switch, cabinet and building-access scope.",
    "faq": [
      [
        "Do you repair ovens, stoves and ranges in NYC?",
        "Repair Asap LLC helps with oven and range symptoms that fit photo-reviewed triage, burner and igniter surface cleaning, door hinge and gasket review, knob replacement, leveling, anti-tip brackets and repair-or-replace scope. Gas work, new 240V wiring, internal elements, control boards and warranty-authorized service may require licensed or specialized technicians, and we flag that before scheduling."
      ],
      [
        "My gas burner keeps clicking but will not light. Can you help?",
        "Often yes \u2014 constant clicking is frequently grease or food debris on the igniter tip or blocked burner ports, which fits accessible surface cleaning scope. If cleaning does not restore a clean light, the issue may sit with an internal igniter or the gas supply, and we route that to the right specialist instead of guessing."
      ],
      [
        "What should I do if I smell gas near my stove?",
        "Leave the area immediately without touching light switches or appliances, then call 911 and Con Edison's gas emergency line from outside. A suspected gas leak is never a handyman visit \u2014 that work belongs to the utility or a licensed emergency plumber, and we will tell you the same if you contact us first."
      ],
      [
        "Can you fix an oven that will not heat or bakes unevenly?",
        "We can review the door gasket and hinges, leveling, error codes, model details and visible conditions, because escaping heat and a tilted range are common uneven-baking causes. If the symptom points to a failed bake element, thermostat or control board, that may require a specialized appliance technician or the manufacturer, and we say so before booking."
      ],
      [
        "Can you install a replacement range if repair is not worth it?",
        "Yes. When the repair math stops making sense, Repair Asap LLC quotes replacement range installation, including leveling, the anti-tip bracket and observation of the existing accessible connection, after model, photo and building-rule review. Licensed trade work is flagged separately if the new unit needs it."
      ]
    ]
  },
  {
    "slug": "dryer-vent-cleaning",
    "crumb": "Dryer Vent Cleaning",
    "title": "Dryer Vent Cleaning NYC | Lint & Airflow Service",
    "description": "Dryer vent cleaning in NYC from $150: lint removal, airflow check, transition hose replacement. Faster drying, lower fire risk. Book your visit today.",
    "ogTitle": "Dryer Vent Cleaning in NYC | Repair Asap LLC",
    "ogDescription": "Dryer vent cleaning in NYC from $150: lint removal, airflow check, transition hose replacement. Faster drying, lower fire risk. Book your visit today.",
    "badge": "Dryer Vent Cleaning",
    "h1": "Dryer Vent Cleaning in NYC",
    "accent": "Shorter Dry Times, Lower Fire Risk",
    "subtitle": "Faster drying, lower fire risk, smaller electric bills \u2014 accessible vent cleaning from $150 with a before/after airflow check in one visit.",
    "serviceType": "Dryer Vent Cleaning",
    "serviceName": "Dryer Vent Cleaning in NYC",
    "serviceDescription": "Dryer vent cleaning in New York City: lint removal from accessible duct runs, transition hose replacement, dryer pull-out and reconnection, before-and-after airflow checks, reachable exterior vent cap checks, and recurring maintenance planning for homes, landlords and laundry closets when scope fits handyman service limits.",
    "intro": [
      "A dryer that needs two cycles for one load is usually not failing \u2014 its vent is choking on lint. In NYC apartments and laundry closets, long duct runs and crushed transition hoses trap lint that slows drying, overworks the dryer and is a leading factor in dryer fires. Repair Asap LLC reviews photos of the dryer, the vent path and the termination point before booking, so the visit arrives with the right expectations and tools.",
      "Good-fit dryer vent cleaning includes lint removal from accessible duct runs, transition hose replacement, pulling the dryer out and reconnecting the vent, a before-and-after airflow check, a reachable exterior vent cap check, and recurring maintenance planning for homeowners, landlords and buildings with in-unit laundry.",
      "In-wall or riser duct rebuilds, high-rise common exhaust systems, roof terminations, masonry alterations and permit-level ductwork may require building management, a licensed HVAC or duct contractor, or a specialist partner \u2014 we do not do roof work, and we flag that before scheduling. If you smell gas near a gas dryer, call 911 and your utility first; that is never a cleaning appointment."
    ],
    "goodFit": [
      [
        "Lint removal from accessible duct runs",
        "We clean lint out of the transition hose, the reachable duct behind the dryer and the accessible run toward the vent cap."
      ],
      [
        "Transition hose replacement",
        "Crushed foil or plastic transition hoses get swapped for a proper semi-rigid connector sized to the dryer and the closet."
      ],
      [
        "Airflow check before and after",
        "We compare airflow at the duct end or exterior cap before and after cleaning, so the improvement is measured, not assumed."
      ],
      [
        "Dryer pull-out and reconnect",
        "We move the dryer out, clean behind it, reconnect the vent transition and level the unit back in place in tight laundry closets."
      ],
      [
        "Reachable exterior vent cap check",
        "Where the cap is reachable without roof access, we check it for lint mats, stuck flappers, bird nests and missing screens."
      ],
      [
        "Annual maintenance planning",
        "Homes, landlords and buildings with in-unit laundry can set a recurring cleaning schedule instead of waiting for dry times to slip again."
      ]
    ],
    "outOfScope": [
      [
        "In-wall or riser duct rebuilds",
        "Replacing duct concealed inside walls or vertical risers may require a licensed HVAC or duct contractor. We flag that before scheduling."
      ],
      [
        "High-rise common exhaust systems",
        "Shared building exhaust risers and rooftop fans belong to building management and its duct contractor, and we route the request there."
      ],
      [
        "Roof terminations",
        "We do not do roof work, so vent caps that terminate on the roof are flagged for a roofing or duct specialist partner before scheduling."
      ],
      [
        "Masonry alterations",
        "Cutting or rebuilding brick, block or facade openings for a new vent path is beyond handyman scope and is flagged before any visit."
      ],
      [
        "Permit-level ductwork",
        "New duct routes, fire-rated penetrations and DOB-permit alterations may require a licensed contractor. We separate that scope up front."
      ]
    ],
    "intake": [
      [
        "Dryer brand and model number",
        "Model details confirm the vent size, the transition type and whether the unit is electric or gas before we quote the visit."
      ],
      [
        "Photos of the vent path",
        "Shots behind the dryer, the transition hose, any visible duct run and where the duct leaves the room tell us most of the scope."
      ],
      [
        "Exterior vent cap location",
        "A photo or description of where the vent exits \u2014 wall, window buck or roof \u2014 tells us whether the cap is reachable without roof work."
      ],
      [
        "Symptom and timing",
        "Longer dry times, a hot laundry closet, a burning smell, lint around the door, and when the vent was last cleaned all shape the plan."
      ],
      [
        "Laundry closet access notes",
        "Stacked units, door clearance and how much room there is to pull the dryer out determine what we bring and how long the visit takes."
      ],
      [
        "Building access, COI and landlord details",
        "Doorman, freight elevator and COI requirements \u2014 plus the unit list, for landlords booking multiple apartments in one trip."
      ]
    ],
    "offers": [
      "Accessible duct run lint removal",
      "Transition hose replacement",
      "Airflow check before and after cleaning",
      "Dryer pull-out, reconnect and leveling",
      "Recurring vent maintenance planning"
    ],
    "relatedInstall": {
      "label": "Dryer Installation",
      "url": "/services/appliance-services/dryer-installation/"
    },
    "related": [
      {
        "label": "Dryer Repair Help",
        "url": "/services/appliance-services/dryer-repair/"
      },
      {
        "label": "Dryer Installation",
        "url": "/services/appliance-services/dryer-installation/"
      },
      {
        "label": "Washer Repair Help",
        "url": "/services/appliance-services/washer-repair/"
      },
      {
        "label": "Washer & Dryer Installation",
        "url": "/services/appliance-services/washer-dryer-installation/"
      },
      {
        "label": "Appliance Repair Help",
        "url": "/services/appliance-services/appliance-repair/"
      }
    ],
    "crossLinks": [
      {
        "label": "Electrical Troubleshooting",
        "url": "/services/electrical/electrical-troubleshooting/"
      },
      {
        "label": "COI Handyman",
        "url": "/services/general-repairs/coi-handyman/"
      },
      {
        "label": "Apartment Turnover",
        "url": "/services/general-repairs/apartment-turnover/"
      }
    ],
    "ctaLabel": "Request Vent Cleaning",
    "serviceAreaNote": "We schedule dryer vent cleaning across Queens, Manhattan, Brooklyn, the Bronx, Staten Island, and Western Long Island or Nassau County when scope and travel fit. Text photos of the vent path, the dryer model and where the vent exits for the fastest quote.",
    "goodFitTag": "Service Scope",
    "goodFitTitle": "What the Visit <span class=\"text-accent\">Covers</span>",
    "relatedTitle": "Related Laundry & Appliance Services",
    "relatedSubtitle": "If the dryer itself is misbehaving \u2014 no heat, error codes, vibration \u2014 start with dryer repair triage instead.",
    "crossSubtitle": "Vent cleaning visits often uncover outlet, access or turnover work in the same laundry area.",
    "faq": [
      [
        "How often should a dryer vent be cleaned in NYC?",
        "Once a year is the practical baseline for most in-unit setups. Long duct runs, heavy laundry use, pet hair and stacked closet installs push that to every six to nine months. We can set the interval after the first visit, based on how much lint actually comes out and how the airflow measures."
      ],
      [
        "What are the signs of a blocked dryer vent?",
        "Loads that need a second cycle, a dryer or laundry closet that runs hot, a burning smell, lint collecting behind the unit or around the door seal, and weak airflow at the exterior cap. A blocked vent also overworks the dryer and is a common factor in dryer fires. If the dryer shows no heat at all, start with our dryer repair triage instead."
      ],
      [
        "What should I send before booking a dryer vent cleaning?",
        "Send the dryer brand and model number, photos behind the dryer showing the transition hose and duct, where the vent exits the building, the symptom you are seeing, and any building access or COI requirements. That is usually enough to confirm scope and quote the visit without a separate trip."
      ],
      [
        "Can you set up recurring dryer vent cleaning for landlords or multifamily buildings?",
        "Yes. We can batch multiple units in one visit, keep notes per apartment, provide COI support, and put the building on an annual or semi-annual schedule. Shared high-rise exhaust risers stay with building management and its duct contractor \u2014 we cover the accessible in-unit runs."
      ],
      [
        "Will cleaning the vent fix a dryer that takes too long?",
        "Often, yes \u2014 a restricted vent is the most common reason a working dryer suddenly needs two cycles. We check airflow before and after cleaning so the improvement is measurable, not assumed. If the duct is clear and drying is still slow, the problem points to the appliance itself and we route you to dryer repair triage."
      ]
    ]
  },
  {
    "slug": "ac-repair-help",
    "crumb": "AC Repair",
    "title": "AC Repair Help NYC | Not-Cooling & Leak Triage",
    "description": "AC not cooling in NYC? Window, through-wall, portable and PTAC triage: free photo estimate, deep cleaning, re-seal or replacement advice. Text photos now.",
    "ogTitle": "AC Repair Help in NYC | Repair Asap LLC",
    "ogDescription": "AC not cooling in NYC? Window, through-wall, portable and PTAC triage: free photo estimate, deep cleaning, re-seal or replacement advice. Text photos now.",
    "badge": "AC Repair Help",
    "h1": "AC Repair Help in NYC",
    "accent": "Not-Cooling & Water-Leak Triage",
    "subtitle": "AC not cooling? Get free photo triage today \u2014 cleaning, drain fixes, re-sealing or smart replacement, sorted before the summer heat wins.",
    "serviceType": "AC Repair Help",
    "serviceName": "AC Repair Help in NYC",
    "serviceDescription": "Photo-reviewed AC repair help in New York City for window, through-wall, portable and PTAC units: not-cooling triage, filter and accessible coil cleaning, drain and condensate leak observation, re-seating and resealing loose units, seasonal removal and reinstallation, and repair-or-replace decisions when scope fits handyman service limits.",
    "intro": [
      "Between April and September, a failed air conditioner turns an NYC apartment, home office or storefront hot enough to disrupt sleep and work within hours. Repair Asap LLC reviews the unit type \u2014 window, through-wall, portable or PTAC \u2014 plus the model or BTU label, photos, symptom timeline and building access before booking a triage, cleaning or re-secure visit.",
      "Good-fit AC repair help includes not-cooling triage from photos and the model label, filter and accessible coil cleaning, drain and condensate observation when water drips inside, re-seating and re-securing units that shifted in the window or sleeve, sealing gaps around side panels, seasonal remove-store-reinstall service, and planning a replacement unit when the old one is not worth fixing.",
      "We do not handle refrigerant-line service or sealed-system repair. Refrigerant diagnosis or recharge may require an EPA Section 608 certified technician, compressor and sealed-system failures may require the manufacturer or a specialist partner, central or ducted systems and mini-split internal service may require an HVAC specialist, and breaker-tripping or wiring faults may require a Licensed Master Electrician. We flag that before scheduling."
    ],
    "goodFit": [
      [
        "AC not cooling \u2014 window, through-wall or portable",
        "Weak or warm airflow is triaged from the model label, filter and coil photos and a symptom timeline before the visit is booked."
      ],
      [
        "PTAC unit not cooling or cycling oddly",
        "Sleeve-mounted PTAC symptoms are reviewed against unit photos, sleeve condition and the co-op or condo rules that shape the visit."
      ],
      [
        "Filter and accessible coil cleaning",
        "Light filter washes and reachable coil cleaning fit a repair visit; heavy buildup gets routed to a dedicated deep-cleaning appointment."
      ],
      [
        "AC leaking water inside",
        "We observe the drain pan, condensate path and unit tilt to find why water drips indoors instead of draining outside."
      ],
      [
        "Loose fit, gaps or bracket concerns",
        "Units that shifted in the opening get re-seated, re-secured and resealed so hot air, noise and rain stay out."
      ],
      [
        "Repair-or-replace decision and unit swap planning",
        "If the unit is not worth fixing, we plan a like-for-like swap and quote window, through-wall or PTAC installation."
      ]
    ],
    "outOfScope": [
      [
        "Refrigerant diagnosis or recharge",
        "Suspected refrigerant loss may require an EPA Section 608 certified technician; we route it there instead of guessing at a fix."
      ],
      [
        "Sealed-system or compressor repair",
        "Compressor and sealed-system failures may require the manufacturer or a specialist partner \u2014 for room units this is usually a replace-the-unit conversation."
      ],
      [
        "Central or ducted split-system service",
        "Whole-home and ducted systems may require an HVAC specialist; our scope stays with self-contained window, sleeve, portable and PTAC units."
      ],
      [
        "Mini-split internal service",
        "Indoor-head and line-set work may require the installing HVAC company; we flag it before scheduling rather than opening the unit."
      ],
      [
        "Electrical circuit faults",
        "A unit that trips breakers or shows outlet damage may require a Licensed Master Electrician before any cooling triage continues."
      ]
    ],
    "intake": [
      [
        "Unit type and model or BTU label",
        "Window, through-wall, portable or PTAC \u2014 the label photo tells us capacity, age and likely part availability."
      ],
      [
        "Photos of the filter and front grille",
        "Filter and coil condition often separate a cleaning visit from a replacement conversation."
      ],
      [
        "Exact symptom and when it started",
        "Warm air, weak airflow, short cycling or dripping \u2014 plus whether it began suddenly or faded over weeks."
      ],
      [
        "Photo or video of any water leak",
        "Where the water shows up \u2014 sill, wall or floor \u2014 points to the drain, tilt or seal issue."
      ],
      [
        "Window, sleeve or bracket photos",
        "Shots from inside, and outside if safe, show how the unit sits and whether re-seating or resealing is needed."
      ],
      [
        "Building access, COI and floor level",
        "Doorman rules, freight elevator windows and COI requirements are confirmed before the appointment."
      ]
    ],
    "offers": [
      "Not-cooling triage from photos and model",
      "Filter and accessible coil cleaning",
      "Drain and condensate leak observation",
      "Seal, gap and bracket re-secure",
      "Unit swap planning and installation quote"
    ],
    "faq": [
      [
        "Do you repair air conditioners in NYC?",
        "Repair Asap LLC helps with window, through-wall, portable and PTAC units when the symptom fits photo-reviewed triage, filter and coil cleaning, drain observation, re-seating, resealing or replacement planning. We do not handle refrigerant-line service or sealed-system repair \u2014 that may require an EPA Section 608 certified technician or the manufacturer, and we flag it before scheduling."
      ],
      [
        "My AC runs but blows warm air \u2014 can you fix it?",
        "We start with the model label, filter and coil photos and a symptom timeline, because clogged filters, dirty coils, blocked airflow and seal gaps cause many warm-air complaints. If the evidence points to refrigerant loss or a compressor failure instead, we route the unit to an EPA Section 608 certified technician or a replacement conversation before booking a visit."
      ],
      [
        "Why is my AC leaking water inside the apartment?",
        "Indoor drips usually trace to a blocked drain path, a dirty pan or a unit tilted toward the room instead of the outside. We observe the drain and condensate path, correct tilt and accessible blockages, and reseal the opening when the water rides in around the unit rather than through it."
      ],
      [
        "Do you service PTAC units in co-ops and condos?",
        "Yes \u2014 PTAC triage, filter and accessible coil cleaning, and like-for-like swaps in existing sleeves are a good fit, and we plan around co-op rules, COI requirements and freight-elevator access. Internal refrigerant components stay with an EPA Section 608 certified technician or the manufacturer, which we flag first."
      ],
      [
        "Can you take my AC out for winter and put it back in spring?",
        "Yes. Seasonal service covers careful removal, window resealing for the cold months, labeled storage prep, and reinstallation with brackets and side panels re-secured before the next cooling season. Send window and unit photos so we can quote both visits at once."
      ]
    ],
    "related": [
      {
        "label": "AC Deep Cleaning",
        "url": "/services/ac-installation-cleaning/ac-deep-cleaning/"
      },
      {
        "label": "Window AC Installation",
        "url": "/services/ac-installation-cleaning/window-ac-installation/"
      },
      {
        "label": "Through-Wall AC Installation",
        "url": "/services/ac-installation-cleaning/through-wall-ac-installation/"
      },
      {
        "label": "PTAC Installation",
        "url": "/services/ac-installation-cleaning/ptac-installation/"
      },
      {
        "label": "AC Removal",
        "url": "/services/ac-installation-cleaning/ac-removal/"
      }
    ],
    "crossLinks": [
      {
        "label": "Electrical Troubleshooting",
        "url": "/services/electrical/electrical-troubleshooting/"
      },
      {
        "label": "Drywall Repair",
        "url": "/services/general-repairs/drywall-repair/"
      },
      {
        "label": "COI Handyman",
        "url": "/services/general-repairs/coi-handyman/"
      }
    ],
    "ctaLabel": "Request AC Repair Help",
    "serviceAreaNote": "We quote AC repair help across Queens, Manhattan, Brooklyn, the Bronx, Staten Island, and Western Long Island or Nassau County when scope and travel fit. Text the unit type, model or BTU label, photos and the exact symptom for the fastest review during business hours.",
    "relatedTitle": "Related AC Services",
    "relatedSubtitle": "Cleaning, installation and seasonal removal pages for the same window, sleeve, portable and PTAC units.",
    "crossSubtitle": "AC symptoms often overlap with outlet, wall-finish or building-access scope.",
    "category": {
      "label": "AC Installation & Cleaning",
      "url": "/services/ac-installation-cleaning/",
      "dataCategory": "ac",
      "heroImage": "/assets/services/service-ac.webp"
    }
  },
  {
    "slug": "commercial-refrigeration",
    "crumb": "Commercial Refrigeration",
    "title": "Commercial Refrigeration Help NYC | Walk-In Cooler Triage",
    "description": "Walk-in or reach-in trouble in NYC? Same-business-day triage when available: coils, gaskets, doors, 41\u00b0F checks. Free photo estimate \u2014 text photos now.",
    "ogTitle": "Commercial Refrigeration Triage in NYC | Repair Asap LLC",
    "ogDescription": "Walk-in or reach-in trouble in NYC? Same-business-day triage when available: coils, gaskets, doors, 41\u00b0F checks. Free photo estimate \u2014 text photos now.",
    "badge": "Commercial Refrigeration Triage",
    "h1": "Commercial Refrigeration Help in NYC",
    "accent": "Cooler, Coil & Gasket Triage",
    "subtitle": "Cooler drifting above 41\u00b0F? Same-business-day triage when available \u2014 don't pay a specialist's emergency rate for a dirty coil or a torn gasket.",
    "serviceType": "Commercial Refrigeration Triage",
    "serviceName": "Commercial Refrigeration Triage in NYC",
    "serviceDescription": "Commercial refrigeration triage in New York City for walk-in coolers, reach-in refrigerators, prep tables and beverage coolers: temperature checks and logging observations, condenser coil and airflow cleaning, door gasket, hinge, latch and closer replacement planning, visible drain line cleaning, door sweeps and strip curtains, leveling, quarterly maintenance planning and COI support, with refrigerant, compressor, sealed-system and warranty work routed to an EPA Section 608 certified technician or refrigeration specialist.",
    "intro": [
      "A walk-in cooler or reach-in that stops holding temperature is urgent for a restaurant, deli, grocery, bar or cafe: NYC food code requires cold food held at 41\u00b0F or below, so a failing unit is a food-loss risk and an inspection risk at the same time. Repair Asap LLC offers same-business-day triage when available during business hours \u2014 we review the unit type, model and serial number, current and target temperatures, photos of the condenser area and door seals, and how much stock is at risk before booking the visit.",
      "Good-fit commercial refrigeration triage includes temperature checks and logging observations, condenser coil and airflow cleaning, door gasket, hinge, latch and closer review with replacement planning, visible drain line cleaning, door sweeps and strip curtains, unit leveling, and quarterly maintenance planning so coils and gaskets are handled before they take a box down mid-service. We also clean and maintain ice machines, and we support COI paperwork for commercial buildings and property managers.",
      "Refrigerant charging or recovery, compressor and sealed-system work, board-level electronics and manufacturer warranty service may require an EPA Section 608 certified technician, a refrigeration specialist or the manufacturer. We flag that before scheduling \u2014 and triage first means you do not pay a specialist's emergency rate to find out the real problem was a dirty condenser coil or a worn door gasket."
    ],
    "goodFit": [
      [
        "Walk-in cooler or freezer not holding temperature",
        "Temperature reading plus airflow, condenser, door-seal and strip-curtain review before any specialist visit is booked."
      ],
      [
        "Reach-in fridge or prep table running warm",
        "Line equipment checked for blocked airflow, dirty coils, overloaded pans and door-seal leaks during your working hours."
      ],
      [
        "Dirty condenser coils or blocked airflow",
        "Kitchen grease and dust choke condensers fast; we clean accessible coils and clear intake and discharge clearance."
      ],
      [
        "Door gasket, hinge, latch or closer wear",
        "Torn gaskets and sagging doors leak cold air all day; we review, measure and plan exact-fit replacements."
      ],
      [
        "Visible drain line clogs, ice or pooling water",
        "Accessible drain lines cleaned, with pan and pitch conditions observed before water reaches stock or flooring."
      ],
      [
        "Quarterly cleaning and maintenance planning",
        "A scheduled coil, gasket, drain and temperature routine that cuts failures and inspection-day surprises."
      ]
    ],
    "outOfScope": [
      [
        "Refrigerant charging or recovery",
        "Any refrigerant work requires an EPA Section 608 certified technician; we route it before scheduling."
      ],
      [
        "Compressor or sealed-system replacement",
        "Sealed-system failures go to a refrigeration specialist once triage rules out coils, seals and airflow."
      ],
      [
        "Board-level control and electronic repair",
        "Failed controllers and control boards are routed to a specialist or the manufacturer after symptom review."
      ],
      [
        "Manufacturer warranty-authorized service",
        "Units under warranty are flagged first so an outside visit does not put your coverage at risk."
      ],
      [
        "New circuits or permit-level buildout",
        "Dedicated power, new outlets and permit work may require a Licensed Master Electrician; we flag it up front."
      ]
    ],
    "intake": [
      [
        "Unit type, brand, model and serial number",
        "Walk-in, reach-in, prep table or beverage cooler details tell us what parts and scope to expect."
      ],
      [
        "Current and target temperature readings",
        "The actual box temperature against the 41\u00b0F food-safety line sets the urgency of the visit."
      ],
      [
        "Photos of the unit, condenser area and door seals",
        "Coil condition, clearance and gasket wear are usually visible before anyone is on site."
      ],
      [
        "When the symptom started and what changed",
        "A slow temperature drift and a sudden failure point to different causes and different routing."
      ],
      [
        "Access notes: kitchen hours, loading and elevators",
        "Service windows, freight elevator rules and building requirements shape realistic scheduling."
      ],
      [
        "COI requirements and warranty status",
        "Certificate of insurance needs and active warranties are confirmed before the visit is booked."
      ]
    ],
    "offers": [
      "Temperature check and logging observation",
      "Condenser coil and airflow cleaning",
      "Door gasket, hinge and closer replacement planning",
      "Visible drain line cleaning and door sweep fitting",
      "Quarterly maintenance planning and COI support"
    ],
    "faq": [
      [
        "Do you repair walk-in coolers in NYC?",
        "We triage them. Repair Asap LLC handles the walk-in scope a handyman does well: temperature checks, condenser coil and airflow cleaning, door gasket, hinge and closer replacement planning, visible drain line cleaning, sweeps, curtains and leveling. Refrigerant, compressor and sealed-system work is routed to an EPA Section 608 certified technician or refrigeration specialist \u2014 and triage often shows the real problem was a dirty coil or a bad gasket."
      ],
      [
        "How fast can you get to a cooler that is down?",
        "We offer same-business-day triage when available, with the fastest response during business hours. Text the unit type, model and serial number, current temperature and photos, and we confirm the earliest practical visit. While you wait, keep doors closed and move at-risk stock to a working unit."
      ],
      [
        "Do you provide a COI for commercial buildings?",
        "Yes. Repair Asap LLC is insured and supports certificate of insurance requests for commercial landlords, property managers and managed buildings. Send the COI requirements with your booking details so the paperwork is ready before the visit."
      ],
      [
        "What happens if my unit needs refrigerant or a new compressor?",
        "We flag it before scheduling and route the work to an EPA Section 608 certified technician or a refrigeration specialist. That triage step protects you from paying a specialist's emergency rate to discover a dirty condenser coil or a worn gasket. If the specialist path is confirmed, you go in with temperatures, photos and observations already documented."
      ],
      [
        "Do you offer maintenance plans for commercial refrigeration?",
        "Yes. We plan quarterly cleaning schedules covering condenser coils, door gaskets and closers, visible drain lines, sweeps and curtains, and temperature checks across your units, including ice machines. A regular routine keeps boxes at 41\u00b0F or below and reduces failures during service hours."
      ]
    ],
    "related": [
      {
        "label": "Ice Machine Cleaning",
        "url": "/services/appliance-services/ice-machine-cleaning/"
      },
      {
        "label": "Appliance Repair Help",
        "url": "/services/appliance-services/appliance-repair/"
      },
      {
        "label": "Refrigerator Repair Help",
        "url": "/services/appliance-services/refrigerator-repair/"
      },
      {
        "label": "COI Handyman",
        "url": "/services/general-repairs/coi-handyman/"
      }
    ],
    "crossLinks": [
      {
        "label": "Handyman for Restaurants",
        "url": "/for-restaurants/"
      },
      {
        "label": "Preventive Maintenance",
        "url": "/preventive-maintenance/"
      },
      {
        "label": "Visible Leak Repair",
        "url": "/services/plumbing/leak-repair/"
      }
    ],
    "ctaLabel": "Request Commercial Triage",
    "goodFitTag": "Commercial Scope",
    "goodFitTitle": "What We Can <span class=\"text-accent\">Triage</span>",
    "relatedTitle": "Related Commercial Services",
    "relatedSubtitle": "Ice machines, residential refrigeration and COI paperwork have their own pages; start with the closest fit.",
    "crossSubtitle": "Food businesses usually need more than one scope reviewed in the same visit window; these pages cover the overlap.",
    "serviceAreaNote": "We triage commercial refrigeration across Queens, Manhattan, Brooklyn, the Bronx, Staten Island, and Western Long Island or Nassau County when scope and travel fit. Text the unit type, model and serial number, current temperature, photos, urgency and COI requirements for the fastest review."
  },
  {
    "slug": "ice-machine-cleaning",
    "crumb": "Ice Machine Cleaning",
    "title": "Ice Machine Cleaning NYC | Descale, Sanitize & Triage",
    "description": "Ice machine cleaning in NYC from $150: manufacturer-cycle descale and sanitize, filter swaps, ice-quality triage. Inspection-ready \u2014 book your visit.",
    "ogTitle": "Ice Machine Cleaning in NYC | Repair Asap LLC",
    "ogDescription": "Ice machine cleaning in NYC from $150: manufacturer-cycle descale and sanitize, filter swaps, ice-quality triage. Inspection-ready \u2014 book your visit.",
    "badge": "Ice Machine Cleaning",
    "h1": "Ice Machine Cleaning in NYC",
    "accent": "Descale, Sanitize & Ice Quality Triage",
    "subtitle": "Cloudy ice, low output or slime in the bin? Manufacturer-cycle cleaning and sanitizing from $150 \u2014 inspection-ready ice for bars, cafes and offices.",
    "serviceType": "Ice Machine Cleaning",
    "serviceName": "Ice Machine Cleaning in NYC",
    "serviceDescription": "Ice machine cleaning in New York City: manufacturer-cycle descale and sanitize following the unit's documented procedure, accessible water filter replacement, visible water and drain line cleaning, bin and condenser cleaning, ice quality triage, and recurring cleaning schedule planning for restaurants, bars, cafes, offices and healthcare waiting rooms.",
    "intro": [
      "Cloudy cubes, off-taste ice, pink slime in the bin or a machine that suddenly makes less ice are problems no NYC bar, restaurant, cafe, office or healthcare waiting room can sit on, because ice is served as food and inspectors treat it that way. Repair Asap LLC reviews the machine's brand, model number, bin and evaporator photos, filter age and cleaning history before booking a scheduled cleaning visit.",
      "Good-fit ice machine service includes a manufacturer-cycle cleaning that descales and sanitizes following the unit's documented procedure, accessible water filter replacement, visible water line and drain line cleaning, exterior scale and storage-bin cleaning, condenser dust and airflow cleaning, ice quality triage from photos and the model number, and planning a recurring cleaning schedule so the machine is ready for health inspections.",
      "Refrigerant, sealed-system and compressor work may require an EPA Section 608 certified technician, water treatment system installation may require a specialist partner, and new water or drain lines may require a Licensed Master Plumber. Warranty-authorized service belongs with the manufacturer, and board-level controls belong with a specialist. We flag all of that before scheduling."
    ],
    "goodFit": [
      [
        "Manufacturer-cycle descale and sanitize",
        "We follow the unit's documented cleaning procedure step by step, the same cycle Hoshizaki, Manitowoc and Scotsman publish in their manuals."
      ],
      [
        "Cloudy, small, off-taste or low-production ice",
        "Ice quality symptoms are triaged from photos and the model number so the visit targets scale, filter or airflow causes first."
      ],
      [
        "Accessible water filter replacement",
        "In-line and cabinet filters are swapped on the documented interval when the filter head is reachable without new plumbing."
      ],
      [
        "Visible water line and drain line cleaning",
        "Reachable supply and drain runs are cleaned and checked for kinks, sag and slime where they connect to the machine."
      ],
      [
        "Exterior scale, bin and condenser dust cleaning",
        "Mineral crust on panels, slime film in the storage bin and dust-packed condenser fins are cleaned to restore airflow."
      ],
      [
        "Recurring cleaning schedule planning",
        "We plan a descale-and-sanitize calendar around your usage and water conditions so inspection day is never a surprise."
      ]
    ],
    "outOfScope": [
      [
        "Refrigerant, sealed-system or compressor work",
        "Low ice from a failing refrigeration circuit may require an EPA Section 608 certified technician, and we flag that before scheduling."
      ],
      [
        "Water treatment system installation",
        "Softener and treatment equipment sizing may require a specialist partner rather than a cleaning visit."
      ],
      [
        "New water or drain line installation",
        "Running new supply or drain piping to the machine may require a Licensed Master Plumber."
      ],
      [
        "Warranty-authorized manufacturer service",
        "Machines under factory warranty may need the manufacturer's own network so coverage stays intact."
      ],
      [
        "Board-level control repair",
        "Failed control boards and sensors may require the manufacturer or a specialist partner, not deeper cleaning."
      ]
    ],
    "intake": [
      [
        "Brand and model number",
        "The nameplate tells us which documented cleaning cycle and sanitizer procedure the machine calls for."
      ],
      [
        "Photos of the machine, bin and evaporator area",
        "Slime, mold film and scale visible in photos set the depth of cleaning the visit needs."
      ],
      [
        "Ice symptoms and when they started",
        "Cloudy, small, bad-tasting or fewer cubes each point at different causes, so timing matters."
      ],
      [
        "Water filter location and last change date",
        "A photo of the filter head and its age tells us whether a replacement cartridge should come along."
      ],
      [
        "Last cleaning date and any service history",
        "Knowing when the machine was last descaled and sanitized shapes both this visit and the recurring schedule."
      ],
      [
        "Building access, service window and COI requirements",
        "Bars, offices and healthcare buildings often need certificates and quiet-hours scheduling arranged in advance."
      ]
    ],
    "offers": [
      "Manufacturer-cycle descale and sanitize",
      "Accessible water filter replacement",
      "Visible water and drain line cleaning",
      "Bin, exterior scale and condenser cleaning",
      "Recurring cleaning schedule planning"
    ],
    "faq": [
      [
        "How often should a NYC bar or restaurant clean its ice machine?",
        "Most manufacturers document a full descale-and-sanitize cycle at least twice a year, and busy bars and restaurants with hard city water often land closer to quarterly. We review your usage, water conditions and inspection history, then plan a recurring schedule instead of waiting for slime or off-taste complaints."
      ],
      [
        "What ice machine brands do you clean?",
        "Any brand that publishes a documented cleaning procedure. Hoshizaki, Manitowoc and Scotsman are common examples \u2014 each publishes a step-by-step descale and sanitize cycle in its manual, and we follow the manufacturer's procedure rather than improvising."
      ],
      [
        "Is dirty ice a health-inspection issue in NYC?",
        "Yes. Ice is handled as a food, so slime, mold film or scale in the machine or storage bin can be cited during an inspection. A recurring, documented cleaning schedule is the practical way to keep the machine ready before the inspector arrives."
      ],
      [
        "What if cleaning does not fix low ice production?",
        "If production stays low after a full descale, sanitize, filter replacement and condenser cleaning, the cause is usually in the refrigeration circuit or controls. That work may require an EPA Section 608 certified technician, the manufacturer or a specialist partner, and we flag that honestly instead of selling repeat cleanings."
      ],
      [
        "Can you handle office and healthcare buildings that require a COI?",
        "Yes. Repair Asap LLC is insured and provides COI support for managed buildings, offices and healthcare waiting rooms. Tell us the certificate requirements and preferred service window when you send photos, and we coordinate the paperwork before the visit."
      ]
    ],
    "related": [
      {
        "label": "Commercial Refrigeration",
        "url": "/services/appliance-services/commercial-refrigeration/"
      },
      {
        "label": "Appliance Repair Help",
        "url": "/services/appliance-services/appliance-repair/"
      },
      {
        "label": "Refrigerator Repair",
        "url": "/services/appliance-services/refrigerator-repair/"
      },
      {
        "label": "COI Handyman",
        "url": "/services/general-repairs/coi-handyman/"
      }
    ],
    "crossLinks": [
      {
        "label": "Visible Leak Repair",
        "url": "/services/plumbing/leak-repair/"
      },
      {
        "label": "Shut-Off Valve Installation",
        "url": "/services/plumbing/shut-off-valve-installation/"
      },
      {
        "label": "Electrical Troubleshooting",
        "url": "/services/electrical/electrical-troubleshooting/"
      }
    ],
    "ctaLabel": "Request Cleaning Help",
    "serviceAreaNote": "We quote ice machine cleaning across Queens, Manhattan, Brooklyn, the Bronx, Staten Island, and Western Long Island or Nassau County when scope and travel fit. Text the model number, photos of the machine and bin, the ice symptom and building requirements for the fastest review.",
    "goodFitTag": "Cleaning Scope",
    "goodFitTitle": "What We Can <span class=\"text-accent\">Clean &amp; Review</span>",
    "relatedTitle": "Related Commercial & Appliance Services",
    "relatedSubtitle": "Commercial refrigeration and appliance pages cover the adjacent symptoms ice machines often ride along with.",
    "crossSubtitle": "Ice machine visits often overlap with shutoff, visible leak and building-access scope."
  }
];

// ---- Conversion layer: calculator config, curated photos, verified reviews ----

const GALLERY_DATA = JSON.parse(
  readFileSync(new URL('./appliance-gallery-data.json', import.meta.url), 'utf8'),
);

// Real job photos as hero backgrounds (generated 640x640 webp) — falls back
// to the category stock image when a page has no real-photo hero yet.
const HERO_IMAGES = JSON.parse(
  readFileSync(new URL('./appliance-hero-images.json', import.meta.url), 'utf8'),
);

// data-config keys must exist in components/modules/calculator.js CONFIGS
const CALC_CONFIG = {
  'refrigerator-repair': 'refrigerator-repair',
  'dishwasher-repair': 'dishwasher-repair',
  'washer-repair': 'washer-repair',
  'dryer-repair': 'dryer-repair',
  'oven-range-repair': 'oven-range-repair',
  'ac-repair-help': 'ac-repair-help',
  'commercial-refrigeration': 'commercial-refrigeration',
  'dryer-vent-cleaning': 'dryer-vent-cleaning',
  'ice-machine-cleaning': 'ice-machine-cleaning',
};

// Real quotes from _data/reviews_database.md (63 five-star reviews).
// Long quotes are trimmed with an ellipsis, never altered.
const REVIEWS = {
  'refrigerator-repair': [
    ['Tanya Z.', 'Yelp · Nov 2025', 'Fast quote on Yelp and came out quick to service my apt. Listened to my concerns about wanting repair vs replacement services. Got the job done in one visit. Competitive prices.'],
    ['Jay C.', 'Thumbtack · Dec 2023', 'He showed up on time. He found the root cause right away. What he did exceeded our expectation. His charge is very reasonable with the time and quality.'],
    ['Christine Yi', 'Google · Jun 2025', 'They were able to book an appointment for me the day of, even on a weekend. Very communicative and responsive as well.'],
  ],
  'dishwasher-repair': [
    ['Kerry C.', 'Yelp · Jan 2026', 'He responded immediately to a repair request and set an appointment. He explained what needed to be done and completed the job. Punctual, respectful, and left the workspace clean.'],
    ['Liza K.', 'Thumbtack · Nov 2021', 'Extremely quick and responsive. I was so happy with the job.'],
    ['Jordan W.', 'Thumbtack · Dec 2021', 'He did a good job and worked really quickly.'],
  ],
  'washer-repair': [
    ['Taylor O.', 'Thumbtack · Nov 2022', 'Very professional and efficient work! Definitely will be hiring again.'],
    ['Atika L.', 'Thumbtack · Dec 2023', 'Punctual, excellent work.'],
    ['Alex A.', 'Thumbtack · Dec 2021', 'Great experience. Would hire again.'],
  ],
  'dryer-repair': [
    ['Artem Eliseyev', 'Google · May 2025', 'Communicated early on his ETA, showed up with two bags of tools and got to work right away. Fixed the issue and everything is working great again!'],
    ['Erin M.', 'Thumbtack · Nov 2021', 'Amazing job. Very professional. Would recommend to anyone.'],
    ['Sarry N.', 'Thumbtack · Dec 2021', 'Great and very professional.'],
  ],
  'oven-range-repair': [
    ['Patricia S.', 'Yelp · Jan 2026', "Very efficient and did high quality work. He installed my oven hood that I didn't have a cabinet to install it under and mounted it to the wall sturdily. It can support 100+ pounds!"],
    ['Carly K.', 'Thumbtack · Aug 2022', 'Highly recommend! He was willing to help with anything and couldn\'t do enough.'],
    ['Andrew D.', 'Thumbtack · Dec 2021', 'Great! Strongly recommend.'],
  ],
  'ac-repair-help': [
    ['Dominic P.', 'Thumbtack · Sep 2025', 'Had an issue with my mini splits. He came and repaired it well. Would definitely leverage his services again.'],
    ['Riaz A.', 'Thumbtack · Jul 2025', 'On time, professional, and came fully prepared with all the necessary tools. Installed a sturdy support bracket and carefully mounted a large 12,000 BTU unit with precision and care.'],
    ['Vivek K.', 'Thumbtack · Oct 2025', 'Did a great job helping me with replacing my window seals and mounting my new PTAC units. On time, responsive and easy to work with.'],
  ],
  'dryer-vent-cleaning': [
    ['Nyjazz N.', 'Yelp · Dec 2025', 'Good work, done in quick time. Worker arrived on time and had the right equipment for the job.'],
    ['Artemisia M.', 'Thumbtack · Jul 2022', 'Very professional. Will hire again!'],
    ['LIOR a.', 'Thumbtack · Aug 2022', 'Thank you for the great help today! See you again next week.'],
  ],
  'commercial-refrigeration': [
    ['Roxanna F.', 'Thumbtack · Aug 2025', 'Wonderful to work with and did an excellent job. Professional, responsive and took the time to explain what needed to be completed. Fantastic service!'],
    ['Damian P.', 'Yelp · May 2025', 'Amazing! He communicated the entire time before the project and his estimate was great. On time and efficient. Extremely happy I found him! Great value! Great work!'],
    ['JV H.', 'Thumbtack · Jun 2025', 'Arrived on time, was courteous and professional, and explained everything clearly before getting started. The work was done quickly and efficiently, and he even cleaned up afterward.'],
  ],
  'ice-machine-cleaning': [
    ['Lory L.', 'Thumbtack · Aug 2022', 'Extremely knowledgeable and efficient with his work. Very helpful with tips! He is super!'],
    ['Jenna l.', 'Thumbtack · Aug 2022', 'Amazing!'],
    ['Jordan W.', 'Thumbtack · Dec 2021', 'He did a good job and worked really quickly.'],
  ],
};

function thumbFor(fullPath) {
  const thumb = fullPath.replace('/assets/photo/', '/assets/photo/thumbnails/');
  return existsSync(join(ROOT, ...thumb.split('/').filter(Boolean))) ? thumb : fullPath;
}

function pricingPanelSection(page) {
  return `        <section class="svc-features" id="pricing" aria-label="Pricing model">
            <div class="container">
                <span class="section-tag">Simple, Honest Pricing</span>
                <h2 class="section-title">Know the Cost <span class="text-accent">Before Anyone Shows Up</span></h2>
                <div class="svc-features__grid">
                    <div class="svc-features__card">
                        <div class="svc-features__icon">${iconSvg('camera')}</div>
                        <h3>1. Free Photo Estimate</h3>
                        <p>Text photos and the model number to <a href="sms:+17753107770">+1 (775) 310-7770</a> or send them through the form — you get a real answer and a price range for free.</p>
                    </div>
                    <div class="svc-features__card">
                        <div class="svc-features__icon">${iconSvg('check')}</div>
                        <h3>2. $99 On-Site Assessment</h3>
                        <p>Can't tell from photos? We come out and diagnose on site. The $99 is credited toward the job if you hire us — so the assessment costs $0 when we do the work.</p>
                    </div>
                    <div class="svc-features__card">
                        <div class="svc-features__icon">${iconSvg('alert')}</div>
                        <h3>3. Work From $150</h3>
                        <p>Every job is quoted and approved before work starts — no surprises. $150 work minimum; NYC sales tax is added separately where applicable.</p>
                    </div>
                </div>
            </div>
        </section>
`;
}

function calculatorSection(slug) {
  const key = CALC_CONFIG[slug];
  if (!key) return '';
  return `        <section class="spoke-module" id="calculator">
            <div class="container">
                <div data-module="calculator" data-config="${key}"></div>
            </div>
        </section>
`;
}

function gallerySection(slug, page) {
  const photos = GALLERY_DATA[slug];
  if (!photos || photos.length === 0) return '';
  const cards = photos
    .map((photo) => `                    <div class="svc-gallery__card" data-type="${photo.type}">
                        <div class="svc-gallery__img-wrap" data-full="${photo.full}" data-caption="${escapeHtml(photo.caption)}">
                            <span class="svc-gallery__badge svc-gallery__badge--${photo.type}">${photo.type === 'before' ? 'Before' : 'After'}</span>
                            <img src="${thumbFor(photo.full)}" alt="${escapeHtml(photo.caption)}" loading="lazy" width="400" height="400">
                        </div>
                        <div class="svc-gallery__caption">${escapeHtml(photo.caption)}</div>
                    </div>`)
    .join('\n');
  return `        <section class="svc-gallery" id="gallery" aria-label="Recent work photos">
            <div class="container">
                <span class="section-tag">Real Jobs</span>
                <h2 class="section-title">Our Work, <span class="text-accent">Not Stock Photos</span></h2>
                <p class="section-subtitle">Recent ${escapeHtml(page.category ? 'AC' : 'appliance')} jobs completed by our team across NYC.</p>
                <div class="svc-gallery__grid">
${cards}
                </div>
            </div>
        </section>
`;
}

function reviewsSection(slug) {
  const reviews = REVIEWS[slug];
  if (!reviews || reviews.length === 0) return '';
  const cards = reviews
    .map(([name, source, text]) => `                    <div class="review-card">
                        <div class="review-card__stars">★★★★★</div>
                        <p class="review-card__text">"${escapeHtml(text)}"</p>
                        <div class="review-card__author">
                            <div class="review-card__name">${escapeHtml(name)}</div>
                            <div class="review-card__loc">${escapeHtml(source)}</div>
                        </div>
                    </div>`)
    .join('\n');
  return `        <section class="svc-features" id="reviews" aria-label="Customer reviews">
            <div class="container">
                <span class="section-tag">Verified Reviews</span>
                <h2 class="section-title">4.9★ Across <span class="text-accent">73 Verified Reviews</span></h2>
                <p class="section-subtitle">Real feedback from Google, Yelp and Thumbtack customers. <a href="/reviews/">Read more reviews →</a></p>
                <div class="reviews__grid">
${cards}
                </div>
            </div>
        </section>
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll('</', '<\\/');
}

function iconSvg(kind) {
  const icons = {
    check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    alert: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    camera: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  };
  return icons[kind];
}

function itemTitle(item) {
  return Array.isArray(item) ? item[0] : item;
}

function itemDesc(item, fallback) {
  return Array.isArray(item) && item[1] ? item[1] : fallback;
}

function featureCards(items, kind) {
  const fallback =
    kind === 'alert'
      ? 'Flagged before scheduling so the visit is routed correctly.'
      : 'Reviewed from photos, model details and site conditions before booking.';
  return items
    .map(
      (item) => `                    <div class="svc-features__card">
                        <div class="svc-features__icon">${iconSvg(kind)}</div>
                        <h3>${escapeHtml(itemTitle(item))}</h3>
                        <p>${escapeHtml(itemDesc(item, fallback))}</p>
                    </div>`,
    )
    .join('\n');
}

function intakeList(items) {
  const fallback = 'Send this before booking so the quote and route can be confirmed.';
  return items
    .map(
      (item) => `                    <div class="svc-process__step">
                        <div class="svc-process__number">+</div>
                        <h3>${escapeHtml(itemTitle(item))}</h3>
                        <p>${escapeHtml(itemDesc(item, fallback))}</p>
                    </div>`,
    )
    .join('\n');
}

function faqItems(items) {
  return items
    .map(
      ([question, answer], index) => `                    <details class="svc-faq__item"${index === 0 ? ' open' : ''}>
                        <summary class="svc-faq__question"><span>${escapeHtml(question)}</span><svg
                                class="svc-faq__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9" />
                            </svg></summary>
                        <div class="svc-faq__answer">
                            <p>${escapeHtml(answer)}</p>
                        </div>
                    </details>`,
    )
    .join('\n');
}

const DEFAULT_CATEGORY = {
  label: 'Appliance Services',
  url: '/services/appliance-services/',
  dataCategory: 'appliances',
  heroImage: '/assets/services/service-appliance.webp',
};

function pageCategory(page) {
  return { ...DEFAULT_CATEGORY, ...(page.category || {}) };
}

function relatedLinks(page) {
  if (page.related) {
    return renderLinkGrid(page.related);
  }
  const repairPages = pages
    .filter((candidate) => candidate.slug !== page.slug && !candidate.category && !candidate.related)
    .slice(0, 3)
    .map((candidate) => ({
      label: candidate.crumb,
      url: `/services/appliance-services/${candidate.slug}/`,
    }));
  const links = [
    { label: 'Appliance Repair Help', url: '/services/appliance-services/appliance-repair/' },
    page.relatedInstall,
    ...repairPages,
  ].filter(Boolean);

  return renderLinkGrid(links);
}

function renderLinkGrid(links) {
  return links
    .map(
      (link) => `                    <a href="${link.url}" class="svc-related__link">
                        <span class="svc-related__link-text">${escapeHtml(link.label)}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </a>`,
    )
    .join('\n');
}

// Standard pricing FAQ appended to every page (featured-snippet target).
// Wording must stay in lockstep with the CRM KB pricing model.
function withPricingFaq(page) {
  const topic = page.crumb.toLowerCase();
  const alreadyCovered = page.faq.some(([q]) => /how much|cost|price/i.test(q));
  if (alreadyCovered) return page.faq;
  return [
    ...page.faq,
    [
      `How much does ${topic} cost in NYC?`,
      'Photo and text estimates are free — send the model number and photos and you get a real price range. An on-site assessment visit is $99, credited toward the job if you hire us. Actual work starts at the $150 work minimum and is quoted before anything begins; NYC sales tax is added separately where applicable.',
    ],
  ];
}

function pageHtml(page) {
  page = { ...page, faq: withPricingFaq(page) };
  const category = pageCategory(page);
  const heroImage = HERO_IMAGES[page.slug] || category.heroImage;
  const canonical = `${BASE_URL}${category.url}${page.slug}/`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services/` },
      { '@type': 'ListItem', position: 3, name: category.label, item: `${BASE_URL}${category.url}` },
      { '@type': 'ListItem', position: 4, name: page.crumb, item: canonical },
    ],
  };
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: page.serviceType,
    name: page.serviceName,
    description: page.serviceDescription,
    provider,
    areaServed,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: page.serviceName,
      itemListElement: page.offers.map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <script defer src="/analytics.js?v=20260707a"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${escapeHtml(page.ogTitle)}">
    <meta property="og:description" content="${escapeHtml(page.ogDescription)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${BASE_URL}/assets/images/og-image.png">
    <meta property="og:image:alt" content="Repair Asap LLC handyman services in New York City">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${BASE_URL}/assets/images/og-image.png">
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
    <noscript><link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"></noscript>
    <link rel="preload" as="image" type="image/webp" href="${heroImage}" fetchpriority="high">
    <link rel="stylesheet" href="/styles.css?v=${CSS_VERSION}">
</head>

<body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <div id="site-header"></div>
    <noscript>
        <div style="background:#0a0f1c;padding:16px 24px;text-align:center;border-bottom:1px solid #1e293b"><a href="/"
                style="color:#c19a4a;font-weight:700;font-size:18px;text-decoration:none">Repair Asap LLC</a><span
                style="color:#94a3b8;margin:0 12px">|</span><a href="tel:+17753107770"
                style="color:#e2e8f0;text-decoration:none">+1 (775) 310-7770</a></div>
    </noscript>

    <nav class="breadcrumbs" aria-label="Breadcrumb">
        <div class="container">
            <ol class="breadcrumbs__list">
                <li class="breadcrumbs__item"><a href="/" class="breadcrumbs__link">Home</a><svg
                        class="breadcrumbs__sep" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg></li>
                <li class="breadcrumbs__item"><a href="/services/" class="breadcrumbs__link">Services</a><svg
                        class="breadcrumbs__sep" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg></li>
                <li class="breadcrumbs__item"><a href="${category.url}"
                        class="breadcrumbs__link">${escapeHtml(category.label)}</a><svg class="breadcrumbs__sep" width="14"
                        height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg></li>
                <li class="breadcrumbs__item breadcrumbs__item--current" aria-current="page">${escapeHtml(page.crumb)}</li>
            </ol>
        </div>
    </nav>

    <script type="application/ld+json">${jsonLd(breadcrumb)}</script>
    <script type="application/ld+json">${jsonLd(service)}</script>
    <script type="application/ld+json">${jsonLd(faq)}</script>

    <main id="main-content">
        <section class="svc-hero" aria-label="Service overview">
            <div class="svc-hero__bg"><img src="${heroImage}"
                    alt="${escapeHtml(page.serviceName)}" class="svc-hero__img" loading="eager" fetchpriority="high"
                    width="640" height="640">
                <div class="svc-hero__overlay"></div>
            </div>
            <div class="container svc-hero__inner">
                <div class="svc-hero__badge">${escapeHtml(page.badge)}</div>
                <h1 class="svc-hero__title">${escapeHtml(page.h1)}<br><span class="text-accent">${escapeHtml(page.accent)}</span></h1>
                <p class="svc-hero__subtitle">${escapeHtml(page.subtitle)}</p>
                <div class="svc-hero__actions"><a href="/#contact" class="btn btn--accent btn--lg">${escapeHtml(page.ctaLabel || 'Request Repair Help')}</a><a href="tel:+17753107770" class="btn btn--outline btn--lg"><svg width="20" height="20"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.38 1.87.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.94.32 1.91.58 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>+1 (775) 310-7770</a></div>
                <div class="svc-hero__trust">
                    <div class="trust-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>4.9★ · 73 Verified Reviews</div>
                    <div class="trust-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>Insured Business</div>
                    <div class="trust-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>Free Photo Estimates</div>
                    <div class="trust-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>Same-Day When Available</div>
                </div>
            </div>
        </section>

        <section class="svc-seo-text">
            <div class="container">
                <div class="svc-seo-text__content">
                    ${page.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n                    ')}
                    <p class="svc-service-area-note">${escapeHtml(page.serviceAreaNote || 'We quote appliance repair help across Queens, Manhattan, Brooklyn, the Bronx, Staten Island, and Western Long Island or Nassau County when scope and travel fit. Based in Rego Park, we are often fastest in Forest Hills, Elmhurst, Middle Village, Corona and nearby Queens neighborhoods. Text the model number, photos, symptom, error code and building requirements for the fastest review.')}</p>
                </div>
            </div>
        </section>

${pricingPanelSection(page)}${calculatorSection(page.slug)}
        <section class="svc-features">
            <div class="container">
                <span class="section-tag">${escapeHtml(page.goodFitTag || 'Good Fit')}</span>
                <h2 class="section-title">${page.goodFitTitle || 'What We Can <span class="text-accent">Review</span>'}</h2>
                <div class="svc-features__grid">
${featureCards(page.goodFit, 'check')}
                </div>
            </div>
        </section>

        <section class="svc-features">
            <div class="container">
                <span class="section-tag">Scope Limits</span>
                <h2 class="section-title">What Gets <span class="text-accent">Flagged First</span></h2>
                <div class="svc-features__grid">
${featureCards(page.outOfScope, 'alert')}
                </div>
            </div>
        </section>

${gallerySection(page.slug, page)}
        <section class="svc-process">
            <div class="container">
                <span class="section-tag">Quote Prep</span>
                <h2 class="section-title">What to Send <span class="text-accent">Before Booking</span></h2>
                <div class="svc-process__steps">
${intakeList(page.intake)}
                </div>
            </div>
        </section>

        <section class="svc-process">
            <div class="container">
                <span class="section-tag">How It Works</span>
                <h2 class="section-title">Repair Scope, <span class="text-accent">Before the Visit</span></h2>
                <div class="svc-process__steps">
                    <div class="svc-process__step">
                        <div class="svc-process__number">01</div>
                        <h3>Send Photos and Model</h3>
                        <p>Share the appliance model, symptom, photos, error code, access notes and building rules.</p>
                    </div>
                    <div class="svc-process__step">
                        <div class="svc-process__number">02</div>
                        <h3>We Review Fit</h3>
                        <p>We confirm whether the request fits diagnostic, cleaning, adjustment, replacement or installation scope.</p>
                    </div>
                    <div class="svc-process__step">
                        <div class="svc-process__number">03</div>
                        <h3>Repair or Replace</h3>
                        <p>If repair help is practical, we quote the visit. If replacement is smarter, we quote compatible installation.</p>
                    </div>
                </div>
            </div>
        </section>

${reviewsSection(page.slug)}
        <section class="svc-faq" id="faq" aria-label="Frequently asked questions">
            <div class="container"><span class="section-tag">Common Questions</span>
                <h2 class="section-title">${escapeHtml(page.crumb)} FAQ</h2>
                <div class="svc-faq__accordion">
${faqItems(page.faq)}
                </div>
            </div>
        </section>

${page.extraSections || ''}        <section class="svc-related" aria-label="Related services">
            <div class="container">
                <h2 class="section-title">${escapeHtml(page.relatedTitle || 'Related Appliance Services')}</h2>
                <p class="section-subtitle">${escapeHtml(page.relatedSubtitle || 'Use the most specific page for the symptom, or request a photo review when the scope is unclear.')}</p>
                <div class="svc-related__grid">
${relatedLinks(page)}
                </div>
            </div>
        </section>

        <section class="svc-related svc-related--cross" aria-label="Other services you may need">
            <div class="container">
                <h2 class="section-title">You May Also <span class="text-accent">Need</span></h2>
                <p class="section-subtitle">${escapeHtml(page.crossSubtitle || 'Appliance symptoms often overlap with fixture, outlet, leak or wall access scope.')}</p>
                <div class="svc-related__grid">
${renderLinkGrid(page.crossLinks || [
    { label: 'Visible Leak Repair', url: '/services/plumbing/leak-repair/' },
    { label: 'Electrical Troubleshooting', url: '/services/electrical/electrical-troubleshooting/' },
    { label: 'COI Handyman', url: '/services/general-repairs/coi-handyman/' },
  ])}
                </div>
            </div>
        </section>
    </main>
    <div id="related-content" data-category="${escapeHtml(category.dataCategory)}"></div>
    <div id="site-footer"></div>
    <script src="/components/loader.js?v=${ASSET_VERSION}"></script>
    <script src="/main.js?v=${ASSET_VERSION}"></script>
</body>

</html>
`;
}

for (const page of pages) {
  const category = pageCategory(page);
  const dir = join(ROOT, ...category.url.split('/').filter(Boolean), page.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), pageHtml(page), 'utf8');
  console.log(`Generated ${category.url}${page.slug}/`);
}

// Re-bake static header/footer into the freshly generated pages
execSync(`node ${new URL('./bake-components.mjs', import.meta.url).pathname}`, { stdio: 'inherit' });
