/* ============================================
   Module: Instant Quote Calculator
   Usage: <div data-module="calculator" data-config="ikea"></div>
   ============================================ */

/* Version of the price table in this file. Bump it on any edit to a figure inside CONFIGS
   or VISIT_CONFIGS below. A lead records the version that was live when the customer saw
   the estimate, so a later price change never rewrites what was promised.
   The window-AC calculator in main.js has its own table and its own
   REPAIR_ASAP_CALC_PRICE_VERSION; both land in the same custom field, and
   calculator_config records which table produced the number. */
const CALC_PRICE_VERSION = 'calc-2026-09-01';

const CONFIGS = {
    ikea: {
        title: 'Get an Instant Estimate',
        subtitle: 'Select your IKEA furniture for an estimated price range.',
        categories: [
            {
                label: 'IKEA Series',
                id: 'series',
                options: [
                    { value: '', label: 'Choose a series…' },
                    { value: 'kallax', label: 'KALLAX (Shelving)' },
                    { value: 'pax', label: 'PAX (Wardrobe)' },
                    { value: 'malm', label: 'MALM (Dresser / Bed)' },
                    { value: 'hemnes', label: 'HEMNES (Dresser / Bed)' },
                    { value: 'besta', label: 'BESTÅ (TV / Storage)' },
                    { value: 'billy', label: 'BILLY (Bookcase)' },
                    { value: 'nordli', label: 'NORDLI (Dresser / Bed)' },
                    { value: 'other', label: 'Other IKEA Item' }
                ]
            },
            {
                label: 'Size / Complexity',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    kallax: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: '1×4 or 2×2 (small)' },
                        { value: 'md', label: '2×4 or 4×2 (medium)' },
                        { value: 'lg', label: '4×4 or 5×5 (large)' }
                    ],
                    pax: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Single frame (1 unit)' },
                        { value: 'md', label: 'Double frame (2 units)' },
                        { value: 'lg', label: 'Triple+ (3+ units)' }
                    ],
                    malm: [
                        { value: '', label: 'Choose item…' },
                        { value: 'sm', label: '2–3 drawer dresser' },
                        { value: 'md', label: '6 drawer dresser' },
                        { value: 'lg', label: 'Bed frame (Queen/King)' }
                    ],
                    hemnes: [
                        { value: '', label: 'Choose item…' },
                        { value: 'sm', label: '3 drawer chest' },
                        { value: 'md', label: '8 drawer dresser' },
                        { value: 'lg', label: 'Bed frame + nightstands' }
                    ],
                    besta: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Single TV unit' },
                        { value: 'md', label: 'TV unit + wall cabinets' },
                        { value: 'lg', label: 'Full wall system' }
                    ],
                    billy: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Single bookcase' },
                        { value: 'md', label: '2–3 bookcases' },
                        { value: 'lg', label: '4+ bookcases / wall-to-wall' }
                    ],
                    nordli: [
                        { value: '', label: 'Choose item…' },
                        { value: 'sm', label: 'Chest of drawers (small)' },
                        { value: 'md', label: 'Chest of drawers (large)' },
                        { value: 'lg', label: 'Bed frame + storage' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple (desk, nightstand)' },
                        { value: 'md', label: 'Medium (bookshelf, cabinet)' },
                        { value: 'lg', label: 'Complex (multi-part system)' }
                    ]
                }
            }
        ],
        pricing: {
            kallax: { sm: [150, 180], md: [180, 230], lg: [230, 295] },
            pax: { sm: [295, 355], md: [375, 480], lg: [480, 620] },
            malm: { sm: [185, 215], md: [200, 245], lg: [235, 300] },
            hemnes: { sm: [185, 220], md: [220, 270], lg: [280, 375] },
            besta: { sm: [150, 200], md: [215, 300], lg: [300, 430] },
            billy: { sm: [150, 185], md: [210, 260], lg: [275, 345] },
            nordli: { sm: [185, 225], md: [215, 265], lg: [265, 335] },
            other: { sm: [150, 195], md: [195, 260], lg: [260, 375] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard assembly. Final price confirmed after review.'
    },
    beds: {
        title: 'Bed Assembly Estimate',
        subtitle: 'Select your bed type for an estimated price range.',
        categories: [
            {
                label: 'Bed Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose bed type…' },
                    { value: 'platform', label: 'Platform Bed' },
                    { value: 'storage', label: 'Storage Bed (Drawers / Hydraulic)' },
                    { value: 'bunk', label: 'Bunk Bed' },
                    { value: 'loft', label: 'Loft Bed' },
                    { value: 'adjustable', label: 'Adjustable Base' },
                    { value: 'daybed', label: 'Daybed / Trundle' },
                    { value: 'other', label: 'Other Bed Frame' }
                ]
            },
            {
                label: 'Size',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    platform: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin / Full' },
                        { value: 'md', label: 'Queen' },
                        { value: 'lg', label: 'King / Cal King' }
                    ],
                    storage: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin / Full' },
                        { value: 'md', label: 'Queen' },
                        { value: 'lg', label: 'King / Cal King' }
                    ],
                    bunk: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Standard bunk' },
                        { value: 'md', label: 'Bunk with trundle' },
                        { value: 'lg', label: 'Triple bunk / L-shaped' }
                    ],
                    loft: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Basic loft frame' },
                        { value: 'md', label: 'Loft with desk' },
                        { value: 'lg', label: 'Loft with desk + shelves' }
                    ],
                    adjustable: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin XL / Full' },
                        { value: 'md', label: 'Queen' },
                        { value: 'lg', label: 'Split King (2 bases)' }
                    ],
                    daybed: [
                        { value: '', label: 'Choose type…' },
                        { value: 'sm', label: 'Daybed only' },
                        { value: 'md', label: 'Daybed + trundle' },
                        { value: 'lg', label: 'Daybed + trundle + storage' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple frame' },
                        { value: 'md', label: 'Frame + headboard' },
                        { value: 'lg', label: 'Complex / multi-part' }
                    ]
                }
            }
        ],
        pricing: {
            platform: { sm: [150, 185], md: [170, 210], lg: [185, 235] },
            storage: { sm: [195, 265], md: [245, 330], lg: [310, 420] },
            bunk: { sm: [265, 340], md: [320, 435], lg: [410, 560] },
            loft: { sm: [250, 320], md: [300, 400], lg: [365, 500] },
            adjustable: { sm: [195, 265], md: [230, 310], lg: [390, 530] },
            daybed: { sm: [150, 195], md: [185, 235], lg: [215, 285] },
            other: { sm: [150, 200], md: [185, 250], lg: [230, 350] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard assembly. Final price confirmed after review.'
    },
    wardrobes: {
        title: 'Wardrobe Assembly Estimate',
        subtitle: 'Select your wardrobe type for an estimated price range.',
        categories: [
            {
                label: 'Wardrobe Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose type…' },
                    { value: 'freestanding', label: 'Freestanding Wardrobe' },
                    { value: 'armoire', label: 'Armoire' },
                    { value: 'closet-system', label: 'Closet System (Multi-Unit)' },
                    { value: 'sliding-door', label: 'Sliding Door Wardrobe' },
                    { value: 'walk-in', label: 'Walk-In Closet Kit' },
                    { value: 'other', label: 'Other Wardrobe' }
                ]
            },
            {
                label: 'Size / Complexity',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    freestanding: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Single door / 2 doors' },
                        { value: 'md', label: '3 doors with drawers' },
                        { value: 'lg', label: '4+ doors / mirrored' }
                    ],
                    armoire: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Small / 2-door' },
                        { value: 'md', label: 'Standard with shelves' },
                        { value: 'lg', label: 'Large / multi-section' }
                    ],
                    'closet-system': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: '1–2 units' },
                        { value: 'md', label: '3–4 units' },
                        { value: 'lg', label: '5+ units / wall-to-wall' }
                    ],
                    'sliding-door': [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: '2-door (up to 150cm)' },
                        { value: 'md', label: '3-door (up to 250cm)' },
                        { value: 'lg', label: '4-door (250cm+)' }
                    ],
                    'walk-in': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Basic rods + shelves' },
                        { value: 'md', label: 'Full kit with drawers' },
                        { value: 'lg', label: 'Custom multi-section' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            freestanding: { sm: [195, 240], md: [240, 310], lg: [310, 410] },
            armoire: { sm: [195, 250], md: [250, 325], lg: [325, 435] },
            'closet-system': { sm: [195, 270], md: [300, 410], lg: [410, 565] },
            'sliding-door': { sm: [195, 265], md: [265, 370], lg: [370, 495] },
            'walk-in': { sm: [210, 295], md: [295, 425], lg: [425, 620] },
            other: { sm: [195, 260], md: [260, 355], lg: [355, 480] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard assembly. Final price confirmed after review.'
    },
    'wall-mounted': {
        title: 'Wall-Mounted Furniture Estimate',
        subtitle: 'Select your item type for an estimated price range.',
        categories: [
            {
                label: 'Item Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose item…' },
                    { value: 'floating-vanity', label: 'Floating Vanity' },
                    { value: 'wall-cabinet', label: 'Wall Cabinet' },
                    { value: 'floating-desk', label: 'Floating Desk' },
                    { value: 'wall-unit', label: 'Wall Entertainment Unit' },
                    { value: 'floating-shelf', label: 'Floating Shelves' },
                    { value: 'other', label: 'Other Wall-Mounted Item' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    'floating-vanity': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Single vanity' },
                        { value: 'md', label: 'Vanity + mirror cabinet' },
                        { value: 'lg', label: 'Double vanity setup' }
                    ],
                    'wall-cabinet': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: '1 cabinet' },
                        { value: 'md', label: '2–3 cabinets' },
                        { value: 'lg', label: '4+ cabinets' }
                    ],
                    'floating-desk': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Small desk' },
                        { value: 'md', label: 'Desk + shelf above' },
                        { value: 'lg', label: 'Large desk / L-shaped' }
                    ],
                    'wall-unit': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Single unit' },
                        { value: 'md', label: 'Unit + shelves' },
                        { value: 'lg', label: 'Full wall system' }
                    ],
                    'floating-shelf': [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1–2 shelves' },
                        { value: 'md', label: '3–5 shelves' },
                        { value: 'lg', label: '6+ shelves' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple / light item' },
                        { value: 'md', label: 'Medium / needs studs' },
                        { value: 'lg', label: 'Heavy / multi-point anchor' }
                    ]
                }
            }
        ],
        pricing: {
            'floating-vanity': { sm: [180, 235], md: [235, 315], lg: [315, 430] },
            'wall-cabinet': { sm: [180, 225], md: [245, 330], lg: [345, 465] },
            'floating-desk': { sm: [165, 210], md: [210, 280], lg: [280, 390] },
            'wall-unit': { sm: [180, 250], md: [265, 380], lg: [380, 530] },
            'floating-shelf': { sm: [165, 200], md: [215, 280], lg: [280, 375] },
            other: { sm: [180, 230], md: [230, 315], lg: [315, 440] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard assembly. Final price confirmed after review.'
    },
    tv: {
        title: 'TV Mounting Estimate',
        subtitle: 'Select your TV size and wall type for an estimated price range.',
        categories: [
            {
                label: 'TV Size',
                id: 'series',
                options: [
                    { value: '', label: 'Choose TV size…' },
                    { value: 'small', label: '32″ – 43″' },
                    { value: 'medium', label: '50″ – 55″' },
                    { value: 'large', label: '60″ – 75″' },
                    { value: 'xlarge', label: '77″ – 85″+' }
                ]
            },
            {
                label: 'Wall Type & Mount',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    small: [
                        { value: '', label: 'Choose setup…' },
                        { value: 'sm', label: 'Drywall — Fixed / Tilt Mount' },
                        { value: 'md', label: 'Drywall — Full-Motion Mount' },
                        { value: 'lg', label: 'Brick / Concrete — Any Mount' }
                    ],
                    medium: [
                        { value: '', label: 'Choose setup…' },
                        { value: 'sm', label: 'Drywall — Fixed / Tilt Mount' },
                        { value: 'md', label: 'Drywall — Full-Motion Mount' },
                        { value: 'lg', label: 'Brick / Concrete — Any Mount' }
                    ],
                    large: [
                        { value: '', label: 'Choose setup…' },
                        { value: 'sm', label: 'Drywall — Fixed / Tilt Mount' },
                        { value: 'md', label: 'Drywall — Full-Motion Mount' },
                        { value: 'lg', label: 'Brick / Concrete — Any Mount' }
                    ],
                    xlarge: [
                        { value: '', label: 'Choose setup…' },
                        { value: 'sm', label: 'Drywall — Fixed / Tilt Mount' },
                        { value: 'md', label: 'Drywall — Full-Motion Mount' },
                        { value: 'lg', label: 'Brick / Concrete — Any Mount' }
                    ]
                }
            }
        ],
        pricing: {
            small: { sm: [150, 210], md: [185, 250], lg: [230, 310] },
            medium: { sm: [150, 215], md: [200, 280], lg: [240, 345] },
            large: { sm: [170, 245], md: [210, 325], lg: [270, 405] },
            xlarge: { sm: [245, 350], md: [310, 430], lg: [375, 540] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include mount, cable concealment, and labor. Mount hardware not included unless specified.'
    },
    shelf: {
        title: 'Shelf Mounting Estimate',
        subtitle: 'Select your shelf type and quantity for an estimated price range.',
        categories: [
            {
                label: 'Shelf Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose shelf type…' },
                    { value: 'floating', label: 'Floating Shelf' },
                    { value: 'bracket', label: 'Bracket Shelf' },
                    { value: 'ledge', label: 'Picture Ledge / Decorative' },
                    { value: 'heavy', label: 'Heavy-Duty / Garage Shelf' },
                    { value: 'corner', label: 'Corner Shelf' },
                    { value: 'other', label: 'Other Shelf Type' }
                ]
            },
            {
                label: 'How Many?',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    floating: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 shelf' },
                        { value: 'md', label: '2–3 shelves' },
                        { value: 'lg', label: '4+ shelves' }
                    ],
                    bracket: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 shelf' },
                        { value: 'md', label: '2–3 shelves' },
                        { value: 'lg', label: '4+ shelves' }
                    ],
                    ledge: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 ledge' },
                        { value: 'md', label: '2–3 ledges' },
                        { value: 'lg', label: '4+ ledges' }
                    ],
                    heavy: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 shelf' },
                        { value: 'md', label: '2–3 shelves' },
                        { value: 'lg', label: '4+ shelves / full wall' }
                    ],
                    corner: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 corner shelf' },
                        { value: 'md', label: '2–3 corner shelves' },
                        { value: 'lg', label: '4+ corner shelves' }
                    ],
                    other: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 shelf' },
                        { value: 'md', label: '2–3 shelves' },
                        { value: 'lg', label: '4+ shelves' }
                    ]
                }
            }
        ],
        pricing: {
            floating: { sm: [150, 190], md: [205, 275], lg: [275, 385] },
            bracket: { sm: [150, 175], md: [200, 250], lg: [250, 340] },
            ledge: { sm: [150, 175], md: [190, 245], lg: [245, 330] },
            heavy: { sm: [150, 200], md: [220, 310], lg: [310, 450] },
            corner: { sm: [150, 190], md: [205, 265], lg: [265, 375] },
            other: { sm: [150, 200], md: [200, 270], lg: [270, 385] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard installation. Final price confirmed after reviewing your wall and shelves.'
    },
    'curtain-rod': {
        title: 'Curtain Rod Estimate',
        subtitle: 'Select your rod type and number of windows for an estimated price range.',
        categories: [
            {
                label: 'Rod Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose rod type…' },
                    { value: 'single', label: 'Single Rod' },
                    { value: 'double', label: 'Double Rod' },
                    { value: 'ceiling', label: 'Ceiling Track' },
                    { value: 'bay', label: 'Bay Window Rod' },
                    { value: 'tension', label: 'Tension Rod' },
                    { value: 'other', label: 'Other Rod Type' }
                ]
            },
            {
                label: 'How Many Windows?',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    single: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 window' },
                        { value: 'md', label: '2–3 windows' },
                        { value: 'lg', label: '4+ windows' }
                    ],
                    double: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 window' },
                        { value: 'md', label: '2–3 windows' },
                        { value: 'lg', label: '4+ windows' }
                    ],
                    ceiling: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 window' },
                        { value: 'md', label: '2–3 windows' },
                        { value: 'lg', label: '4+ windows / room divider' }
                    ],
                    bay: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: '3-sided bay' },
                        { value: 'md', label: '5-sided bay' },
                        { value: 'lg', label: 'Multiple bay windows' }
                    ],
                    tension: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 rod' },
                        { value: 'md', label: '2–3 rods' },
                        { value: 'lg', label: '4+ rods' }
                    ],
                    other: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 window' },
                        { value: 'md', label: '2–3 windows' },
                        { value: 'lg', label: '4+ windows' }
                    ]
                }
            }
        ],
        pricing: {
            single: { sm: [150, 175], md: [210, 275], lg: [275, 370] },
            double: { sm: [150, 185], md: [225, 305], lg: [305, 425] },
            ceiling: { sm: [150, 195], md: [235, 335], lg: [335, 465] },
            bay: { sm: [150, 195], md: [195, 265], lg: [295, 415] },
            tension: { sm: [150, 165], md: [180, 225], lg: [225, 290] },
            other: { sm: [150, 195], md: [210, 290], lg: [290, 405] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard installation. Final price confirmed after reviewing your windows and rods.'
    },
    mirror: {
        title: 'Mirror Mounting Estimate',
        subtitle: 'Select your mirror type and size for an estimated price range.',
        categories: [
            {
                label: 'Mirror Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose mirror type…' },
                    { value: 'vanity', label: 'Bathroom Vanity Mirror' },
                    { value: 'full-length', label: 'Full-Length Mirror' },
                    { value: 'decorative', label: 'Decorative / Accent Mirror' },
                    { value: 'oversized', label: 'Oversized / Heavy Mirror' },
                    { value: 'frameless', label: 'Frameless Mirror' },
                    { value: 'other', label: 'Other Mirror' }
                ]
            },
            {
                label: 'Size & Wall',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    vanity: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Small (up to 24″)' },
                        { value: 'md', label: 'Medium (24″–48″)' },
                        { value: 'lg', label: 'Large (48″+) or tile wall' }
                    ],
                    'full-length': [
                        { value: '', label: 'Choose mount…' },
                        { value: 'sm', label: 'Leaner (secured to wall)' },
                        { value: 'md', label: 'Wall-hung (drywall)' },
                        { value: 'lg', label: 'Wall-hung (brick / concrete)' }
                    ],
                    decorative: [
                        { value: '', label: 'Choose weight…' },
                        { value: 'sm', label: 'Light (under 15 lbs)' },
                        { value: 'md', label: 'Medium (15–40 lbs)' },
                        { value: 'lg', label: 'Heavy (40+ lbs)' }
                    ],
                    oversized: [
                        { value: '', label: 'Choose wall type…' },
                        { value: 'sm', label: 'Drywall (into studs)' },
                        { value: 'md', label: 'Plaster wall' },
                        { value: 'lg', label: 'Brick / concrete' }
                    ],
                    frameless: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Small (up to 24″)' },
                        { value: 'md', label: 'Medium (24″–48″)' },
                        { value: 'lg', label: 'Large (48″+)' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple / light' },
                        { value: 'md', label: 'Medium weight' },
                        { value: 'lg', label: 'Heavy / complex' }
                    ]
                }
            }
        ],
        pricing: {
            vanity: { sm: [150, 175], md: [175, 215], lg: [215, 280] },
            'full-length': { sm: [150, 185], md: [185, 230], lg: [230, 300] },
            decorative: { sm: [150, 175], md: [175, 220], lg: [220, 275] },
            oversized: { sm: [275, 375], md: [325, 440], lg: [390, 530] },
            frameless: { sm: [150, 185], md: [185, 235], lg: [235, 310] },
            other: { sm: [150, 195], md: [195, 260], lg: [260, 360] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard installation. Final price confirmed after reviewing your mirror and wall.'
    },
    projector: {
        title: 'Projector Mounting Estimate',
        subtitle: 'Select your mount type and ceiling for an estimated price range.',
        categories: [
            {
                label: 'Mount Location',
                id: 'series',
                options: [
                    { value: '', label: 'Choose mount type…' },
                    { value: 'ceiling', label: 'Ceiling Mount' },
                    { value: 'wall', label: 'Wall Mount' },
                    { value: 'shelf', label: 'Shelf / Table Bracket' },
                    { value: 'other', label: 'Other Setup' }
                ]
            },
            {
                label: 'Ceiling / Wall Type',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    ceiling: [
                        { value: '', label: 'Choose surface…' },
                        { value: 'sm', label: 'Drywall ceiling' },
                        { value: 'md', label: 'Drop ceiling (suspended)' },
                        { value: 'lg', label: 'Concrete ceiling' }
                    ],
                    wall: [
                        { value: '', label: 'Choose surface…' },
                        { value: 'sm', label: 'Drywall' },
                        { value: 'md', label: 'Plaster' },
                        { value: 'lg', label: 'Brick / concrete' }
                    ],
                    shelf: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Mount only' },
                        { value: 'md', label: 'Mount + cable routing' },
                        { value: 'lg', label: 'Mount + cable + alignment' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            ceiling: { sm: [165, 215], md: [205, 280], lg: [265, 355] },
            wall: { sm: [165, 215], md: [195, 260], lg: [240, 335] },
            shelf: { sm: [165, 200], md: [200, 240], lg: [225, 285] },
            other: { sm: [165, 225], md: [225, 300], lg: [300, 410] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include mount and cable routing. Projector and cables not included.'
    },
    'projector-screen': {
        title: 'Projector Screen Estimate',
        subtitle: 'Select your screen type and size for an estimated price range.',
        categories: [
            {
                label: 'Screen Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose screen type…' },
                    { value: 'fixed', label: 'Fixed-Frame Screen' },
                    { value: 'pulldown', label: 'Pull-Down (Manual)' },
                    { value: 'motorized', label: 'Motorized Electric' },
                    { value: 'tab-tension', label: 'Tab-Tensioned Screen' },
                    { value: 'other', label: 'Other Screen' }
                ]
            },
            {
                label: 'Screen Size',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    fixed: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Up to 100″' },
                        { value: 'md', label: '100″ – 120″' },
                        { value: 'lg', label: '120″+' }
                    ],
                    pulldown: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Up to 100″' },
                        { value: 'md', label: '100″ – 120″' },
                        { value: 'lg', label: '120″+' }
                    ],
                    motorized: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Up to 100″' },
                        { value: 'md', label: '100″ – 120″' },
                        { value: 'lg', label: '120″+' }
                    ],
                    'tab-tension': [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Up to 100″' },
                        { value: 'md', label: '100″ – 120″' },
                        { value: 'lg', label: '120″+' }
                    ],
                    other: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Small' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Large' }
                    ]
                }
            }
        ],
        pricing: {
            fixed: { sm: [195, 245], md: [245, 330], lg: [330, 430] },
            pulldown: { sm: [195, 240], md: [240, 295], lg: [295, 385] },
            motorized: { sm: [195, 260], md: [260, 360], lg: [360, 485] },
            'tab-tension': { sm: [195, 265], md: [265, 375], lg: [375, 520] },
            other: { sm: [195, 255], md: [255, 330], lg: [330, 465] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include mounting and alignment. Screen hardware not included unless specified.'
    },
    desk: {
        title: 'Desk Assembly Estimate',
        subtitle: 'Select your desk type and complexity for an estimated price range.',
        categories: [
            {
                label: 'Desk Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose desk type…' },
                    { value: 'simple', label: 'Simple Writing Desk' },
                    { value: 'lshaped', label: 'L-Shaped / Corner Desk' },
                    { value: 'standing', label: 'Standing / Adjustable Desk' },
                    { value: 'executive', label: 'Executive / Large Desk' },
                    { value: 'gaming', label: 'Gaming Desk' },
                    { value: 'other', label: 'Other Desk' }
                ]
            },
            {
                label: 'Complexity',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    simple: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Basic (no drawers)' },
                        { value: 'md', label: 'With drawers / hutch' },
                        { value: 'lg', label: 'With hutch + shelving' }
                    ],
                    lshaped: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Basic L-shape' },
                        { value: 'md', label: 'With drawers / filing' },
                        { value: 'lg', label: 'With hutch + storage' }
                    ],
                    standing: [
                        { value: '', label: 'Choose type…' },
                        { value: 'sm', label: 'Manual crank' },
                        { value: 'md', label: 'Electric — single motor' },
                        { value: 'lg', label: 'Electric — dual motor + accessories' }
                    ],
                    executive: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Standard' },
                        { value: 'md', label: 'With credenza' },
                        { value: 'lg', label: 'With credenza + hutch' }
                    ],
                    gaming: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Basic frame' },
                        { value: 'md', label: 'With monitor arm / cable mgmt' },
                        { value: 'lg', label: 'Full setup + accessories' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            simple: { sm: [150, 190], md: [190, 245], lg: [245, 335] },
            lshaped: { sm: [150, 205], md: [205, 290], lg: [290, 415] },
            standing: { sm: [150, 205], md: [205, 270], lg: [270, 385] },
            executive: { sm: [150, 210], md: [230, 340], lg: [340, 500] },
            gaming: { sm: [150, 200], md: [200, 285], lg: [285, 410] },
            other: { sm: [150, 210], md: [210, 290], lg: [290, 445] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard assembly. Final price confirmed after reviewing your desk.'
    },
    dresser: {
        title: 'Dresser Assembly Estimate',
        subtitle: 'Select your dresser type and size for an estimated price range.',
        categories: [
            {
                label: 'Dresser Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose dresser type…' },
                    { value: 'standard', label: 'Standard Dresser' },
                    { value: 'tall', label: 'Tall / Chest of Drawers' },
                    { value: 'wide', label: 'Wide / Double Dresser' },
                    { value: 'combo', label: 'Dresser + Mirror Combo' },
                    { value: 'nightstand', label: 'Nightstand / Side Table' },
                    { value: 'other', label: 'Other Storage' }
                ]
            },
            {
                label: 'Size / Drawers',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    standard: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: '3–4 drawers' },
                        { value: 'md', label: '5–6 drawers' },
                        { value: 'lg', label: '7+ drawers' }
                    ],
                    tall: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: '4–5 drawers' },
                        { value: 'md', label: '6–7 drawers' },
                        { value: 'lg', label: '8+ drawers' }
                    ],
                    wide: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: '6 drawers' },
                        { value: 'md', label: '8 drawers' },
                        { value: 'lg', label: '10+ drawers' }
                    ],
                    combo: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Dresser only' },
                        { value: 'md', label: 'Dresser + mirror mount' },
                        { value: 'lg', label: 'Dresser + mirror + wall anchor' }
                    ],
                    nightstand: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 nightstand' },
                        { value: 'md', label: '2 nightstands' },
                        { value: 'lg', label: '3+ nightstands' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            standard: { sm: [185, 230], md: [230, 285], lg: [285, 360] },
            tall: { sm: [185, 230], md: [230, 300], lg: [300, 385] },
            wide: { sm: [185, 245], md: [245, 320], lg: [320, 440] },
            combo: { sm: [185, 245], md: [245, 320], lg: [320, 415] },
            nightstand: { sm: [185, 210], md: [210, 270], lg: [255, 325] },
            other: { sm: [185, 245], md: [245, 335], lg: [335, 450] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates based on standard assembly. Wall anchoring included where required.'
    },
    'wall-bed': {
        title: 'Murphy Bed Estimate',
        subtitle: 'Select your Murphy bed type and size for an estimated price range.',
        categories: [
            {
                label: 'Murphy Bed Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose bed type…' },
                    { value: 'vertical', label: 'Vertical Murphy Bed' },
                    { value: 'horizontal', label: 'Horizontal Murphy Bed' },
                    { value: 'cabinet', label: 'Cabinet / Wall Bed System' },
                    { value: 'bookcase', label: 'Bookcase Murphy Bed' },
                    { value: 'desk-combo', label: 'Desk + Murphy Bed Combo' },
                    { value: 'other', label: 'Other Wall Bed' }
                ]
            },
            {
                label: 'Bed Size',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    vertical: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin / Twin XL' },
                        { value: 'md', label: 'Full / Queen' },
                        { value: 'lg', label: 'King / Cal King' }
                    ],
                    horizontal: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin / Twin XL' },
                        { value: 'md', label: 'Full' },
                        { value: 'lg', label: 'Queen' }
                    ],
                    cabinet: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin / Twin XL' },
                        { value: 'md', label: 'Full / Queen' },
                        { value: 'lg', label: 'Queen + side cabinets' }
                    ],
                    bookcase: [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin / Twin XL' },
                        { value: 'md', label: 'Full / Queen' },
                        { value: 'lg', label: 'Queen + shelving units' }
                    ],
                    'desk-combo': [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Twin + small desk' },
                        { value: 'md', label: 'Full + desk' },
                        { value: 'lg', label: 'Queen + full desk system' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Standard' },
                        { value: 'md', label: 'With storage' },
                        { value: 'lg', label: 'Full system' }
                    ]
                }
            }
        ],
        pricing: {
            vertical: { sm: [350, 490], md: [490, 705], lg: [705, 985] },
            horizontal: { sm: [350, 490], md: [490, 660], lg: [660, 905] },
            cabinet: { sm: [405, 575], md: [575, 830], lg: [830, 1225] },
            bookcase: { sm: [405, 575], md: [575, 830], lg: [830, 1150] },
            'desk-combo': { sm: [450, 615], md: [615, 905], lg: [905, 1300] },
            other: { sm: [350, 535], md: [535, 790], lg: [790, 1150] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include assembly, wall anchoring, and mechanism testing. Hardware and bed frame included in estimate.'
    },
    art: {
        title: 'Art Installation Estimate',
        subtitle: 'Select your art type and scope for an estimated price range.',
        categories: [
            {
                label: 'Art Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose art type…' },
                    { value: 'framed', label: 'Framed Art / Photo' },
                    { value: 'canvas', label: 'Canvas Print' },
                    { value: 'gallery-wall', label: 'Gallery Wall (multiple pieces)' },
                    { value: 'heavy', label: 'Heavy Frame (40+ lbs)' },
                    { value: 'mirror-decor', label: 'Decorative Mirror' },
                    { value: 'other', label: 'Other Art Piece' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    framed: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 piece' },
                        { value: 'md', label: '2–3 pieces' },
                        { value: 'lg', label: '4+ pieces' }
                    ],
                    canvas: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 canvas' },
                        { value: 'md', label: '2–3 canvases' },
                        { value: 'lg', label: '4+ canvases / multi-panel set' }
                    ],
                    'gallery-wall': [
                        { value: '', label: 'Choose pieces…' },
                        { value: 'sm', label: '3–5 pieces' },
                        { value: 'md', label: '6–10 pieces' },
                        { value: 'lg', label: '10+ pieces' }
                    ],
                    heavy: [
                        { value: '', label: 'Choose wall type…' },
                        { value: 'sm', label: 'Drywall (into studs)' },
                        { value: 'md', label: 'Plaster wall' },
                        { value: 'lg', label: 'Brick / concrete' }
                    ],
                    'mirror-decor': [
                        { value: '', label: 'Choose size…' },
                        { value: 'sm', label: 'Small (under 24″)' },
                        { value: 'md', label: 'Medium (24″–48″)' },
                        { value: 'lg', label: 'Large (48″+)' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple / light' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex / heavy' }
                    ]
                }
            }
        ],
        pricing: {
            framed: { sm: [150, 175], md: [185, 245], lg: [260, 375] },
            canvas: { sm: [150, 175], md: [185, 245], lg: [260, 355] },
            'gallery-wall': { sm: [150, 230], md: [230, 350], lg: [350, 530] },
            heavy: { sm: [150, 205], md: [205, 270], lg: [270, 395] },
            'mirror-decor': { sm: [150, 180], md: [180, 240], lg: [240, 320] },
            other: { sm: [150, 185], md: [185, 265], lg: [265, 395] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include wall assessment, leveling, and hardware. Art pieces not included.'
    },
    'wall-cabinet': {
        title: 'Wall Cabinet Installation Estimate',
        subtitle: 'Select your cabinet type and scope for an estimated price range.',
        categories: [
            {
                label: 'Cabinet Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose cabinet type…' },
                    { value: 'kitchen', label: 'Kitchen Upper Cabinet' },
                    { value: 'bathroom', label: 'Bathroom / Medicine Cabinet' },
                    { value: 'ikea', label: 'IKEA Wall Cabinet (METOD, EKET, BESTÅ)' },
                    { value: 'laundry', label: 'Laundry / Garage Cabinet' },
                    { value: 'floating', label: 'Floating Cabinet / Credenza' },
                    { value: 'other', label: 'Other Wall Cabinet' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    kitchen: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 cabinet' },
                        { value: 'md', label: '2–4 cabinets' },
                        { value: 'lg', label: '5+ cabinets (full run)' }
                    ],
                    bathroom: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Small medicine cabinet' },
                        { value: 'md', label: 'Large mirrored cabinet' },
                        { value: 'lg', label: 'Cabinet + additional storage' }
                    ],
                    ikea: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: '1 unit' },
                        { value: 'md', label: '2–3 units' },
                        { value: 'lg', label: '4+ units / full system' }
                    ],
                    laundry: [
                        { value: '', label: 'Choose quantity…' },
                        { value: 'sm', label: '1 cabinet' },
                        { value: 'md', label: '2–3 cabinets' },
                        { value: 'lg', label: '4+ cabinets' }
                    ],
                    floating: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Single unit' },
                        { value: 'md', label: 'Unit + shelves' },
                        { value: 'lg', label: 'Full wall system' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple / light' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex / heavy' }
                    ]
                }
            }
        ],
        pricing: {
            kitchen: { sm: [165, 215], md: [265, 385], lg: [425, 620] },
            bathroom: { sm: [165, 200], md: [200, 265], lg: [265, 360] },
            ikea: { sm: [165, 210], md: [230, 310], lg: [325, 445] },
            laundry: { sm: [165, 215], md: [250, 345], lg: [355, 505] },
            floating: { sm: [165, 210], md: [230, 310], lg: [325, 445] },
            other: { sm: [165, 215], md: [230, 315], lg: [325, 460] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include stud locating, leveling, and secure mounting. Cabinet hardware not included unless specified.'
    },
    dishwasher: {
        title: 'Dishwasher Installation Estimate',
        subtitle: 'Select your installation type for an estimated price range.',
        categories: [
            {
                label: 'Installation Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose install type…' },
                    { value: 'swap', label: 'Swap (replace existing)' },
                    { value: 'new', label: 'New Install (no existing hookup)' },
                    { value: 'builtin', label: 'Built-In / Panel-Ready' },
                    { value: 'other', label: 'Other Setup' }
                ]
            },
            {
                label: 'Add-Ons',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    swap: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap only' },
                        { value: 'md', label: 'Swap + old unit haul-away' },
                        { value: 'lg', label: 'Swap + new supply line + haul-away' }
                    ],
                    new: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Water + drain nearby' },
                        { value: 'md', label: 'New supply line + drain hookup' },
                        { value: 'lg', label: 'Full plumbing + electrical' }
                    ],
                    builtin: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard fit' },
                        { value: 'md', label: 'Custom panel installation' },
                        { value: 'lg', label: 'Custom + plumbing modifications' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            swap: { sm: [175, 230], md: [215, 280], lg: [250, 340] },
            new: { sm: [325, 450], md: [430, 590], lg: [520, 700] },
            builtin: { sm: [280, 380], md: [430, 590], lg: [650, 880] },
            other: { sm: [175, 250], md: [250, 380], lg: [380, 540] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include hookup, leveling, and leak test. Appliance not included.'
    },
    dryer: {
        title: 'Dryer Installation Estimate',
        subtitle: 'Select your dryer type and setup for an estimated price range.',
        categories: [
            {
                label: 'Dryer Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose dryer type…' },
                    { value: 'electric', label: 'Electric Dryer' },
                    { value: 'gas', label: 'Gas Dryer' },
                    { value: 'ventless', label: 'Ventless / Heat Pump Dryer' },
                    { value: 'stackable', label: 'Stackable Dryer' },
                    { value: 'other', label: 'Other Dryer' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    electric: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap (outlet exists)' },
                        { value: 'md', label: 'Swap + venting' },
                        { value: 'lg', label: 'New outlet + venting + haul-away' }
                    ],
                    gas: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap (gas line exists)' },
                        { value: 'md', label: 'Swap + flex connector + venting' },
                        { value: 'lg', label: 'New gas line + venting' }
                    ],
                    ventless: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + drain hookup' },
                        { value: 'lg', label: 'New install + drain + electrical' }
                    ],
                    stackable: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Stack on existing washer' },
                        { value: 'md', label: 'Stack + venting' },
                        { value: 'lg', label: 'Stack + venting + electrical' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            electric: { sm: [165, 210], md: [210, 265], lg: [275, 355] },
            gas: { sm: [125, 180], md: [180, 260], lg: [290, 410] },
            ventless: { sm: [165, 215], md: [215, 285], lg: [285, 380] },
            stackable: { sm: [165, 215], md: [215, 280], lg: [280, 370] },
            other: { sm: [165, 220], md: [220, 300], lg: [300, 420] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include hookup, venting, and testing. Appliance and parts not included.'
    },
    microwave: {
        title: 'Microwave Installation Estimate',
        subtitle: 'Select your microwave type for an estimated price range.',
        categories: [
            {
                label: 'Microwave Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose type…' },
                    { value: 'otr', label: 'Over-the-Range (OTR)' },
                    { value: 'builtin', label: 'Built-In / Wall Oven Combo' },
                    { value: 'undermount', label: 'Under-Cabinet Mount' },
                    { value: 'drawer', label: 'Microwave Drawer' },
                    { value: 'other', label: 'Other Microwave' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    otr: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Swap existing OTR' },
                        { value: 'md', label: 'New OTR (template + mounting)' },
                        { value: 'lg', label: 'New OTR + venting + electrical' }
                    ],
                    builtin: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Swap existing unit' },
                        { value: 'md', label: 'New install (trim kit)' },
                        { value: 'lg', label: 'New install + electrical' }
                    ],
                    undermount: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Mount only' },
                        { value: 'md', label: 'Mount + bracket fabrication' },
                        { value: 'lg', label: 'Mount + electrical + venting' }
                    ],
                    drawer: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Swap existing drawer' },
                        { value: 'md', label: 'New cutout + install' },
                        { value: 'lg', label: 'New cutout + electrical + trim' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            otr: { sm: [195, 250], md: [250, 345], lg: [345, 480] },
            builtin: { sm: [195, 255], md: [255, 355], lg: [355, 500] },
            undermount: { sm: [195, 245], md: [245, 325], lg: [325, 455] },
            drawer: { sm: [195, 255], md: [255, 375], lg: [375, 530] },
            other: { sm: [195, 270], md: [270, 385], lg: [385, 530] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include mounting, venting, and electrical check. Microwave not included.'
    },
    range: {
        title: 'Range & Oven Installation Estimate',
        subtitle: 'Select your range type and setup for an estimated price range.',
        categories: [
            {
                label: 'Range Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose range type…' },
                    /* 'Slide-In Range (Gas or Electric)' used to sit on the electric row, so a
                       customer with a GAS slide-in was quoted an electric price for work that
                       needs a Licensed Master Plumber under Local Law 429 (2025). Gas belongs on
                       the frozen gas row — the one the catalog holds at status "frozen" and this
                       repricing does not touch — so the two options now say which fuel they are
                       for, and the gas option covers both body styles. */
                    { value: 'gas-freestanding', label: 'Gas Range — Freestanding or Slide-In' },
                    { value: 'electric-freestanding', label: 'Electric Freestanding Range' },
                    { value: 'slide-in', label: 'Slide-In Range (Electric)' },
                    { value: 'wall-oven', label: 'Wall Oven' },
                    { value: 'cooktop', label: 'Cooktop Only' },
                    { value: 'other', label: 'Other Range / Oven' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    'gas-freestanding': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + flex connector + anti-tip' },
                        { value: 'lg', label: 'New gas line + electrical + haul-away' }
                    ],
                    'electric-freestanding': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + anti-tip bracket' },
                        { value: 'lg', label: 'New outlet + anti-tip + haul-away' }
                    ],
                    'slide-in': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + trim / gap fill' },
                        { value: 'lg', label: 'New hookup + countertop adjustment' }
                    ],
                    'wall-oven': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Single oven swap' },
                        { value: 'md', label: 'Double oven swap' },
                        { value: 'lg', label: 'New cutout + electrical' }
                    ],
                    cooktop: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Electric cooktop swap' },
                        { value: 'md', label: 'Gas cooktop swap + leak test' },
                        { value: 'lg', label: 'New cutout + gas or electric' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            'gas-freestanding': { sm: [125, 180], md: [180, 260], lg: [290, 410] },
            'electric-freestanding': { sm: [205, 265], md: [265, 340], lg: [360, 480] },
            'slide-in': { sm: [205, 270], md: [270, 385], lg: [385, 540] },
            'wall-oven': { sm: [175, 250], md: [250, 365], lg: [385, 575] },
            cooktop: { sm: [110, 165], md: [165, 250], lg: [260, 395] },
            other: { sm: [205, 300], md: [300, 430], lg: [430, 620] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include hookup, anti-tip installation, and testing. Appliance not included.'
    },
    refrigerator: {
        title: 'Refrigerator Installation Estimate',
        subtitle: 'Select your fridge type and setup for an estimated price range.',
        categories: [
            {
                label: 'Refrigerator Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose fridge type…' },
                    { value: 'freestanding', label: 'Freestanding (Top / Bottom Freezer)' },
                    { value: 'french-door', label: 'French Door' },
                    { value: 'side-by-side', label: 'Side-by-Side' },
                    { value: 'counter-depth', label: 'Counter-Depth / Built-In' },
                    { value: 'mini', label: 'Mini / Wine Cooler' },
                    { value: 'other', label: 'Other Refrigerator' }
                ]
            },
            {
                label: 'Add-Ons',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    freestanding: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Delivery + leveling' },
                        { value: 'md', label: 'Leveling + water line' },
                        { value: 'lg', label: 'Water line + door reversal + haul-away' }
                    ],
                    'french-door': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Delivery + leveling' },
                        { value: 'md', label: 'Leveling + water line' },
                        { value: 'lg', label: 'Water line + door removal / hinge swap' }
                    ],
                    'side-by-side': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Delivery + leveling' },
                        { value: 'md', label: 'Leveling + water line' },
                        { value: 'lg', label: 'Water line + old unit haul-away' }
                    ],
                    'counter-depth': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard fit + leveling' },
                        { value: 'md', label: 'Fit + water line + trim' },
                        { value: 'lg', label: 'Custom fit + plumbing + haul-away' }
                    ],
                    mini: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Placement only' },
                        { value: 'md', label: 'Under-counter fit + leveling' },
                        { value: 'lg', label: 'Built-in fit + trim + drain' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            freestanding: { sm: [150, 210], md: [210, 305], lg: [325, 465] },
            'french-door': { sm: [150, 215], md: [215, 305], lg: [325, 475] },
            'side-by-side': { sm: [150, 215], md: [215, 305], lg: [305, 445] },
            'counter-depth': { sm: [150, 220], md: [220, 360], lg: [375, 560] },
            mini: { sm: [150, 195], md: [195, 255], lg: [255, 375] },
            other: { sm: [150, 235], md: [235, 375], lg: [375, 560] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include leveling, water line, and testing. Appliance not included.'
    },
    'washer-dryer': {
        title: 'Washer & Dryer Combo Estimate',
        subtitle: 'Select your combo type and setup for an estimated price range.',
        categories: [
            {
                label: 'Combo Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose combo type…' },
                    { value: 'stacked', label: 'Stacked Washer + Dryer' },
                    { value: 'sidebyside', label: 'Side-by-Side Washer + Dryer' },
                    { value: 'allinone', label: 'All-in-One Combo Unit' },
                    { value: 'laundry-center', label: 'Laundry Center' },
                    { value: 'other', label: 'Other Setup' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    stacked: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap (hookups exist)' },
                        { value: 'md', label: 'Swap + stacking kit + venting' },
                        { value: 'lg', label: 'New hookups + venting + haul-away' }
                    ],
                    sidebyside: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap (hookups exist)' },
                        { value: 'md', label: 'Swap + hoses + venting' },
                        { value: 'lg', label: 'New hookups + venting + haul-away' }
                    ],
                    allinone: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + drain hookup' },
                        { value: 'lg', label: 'New install + plumbing + electrical' }
                    ],
                    'laundry-center': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + hoses + venting' },
                        { value: 'lg', label: 'New install + full hookup' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            stacked: { sm: [235, 330], md: [330, 430], lg: [460, 620] },
            sidebyside: { sm: [235, 330], md: [330, 430], lg: [460, 620] },
            allinone: { sm: [235, 295], md: [295, 385], lg: [415, 540] },
            'laundry-center': { sm: [215, 290], md: [290, 395], lg: [415, 565] },
            other: { sm: [215, 310], md: [310, 430], lg: [430, 620] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include hookup, venting, and testing for both units. Appliances not included.'
    },
    washer: {
        title: 'Washer Installation Estimate',
        subtitle: 'Select your washer type and setup for an estimated price range.',
        categories: [
            {
                label: 'Washer Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose washer type…' },
                    { value: 'topload', label: 'Top-Load Washer' },
                    { value: 'frontload', label: 'Front-Load Washer' },
                    { value: 'stackable', label: 'Stackable Washer' },
                    { value: 'portable', label: 'Portable / Compact Washer' },
                    { value: 'other', label: 'Other Washer' }
                ]
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    topload: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap (hookups exist)' },
                        { value: 'md', label: 'Swap + new hoses + leveling' },
                        { value: 'lg', label: 'New hookups + drain + haul-away' }
                    ],
                    frontload: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap (hookups exist)' },
                        { value: 'md', label: 'Swap + pedestal install + hoses' },
                        { value: 'lg', label: 'New hookups + drain + haul-away' }
                    ],
                    stackable: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Standard swap' },
                        { value: 'md', label: 'Swap + new hoses + leveling' },
                        { value: 'lg', label: 'New hookups + drain' }
                    ],
                    portable: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Sink adapter hookup' },
                        { value: 'md', label: 'Dedicated faucet adapter' },
                        { value: 'lg', label: 'Permanent drain connection' }
                    ],
                    other: [
                        { value: '', label: 'Choose complexity…' },
                        { value: 'sm', label: 'Simple' },
                        { value: 'md', label: 'Medium' },
                        { value: 'lg', label: 'Complex' }
                    ]
                }
            }
        ],
        pricing: {
            topload: { sm: [165, 220], md: [220, 295], lg: [315, 430] },
            frontload: { sm: [165, 225], md: [225, 325], lg: [325, 455] },
            stackable: { sm: [165, 225], md: [225, 300], lg: [325, 435] },
            portable: { sm: [165, 205], md: [205, 255], lg: [255, 335] },
            other: { sm: [165, 240], md: [240, 335], lg: [335, 480] }
        },
        cta: { text: 'Get Exact Quote', href: '/#contact' },
        disclaimer: 'Estimates include hookup, leveling, and leak test. Appliance and hoses not included.'
    },
    decorative_plaster: {
        title: 'Decorative Plaster Budget Planner',
        subtitle: 'Choose a finish direction and room type for a rough planning range. Final pricing is confirmed after photos, surface review, access, and material selection.',
        categories: [
            {
                label: 'Finish Direction',
                id: 'series',
                options: [
                    { value: '', label: 'Choose finish direction…' },
                    { value: 'lime-plaster', label: 'Lime plaster / mineral texture' },
                    { value: 'lime-paint', label: 'Lime paint / soft mineral wash' },
                    { value: 'venetian', label: 'Marmorino / Venetian-style plaster' },
                    { value: 'tadelakt', label: 'Tadelakt-style bathroom finish' },
                    { value: 'carrera', label: 'Carrera-style marble plaster' }
                ]
            },
            {
                label: 'Room / Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    'lime-plaster': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Small accent wall' },
                        { value: 'md', label: 'Feature wall / fireplace wall' },
                        { value: 'lg', label: 'Room-scale wall finish' }
                    ],
                    'lime-paint': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Small room or entry' },
                        { value: 'md', label: 'Bedroom / office walls' },
                        { value: 'lg', label: 'Living room or multi-room' }
                    ],
                    venetian: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Accent panel / niche' },
                        { value: 'md', label: 'Feature wall' },
                        { value: 'lg', label: 'Large feature area' }
                    ],
                    tadelakt: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Powder room wall / vanity area' },
                        { value: 'md', label: 'Bathroom walls' },
                        { value: 'lg', label: 'Shower or wet-area review' }
                    ],
                    carrera: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Small statement wall' },
                        { value: 'md', label: 'Powder room / fireplace wall' },
                        { value: 'lg', label: 'Large custom feature wall' }
                    ]
                }
            }
        ],
        pricing: {
            'lime-plaster': { sm: [1200, 2200], md: [2200, 3800], lg: [4200, 7800] },
            'lime-paint': { sm: [850, 1600], md: [1600, 2900], lg: [3000, 5600] },
            venetian: { sm: [1500, 2800], md: [2800, 5200], lg: [5600, 9800] },
            tadelakt: { sm: [2400, 4200], md: [4200, 7500], lg: [6500, 12000] },
            carrera: { sm: [1800, 3400], md: [3400, 6500], lg: [7000, 12500] }
        },
        cta: { text: 'Request Finish Consultation', href: '/#contact' },
        disclaimer: 'Budget ranges are planning estimates only. Wet-area finishes require proper waterproofing behind the decorative surface and a custom review.',
        placeholder: 'Select finish and scope to see a planning range'
    }
};

/* ---- Visit-mode configs (repair / diagnostic pages) ----
   mode:'visit' pricing values are VISIT paths, not menu-priced work:
   [0,0] = free photo estimate, [99,99] = on-site assessment (credited),
   [150,N] = defined work like cleaning/tune-ups ($150 work minimum applies).
   The $150 floor is intentionally NOT applied in visit mode so the $99
   assessment (and the free photo option) can render truthfully. */

const VISIT_PATH_OPTIONS = (workLabel, workRange) => {
    // 'work' is a real job path: require BOTH label and range, and hold the
    // $150 work minimum here since visit mode bypasses the shared floor.
    const hasWork = Boolean(workLabel && workRange);
    const flooredWork = hasWork ? [Math.max(workRange[0], 150), Math.max(workRange[1], 150)] : null;
    return {
        options: [
            { value: '', label: 'How do you want to start?' },
            { value: 'photo', label: 'Text photos — free estimate' },
            { value: 'visit', label: 'Book on-site assessment ($99, credited)' },
            ...(hasWork ? [{ value: 'work', label: workLabel }] : []),
        ],
        pricing: { photo: [0, 0], visit: [99, 99], ...(hasWork ? { work: flooredWork } : {}) },
    };
};

function visitConfig({ title, subtitle, symptoms, workLabel, workRange, ctaText }) {
    const start = VISIT_PATH_OPTIONS(workLabel, workRange);
    const optionSets = {};
    const pricing = {};
    symptoms.forEach(([value, label]) => {
        optionSets[value] = start.options;
        pricing[value] = start.pricing;
    });
    return {
        mode: 'visit',
        title,
        subtitle,
        categories: [
            {
                label: "What's happening?",
                id: 'series',
                options: [{ value: '', label: 'Choose the symptom…' }, ...symptoms.map(([value, label]) => ({ value, label }))],
            },
            { label: 'Your first step', id: 'size', dependsOn: 'series', optionSets },
        ],
        pricing,
        priceLabel: 'Your Cost To Start',
        cta: { text: ctaText || 'Start My Repair Request', href: '/#contact' },
        disclaimer: 'Photo and text estimates are always free. The $99 on-site assessment is credited toward the job if you hire us — you never pay it twice.',
        floorNote: 'Actual repair or cleaning work starts at the $150 work minimum, quoted before anything begins.',
        placeholder: 'Pick a symptom to see how to start — free options included',
        resultNotes: {
            photo: 'Free — text photos and the model number, get a real answer fast.',
            visit: 'Credited toward the work if you proceed, so assessment costs $0 when we do the job.',
            work: 'Estimated range for the defined work — confirmed before booking. NYC sales tax separate.',
        },
    };
}

const VISIT_CONFIGS = {
    'refrigerator-repair': visitConfig({
        title: 'What Will My Refrigerator Visit Cost?',
        subtitle: 'Pick the symptom and see your options — starting with a free photo estimate.',
        symptoms: [
            ['not-cooling', 'Not cooling / not cold enough'],
            ['ice-frost', 'Ice buildup or frost'],
            ['leaking', 'Leaking water'],
            ['noisy', 'Noisy or vibrating'],
            ['dirty-coils', 'Never had coils cleaned'],
            ['replace', 'Thinking about replacing it'],
        ],
        workLabel: 'Condenser coil deep clean ($175–$260)',
        workRange: [175, 260],
    }),
    'dishwasher-repair': visitConfig({
        title: 'What Will My Dishwasher Visit Cost?',
        subtitle: 'Pick the symptom and see your options — starting with a free photo estimate.',
        symptoms: [
            ['leaking', 'Leaking'],
            ['not-draining', 'Not draining / standing water'],
            ['odor', 'Odor or residue on dishes'],
            ['loose', 'Loose, tilted or rocking'],
            ['hookup', 'Hookup or high-loop concern'],
            ['replace', 'Thinking about replacing it'],
        ],
        workLabel: 'Filter + drain-path service ($175–$260)',
        workRange: [175, 260],
    }),
    'washer-repair': visitConfig({
        title: 'What Will My Washer Visit Cost?',
        subtitle: 'Pick the symptom and see your options — starting with a free photo estimate.',
        symptoms: [
            ['not-draining', 'Not draining'],
            ['shaking', 'Shaking or walking'],
            ['leaking', 'Leaking'],
            ['hoses', 'Old / suspect supply hoses'],
            ['stacking', 'Stacking or leveling issue'],
            ['replace', 'Thinking about replacing it'],
        ],
        workLabel: 'Leveling + hose refresh ($175–$280)',
        workRange: [175, 280],
    }),
    'dryer-repair': visitConfig({
        title: 'What Will My Dryer Visit Cost?',
        subtitle: 'Pick the symptom and see your options — starting with a free photo estimate.',
        symptoms: [
            ['not-heating', 'Not heating / clothes stay damp'],
            ['long-dry', 'Takes forever to dry'],
            ['vent', 'Lint or vent concern'],
            ['noisy', 'Noisy or vibrating'],
            ['connection', 'Cord / plug / gas-ready question'],
            ['replace', 'Thinking about replacing it'],
        ],
        workLabel: 'Vent cleaning + reconnect ($175–$360)',
        workRange: [175, 360],
    }),
    'oven-range-repair': visitConfig({
        title: 'What Will My Oven or Range Visit Cost?',
        subtitle: 'Pick the symptom and see your options — starting with a free photo estimate.',
        symptoms: [
            ['burner', 'Burner not lighting / not heating'],
            ['door', 'Door, hinge or gasket issue'],
            ['knobs', 'Broken knobs or handles'],
            ['level', 'Not level / no anti-tip bracket'],
            ['hood', 'Range hood filter or light'],
            ['replace', 'Thinking about replacing it'],
        ],
        workLabel: 'Burner + door tune-up ($175–$280)',
        workRange: [175, 280],
    }),
    'ac-repair-help': visitConfig({
        title: 'What Will My AC Visit Cost?',
        subtitle: 'Window, through-wall, portable or PTAC — pick the symptom to see your options.',
        symptoms: [
            ['not-cooling', 'Not cooling like it used to'],
            ['leaking', 'Leaking or dripping water'],
            ['noisy', 'Noisy or rattling'],
            ['airflow', 'Weak airflow / dirty filter'],
            ['seal', 'Gaps or bad seal around the unit'],
            ['replace', 'Thinking about replacing it'],
        ],
        workLabel: 'Deep clean + re-seat ($175–$330)',
        workRange: [175, 330],
    }),
    'commercial-refrigeration': visitConfig({
        title: 'What Will a Commercial Triage Visit Cost?',
        subtitle: 'Walk-in, reach-in, prep table or beverage cooler — see how to start before paying specialist rates.',
        symptoms: [
            ['not-holding', 'Not holding temperature (41°F risk)'],
            ['gasket', 'Torn gasket / door not sealing'],
            ['coils', 'Dirty condenser coils'],
            ['drain', 'Drain line / water pooling'],
            ['door', 'Door hinge, latch or closer'],
            ['plan', 'Want a maintenance plan'],
        ],
        workLabel: 'Coil clean + gasket/door service ($195–$450)',
        workRange: [195, 450],
        ctaText: 'Request Commercial Triage',
    }),
    /* The appliance-repair page covers every machine, so a price grid would have
       to guess which one. The symptom-first path is the honest answer: a free
       photo estimate for most, the $99 credited visit when it needs eyes on it. */
    'appliance-repair': visitConfig({
        title: 'What Will My Appliance Visit Cost?',
        subtitle: 'Pick what the appliance is doing and see your options — most start free.',
        symptoms: [
            ['not-working', 'Not turning on or not running'],
            ['not-cooling-heating', 'Not cooling or not heating'],
            ['leaking', 'Leaking water'],
            ['noisy', 'Noisy, shaking or vibrating'],
            ['drain-vent', 'Not draining or not venting'],
            ['install-replace', 'Installing or replacing a unit'],
        ],
        workLabel: 'Cleaning, hookup or adjustment work ($175–$300)',
        workRange: [175, 300],
        ctaText: 'Start My Appliance Request',
    }),
};

Object.assign(CONFIGS, {
    'ac-window': {
            "title": "Window AC Installation Estimate",
            "subtitle": "Pick the unit size and what the window needs for an estimated range.",
            "categories": [
                    {
                            "label": "Unit Size",
                            "id": "series",
                            "options": [
                                    {
                                            "value": "",
                                            "label": "Choose unit size…"
                                    },
                                    {
                                            "value": "small",
                                            "label": "Small — 5,000–8,000 BTU (one person can lift it)"
                                    },
                                    {
                                            "value": "medium",
                                            "label": "Medium — 10,000–14,000 BTU"
                                    },
                                    {
                                            "value": "large",
                                            "label": "Large — 18,000 BTU or heavier"
                                    },
                                    {
                                            "value": "casement",
                                            "label": "Casement or sliding window (needs a panel kit)"
                                    }
                            ]
                    },
                    {
                            "label": "What The Window Needs",
                            "id": "size",
                            "dependsOn": "series",
                            "optionSets": {
                                    "small": [
                                            {
                                                    "value": "",
                                                    "label": "Choose what the window needs…"
                                            },
                                            {
                                                    "value": "drop",
                                                    "label": "Drop-in — existing bracket or sill, window opens normally"
                                            },
                                            {
                                                    "value": "seal",
                                                    "label": "Install + side panels, foam sealing and drainage tilt"
                                            },
                                            {
                                                    "value": "hard",
                                                    "label": "Bracket or rails to install, high floor or awkward access"
                                            }
                                    ],
                                    "medium": [
                                            {
                                                    "value": "",
                                                    "label": "Choose what the window needs…"
                                            },
                                            {
                                                    "value": "drop",
                                                    "label": "Drop-in — existing bracket or sill, window opens normally"
                                            },
                                            {
                                                    "value": "seal",
                                                    "label": "Install + side panels, foam sealing and drainage tilt"
                                            },
                                            {
                                                    "value": "hard",
                                                    "label": "Bracket or rails to install, high floor or awkward access"
                                            }
                                    ],
                                    "large": [
                                            {
                                                    "value": "",
                                                    "label": "Choose what the window needs…"
                                            },
                                            {
                                                    "value": "drop",
                                                    "label": "Drop-in — existing bracket or sill, window opens normally"
                                            },
                                            {
                                                    "value": "seal",
                                                    "label": "Install + side panels, foam sealing and drainage tilt"
                                            },
                                            {
                                                    "value": "hard",
                                                    "label": "Bracket or rails to install, high floor or awkward access"
                                            }
                                    ],
                                    "casement": [
                                            {
                                                    "value": "",
                                                    "label": "Choose what the window needs…"
                                            },
                                            {
                                                    "value": "drop",
                                                    "label": "Drop-in — existing bracket or sill, window opens normally"
                                            },
                                            {
                                                    "value": "seal",
                                                    "label": "Install + side panels, foam sealing and drainage tilt"
                                            },
                                            {
                                                    "value": "hard",
                                                    "label": "Bracket or rails to install, high floor or awkward access"
                                            }
                                    ]
                            }
                    }
            ],
            "pricing": {
                small: { drop: [150, 210], seal: [210, 305], hard: [290, 425] },
                medium: { drop: [170, 240], seal: [240, 355], hard: [340, 495] },
                large: { drop: [210, 300], seal: [300, 435], hard: [420, 610] },
                casement: { drop: [195, 275], seal: [275, 400], hard: [395, 570] }
            },
            "cta": {
                    "text": "Get My AC Install Quote",
                    "href": "/#contact"
            },
            "disclaimer": "Ranges cover labor only: carrying the unit in, seating it in the window, securing it, fitting the side panels and sealing the gaps, then testing that it cools and drains outward. The unit, a support bracket, a panel kit and any foam or weatherstripping are not included. We do not run new electrical circuits — an AC that needs its own circuit or a different outlet type goes to a licensed electrician first. Buildings that require a bracket, a permit or a specific install method are quoted after we see the building rules. Above the 6th floor with no elevator, or any unit needing two people, is quoted from photos.",
            "placeholder": "Select your unit size and window to see your estimate"
    },
});

Object.assign(CONFIGS, VISIT_CONFIGS, {
    'dryer-vent-cleaning': {
        title: 'Dryer Vent Cleaning Estimate',
        subtitle: 'Select your setup for an estimated price range.',
        categories: [
            {
                label: 'Dryer Setup',
                id: 'series',
                options: [
                    { value: '', label: 'Choose your setup…' },
                    { value: 'standard', label: 'Side-by-side, vent within reach' },
                    { value: 'stacked', label: 'Stacked unit in a closet' },
                    { value: 'long-run', label: 'Longer duct run (10ft+)' },
                    { value: 'multi', label: 'Multiple units (landlord / building)' },
                ],
            },
            {
                label: 'Scope',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    standard: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Cleaning + airflow check' },
                        { value: 'md', label: '+ transition hose replacement' },
                        { value: 'lg', label: '+ dryer pull-out & reconnect' },
                    ],
                    stacked: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Cleaning + airflow check' },
                        { value: 'md', label: '+ transition hose replacement' },
                        { value: 'lg', label: '+ unstack / restack service' },
                    ],
                    'long-run': [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: 'Accessible run cleaning' },
                        { value: 'md', label: '+ exterior cap check (reachable)' },
                        { value: 'lg', label: 'Full accessible path + hose' },
                    ],
                    multi: [
                        { value: '', label: 'Choose scope…' },
                        { value: 'sm', label: '2–3 units, one visit' },
                        { value: 'md', label: '4–6 units, one visit' },
                        { value: 'lg', label: 'Building program (recurring)' },
                    ],
                },
            },
        ],
        pricing: {
            standard: { sm: [175, 235], md: [210, 300], lg: [255, 380] },
            stacked: { sm: [195, 280], md: [235, 340], lg: [315, 460] },
            'long-run': { sm: [210, 315], md: [235, 355], lg: [300, 445] },
            multi: { sm: [480, 620], md: [675, 895], lg: [895, 1200] }
        },
        cta: { text: 'Book My Vent Cleaning', href: '/#contact' },
        disclaimer: 'Estimates cover accessible duct runs. In-wall or riser ductwork is flagged and routed separately. Final price confirmed after photos.',
    },
    'ice-machine-cleaning': {
        title: 'Ice Machine Cleaning Estimate',
        subtitle: 'Select your machine for an estimated cleaning price.',
        categories: [
            {
                label: 'Machine Type',
                id: 'series',
                options: [
                    { value: '', label: 'Choose machine type…' },
                    { value: 'undercounter', label: 'Undercounter / bar unit' },
                    { value: 'modular', label: 'Modular head + bin' },
                    { value: 'countertop', label: 'Countertop / office unit' },
                    { value: 'multiple', label: 'Multiple machines' },
                ],
            },
            {
                label: 'Service',
                id: 'size',
                dependsOn: 'series',
                optionSets: {
                    undercounter: [
                        { value: '', label: 'Choose service…' },
                        { value: 'sm', label: 'Manufacturer-cycle clean + sanitize' },
                        { value: 'md', label: '+ water filter replacement' },
                        { value: 'lg', label: '+ quarterly plan setup' },
                    ],
                    modular: [
                        { value: '', label: 'Choose service…' },
                        { value: 'sm', label: 'Manufacturer-cycle clean + sanitize' },
                        { value: 'md', label: '+ water filter replacement' },
                        { value: 'lg', label: '+ quarterly plan setup' },
                    ],
                    countertop: [
                        { value: '', label: 'Choose service…' },
                        { value: 'sm', label: 'Manufacturer-cycle clean + sanitize' },
                        { value: 'md', label: '+ water filter replacement' },
                        { value: 'lg', label: '+ quarterly plan setup' },
                    ],
                    multiple: [
                        { value: '', label: 'Choose service…' },
                        { value: 'sm', label: '2 machines, one visit' },
                        { value: 'md', label: '3–4 machines, one visit' },
                        { value: 'lg', label: 'Recurring program' },
                    ],
                },
            },
        ],
        pricing: {
            undercounter: { sm: [245, 305], md: [275, 340], lg: [305, 375] },
            modular: { sm: [275, 350], md: [305, 385], lg: [340, 420] },
            countertop: { sm: [225, 275], md: [250, 305], lg: [285, 350] },
            multiple: { sm: [480, 620], md: [595, 770], lg: [710, 950] }
        },
        cta: { text: 'Book My Machine Cleaning', href: '/#contact' },
        disclaimer: 'Cleaning follows the manufacturer’s documented procedure. Refrigerant or sealed-system faults found during cleaning are flagged and routed to a specialist. Final price confirmed after photos.',
    },
});

// ---- Category configs authored 2026-07-26 (AC, electrical, flooring,
// general repairs, painting, plumbing). Every range respects the $150 work
// minimum; [99, 99] marks the on-site assessment path used where a symptom
// is diagnosed but the repair itself routes to a licensed trade.
Object.assign(CONFIGS, {
    "interior-painting": {
        "title": "What Will Painting This Room Cost?",
        "subtitle": "Pick the space and how much of it we're painting for an estimated labor range.",
        "categories": [
            {
                "label": "What are we painting?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the space…"
                    },
                    {
                        "value": "bedroom",
                        "label": "Bedroom / small room (up to ~120 sq ft floor)"
                    },
                    {
                        "value": "living",
                        "label": "Living room / large room (150–250 sq ft floor)"
                    },
                    {
                        "value": "hallway",
                        "label": "Hallway, entry or staircase"
                    },
                    {
                        "value": "apartment",
                        "label": "Whole apartment (multiple rooms)"
                    },
                    {
                        "value": "ceiling",
                        "label": "Ceilings only"
                    },
                    {
                        "value": "touchup",
                        "label": "Touch-ups / one wall repainted"
                    }
                ]
            },
            {
                "label": "Scope & wall condition",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "bedroom": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Walls only — sound walls, similar color"
                        },
                        {
                            "value": "md",
                            "label": "Walls + ceiling — minor patching, 2 coats"
                        },
                        {
                            "value": "lg",
                            "label": "Walls + ceiling + trim — heavy patching or color change"
                        }
                    ],
                    "living": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Walls only — sound walls, similar color"
                        },
                        {
                            "value": "md",
                            "label": "Walls + ceiling — minor patching, 2 coats"
                        },
                        {
                            "value": "lg",
                            "label": "Walls + ceiling + trim — heavy patching or color change"
                        }
                    ],
                    "hallway": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Hallway walls only (standard 8–9 ft ceiling)"
                        },
                        {
                            "value": "md",
                            "label": "Walls + ceiling — minor patching"
                        },
                        {
                            "value": "lg",
                            "label": "Staircase or 10 ft+ ceiling — ladder / scaffold work"
                        }
                    ],
                    "apartment": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Studio / 1BR — walls only"
                        },
                        {
                            "value": "md",
                            "label": "1BR — walls + ceilings"
                        },
                        {
                            "value": "lg",
                            "label": "2BR — walls + ceilings + baseboards + doors"
                        },
                        {
                            "value": "xl",
                            "label": "3BR+ — full scope (walls, ceilings, trim and doors)"
                        }
                    ],
                    "ceiling": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One room ceiling — flat, no stains"
                        },
                        {
                            "value": "md",
                            "label": "2–3 room ceilings"
                        },
                        {
                            "value": "lg",
                            "label": "Ceilings + stain blocking (old water marks)"
                        }
                    ],
                    "touchup": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall, matching the existing color"
                        },
                        {
                            "value": "md",
                            "label": "One wall + patching (holes, anchors, dings)"
                        },
                        {
                            "value": "lg",
                            "label": "Several patch areas across rooms"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            bedroom: { sm: [450, 645], md: [595, 850], lg: [805, 1150] },
            living: { sm: [525, 785], md: [730, 1090], lg: [1015, 1500] },
            hallway: { sm: [325, 525], md: [475, 750], lg: [750, 1250] },
            apartment: { sm: [1600, 2600], md: [2600, 4200], lg: [4300, 7500], xl: [6500, 11000] },
            ceiling: { sm: [225, 375], md: [450, 750], lg: [600, 975] },
            touchup: { sm: [225, 345], md: [300, 430], lg: [410, 600] }
        },
        "cta": {
            "text": "Get My Painting Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only: furniture moved and covered, floors protected, holes patched and sanded, spot primer, two coats, and cleanup. Paint and materials are not included — use paint you supply, or we pick it up and bill it at cost. Wallpapered walls and blown or cracked plaster get flagged and quoted separately instead of painted over. Mold or an active leak we do not paint over and do not take on — we flag it and route you to a licensed mold remediation contractor or a NYC Licensed Master Plumber first, and we come back once the wall is dry and sound. In pre-1978 buildings we stop and flag suspected lead paint before sanding. Final price confirmed after photos or a walkthrough."
    },
    "accent-wall": {
        "title": "What Will My Accent Wall Cost?",
        "subtitle": "Pick the look and the wall size for an estimated labor range.",
        "categories": [
            {
                "label": "Accent wall style",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the look…"
                    },
                    {
                        "value": "solid",
                        "label": "Solid color feature wall"
                    },
                    {
                        "value": "two-tone",
                        "label": "Two-tone / color block"
                    },
                    {
                        "value": "stripes",
                        "label": "Stripes or chevron"
                    },
                    {
                        "value": "geometric",
                        "label": "Custom geometric pattern"
                    },
                    {
                        "value": "dark",
                        "label": "Deep or bold color over a light wall"
                    },
                    {
                        "value": "multiple",
                        "label": "Multiple accent walls"
                    }
                ]
            },
            {
                "label": "Wall size & condition",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "solid": [
                        {
                            "value": "",
                            "label": "Choose wall size…"
                        },
                        {
                            "value": "sm",
                            "label": "Standard wall (up to ~12 ft wide, 8–9 ft ceiling)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall (12–18 ft) or minor patching first"
                        },
                        {
                            "value": "lg",
                            "label": "10 ft+ ceiling or heavy patching / skim coat"
                        }
                    ],
                    "two-tone": [
                        {
                            "value": "",
                            "label": "Choose layout…"
                        },
                        {
                            "value": "sm",
                            "label": "Standard wall, one clean tape line"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or two tape lines"
                        },
                        {
                            "value": "lg",
                            "label": "Tall wall / wraps a corner or trim"
                        }
                    ],
                    "stripes": [
                        {
                            "value": "",
                            "label": "Choose pattern density…"
                        },
                        {
                            "value": "sm",
                            "label": "Wide stripes, standard wall"
                        },
                        {
                            "value": "md",
                            "label": "Narrow stripes or large wall"
                        },
                        {
                            "value": "lg",
                            "label": "Tall wall or many stripes / two colors + base"
                        }
                    ],
                    "geometric": [
                        {
                            "value": "",
                            "label": "Choose complexity…"
                        },
                        {
                            "value": "sm",
                            "label": "Simple shapes, standard wall"
                        },
                        {
                            "value": "md",
                            "label": "Multi-shape layout or 3 colors"
                        },
                        {
                            "value": "lg",
                            "label": "Complex pattern, tall wall, or outlets/shelves in the design"
                        }
                    ],
                    "dark": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "Standard wall — tinted primer + 2 coats"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 3 coats for full coverage"
                        },
                        {
                            "value": "lg",
                            "label": "Tall wall / heavy coverage + patching"
                        }
                    ],
                    "multiple": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "2 walls, solid color"
                        },
                        {
                            "value": "md",
                            "label": "2 walls with pattern, or 3 walls solid"
                        },
                        {
                            "value": "lg",
                            "label": "3+ walls with pattern / whole-room feature scheme"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            solid: { sm: [275, 520], md: [335, 550], lg: [490, 760] },
            'two-tone': { sm: [275, 455], md: [425, 670], lg: [610, 945] },
            stripes: { sm: [395, 610], md: [580, 880], lg: [820, 1185] },
            geometric: { sm: [520, 790], md: [760, 1155], lg: [1095, 1700] },
            dark: { sm: [275, 455], md: [425, 670], lg: [610, 975] },
            multiple: { sm: [395, 640], md: [640, 1035], lg: [1035, 1700] }
        },
        "cta": {
            "text": "Get My Accent Wall Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only: floor and trim protection, small holes patched, taping and layout, primer where the color change needs it, two coats, and clean edges. Paint, primer, and tape are not included unless you ask us to supply them. Pattern layouts are confirmed against a straight-on photo of your actual wall before we start — outlets, shelves, and out-of-square corners change how a pattern lands. Wallpapered, textured, or damaged walls need prep or removal quoted separately."
    },
    "cabinet-painting": {
        "title": "What Will Cabinet Painting Cost?",
        "subtitle": "Cabinet painting is priced by door and drawer-front count — pick yours for an estimated labor range.",
        "categories": [
            {
                "label": "What are we refinishing?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose what we're painting…"
                    },
                    {
                        "value": "kitchen",
                        "label": "Kitchen cabinets"
                    },
                    {
                        "value": "bathroom",
                        "label": "Bathroom vanity"
                    },
                    {
                        "value": "island",
                        "label": "Island or one cabinet run"
                    },
                    {
                        "value": "builtin",
                        "label": "Built-ins / bookcases / closet doors"
                    },
                    {
                        "value": "furniture",
                        "label": "Freestanding furniture piece"
                    }
                ]
            },
            {
                "label": "Doors + drawer fronts",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "kitchen": [
                        {
                            "value": "",
                            "label": "Count doors + drawer fronts…"
                        },
                        {
                            "value": "sm",
                            "label": "Up to 15 doors + drawer fronts (galley / small kitchen)"
                        },
                        {
                            "value": "md",
                            "label": "16–30 doors + drawer fronts"
                        },
                        {
                            "value": "lg",
                            "label": "31+ doors + drawer fronts (large kitchen)"
                        }
                    ],
                    "bathroom": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Single vanity (2–4 doors / drawers)"
                        },
                        {
                            "value": "md",
                            "label": "Large vanity (5–8) or two vanities"
                        },
                        {
                            "value": "lg",
                            "label": "Vanity + linen or medicine cabinet"
                        }
                    ],
                    "island": [
                        {
                            "value": "",
                            "label": "Count doors + drawer fronts…"
                        },
                        {
                            "value": "sm",
                            "label": "Island only (up to 6 doors / drawers)"
                        },
                        {
                            "value": "md",
                            "label": "One run, 7–14 doors / drawers"
                        },
                        {
                            "value": "lg",
                            "label": "Island + run, 15+ doors / drawers"
                        }
                    ],
                    "builtin": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit (up to 4 doors) or open shelving"
                        },
                        {
                            "value": "md",
                            "label": "2–3 units (5–12 doors)"
                        },
                        {
                            "value": "lg",
                            "label": "Wall-to-wall built-ins (13+ doors)"
                        }
                    ],
                    "furniture": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 small piece (nightstand, small cabinet)"
                        },
                        {
                            "value": "md",
                            "label": "1 large piece (dresser, hutch, sideboard)"
                        },
                        {
                            "value": "lg",
                            "label": "2+ pieces or a matching set"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            kitchen: { sm: [1310, 2120], md: [2605, 4475], lg: [3550, 5500] },
            bathroom: { sm: [415, 690], md: [690, 1120], lg: [1055, 1685] },
            island: { sm: [625, 1055], md: [1055, 1810], lg: [1750, 2840] },
            builtin: { sm: [520, 855], md: [855, 1500], lg: [1500, 2480] },
            furniture: { sm: [275, 485], md: [485, 855], lg: [825, 1435] }
        },
        "cta": {
            "text": "Get My Cabinet Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only: hardware and doors removed and labeled, degreasing, sanding, bonding primer, two coats of cabinet-grade paint, and reinstallation with hinges adjusted. Paint, primer, and any new hardware are not included unless you ask us to supply them. Peeling veneer, swollen MDF, water damage, or failing hinges are flagged before paint — if refacing or replacement is the honest answer, we say so instead of painting over it. In pre-1978 buildings we stop and flag suspected lead paint before sanding any original millwork, built-ins, or old painted doors. Cabinet paint needs cure time, so the kitchen is partly out of use for a few days; a full kitchen typically runs 3–5 days."
    },
    "trim-painting": {
        "title": "What Will Trim Painting Cost?",
        "subtitle": "Trim is priced by run length and piece count — pick yours for an estimated labor range.",
        "categories": [
            {
                "label": "Which trim?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the trim…"
                    },
                    {
                        "value": "baseboard",
                        "label": "Baseboards (and shoe / quarter round)"
                    },
                    {
                        "value": "doors",
                        "label": "Doors + door casings"
                    },
                    {
                        "value": "windows",
                        "label": "Window casings & sills"
                    },
                    {
                        "value": "crown",
                        "label": "Crown molding"
                    },
                    {
                        "value": "wainscot",
                        "label": "Wainscoting / chair rail / paneling"
                    },
                    {
                        "value": "all",
                        "label": "All trim in the room(s)"
                    }
                ]
            },
            {
                "label": "How much trim?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "baseboard": [
                        {
                            "value": "",
                            "label": "Estimate the run…"
                        },
                        {
                            "value": "sm",
                            "label": "One room (up to ~40 linear ft)"
                        },
                        {
                            "value": "md",
                            "label": "2–3 rooms (~40–120 linear ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Whole apartment (120+ linear ft)"
                        }
                    ],
                    "doors": [
                        {
                            "value": "",
                            "label": "Count the doors…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 doors + casings"
                        },
                        {
                            "value": "md",
                            "label": "3–5 doors + casings"
                        },
                        {
                            "value": "lg",
                            "label": "6+ doors + casings"
                        }
                    ],
                    "windows": [
                        {
                            "value": "",
                            "label": "Count the windows…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / bay window"
                        }
                    ],
                    "crown": [
                        {
                            "value": "",
                            "label": "Estimate the run…"
                        },
                        {
                            "value": "sm",
                            "label": "One room (up to ~40 linear ft)"
                        },
                        {
                            "value": "md",
                            "label": "2–3 rooms (~40–120 linear ft)"
                        },
                        {
                            "value": "lg",
                            "label": "120+ linear ft or 10 ft+ ceilings (ladder work)"
                        }
                    ],
                    "wainscot": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall / short run"
                        },
                        {
                            "value": "md",
                            "label": "One full room"
                        },
                        {
                            "value": "lg",
                            "label": "Multiple rooms or a hallway run"
                        }
                    ],
                    "all": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One room — baseboard, door + window casing"
                        },
                        {
                            "value": "md",
                            "label": "2–3 rooms"
                        },
                        {
                            "value": "lg",
                            "label": "Whole apartment"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            baseboard: { sm: [255, 420], md: [475, 790], lg: [840, 1385] },
            doors: { sm: [225, 395], md: [450, 740], lg: [790, 1290] },
            windows: { sm: [225, 365], md: [395, 660], lg: [690, 1145] },
            crown: { sm: [310, 505], md: [585, 970], lg: [790, 1385] },
            wainscot: { sm: [285, 475], md: [585, 995], lg: [1045, 1770] },
            all: { sm: [475, 790], md: [895, 1485], lg: [1580, 2600] }
        },
        "cta": {
            "text": "Get My Trim Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only: nail holes filled, gaps caulked, sanding, spot primer, flooring and wall edges masked, and two coats of durable semi-gloss. Paint, caulk, and filler are not included unless you ask us to supply them. Prewar trim carrying many old layers, peeling paint, or paint bonded to the floor may need stripping or replacement — we flag that before painting rather than adding another coat, and pre-1978 buildings get a lead-paint caution before sanding. Damaged or missing trim pieces are quoted separately. Bundling trim with wall painting is cheaper than booking it on its own."
    },
    "wallpaper-install": {
        "title": "What Will Wallpaper Installation Cost?",
        "subtitle": "Pick the paper type and how much wall it covers for an estimated labor range.",
        "categories": [
            {
                "label": "Wallpaper type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the paper…"
                    },
                    {
                        "value": "peel-stick",
                        "label": "Peel-and-stick"
                    },
                    {
                        "value": "prepasted",
                        "label": "Pre-pasted / traditional paste"
                    },
                    {
                        "value": "vinyl",
                        "label": "Vinyl / commercial-grade"
                    },
                    {
                        "value": "grasscloth",
                        "label": "Grasscloth / natural fiber"
                    },
                    {
                        "value": "mural",
                        "label": "Mural / numbered panel set"
                    }
                ]
            },
            {
                "label": "How much wall?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "peel-stick": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One accent wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "prepasted": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One accent wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "vinyl": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One accent wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "grasscloth": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One accent wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "mural": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "Single mural on a standard wall"
                        },
                        {
                            "value": "md",
                            "label": "Large mural / multi-panel set"
                        },
                        {
                            "value": "lg",
                            "label": "Mural + surrounding walls papered"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'peel-stick': { sm: [300, 510], md: [535, 995], lg: [995, 1800] },
            prepasted: { sm: [405, 665], md: [690, 1250], lg: [1650, 3030] },
            vinyl: { sm: [430, 715], md: [740, 1300], lg: [1300, 2345] },
            grasscloth: { sm: [560, 920], md: [945, 1600], lg: [2445, 4200] },
            mural: { sm: [455, 765], md: [765, 1300], lg: [1300, 2245] }
        },
        "cta": {
            "text": "Get My Wallpaper Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only: wall prep, wallpaper primer where needed, pattern matching, bubble-free application, and clean cuts around outlets, windows, and corners. The picker above carries the labor range — paper type, pattern repeat, wall height, and how square your corners are move it more than square footage does, so we confirm the number from photos. Wallpaper, primer, and paste are not included — we hang the paper you buy and will help you calculate roll count before you order. Textured, uneven, or previously papered walls may need a liner, skim coat, or removal first, quoted separately. Send the product link and a straight-on wall photo so we can confirm the repeat lays out cleanly on your actual wall."
    },
    "wallpaper-removal": {
        "title": "What Will Wallpaper Removal Cost?",
        "subtitle": "What's on the wall matters more than the square footage — pick your situation for an estimated labor range.",
        "categories": [
            {
                "label": "What's on the wall now?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the condition…"
                    },
                    {
                        "value": "single-layer",
                        "label": "Single layer, peels in sheets"
                    },
                    {
                        "value": "vinyl",
                        "label": "Vinyl / washable paper"
                    },
                    {
                        "value": "grasscloth",
                        "label": "Grasscloth / fabric-backed"
                    },
                    {
                        "value": "multi-layer",
                        "label": "Multiple layers (older apartment)"
                    },
                    {
                        "value": "painted-over",
                        "label": "Painted-over wallpaper"
                    },
                    {
                        "value": "glue-residue",
                        "label": "Paper is off — glue residue left behind"
                    }
                ]
            },
            {
                "label": "How much wall?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "single-layer": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "vinyl": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "grasscloth": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "multi-layer": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall (up to ~100 sq ft)"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room — plaster or unprimed drywall underneath"
                        }
                    ],
                    "painted-over": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall — score, soak, steam"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room (~250–450 sq ft)"
                        }
                    ],
                    "glue-residue": [
                        {
                            "value": "",
                            "label": "Choose coverage…"
                        },
                        {
                            "value": "sm",
                            "label": "One wall — wash + scrape"
                        },
                        {
                            "value": "md",
                            "label": "Large wall or 2 walls (~100–250 sq ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Full room — paper off, glue washed, walls left clean"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'single-layer': { sm: [260, 425], md: [425, 740], lg: [765, 1275] },
            vinyl: { sm: [315, 505], md: [505, 865], lg: [865, 1465] },
            grasscloth: { sm: [400, 635], md: [635, 1060], lg: [1060, 1785] },
            'multi-layer': { sm: [425, 690], md: [690, 1130], lg: [1130, 1920] },
            'painted-over': { sm: [480, 765], md: [765, 1275], lg: [1275, 2100] },
            'glue-residue': { sm: [200, 345], md: [345, 585], lg: [585, 985] }
        },
        "cta": {
            "text": "Get My Removal Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only: scoring, steaming or chemical stripping, adhesive washdown, light smoothing, floor and trim protection, and debris removal. The picker above carries the labor range — how many layers are up there and how the paper releases matter far more than square footage, so we confirm the number after a test strip. Stripper, primer, and skim-coat materials are not included. What is behind the paper decides the real number — unprimed drywall, blown plaster, or a torn paper face usually needs patching, skim coat, or primer before it is paint-ready, and that is quoted separately once the wall is exposed rather than guessed at up front. If we uncover mold or a wet wall we stop and route you to a licensed remediation contractor or a NYC Licensed Master Plumber before any paint goes on. Pre-1978 buildings get a lead-paint caution before any scraping or sanding. We do a test strip in a corner first so the estimate is based on how your wall actually releases."
    },
    "laminate-flooring": {
        "title": "Laminate Flooring Installation Estimate",
        "subtitle": "Pick your room size and how much prep the floor needs for an estimated labor range.",
        "categories": [
            {
                "label": "Room Size",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose room size…"
                    },
                    {
                        "value": "closet",
                        "label": "Closet, entry or bath — under 60 sq ft"
                    },
                    {
                        "value": "small",
                        "label": "Small room — 60–149 sq ft"
                    },
                    {
                        "value": "room",
                        "label": "Bedroom or living room — 150–249 sq ft"
                    },
                    {
                        "value": "large",
                        "label": "Large room — 250–349 sq ft"
                    },
                    {
                        "value": "multi",
                        "label": "Two–three rooms — 350–599 sq ft"
                    },
                    {
                        "value": "apartment",
                        "label": "Whole apartment — 600–1,000 sq ft"
                    }
                ]
            },
            {
                "label": "Prep & Extras",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "closet": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "small": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "room": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "large": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "apartment": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            closet: { sm: [275, 425], md: [375, 575], lg: [525, 800] },
            small: { sm: [425, 675], md: [575, 900], lg: [800, 1250] },
            room: { sm: [700, 1050], md: [900, 1400], lg: [1250, 1900] },
            large: { sm: [975, 1500], md: [1300, 1950], lg: [1750, 2600] },
            multi: { sm: [1500, 2300], md: [1950, 2900], lg: [2600, 3900] },
            apartment: { sm: [2300, 3600], md: [3000, 4600], lg: [3900, 6200] }
        },
        "cta": {
            "text": "Get My Laminate Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: layout, plank cutting, underlayment, expansion gaps, door-jamb undercuts, transition strips, and baseboard or quarter-round reinstallation. Laminate, underlayment, transitions and trim stock are not included — supply your own or we can source them. Soft or rotted subfloor, active leaks, joist-level damage, and suspected asbestos tile or adhesive (common under old 9×9 tile in pre-1980 NYC buildings) are flagged, never disturbed, and routed to the right licensed specialist. Floors larger than about 1,000 sq ft are quoted from a floor plan or an on-site measure instead of the range above. Final scope confirmed after photos or an on-site measure.",
        "placeholder": "Select room size and prep scope to see your estimate"
    },
    "vinyl-plank-flooring": {
        "title": "Vinyl Plank Flooring Installation Estimate",
        "subtitle": "Pick your room size and how much prep the floor needs for an estimated labor range.",
        "categories": [
            {
                "label": "Room Size",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose room size…"
                    },
                    {
                        "value": "closet",
                        "label": "Closet, entry or bath — under 60 sq ft"
                    },
                    {
                        "value": "small",
                        "label": "Small room — 60–149 sq ft"
                    },
                    {
                        "value": "room",
                        "label": "Bedroom or living room — 150–249 sq ft"
                    },
                    {
                        "value": "large",
                        "label": "Large room — 250–349 sq ft"
                    },
                    {
                        "value": "multi",
                        "label": "Two–three rooms — 350–599 sq ft"
                    },
                    {
                        "value": "apartment",
                        "label": "Whole apartment — 600–1,000 sq ft"
                    }
                ]
            },
            {
                "label": "Prep & Extras",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "closet": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + floating old-floor pull-up & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "small": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + floating old-floor pull-up & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "room": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + floating old-floor pull-up & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "large": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + floating old-floor pull-up & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + floating old-floor pull-up & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "apartment": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + floating old-floor pull-up & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            closet: { sm: [295, 450], md: [400, 600], lg: [550, 850] },
            small: { sm: [450, 700], md: [600, 925], lg: [825, 1275] },
            room: { sm: [700, 1075], md: [925, 1425], lg: [1275, 1950] },
            large: { sm: [975, 1475], md: [1300, 1950], lg: [1750, 2600] },
            multi: { sm: [1450, 2250], md: [1900, 2850], lg: [2550, 3800] },
            apartment: { sm: [2200, 3450], md: [2900, 4400], lg: [3800, 6000] }
        },
        "cta": {
            "text": "Get My Vinyl Plank Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: layout, cuts around cabinets, toilets and door jambs, underlayment where the product calls for it, expansion gaps, transition strips and stair noses, plus baseboard or quarter-round reinstallation. LVP/SPC planks, underlayment, transitions and trim are not included. Removal pricing covers floating floors only (click-lock, loose-lay, tack-strip carpet). Glued-down tile or sheet vinyl, soft or moisture-damaged subfloor, active leaks, and anything that could be asbestos-era tile or adhesive are flagged, never disturbed, and routed to a licensed abatement or flooring specialist — we quote those only after testing clears them. Floors larger than about 1,000 sq ft are quoted from a floor plan or an on-site measure instead of the range above. Final scope confirmed after photos or an on-site measure.",
        "placeholder": "Select room size and prep scope to see your estimate"
    },
    "click-lock-flooring": {
        "title": "Click-Lock Tile Installation Estimate",
        "subtitle": "Pick your room size and how much prep the floor needs for an estimated labor range.",
        "categories": [
            {
                "label": "Room Size",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose room size…"
                    },
                    {
                        "value": "closet",
                        "label": "Closet, entry or bath — under 60 sq ft"
                    },
                    {
                        "value": "small",
                        "label": "Small room — 60–149 sq ft"
                    },
                    {
                        "value": "room",
                        "label": "Bedroom or living room — 150–249 sq ft"
                    },
                    {
                        "value": "large",
                        "label": "Large room — 250–349 sq ft"
                    },
                    {
                        "value": "multi",
                        "label": "Two–three rooms — 350–599 sq ft"
                    },
                    {
                        "value": "apartment",
                        "label": "Whole apartment — 600–1,000 sq ft"
                    }
                ]
            },
            {
                "label": "Prep & Extras",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "closet": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "small": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "room": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "large": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ],
                    "apartment": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Empty room, floor ready — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + subfloor leveling + transitions & baseboard"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            closet: { sm: [350, 525], md: [475, 700], lg: [650, 975] },
            small: { sm: [525, 800], md: [700, 1100], lg: [975, 1500] },
            room: { sm: [850, 1300], md: [1100, 1700], lg: [1500, 2300] },
            large: { sm: [1200, 1800], md: [1600, 2400], lg: [2100, 3200] },
            multi: { sm: [1800, 2800], md: [2400, 3600], lg: [3200, 4800] },
            apartment: { sm: [2800, 4300], md: [3600, 5500], lg: [4800, 7400] }
        },
        "cta": {
            "text": "Get My Click-Lock Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: dry-fit layout, panel cuts at edges, corners and door jambs, expansion gaps, transition strips, and trim reinstallation — no mortar or grout. Tile panels, underlayment, transitions and trim stock are not included. Interlocking tile needs a flat, stable substrate, so out-of-tolerance floors get leveling quoted first. Rot, active leaks, and suspected asbestos tile or adhesive are flagged, never disturbed, and routed to a licensed specialist. Floors larger than about 1,000 sq ft are quoted from a floor plan or an on-site measure instead of the range above.",
        "placeholder": "Select room size and prep scope to see your estimate"
    },
    "peel-stick-flooring": {
        "title": "Peel & Stick Flooring Estimate",
        "subtitle": "Pick your room size and how much surface prep the floor needs for an estimated labor range.",
        "categories": [
            {
                "label": "Room Size",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose room size…"
                    },
                    {
                        "value": "closet",
                        "label": "Closet, bath or utility area — under 60 sq ft"
                    },
                    {
                        "value": "small",
                        "label": "Small room — 60–149 sq ft"
                    },
                    {
                        "value": "room",
                        "label": "Bedroom or living room — 150–249 sq ft"
                    },
                    {
                        "value": "large",
                        "label": "Large room — 250–349 sq ft"
                    },
                    {
                        "value": "multi",
                        "label": "Multiple rooms — 350–599 sq ft"
                    },
                    {
                        "value": "apartment",
                        "label": "Whole apartment — 600–1,000 sq ft"
                    }
                ]
            },
            {
                "label": "Surface Prep",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "closet": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Clean, smooth, empty floor — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + surface prep / primer + transitions"
                        }
                    ],
                    "small": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Clean, smooth, empty floor — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + surface prep / primer + transitions"
                        }
                    ],
                    "room": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Clean, smooth, empty floor — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + surface prep / primer + transitions"
                        }
                    ],
                    "large": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Clean, smooth, empty floor — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + surface prep / primer + transitions"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Clean, smooth, empty floor — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + surface prep / primer + transitions"
                        }
                    ],
                    "apartment": [
                        {
                            "value": "",
                            "label": "Choose prep scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Clean, smooth, empty floor — install only"
                        },
                        {
                            "value": "md",
                            "label": "Furniture moving + old floor removal & disposal"
                        },
                        {
                            "value": "lg",
                            "label": "Removal + surface prep / primer + transitions"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            closet: { sm: [175, 300], md: [250, 400], lg: [350, 550] },
            small: { sm: [275, 450], md: [400, 625], lg: [550, 850] },
            room: { sm: [425, 675], md: [600, 925], lg: [850, 1300] },
            large: { sm: [600, 925], md: [850, 1250], lg: [1150, 1750] },
            multi: { sm: [925, 1500], md: [1300, 2000], lg: [1750, 2700] },
            apartment: { sm: [1700, 2500], md: [2200, 3200], lg: [2900, 4100] }
        },
        "cta": {
            "text": "Get My Peel & Stick Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: surface cleaning and prep, layout, cutting, rolling, and thresholds. Tile or plank, primer, skim compound and transition strips are not included. Peel-and-stick only holds on a clean, dry, smooth surface — textured, waxed, damp or crumbling floors get prep quoted first, or we will tell you straight that a more durable vinyl product is the better buy. Suspected asbestos tile or adhesive is flagged, never disturbed, and routed to a licensed abatement contractor. Floors larger than about 1,000 sq ft are quoted from a floor plan or an on-site measure instead of the range above.",
        "placeholder": "Select room size and prep scope to see your estimate"
    },
    "floor-repair": {
        "title": "Floor Repair Estimate",
        "subtitle": "Tell us what failed and how much of the floor it affects for an estimated labor range.",
        "categories": [
            {
                "label": "What's Wrong?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the problem…"
                    },
                    {
                        "value": "planks",
                        "label": "Loose, lifted or damaged planks"
                    },
                    {
                        "value": "water",
                        "label": "Water damage / swollen boards"
                    },
                    {
                        "value": "scratch",
                        "label": "Scratches, dents or gouges"
                    },
                    {
                        "value": "squeak",
                        "label": "Squeaks, movement or hollow spots"
                    },
                    {
                        "value": "tile",
                        "label": "Cracked or loose tile / click-lock panels"
                    },
                    {
                        "value": "transition",
                        "label": "Transitions, thresholds & quarter round"
                    }
                ]
            },
            {
                "label": "How Much Is Affected?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "planks": [
                        {
                            "value": "",
                            "label": "Choose extent…"
                        },
                        {
                            "value": "sm",
                            "label": "1–3 boards, spare material on hand"
                        },
                        {
                            "value": "md",
                            "label": "4–10 boards, or we source the match"
                        },
                        {
                            "value": "lg",
                            "label": "Section replacement, 25+ sq ft"
                        }
                    ],
                    "water": [
                        {
                            "value": "",
                            "label": "Choose extent…"
                        },
                        {
                            "value": "sm",
                            "label": "Small spot, subfloor looks dry"
                        },
                        {
                            "value": "md",
                            "label": "Corner or under an appliance, needs drying"
                        },
                        {
                            "value": "lg",
                            "label": "Large area + subfloor patch"
                        }
                    ],
                    "scratch": [
                        {
                            "value": "",
                            "label": "Choose extent…"
                        },
                        {
                            "value": "sm",
                            "label": "A few scratches or one dent"
                        },
                        {
                            "value": "md",
                            "label": "Several areas in one room"
                        },
                        {
                            "value": "lg",
                            "label": "Multiple rooms / heavy wear"
                        }
                    ],
                    "squeak": [
                        {
                            "value": "",
                            "label": "Choose extent…"
                        },
                        {
                            "value": "sm",
                            "label": "One spot"
                        },
                        {
                            "value": "md",
                            "label": "Several spots in one room"
                        },
                        {
                            "value": "lg",
                            "label": "Hallway or whole room, boards lifted to fix"
                        }
                    ],
                    "tile": [
                        {
                            "value": "",
                            "label": "Choose extent…"
                        },
                        {
                            "value": "sm",
                            "label": "1–3 tiles or panels, spares available"
                        },
                        {
                            "value": "md",
                            "label": "4–10 tiles or panels"
                        },
                        {
                            "value": "lg",
                            "label": "Larger area + substrate correction"
                        }
                    ],
                    "transition": [
                        {
                            "value": "",
                            "label": "Choose extent…"
                        },
                        {
                            "value": "sm",
                            "label": "One doorway or threshold"
                        },
                        {
                            "value": "md",
                            "label": "2–4 doorways, or one room of quarter round"
                        },
                        {
                            "value": "lg",
                            "label": "Whole apartment thresholds + shoe molding"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            planks: { sm: [200, 340], md: [340, 550], lg: [600, 1005] },
            water: { sm: [285, 445], md: [470, 770], lg: [820, 1500] },
            scratch: { sm: [200, 315], md: [315, 500], lg: [525, 915] },
            squeak: { sm: [230, 365], md: [365, 600], lg: [650, 1145] },
            tile: { sm: [230, 395], md: [395, 675], lg: [720, 1235] },
            transition: { sm: [200, 315], md: [315, 550], lg: [575, 1005] }
        },
        "cta": {
            "text": "Get My Floor Repair Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: damage assessment, material matching, removing and replacing the affected sections, refastening, and blending the finish. Replacement planks, tiles, adhesive and finish are not included — leftover material from the original install gives the closest match. Water-damaged flooring is replaced only after the source of the water is fixed: an active leak goes to a Licensed Master Plumber first, rot or joist/structural damage to a licensed contractor, and suspected asbestos tile or adhesive is flagged and never disturbed. Whole-floor hardwood sand-and-refinish is quoted as a separate specialty scope.",
        "placeholder": "Select the problem and how much is affected to see your estimate"
    },
    "baseboard-trim": {
        "title": "Baseboard & Trim Installation Estimate",
        "subtitle": "Pick how much trim you need and how finished you want it for an estimated labor range.",
        "categories": [
            {
                "label": "How Much Trim?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose linear footage…"
                    },
                    {
                        "value": "lf25",
                        "label": "Small room — up to 25 linear ft"
                    },
                    {
                        "value": "lf50",
                        "label": "One room — 26–50 linear ft"
                    },
                    {
                        "value": "lf100",
                        "label": "Room + hallway or two rooms — 51–100 linear ft"
                    },
                    {
                        "value": "lf175",
                        "label": "Most of an apartment — 101–175 linear ft"
                    },
                    {
                        "value": "lf300",
                        "label": "Whole apartment — 176–300 linear ft"
                    },
                    {
                        "value": "casing",
                        "label": "Door casing / window trim only"
                    }
                ]
            },
            {
                "label": "Finish Level",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "lf25": [
                        {
                            "value": "",
                            "label": "Choose finish level…"
                        },
                        {
                            "value": "sm",
                            "label": "Install new trim only — paint-ready"
                        },
                        {
                            "value": "md",
                            "label": "Remove old trim + fill, caulk & clean edges"
                        },
                        {
                            "value": "lg",
                            "label": "Remove old + caulk + painted finish"
                        }
                    ],
                    "lf50": [
                        {
                            "value": "",
                            "label": "Choose finish level…"
                        },
                        {
                            "value": "sm",
                            "label": "Install new trim only — paint-ready"
                        },
                        {
                            "value": "md",
                            "label": "Remove old trim + fill, caulk & clean edges"
                        },
                        {
                            "value": "lg",
                            "label": "Remove old + caulk + painted finish"
                        }
                    ],
                    "lf100": [
                        {
                            "value": "",
                            "label": "Choose finish level…"
                        },
                        {
                            "value": "sm",
                            "label": "Install new trim only — paint-ready"
                        },
                        {
                            "value": "md",
                            "label": "Remove old trim + fill, caulk & clean edges"
                        },
                        {
                            "value": "lg",
                            "label": "Remove old + caulk + painted finish"
                        }
                    ],
                    "lf175": [
                        {
                            "value": "",
                            "label": "Choose finish level…"
                        },
                        {
                            "value": "sm",
                            "label": "Install new trim only — paint-ready"
                        },
                        {
                            "value": "md",
                            "label": "Remove old trim + fill, caulk & clean edges"
                        },
                        {
                            "value": "lg",
                            "label": "Remove old + caulk + painted finish"
                        }
                    ],
                    "lf300": [
                        {
                            "value": "",
                            "label": "Choose finish level…"
                        },
                        {
                            "value": "sm",
                            "label": "Install new trim only — paint-ready"
                        },
                        {
                            "value": "md",
                            "label": "Remove old trim + fill, caulk & clean edges"
                        },
                        {
                            "value": "lg",
                            "label": "Remove old + caulk + painted finish"
                        }
                    ],
                    "casing": [
                        {
                            "value": "",
                            "label": "Choose how many openings…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 doorways or windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 openings"
                        },
                        {
                            "value": "lg",
                            "label": "6–10 openings"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            lf25: { sm: [195, 330], md: [275, 435], lg: [380, 615] },
            lf50: { sm: [300, 485], md: [435, 690], lg: [590, 920] },
            lf100: { sm: [510, 795], md: [715, 1100], lg: [945, 1450] },
            lf175: { sm: [845, 1300], md: [1150, 1795], lg: [1550, 2340] },
            lf300: { sm: [1350, 2045], md: [1845, 2830], lg: [2435, 3700] },
            casing: { sm: [195, 380], md: [380, 745], lg: [745, 1450] }
        },
        "cta": {
            "text": "Get My Baseboard Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: measuring, miter and cope cuts, scribing to the wall, fastening, nail-hole filling, caulking, and paint where selected. Baseboard, shoe molding, casing stock, caulk and paint are quoted separately by profile and footage — we can supply them or install material you already have. Runs over 300 linear feet, or more than 10 casing openings, are quoted from a measure or a floor plan instead of the range above. Wavy walls, uneven floors or heavily glued old trim may need patching, sanding, or a shoe-molding detail to close the gap; we say so before we start rather than after.",
        "placeholder": "Select linear footage and finish level to see your estimate"
    },
    "subfloor-prep": {
        "title": "Subfloor Preparation Estimate",
        "subtitle": "Pick what the subfloor needs and how large the area is for an estimated labor range.",
        "categories": [
            {
                "label": "What Does the Subfloor Need?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the work…"
                    },
                    {
                        "value": "level",
                        "label": "Leveling dips & grinding high spots"
                    },
                    {
                        "value": "plywood",
                        "label": "Damaged plywood panel / soft spot over sound joists"
                    },
                    {
                        "value": "squeak",
                        "label": "Squeaks & refastening a loose subfloor"
                    },
                    {
                        "value": "demo",
                        "label": "Old adhesive, staples & underlayment removal"
                    },
                    {
                        "value": "moisture",
                        "label": "Moisture test & vapor barrier over concrete"
                    },
                    {
                        "value": "underlayment",
                        "label": "Underlayment install before new flooring"
                    }
                ]
            },
            {
                "label": "How Large an Area?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "level": [
                        {
                            "value": "",
                            "label": "Choose area…"
                        },
                        {
                            "value": "sm",
                            "label": "Spot fix — up to 50 sq ft"
                        },
                        {
                            "value": "md",
                            "label": "One room — 51–250 sq ft"
                        },
                        {
                            "value": "lg",
                            "label": "Multi-room — 251–600 sq ft"
                        }
                    ],
                    "plywood": [
                        {
                            "value": "",
                            "label": "Choose area…"
                        },
                        {
                            "value": "sm",
                            "label": "Spot fix — up to 50 sq ft"
                        },
                        {
                            "value": "md",
                            "label": "One room — 51–250 sq ft"
                        },
                        {
                            "value": "lg",
                            "label": "Multi-room — 251–600 sq ft"
                        }
                    ],
                    "squeak": [
                        {
                            "value": "",
                            "label": "Choose area…"
                        },
                        {
                            "value": "sm",
                            "label": "Spot fix — up to 50 sq ft"
                        },
                        {
                            "value": "md",
                            "label": "One room — 51–250 sq ft"
                        },
                        {
                            "value": "lg",
                            "label": "Multi-room — 251–600 sq ft"
                        }
                    ],
                    "demo": [
                        {
                            "value": "",
                            "label": "Choose area…"
                        },
                        {
                            "value": "sm",
                            "label": "Spot fix — up to 50 sq ft"
                        },
                        {
                            "value": "md",
                            "label": "One room — 51–250 sq ft"
                        },
                        {
                            "value": "lg",
                            "label": "Multi-room — 251–600 sq ft"
                        }
                    ],
                    "moisture": [
                        {
                            "value": "",
                            "label": "Choose area…"
                        },
                        {
                            "value": "sm",
                            "label": "Spot fix — up to 50 sq ft"
                        },
                        {
                            "value": "md",
                            "label": "One room — 51–250 sq ft"
                        },
                        {
                            "value": "lg",
                            "label": "Multi-room — 251–600 sq ft"
                        }
                    ],
                    "underlayment": [
                        {
                            "value": "",
                            "label": "Choose area…"
                        },
                        {
                            "value": "sm",
                            "label": "Spot fix — up to 50 sq ft"
                        },
                        {
                            "value": "md",
                            "label": "One room — 51–250 sq ft"
                        },
                        {
                            "value": "lg",
                            "label": "Multi-room — 251–600 sq ft"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            level: { sm: [225, 395], md: [425, 1010], lg: [1415, 2670] },
            plywood: { sm: [285, 505], md: [535, 1215], lg: [1905, 3600] },
            squeak: { sm: [195, 340], md: [370, 750], lg: [750, 1365] },
            demo: { sm: [225, 395], md: [425, 960], lg: [960, 1810] },
            moisture: { sm: [195, 310], md: [340, 750], lg: [750, 1415] },
            underlayment: { sm: [195, 310], md: [340, 695], lg: [695, 1315] }
        },
        "cta": {
            "text": "Get My Subfloor Quote",
            "href": "/#contact"
        },
        "disclaimer": "Ranges cover labor only: inspection, straightedge and moisture readings, refastening, patching, leveling or panel replacement, and underlayment where selected. Leveling compound, plywood, fasteners, vapor barrier and underlayment are not included. A moisture reading on its own is part of the $99 on-site assessment, credited toward the work. Cutting out and replacing a damaged plywood panel that sits over sound joists is handyman scope; rot in the joists themselves, real floor movement or any framing work is structural scope for a licensed contractor, and an active leak goes to a Licensed Master Plumber before we touch the floor. Suspected asbestos tile or adhesive is flagged and never disturbed. Areas over 600 sq ft are quoted from an on-site measure instead of the range above.",
        "placeholder": "Select the work and area size to see your estimate"
    },
    "faucet": {
        "title": "Faucet Installation Estimate",
        "subtitle": "Pick your faucet type and what shape the shut-offs are in for an estimated range.",
        "categories": [
            {
                "label": "Faucet Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose faucet type…"
                    },
                    {
                        "value": "kitchen",
                        "label": "Kitchen — single-hole / pull-down"
                    },
                    {
                        "value": "bathroom",
                        "label": "Bathroom — single-hole / centerset"
                    },
                    {
                        "value": "widespread",
                        "label": "Widespread — 3-hole / 8″ spread"
                    },
                    {
                        "value": "wall-bar",
                        "label": "Wall-mount or bar / prep faucet"
                    },
                    {
                        "value": "laundry",
                        "label": "Laundry / utility faucet"
                    },
                    {
                        "value": "shower-tub",
                        "label": "Tub or shower faucet trim (existing valve)"
                    }
                ]
            },
            {
                "label": "Scope & Shut-Off Condition",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "kitchen": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap — shut-offs turn, lines reusable"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new supply lines + old faucet haul-away"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + replace 2 seized shut-off valves / tight cabinet"
                        }
                    ],
                    "bathroom": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap — shut-offs turn, lines reusable"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new supply lines + pop-up drain assembly"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + replace 2 seized shut-off valves / tight vanity"
                        }
                    ],
                    "widespread": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Swap into existing 3-hole layout — shut-offs turn"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new supply lines + pop-up drain assembly"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + shut-off valves + corroded/stuck mounting nuts"
                        }
                    ],
                    "wall-bar": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Direct swap onto existing stub-outs"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new supply lines / escutcheons + haul-away"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + shut-off valves + tile or awkward access"
                        }
                    ],
                    "laundry": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap — valves turn, lines reusable"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new supply lines + old faucet haul-away"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + replace both shut-off valves / basement access"
                        }
                    ],
                    "shower-tub": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Trim plate + handle swap only"
                        },
                        {
                            "value": "md",
                            "label": "Trim + cartridge replacement (existing valve body)"
                        },
                        {
                            "value": "lg",
                            "label": "Trim + cartridge + tub spout & diverter"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            kitchen: { sm: [175, 255], md: [255, 355], lg: [355, 495] },
            bathroom: { sm: [175, 240], md: [230, 330], lg: [330, 460] },
            widespread: { sm: [210, 300], md: [300, 410], lg: [410, 560] },
            'wall-bar': { sm: [190, 275], md: [275, 385], lg: [385, 530] },
            laundry: { sm: [175, 240], md: [240, 340], lg: [340, 475] },
            'shower-tub': { sm: [190, 275], md: [275, 385], lg: [385, 530] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers removing the old faucet, cleaning the mounting area, setting the new fixture, connecting compatible supply lines, and leak testing before we close out. Faucet, supply lines, valves and drain parts are not included — you supply them or we source them at cost after you approve. Fixture-level work only: new supply or drain locations, concealed piping, riser or main valves, countertop drilling for extra holes, and any permit or DOB work route to a Licensed Master Plumber (stone counters route to a fabricator)."
    },
    "sink": {
        "title": "Sink Installation Estimate",
        "subtitle": "Pick your sink type and how much of the hookup is being redone.",
        "categories": [
            {
                "label": "Sink Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose sink type…"
                    },
                    {
                        "value": "drop-in",
                        "label": "Drop-in / top-mount (kitchen or bath)"
                    },
                    {
                        "value": "undermount",
                        "label": "Undermount (existing cutout)"
                    },
                    {
                        "value": "vessel",
                        "label": "Vessel sink on counter"
                    },
                    {
                        "value": "pedestal",
                        "label": "Pedestal / wall-mount sink"
                    },
                    {
                        "value": "vanity",
                        "label": "Vanity + sink top (combo unit)"
                    },
                    {
                        "value": "utility",
                        "label": "Utility / laundry sink"
                    }
                ]
            },
            {
                "label": "Hookup Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "drop-in": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Same-size swap — reuse drain, trap & valves"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new drain assembly, P-trap & supply lines"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + faucet pairing + valve replacement + haul-away"
                        }
                    ],
                    "undermount": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Reset / re-secure into existing cutout"
                        },
                        {
                            "value": "md",
                            "label": "Swap + clips, sealing, new drain & trap"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + faucet pairing + valve replacement + haul-away"
                        }
                    ],
                    "vessel": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Set on existing drilled counter, reuse trap"
                        },
                        {
                            "value": "md",
                            "label": "Set + new drain, tailpiece & supply lines"
                        },
                        {
                            "value": "lg",
                            "label": "Set + tall faucet pairing + valve replacement"
                        }
                    ],
                    "pedestal": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Swap onto existing anchors & stub-outs"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new drain, trap & supply lines"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + faucet pairing + valve replacement + haul-away"
                        }
                    ],
                    "vanity": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Same-footprint vanity swap, reuse drain & valves"
                        },
                        {
                            "value": "md",
                            "label": "Vanity + top + faucet + new drain and supplies"
                        },
                        {
                            "value": "lg",
                            "label": "Vanity + top + faucet + valves + old unit haul-away"
                        }
                    ],
                    "utility": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Freestanding swap onto existing hookup"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new drain, trap & supply lines"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + faucet pairing + valve replacement + haul-away"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'drop-in': { sm: [245, 325], md: [325, 430], lg: [430, 565] },
            undermount: { sm: [295, 395], md: [395, 520], lg: [520, 670] },
            vessel: { sm: [265, 355], md: [355, 470], lg: [470, 605] },
            pedestal: { sm: [295, 395], md: [395, 510], lg: [510, 665] },
            vanity: { sm: [325, 440], md: [440, 580], lg: [580, 760] },
            utility: { sm: [245, 325], md: [325, 430], lg: [430, 555] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers disconnecting the old sink, setting the new one in the existing opening, drain assembly and P-trap alignment, compatible supply connections, silicone sealing, and a leak test. Sink, faucet, drain parts and valves are not included. Fixture-level work only: cutting or enlarging a countertop opening, new supply or drain locations, moving the drain, concealed piping, and permit work are separate — those route to a Licensed Master Plumber, and stone counter cutting routes to a fabricator. Old-sink haul-away depends on building disposal rules."
    },
    "toilet": {
        "title": "Toilet Installation Estimate",
        "subtitle": "Pick your toilet type and whether the valve, supply and haul-away are in scope.",
        "categories": [
            {
                "label": "Toilet Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose toilet type…"
                    },
                    {
                        "value": "standard",
                        "label": "Standard two-piece (round or elongated)"
                    },
                    {
                        "value": "comfort",
                        "label": "Comfort-height / dual-flush two-piece"
                    },
                    {
                        "value": "one-piece",
                        "label": "One-piece or skirted toilet"
                    },
                    {
                        "value": "bidet-smart",
                        "label": "Bidet seat / smart toilet (outlet exists)"
                    },
                    {
                        "value": "wall-hung",
                        "label": "Wall-hung on existing carrier"
                    },
                    {
                        "value": "repair",
                        "label": "Repair only — running toilet / loose & rocking"
                    }
                ]
            },
            {
                "label": "Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "standard": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap — flange & floor sound, valve turns"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new shut-off valve & supply line"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + valve + old toilet removal & haul-away"
                        }
                    ],
                    "comfort": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap — flange & floor sound, valve turns"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new shut-off valve & supply line"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + valve + old toilet removal & haul-away"
                        }
                    ],
                    "one-piece": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap — flange & floor sound, valve turns"
                        },
                        {
                            "value": "md",
                            "label": "Swap + new shut-off valve & supply line"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + valve + heavy unit carry & haul-away"
                        }
                    ],
                    "bidet-smart": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Bidet seat on existing toilet — tee off supply"
                        },
                        {
                            "value": "md",
                            "label": "Bidet seat + new shut-off valve & supply line"
                        },
                        {
                            "value": "lg",
                            "label": "Full smart toilet swap (GFCI outlet already there)"
                        }
                    ],
                    "wall-hung": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Bowl swap on existing carrier & seal"
                        },
                        {
                            "value": "md",
                            "label": "Bowl swap + surface actuator plate & new seals"
                        },
                        {
                            "value": "lg",
                            "label": "Bowl + actuator plate + tight bathroom access & old bowl haul-away"
                        }
                    ],
                    "repair": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Running toilet — fill valve, flapper, handle or tank hardware rebuild"
                        },
                        {
                            "value": "md",
                            "label": "Loose or rocking — pull, new wax ring, bolts, re-level & caulk"
                        },
                        {
                            "value": "lg",
                            "label": "Reset + tank hardware rebuild + new shut-off valve & supply line"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            standard: { sm: [220, 315], md: [315, 420], lg: [400, 535] },
            comfort: { sm: [245, 340], md: [340, 455], lg: [420, 570] },
            'one-piece': { sm: [280, 385], md: [385, 515], lg: [480, 640] },
            'bidet-smart': { sm: [205, 290], md: [290, 410], lg: [480, 665] },
            'wall-hung': { sm: [315, 445], md: [410, 560], lg: [515, 710] },
            repair: { sm: [185, 255], md: [220, 305], lg: [290, 400] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers disconnecting the existing toilet, a new wax ring or seal, fresh closet bolts, supply-line connection, base caulking, and multi-flush leak testing. Toilet, seat, valve and supply line are not included — you supply them or we source them at cost once approved. Fixture-level work only: a damaged or sunken flange, soft or rotted floor, rough-in changes, concealed piping and stack issues route to a Licensed Master Plumber. On a wall-hung toilet we swap the bowl on the existing carrier and the surface actuator plate only — the concealed tank, its fill and flush valves, and the in-wall carrier itself are behind-the-wall work we don't touch, and route to a Licensed Master Plumber. Smart toilets need an existing GFCI outlet — a new outlet or circuit is a Licensed Master Electrician job. Haul-away depends on building disposal rules."
    },
    "garbage-disposal": {
        "title": "Garbage Disposal Installation Estimate",
        "subtitle": "Pick the job type and the unit size / power setup under your sink.",
        "categories": [
            {
                "label": "Job Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose job type…"
                    },
                    {
                        "value": "swap-same",
                        "label": "Direct swap — same brand & mount ring"
                    },
                    {
                        "value": "swap-diff",
                        "label": "Replacement — different brand / new mount ring"
                    },
                    {
                        "value": "new-install",
                        "label": "First disposal in this sink (power already there)"
                    },
                    {
                        "value": "repair",
                        "label": "Jammed, humming, or leaking unit"
                    },
                    {
                        "value": "remove",
                        "label": "Remove disposal — convert back to standard drain"
                    }
                ]
            },
            {
                "label": "Unit Size & Power Setup",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "swap-same": [
                        {
                            "value": "",
                            "label": "Choose setup…"
                        },
                        {
                            "value": "sm",
                            "label": "1/3–1/2 HP — plug-in outlet under sink, reuse drain parts"
                        },
                        {
                            "value": "md",
                            "label": "3/4 HP — new drain parts / dishwasher knockout & tie-in"
                        },
                        {
                            "value": "lg",
                            "label": "1 HP — existing hardwired or air-switch setup + haul-away"
                        }
                    ],
                    "swap-diff": [
                        {
                            "value": "",
                            "label": "Choose setup…"
                        },
                        {
                            "value": "sm",
                            "label": "1/3–1/2 HP — plug-in outlet, new mount ring & flange"
                        },
                        {
                            "value": "md",
                            "label": "3/4 HP — new flange, drain parts & dishwasher tie-in"
                        },
                        {
                            "value": "lg",
                            "label": "1 HP — existing hardwired or air-switch setup + haul-away"
                        }
                    ],
                    "new-install": [
                        {
                            "value": "",
                            "label": "Choose setup…"
                        },
                        {
                            "value": "sm",
                            "label": "1/3–1/2 HP — switched outlet ready, drain lines up"
                        },
                        {
                            "value": "md",
                            "label": "3/4 HP — new flange, trap rework & dishwasher tie-in"
                        },
                        {
                            "value": "lg",
                            "label": "1 HP — tight cabinet, old drain parts, full trap rebuild"
                        }
                    ],
                    "repair": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Jam clear / reset — unit otherwise sound"
                        },
                        {
                            "value": "md",
                            "label": "Leak diagnosis + flange re-seal or drain-part swap"
                        },
                        {
                            "value": "lg",
                            "label": "Diagnose, then replace the unit the same visit"
                        }
                    ],
                    "remove": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Remove unit, install standard basket strainer"
                        },
                        {
                            "value": "md",
                            "label": "Remove + new strainer, tailpiece & trap"
                        },
                        {
                            "value": "lg",
                            "label": "Remove + drain rework + dishwasher drain rerouted"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'swap-same': { sm: [225, 305], md: [290, 390], lg: [370, 500] },
            'swap-diff': { sm: [245, 330], md: [310, 420], lg: [395, 530] },
            'new-install': { sm: [350, 470], md: [445, 585], lg: [550, 720] },
            repair: { sm: [185, 255], md: [230, 320], lg: [330, 460] },
            remove: { sm: [185, 255], md: [230, 320], lg: [295, 395] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers mounting ring and flange fit, drain and trap tie-in, dishwasher knockout when needed, connecting to the existing switched power, and running the unit under water to leak test. Disposal unit and drain parts are not included. Requires power that is already there — a new outlet, new switched circuit, or rewiring routes to a Licensed Master Electrician. New drain lines, moving the trap arm, concealed piping, old galvanized drain replacement, and permit work route to a Licensed Master Plumber. Haul-away of the old unit depends on building disposal rules."
    },
    "shut-off-valve": {
        "title": "Shut-Off Valve Replacement Estimate",
        "subtitle": "Pick the fixture and how many valves — plus whether water shuts off locally.",
        "categories": [
            {
                "label": "Which Fixture Valve",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the fixture…"
                    },
                    {
                        "value": "toilet",
                        "label": "Toilet supply valve"
                    },
                    {
                        "value": "sink",
                        "label": "Sink / faucet valves (hot & cold)"
                    },
                    {
                        "value": "appliance",
                        "label": "Dishwasher or ice-maker valve"
                    },
                    {
                        "value": "washer",
                        "label": "Washing machine hose bibs (exposed / surface-mounted only)"
                    },
                    {
                        "value": "multi",
                        "label": "Several fixtures in one visit"
                    }
                ]
            },
            {
                "label": "Count, Condition & Water Shutoff",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "toilet": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 valve — accessible, water isolates locally"
                        },
                        {
                            "value": "md",
                            "label": "1 valve — corroded / seized, extra removal time"
                        },
                        {
                            "value": "lg",
                            "label": "Valve + supply line, building shutoff window needed"
                        }
                    ],
                    "sink": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 valve — accessible, water isolates locally"
                        },
                        {
                            "value": "md",
                            "label": "Both hot & cold — corroded, tight cabinet"
                        },
                        {
                            "value": "lg",
                            "label": "Both valves + supplies, building shutoff window needed"
                        }
                    ],
                    "appliance": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 valve — accessible, water isolates locally"
                        },
                        {
                            "value": "md",
                            "label": "1 valve — behind appliance, pull-out & reset needed"
                        },
                        {
                            "value": "lg",
                            "label": "Valve + new supply line, building shutoff window needed"
                        }
                    ],
                    "washer": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 valve in an accessible box"
                        },
                        {
                            "value": "md",
                            "label": "Both exposed hot & cold bibs — corroded handles"
                        },
                        {
                            "value": "lg",
                            "label": "Both exposed bibs + machine pull-out & reconnect"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "2 valves, one room, water isolates locally"
                        },
                        {
                            "value": "md",
                            "label": "3–4 valves across the apartment"
                        },
                        {
                            "value": "lg",
                            "label": "5+ valves / whole-apartment sweep with shutoff window"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            toilet: { sm: [195, 260], md: [250, 330], lg: [330, 440] },
            sink: { sm: [250, 350], md: [350, 455], lg: [455, 595] },
            appliance: { sm: [210, 280], md: [280, 370], lg: [370, 485] },
            washer: { sm: [230, 310], md: [310, 410], lg: [410, 540] },
            multi: { sm: [350, 480], md: [480, 640], lg: [640, 850] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers isolating the water, removing the old fixture valve, fitting a new quarter-turn valve on the existing accessible stub-out, reconnecting the supply, and pressure and leak testing. Valves and supply lines are not included. Accessible fixture valves only: main or riser valves, concealed and in-wall valves, pipe alterations behind the wall, corroded galvanized or lead-joint pipe, and permit work route to a Licensed Master Plumber. If water cannot be isolated locally, your building superintendent has to schedule the shutoff window before we book. Recessed washer boxes are in-wall work: if the valve bodies sit inside the wall cavity we stop, send photos free of charge and route you to a Licensed Master Plumber."
    },
    "leak-repair": {
        "title": "Leak Repair Estimate",
        "subtitle": "Tell us where the water is coming from and how easy it is to reach.",
        "categories": [
            {
                "label": "Where Is The Leak",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the leak location…"
                    },
                    {
                        "value": "faucet",
                        "label": "Faucet — dripping spout or leaking at the base"
                    },
                    {
                        "value": "under-sink",
                        "label": "Under the sink — supply line, trap or drain fitting"
                    },
                    {
                        "value": "toilet",
                        "label": "Toilet — supply, tank, or leaking at the base"
                    },
                    {
                        "value": "disposal",
                        "label": "Garbage disposal — leaking body or flange"
                    },
                    {
                        "value": "shower-tub",
                        "label": "Shower or tub — head, trim, spout or diverter"
                    },
                    {
                        "value": "unsure",
                        "label": "Not sure — water shows up, source unclear"
                    }
                ]
            },
            {
                "label": "Access & Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "faucet": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Cartridge, washer or aerator — open access"
                        },
                        {
                            "value": "md",
                            "label": "Re-seat & re-seal the faucet, new supply lines"
                        },
                        {
                            "value": "lg",
                            "label": "Faucet has to be replaced to stop it / tight cabinet"
                        }
                    ],
                    "under-sink": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Tighten / re-seal one visible connection"
                        },
                        {
                            "value": "md",
                            "label": "Replace supply lines, tailpiece or P-trap"
                        },
                        {
                            "value": "lg",
                            "label": "Full drain assembly rebuild / cabinet packed & tight"
                        }
                    ],
                    "toilet": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Supply line, tank-bolt or tank-to-bowl gasket leak"
                        },
                        {
                            "value": "md",
                            "label": "Leaking at the base — pull, new wax ring, bolts, reset & caulk"
                        },
                        {
                            "value": "lg",
                            "label": "Base reset + tank hardware rebuild + new shut-off valve"
                        }
                    ],
                    "disposal": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Leak at a drain or dishwasher hose connection"
                        },
                        {
                            "value": "md",
                            "label": "Sink flange re-seal or drain-part replacement"
                        },
                        {
                            "value": "lg",
                            "label": "Body is leaking — unit replaced to stop it"
                        }
                    ],
                    "shower-tub": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Shower head, arm or hose connection re-sealed"
                        },
                        {
                            "value": "md",
                            "label": "Trim + cartridge replacement (existing valve body)"
                        },
                        {
                            "value": "lg",
                            "label": "Trim + cartridge + tub spout / diverter, tile access"
                        }
                    ],
                    "unsure": [
                        {
                            "value": "",
                            "label": "Choose what you're seeing…"
                        },
                        {
                            "value": "sm",
                            "label": "Only wet when a fixture runs — easy to reach"
                        },
                        {
                            "value": "md",
                            "label": "Slow stain or intermittent drip, cabinet access"
                        },
                        {
                            "value": "lg",
                            "label": "More than one fixture wet, or a slow leak behind a cabinet or appliance"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            faucet: { sm: [185, 255], md: [245, 350], lg: [350, 490] },
            'under-sink': { sm: [185, 270], md: [255, 360], lg: [360, 500] },
            toilet: { sm: [185, 255], md: [220, 305], lg: [290, 395] },
            disposal: { sm: [185, 270], md: [235, 325], lg: [340, 480] },
            'shower-tub': { sm: [205, 290], md: [290, 410], lg: [410, 560] },
            unsure: { sm: [185, 280], md: [280, 395], lg: [395, 560] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Photo and text estimates are free, and if we can't tell from photos the $99 on-site assessment is credited toward the work. The range covers tracing the visible source, correcting the approved fixture-level issue, and testing dry — replacement parts are not included. Accessible fixture leaks only: leaks inside walls, ceilings or floors, concealed piping, risers, stacks, water heaters and boilers, and building-system leaks route to a Licensed Master Plumber or your building's maintenance. A stain on the ceiling below you, or water coming from the apartment above, is a concealed or building leak — we don't price that as a repair here; send photos and we'll tell you free who to call, and if it needs eyes on site the $99 assessment is credited toward any fixture work we do end up doing. Drywall, tile and paint repair after the plumbing fix is quoted separately. If the water can't be shut off, call your superintendent first."
    },
    "bathroom-fixture": {
        "title": "Bathroom Fixture Installation Estimate",
        "subtitle": "Pick what's going up and what it's going into — drywall or tile.",
        "categories": [
            {
                "label": "Fixture Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose fixture type…"
                    },
                    {
                        "value": "showerhead",
                        "label": "Shower head / handheld / rain head"
                    },
                    {
                        "value": "shower-trim",
                        "label": "Shower valve trim plate & handle"
                    },
                    {
                        "value": "accessories",
                        "label": "Towel bars, hooks, TP holder, shelves (1–3 pieces)"
                    },
                    {
                        "value": "full-set",
                        "label": "Full matching accessory set (4+ pieces)"
                    },
                    {
                        "value": "grab-bar",
                        "label": "Grab bar / safety rail"
                    },
                    {
                        "value": "mirror-cabinet",
                        "label": "Mirror or medicine cabinet"
                    }
                ]
            },
            {
                "label": "Wall Type & Quantity",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "showerhead": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Head swap on the existing shower arm"
                        },
                        {
                            "value": "md",
                            "label": "New shower arm or escutcheon with the head"
                        },
                        {
                            "value": "lg",
                            "label": "Rain head or handheld + slide bar — bracket set, drilling into tile"
                        }
                    ],
                    "shower-trim": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Trim plate + handle swap only"
                        },
                        {
                            "value": "md",
                            "label": "Trim + cartridge replacement (existing valve body)"
                        },
                        {
                            "value": "lg",
                            "label": "Trim + cartridge + tub spout & diverter"
                        }
                    ],
                    "accessories": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 piece on drywall"
                        },
                        {
                            "value": "md",
                            "label": "2–3 pieces on drywall"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 pieces drilled into tile, or old holes to patch"
                        }
                    ],
                    "full-set": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "4–5 pieces on drywall"
                        },
                        {
                            "value": "md",
                            "label": "4–5 pieces drilled into tile"
                        },
                        {
                            "value": "lg",
                            "label": "6–8 pieces — tile, old hardware removed & holes patched"
                        }
                    ],
                    "grab-bar": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 bar into studs or existing blocking"
                        },
                        {
                            "value": "md",
                            "label": "2 bars, tile drilling, heavy-duty anchors"
                        },
                        {
                            "value": "lg",
                            "label": "3+ bars / full tub-and-shower safety set in tile"
                        }
                    ],
                    "mirror-cabinet": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Mirror hung on drywall"
                        },
                        {
                            "value": "md",
                            "label": "Surface-mount medicine cabinet"
                        },
                        {
                            "value": "lg",
                            "label": "Recessed cabinet into an existing opening / tile"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            showerhead: { sm: [150, 190], md: [195, 265], lg: [280, 380] },
            'shower-trim': { sm: [195, 265], md: [265, 360], lg: [360, 470] },
            accessories: { sm: [150, 200], md: [190, 265], lg: [265, 370] },
            'full-set': { sm: [280, 390], md: [370, 510], lg: [480, 660] },
            'grab-bar': { sm: [195, 265], md: [265, 360], lg: [360, 470] },
            'mirror-cabinet': { sm: [195, 270], md: [270, 365], lg: [400, 540] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers stud finding, anchor selection, level mounting, and a secure function test; water-connected fixtures also get a shut-off review and a leak test. Fixtures, anchors, trim kits and cartridges are not included. Surface-level work only: opening the wall, replacing a behind-wall valve body, moving a shower arm or supply to a new location, cutting a new recess for a cabinet, re-tiling, concealed piping, and permit work route to a Licensed Master Plumber. Brittle tile, plaster, metal studs or hidden anchors can change the method — photos before the visit keep the quote accurate."
    },
    "ceiling-fan": {
        "title": "What Will My Ceiling Fan Install Cost?",
        "subtitle": "Pick the fan and your ceiling — free photo estimates, price confirmed before we book.",
        "categories": [
            {
                "label": "What kind of fan?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose fan type…"
                    },
                    {
                        "value": "swap",
                        "label": "Like-for-like fan replacement"
                    },
                    {
                        "value": "hugger",
                        "label": "Hugger / low-profile flush mount"
                    },
                    {
                        "value": "downrod",
                        "label": "Standard downrod fan"
                    },
                    {
                        "value": "light-remote",
                        "label": "Fan with light kit + remote"
                    },
                    {
                        "value": "outdoor",
                        "label": "Outdoor / damp-rated (balcony, terrace)"
                    },
                    {
                        "value": "other",
                        "label": "Other / not sure yet"
                    }
                ]
            },
            {
                "label": "Ceiling height and existing support",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "swap": [
                        {
                            "value": "",
                            "label": "Choose your ceiling…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, fan-rated box already there"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or box needs a fan-rated brace"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, sloped ceiling or two-person lift"
                        }
                    ],
                    "hugger": [
                        {
                            "value": "",
                            "label": "Choose your ceiling…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, fan-rated box already there"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or box needs a fan-rated brace"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, sloped ceiling or two-person lift"
                        }
                    ],
                    "downrod": [
                        {
                            "value": "",
                            "label": "Choose your ceiling…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, fan-rated box already there"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or box needs a fan-rated brace"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, sloped ceiling or two-person lift"
                        }
                    ],
                    "light-remote": [
                        {
                            "value": "",
                            "label": "Choose your ceiling…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, fan-rated box already there"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or box needs a fan-rated brace"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, sloped ceiling or two-person lift"
                        }
                    ],
                    "outdoor": [
                        {
                            "value": "",
                            "label": "Choose your ceiling…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, fan-rated box already there"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or box needs a fan-rated brace"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, exposed or two-person lift"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose your ceiling…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, fan-rated box already there"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or box needs a fan-rated brace"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, sloped ceiling or two-person lift"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            swap: { sm: [200, 265], md: [280, 400], lg: [415, 590] },
            hugger: { sm: [200, 285], md: [300, 430], lg: [440, 630] },
            downrod: { sm: [220, 320], md: [335, 470], lg: [485, 685] },
            'light-remote': { sm: [240, 350], md: [360, 510], lg: [525, 740] },
            outdoor: { sm: [255, 370], md: [380, 535], lg: [550, 780] },
            other: { sm: [200, 320], md: [335, 485], lg: [495, 725] }
        },
        "cta": {
            "text": "Get My Fan Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers removing the old fixture or fan, checking fan-rated support, hanging on the existing wiring, blade balancing, light-kit assembly, remote pairing, and a full speed and direction test. The fan, downrod, brace box and remote kit are not included. New fan locations, new switch legs or wiring runs, added circuits and panel work are outside handyman scope — we flag them and route you to a NYC Licensed Master Electrician. Send a ceiling photo, ceiling height and the fan model and we confirm the exact price for free."
    },
    "chandelier": {
        "title": "What Will My Chandelier Install Cost?",
        "subtitle": "Weight and ceiling height drive the price — send photos and the estimate is free.",
        "categories": [
            {
                "label": "What kind of fixture?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose fixture type…"
                    },
                    {
                        "value": "standard",
                        "label": "Standard chandelier (15–34 lb)"
                    },
                    {
                        "value": "crystal",
                        "label": "Crystal / multi-tier (crystals to assemble)"
                    },
                    {
                        "value": "heavy",
                        "label": "Heavy fixture (35–50 lb, two-person)"
                    },
                    {
                        "value": "oversize",
                        "label": "Over 50 lb, or the box is not rated for it"
                    },
                    {
                        "value": "cluster",
                        "label": "Pendant cluster on one canopy / multi-point fixture"
                    },
                    {
                        "value": "other",
                        "label": "Other / not sure yet"
                    }
                ]
            },
            {
                "label": "Ceiling height and access",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "standard": [
                        {
                            "value": "",
                            "label": "Choose height and access…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft ceiling, clear access"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or dining table to work around"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, stairwell or scaffold access"
                        }
                    ],
                    "crystal": [
                        {
                            "value": "",
                            "label": "Choose height and access…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft ceiling, clear access"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or dining table to work around"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, stairwell or scaffold access"
                        }
                    ],
                    "heavy": [
                        {
                            "value": "",
                            "label": "Choose height and access…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft, clear access, box already rated for the weight"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft or furniture to work around, box rated for the weight"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, stairwell or scaffold, box rated for the weight"
                        }
                    ],
                    "cluster": [
                        {
                            "value": "",
                            "label": "Choose height and access…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft ceiling, one canopy"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or several hang points"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, stairwell or scaffold access"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose height and access…"
                        },
                        {
                            "value": "sm",
                            "label": "8–9 ft ceiling, clear access"
                        },
                        {
                            "value": "md",
                            "label": "10–12 ft, or furniture to work around"
                        },
                        {
                            "value": "lg",
                            "label": "13 ft+, stairwell or scaffold access"
                        }
                    ],
                    "oversize": [
                        {
                            "value": "",
                            "label": "Choose what we are looking at…"
                        },
                        {
                            "value": "sm",
                            "label": "Fixture over 50 lb, box looks solid — on-site assessment ($99, credited)"
                        },
                        {
                            "value": "md",
                            "label": "Box or brace not rated for the weight — on-site assessment ($99, credited)"
                        },
                        {
                            "value": "lg",
                            "label": "Needs structural blocking or a new support point — on-site assessment ($99, credited)"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            standard: { sm: [290, 380], md: [390, 505], lg: [515, 675] },
            crystal: { sm: [375, 495], md: [505, 665], lg: [675, 885] },
            heavy: { sm: [415, 545], md: [555, 720], lg: [725, 950] },
            cluster: { sm: [340, 455], md: [465, 610], lg: [620, 810] },
            other: { sm: [265, 395], md: [405, 545], lg: [555, 745] },
            oversize: { sm: [99, 99], md: [99, 99], lg: [99, 99] }
        },
        "cta": {
            "text": "Get My Chandelier Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers removing the accessible old fixture, checking the existing box rating against the fixture weight, mounting plate fit, hanging and leveling, crystal or shade assembly, canopy coverage, dimmer and bulb check, and a function test on the existing wiring. The fixture, bulbs and any added support hardware are not included, and we protect the floor and furniture underneath. We hang up to 50 lb, and only on a box or brace already rated for that weight. Fixtures over 50 lb, boxes that are not rated, ceilings that need structural blocking, new fixture locations, added circuits and panel work are outside handyman scope — those carry no work price here: you get a free photo review, an on-site assessment ($99, credited) if photos are not enough, and the support or wiring itself is routed to a NYC Licensed Master Electrician or building management. Single pendants and flush fixtures under 15 lb are priced on our light fixture installation page. Send the product link, fixture weight and ceiling height for a free exact quote."
    },
    "light-fixture": {
        "title": "What Will My Light Fixture Install Cost?",
        "subtitle": "Replacing existing fixtures — pick the type and how many for a real range.",
        "categories": [
            {
                "label": "What kind of fixture?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose fixture type…"
                    },
                    {
                        "value": "flush",
                        "label": "Flush / semi-flush ceiling light"
                    },
                    {
                        "value": "pendant",
                        "label": "Pendant / mini-chandelier (separate pendants)"
                    },
                    {
                        "value": "sconce-vanity",
                        "label": "Wall sconce / vanity light bar"
                    },
                    {
                        "value": "track",
                        "label": "Track lighting (existing box or track)"
                    },
                    {
                        "value": "under-cabinet",
                        "label": "Under-cabinet LED strip or puck"
                    },
                    {
                        "value": "other",
                        "label": "Other / not sure yet"
                    }
                ]
            },
            {
                "label": "How many, and how high?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "flush": [
                        {
                            "value": "",
                            "label": "Choose quantity and height…"
                        },
                        {
                            "value": "sm",
                            "label": "1 fixture, standard 8–9 ft ceiling"
                        },
                        {
                            "value": "md",
                            "label": "2–3 fixtures, or one at 10–12 ft"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 fixtures, or 13 ft+ / stairwell"
                        }
                    ],
                    "pendant": [
                        {
                            "value": "",
                            "label": "Choose quantity and height…"
                        },
                        {
                            "value": "sm",
                            "label": "1 pendant, standard 8–9 ft ceiling"
                        },
                        {
                            "value": "md",
                            "label": "2–3 pendants, or one at 10–12 ft"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 pendants, or 13 ft+ / stairwell"
                        }
                    ],
                    "sconce-vanity": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 sconce or vanity bar"
                        },
                        {
                            "value": "md",
                            "label": "2–3 sconces or bars"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 sconces, or high / awkward mounting"
                        }
                    ],
                    "track": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 track run, standard 8–9 ft ceiling"
                        },
                        {
                            "value": "md",
                            "label": "2 runs, or one at 10–12 ft"
                        },
                        {
                            "value": "lg",
                            "label": "3–4 runs, or 13 ft+ / commercial ceiling"
                        }
                    ],
                    "under-cabinet": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 cabinet run, plug-in or existing feed"
                        },
                        {
                            "value": "md",
                            "label": "2–3 runs with linking and driver"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 runs / full kitchen, surface raceway or cord channel"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose quantity and height…"
                        },
                        {
                            "value": "sm",
                            "label": "1 fixture, standard 8–9 ft ceiling"
                        },
                        {
                            "value": "md",
                            "label": "2–3 fixtures, or one at 10–12 ft"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 fixtures, or 13 ft+ / stairwell"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            flush: { sm: [175, 225], md: [240, 340], lg: [350, 505] },
            pendant: { sm: [185, 260], md: [270, 380], lg: [390, 560] },
            'sconce-vanity': { sm: [175, 245], md: [255, 360], lg: [370, 535] },
            track: { sm: [215, 300], md: [310, 425], lg: [435, 620] },
            'under-cabinet': { sm: [290, 395], md: [430, 580], lg: [620, 840] },
            other: { sm: [175, 260], md: [270, 390], lg: [400, 580] }
        },
        "cta": {
            "text": "Get My Fixture Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers replacing fixtures on existing boxes and existing wiring: old fixture removal, box and mounting-plate check, fixture weight review, canopy coverage over the old opening, dimmer and bulb compatibility, and a function test. Fixtures, bulbs and drivers are not included. Under-cabinet lighting is surface work — we use surface raceway or cord channel and never conceal cable inside a finished wall, because in-wall cable runs are licensed-electrician work. New fixture locations, new ceiling boxes, recessed-lighting layouts, added circuits and panel work are outside handyman scope — flagged and routed to a NYC Licensed Master Electrician, with a DOB permit where required. The counts above cover a room at a time; bigger than that is still our job, it just gets a custom quote instead of a calculator range. Text photos of the current fixture and canopy plus the product link for a free exact quote."
    },
    "outlet": {
        "title": "What Will My Outlet Replacement Cost?",
        "subtitle": "Device-level replacement in the existing box — pick the device and how many.",
        "categories": [
            {
                "label": "What are we replacing?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose device type…"
                    },
                    {
                        "value": "standard",
                        "label": "Standard outlet swap (15A / 20A)"
                    },
                    {
                        "value": "gfci",
                        "label": "GFCI outlet (kitchen, bath, laundry)"
                    },
                    {
                        "value": "usb",
                        "label": "USB / combo charging outlet (mixed types)"
                    },
                    {
                        "value": "smart",
                        "label": "Smart Wi-Fi outlet"
                    },
                    {
                        "value": "damaged",
                        "label": "Loose, cracked or not holding plugs"
                    },
                    {
                        "value": "plates",
                        "label": "Cover plates / faceplate refresh"
                    }
                ]
            },
            {
                "label": "How many outlets?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "standard": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets (one room)"
                        }
                    ],
                    "gfci": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 GFCI outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 GFCI outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–5 GFCI outlets"
                        }
                    ],
                    "usb": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets"
                        }
                    ],
                    "smart": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 smart outlet + app pairing"
                        },
                        {
                            "value": "md",
                            "label": "2–3 smart outlets + app setup"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 smart outlets + scenes"
                        }
                    ],
                    "damaged": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets"
                        }
                    ],
                    "plates": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–3 plates"
                        },
                        {
                            "value": "md",
                            "label": "4–8 plates"
                        },
                        {
                            "value": "lg",
                            "label": "9–15 plates"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            standard: { sm: [150, 185], md: [190, 275], lg: [290, 430] },
            gfci: { sm: [150, 220], md: [225, 330], lg: [340, 515] },
            usb: { sm: [150, 220], md: [225, 330], lg: [340, 495] },
            smart: { sm: [150, 225], md: [235, 355], lg: [365, 550] },
            damaged: { sm: [150, 210], md: [215, 310], lg: [320, 485] },
            plates: { sm: [150, 165], md: [170, 220], lg: [225, 310] }
        },
        "cta": {
            "text": "Get My Outlet Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers replacing the device in an existing box on existing wiring: box and visible wiring condition, correct line and load orientation on GFCI, grounding check, secure mounting, flat faceplate fit, and a tester check on every outlet we touch. Devices, plates and materials are not included. New outlet locations, added circuits, higher-voltage outlets (dryer, oven, AC, EV charger), and any panel or service work are outside handyman scope — we flag them and route you to a NYC Licensed Master Electrician, with a DOB permit where required. If an outlet is warm, scorched, sparking or buzzing, do not use it and do not order a swap here — that is a safety symptom, it goes to the $99 on-site assessment on our electrical troubleshooting page, and the repair is routed to a Licensed Master Electrician. For exact USB-A, USB-C or GFCI-protected USB pricing use our USB outlet page; the counts above cover a room at a time, and anything larger gets a custom quote instead of a calculator range."
    },
    "usb-outlet": {
        "title": "What Will My USB Outlet Cost?",
        "subtitle": "USB-A, USB-C and combo receptacles in your existing boxes — pick the type and quantity.",
        "categories": [
            {
                "label": "Which USB outlet?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose USB outlet type…"
                    },
                    {
                        "value": "usb-a",
                        "label": "USB-A + standard receptacle"
                    },
                    {
                        "value": "usb-c",
                        "label": "USB-C fast charge (PD) + receptacle"
                    },
                    {
                        "value": "combo",
                        "label": "Combo USB-A + USB-C"
                    },
                    {
                        "value": "usb-gfci",
                        "label": "USB in a kitchen or bath (GFCI-protected)"
                    },
                    {
                        "value": "usb-plate",
                        "label": "USB charging faceplate (no device swap)"
                    },
                    {
                        "value": "other",
                        "label": "Not sure / mixed types"
                    }
                ]
            },
            {
                "label": "How many outlets?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "usb-a": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets (desk, kitchen, bedsides)"
                        }
                    ],
                    "usb-c": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets (desk, kitchen, bedsides)"
                        }
                    ],
                    "combo": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets (desk, kitchen, bedsides)"
                        }
                    ],
                    "usb-gfci": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–5 outlets (kitchen counter)"
                        }
                    ],
                    "usb-plate": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 plates"
                        },
                        {
                            "value": "md",
                            "label": "3–5 plates"
                        },
                        {
                            "value": "lg",
                            "label": "6–10 plates"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 outlet"
                        },
                        {
                            "value": "md",
                            "label": "2–3 outlets"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 outlets"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'usb-a': { sm: [150, 200], md: [205, 300], lg: [310, 455] },
            'usb-c': { sm: [150, 210], md: [215, 315], lg: [330, 480] },
            combo: { sm: [150, 220], md: [225, 335], lg: [345, 505] },
            'usb-gfci': { sm: [155, 230], md: [245, 365], lg: [375, 550] },
            'usb-plate': { sm: [150, 185], md: [190, 260], lg: [270, 385] },
            other: { sm: [150, 220], md: [225, 340], lg: [350, 515] }
        },
        "cta": {
            "text": "Get My USB Outlet Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers swapping the receptacle in your existing box on existing wiring: box depth check, wiring and grounding condition, correct rating for the room, tamper-resistant hardware where code calls for it, flat faceplate fit, and a live charge test on every port. USB outlets are physically deeper than older receptacles — if the existing box is too shallow we tell you before we start rather than forcing it. Devices and plates are not included. New outlet locations, added circuits and any panel work are outside handyman scope and get routed to a NYC Licensed Master Electrician. If an outlet is warm, scorched, sparking or buzzing, stop using it and send it to our electrical troubleshooting page instead — that is the $99 on-site assessment path, not a device swap. The counts above cover a room at a time; larger jobs are still ours, they just get a custom quote instead of a calculator range. Text a straight-on photo of the outlet plus the product link for a free exact quote."
    },
    "switch": {
        "title": "What Will My Switch Replacement Cost?",
        "subtitle": "Standard, dimmer, smart or 3-way — replacement on the wiring you already have.",
        "categories": [
            {
                "label": "What kind of switch?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose switch type…"
                    },
                    {
                        "value": "standard",
                        "label": "Standard single-pole switch"
                    },
                    {
                        "value": "dimmer",
                        "label": "Dimmer switch"
                    },
                    {
                        "value": "three-way",
                        "label": "3-way / multi-location (existing 3-way wiring)"
                    },
                    {
                        "value": "smart",
                        "label": "Smart switch (Lutron, TP-Link, Leviton)"
                    },
                    {
                        "value": "timer-fan",
                        "label": "Timer, humidity or fan-speed control"
                    },
                    {
                        "value": "other",
                        "label": "Worn or loose switch, or not sure"
                    }
                ]
            },
            {
                "label": "How many switches?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "standard": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 switch"
                        },
                        {
                            "value": "md",
                            "label": "2–3 switches (or a 2–3 gang plate)"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 switches (one room or hallway)"
                        }
                    ],
                    "dimmer": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 dimmer"
                        },
                        {
                            "value": "md",
                            "label": "2–3 dimmers"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 dimmers"
                        }
                    ],
                    "three-way": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 pair (2 locations, one fixture)"
                        },
                        {
                            "value": "md",
                            "label": "2 pairs, or a 3-way plus dimmer"
                        },
                        {
                            "value": "lg",
                            "label": "3–4 pairs (hallway or stair runs)"
                        }
                    ],
                    "smart": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 smart switch or dimmer + app pairing"
                        },
                        {
                            "value": "md",
                            "label": "2–3 smart switches + app scenes"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 smart switches + scenes"
                        }
                    ],
                    "timer-fan": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 control"
                        },
                        {
                            "value": "md",
                            "label": "2–3 controls"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 controls"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1 switch"
                        },
                        {
                            "value": "md",
                            "label": "2–3 switches"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 switches"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            standard: { sm: [150, 185], md: [190, 270], lg: [285, 420] },
            dimmer: { sm: [150, 205], md: [210, 305], lg: [315, 465] },
            'three-way': { sm: [155, 220], md: [230, 340], lg: [350, 525] },
            smart: { sm: [150, 225], md: [240, 355], lg: [370, 550] },
            'timer-fan': { sm: [150, 215], md: [220, 325], lg: [335, 490] },
            other: { sm: [150, 220], md: [225, 340], lg: [350, 515] }
        },
        "cta": {
            "text": "Get My Switch Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers replacing switches in existing boxes on existing wiring: box depth, visible wiring layout, neutral availability, load type, dimmer and bulb compatibility, gang-plate fit, and a function test from every location that controls the fixture. Switches, dimmers and plates are not included. Smart switches usually need a neutral wire in the box — that is the most common reason a job changes scope, and we check it before we quote. Converting a single switch to a 3-way, adding switch locations, new wiring runs, added circuits and panel work are outside handyman scope and get routed to a NYC Licensed Master Electrician. If a switch crackles, sparks, feels warm or smells hot, stop using it — that is a safety symptom, not a swap: it goes to the $99 on-site assessment on our electrical troubleshooting page and the repair is routed to a Licensed Master Electrician. Smart switch pricing here matches our smart device page exactly. The counts above cover a room at a time; a whole-apartment refresh is still our job, it just gets a custom quote instead of a calculator range. Send a photo of the existing switch and the product link for a free exact quote."
    },
    "smart-device": {
        "title": "What Will My Smart Device Setup Cost?",
        "subtitle": "Thermostats, locks, doorbells, lighting and sensors — mounted, paired and tested.",
        "categories": [
            {
                "label": "Which device?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose device type…"
                    },
                    {
                        "value": "thermostat",
                        "label": "Smart thermostat (Nest, ecobee, Honeywell)"
                    },
                    {
                        "value": "lock",
                        "label": "Smart lock / keypad deadbolt"
                    },
                    {
                        "value": "doorbell",
                        "label": "Video doorbell (existing wired chime)"
                    },
                    {
                        "value": "lighting",
                        "label": "Smart switches, dimmers or bulbs"
                    },
                    {
                        "value": "plugs-sensors",
                        "label": "Smart plugs, sensors or a hub"
                    },
                    {
                        "value": "camera-other",
                        "label": "Indoor camera / other smart device"
                    }
                ]
            },
            {
                "label": "Scope of the setup",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "thermostat": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 thermostat, C-wire present, app ready"
                        },
                        {
                            "value": "md",
                            "label": "1 thermostat + adapter or power kit"
                        },
                        {
                            "value": "lg",
                            "label": "2 thermostats, each a 1-for-1 swap on its own existing wiring, + app and scenes"
                        }
                    ],
                    "lock": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 lock, door and deadbolt fit as-is"
                        },
                        {
                            "value": "md",
                            "label": "1 lock + strike, bore or alignment work"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 doors, or keypad plus hub and app setup"
                        }
                    ],
                    "doorbell": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Existing wired doorbell, chime compatible"
                        },
                        {
                            "value": "md",
                            "label": "+ chime adapter or low-voltage-side fit at the existing chime"
                        },
                        {
                            "value": "lg",
                            "label": "2 units, or wedge mount plus full app setup"
                        }
                    ],
                    "lighting": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 smart switch, dimmer or bulb + app pairing"
                        },
                        {
                            "value": "md",
                            "label": "2–3 smart switches, dimmers or bulbs + app scenes"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 smart switches, dimmers or bulbs + scenes"
                        }
                    ],
                    "plugs-sensors": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1–3 plug-in smart plugs or sensors + app"
                        },
                        {
                            "value": "md",
                            "label": "4–8 devices + hub pairing"
                        },
                        {
                            "value": "lg",
                            "label": "9–12 devices + hub pairing and automations"
                        }
                    ],
                    "camera-other": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 device, power and mounting point ready"
                        },
                        {
                            "value": "md",
                            "label": "2–3 devices + app setup"
                        },
                        {
                            "value": "lg",
                            "label": "4–6 devices / multi-room setup"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            thermostat: { sm: [150, 215], md: [225, 320], lg: [330, 490] },
            lock: { sm: [215, 290], md: [300, 405], lg: [430, 580] },
            doorbell: { sm: [165, 240], md: [250, 360], lg: [370, 550] },
            lighting: { sm: [150, 220], md: [230, 335], lg: [345, 500] },
            'plugs-sensors': { sm: [150, 200], md: [210, 320], lg: [330, 560] },
            'camera-other': { sm: [150, 215], md: [225, 330], lg: [340, 520] }
        },
        "cta": {
            "text": "Get My Smart Setup Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers installing the device on the existing wiring or mounting point, Wi-Fi and app pairing, account sign-in with you present, and a function test of every feature before we leave. Devices, adapters, hubs, bulbs and batteries are not included, and you need your account login and Wi-Fi password on site or we cannot finish the pairing. Smart switches usually need a neutral wire and most smart thermostats need a C-wire or an approved adapter — send a wiring photo first so we confirm fit before booking. Doorbell work here is the low-voltage side only: an existing chime, chime adapter or plug-in adapter. Replacing or adding a 120V doorbell transformer at a junction box or panel is line-voltage work and is routed to a NYC Licensed Master Electrician. Running a new C-wire or low-voltage cable, drilling exterior penetrations, zoning, damper or any other HVAC control change, added circuits and panel work are also outside handyman scope — routed to a NYC Licensed Master Electrician or an HVAC specialist. Smart switch and dimmer pricing here matches our switch installation page exactly. The counts above cover a normal apartment setup; bigger installs are still our job, they just get a custom quote instead of a calculator range."
    },
    "electrical-troubleshooting": {
        "title": "What Will It Cost to Find and Fix It?",
        "subtitle": "Photo estimates are free, the $99 on-site diagnosis is credited toward the fix, and work starts at $150.",
        "categories": [
            {
                "label": "What is happening?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the symptom…"
                    },
                    {
                        "value": "dead-outlet",
                        "label": "Outlet or wall plug is dead"
                    },
                    {
                        "value": "partial-power",
                        "label": "Half a room or several outlets are out"
                    },
                    {
                        "value": "breaker-trips",
                        "label": "Breaker trips over and over — safety stop"
                    },
                    {
                        "value": "flicker",
                        "label": "Lights flicker or dim (LED / dimmer mismatch)"
                    },
                    {
                        "value": "buzz-heat",
                        "label": "Outlet or switch buzzes, feels warm or sparks — safety stop"
                    },
                    {
                        "value": "after-install",
                        "label": "Stopped working after a recent install"
                    }
                ]
            },
            {
                "label": "What is involved",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "dead-outlet": [
                        {
                            "value": "",
                            "label": "Choose the likely fix…"
                        },
                        {
                            "value": "sm",
                            "label": "Diagnose, then repair at the existing device"
                        },
                        {
                            "value": "md",
                            "label": "Diagnose + replace the dead outlet or its GFCI"
                        },
                        {
                            "value": "lg",
                            "label": "Diagnose + trace the run, several devices"
                        }
                    ],
                    "partial-power": [
                        {
                            "value": "",
                            "label": "Choose the likely fix…"
                        },
                        {
                            "value": "sm",
                            "label": "Diagnose + restore at the device we find"
                        },
                        {
                            "value": "md",
                            "label": "Diagnose + replace the failed device in the run"
                        },
                        {
                            "value": "lg",
                            "label": "Diagnose + trace the whole run, several devices"
                        }
                    ],
                    "breaker-trips": [
                        {
                            "value": "",
                            "label": "Choose what is happening…"
                        },
                        {
                            "value": "sm",
                            "label": "One appliance or one room involved — on-site assessment ($99, credited)"
                        },
                        {
                            "value": "md",
                            "label": "Several rooms, or it trips when one device runs — on-site assessment ($99, credited)"
                        },
                        {
                            "value": "lg",
                            "label": "Trips with nothing plugged in, or after a leak or storm — on-site assessment ($99, credited)"
                        }
                    ],
                    "flicker": [
                        {
                            "value": "",
                            "label": "Choose the likely fix…"
                        },
                        {
                            "value": "sm",
                            "label": "Diagnose + correct bulb or dimmer mismatch"
                        },
                        {
                            "value": "md",
                            "label": "Diagnose + replace the switch, dimmer or fixture"
                        },
                        {
                            "value": "lg",
                            "label": "Diagnose + tighten and test several connections"
                        }
                    ],
                    "buzz-heat": [
                        {
                            "value": "",
                            "label": "Choose what is happening…"
                        },
                        {
                            "value": "sm",
                            "label": "One outlet or switch involved — on-site assessment ($99, credited)"
                        },
                        {
                            "value": "md",
                            "label": "Several devices, or it started recently — on-site assessment ($99, credited)"
                        },
                        {
                            "value": "lg",
                            "label": "Burning smell, scorch marks or sparks — stop using it now; on-site assessment ($99, credited)"
                        }
                    ],
                    "after-install": [
                        {
                            "value": "",
                            "label": "Choose the likely fix…"
                        },
                        {
                            "value": "sm",
                            "label": "Diagnose + correct the connection"
                        },
                        {
                            "value": "md",
                            "label": "Diagnose + replace the device or fixture"
                        },
                        {
                            "value": "lg",
                            "label": "Diagnose + redo the install properly"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'dead-outlet': { sm: [185, 250], md: [260, 350], lg: [360, 510] },
            'partial-power': { sm: [200, 290], md: [300, 410], lg: [420, 590] },
            'breaker-trips': { sm: [99, 99], md: [99, 99], lg: [99, 99] },
            flicker: { sm: [185, 260], md: [265, 360], lg: [370, 520] },
            'buzz-heat': { sm: [99, 99], md: [99, 99], lg: [99, 99] },
            'after-install': { sm: [185, 235], md: [245, 335], lg: [345, 485] }
        },
        "cta": {
            "text": "Start My Diagnosis Request",
            "href": "/#contact"
        },
        "disclaimer": "Text photos or a short video first — remote estimates are always free. If we cannot tell from photos, the $99 on-site assessment covers meter testing and a written finding, and it is credited toward any work we do for you, so the diagnosis costs $0 when we do the job. Work ranges above are for that diagnosis plus a defined device-level fix on existing wiring; replacement outlets, switches and fixtures are not included and every repair is quoted and approved before a single part comes out. Two symptoms carry no repair price on purpose: repeated breaker trips, and a device that buzzes, feels warm, sparks, smells like burning or shows scorch marks. Those are safety stops — stop using that circuit, we come out for the $99 assessment and give you a written finding, and the repair itself goes to a NYC Licensed Master Electrician or building maintenance. Aluminum wiring, panel or breaker work, new circuits and new outlet locations are outside handyman scope the same way — we route them, we never guess at them."
    },
    "ac-through-wall": {
        "title": "Through-Wall AC Installation Estimate",
        "subtitle": "Select your unit size and sleeve condition for an estimated price range.",
        "categories": [
            {
                "label": "AC Unit Size",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose unit size…"
                    },
                    {
                        "value": "upto12k",
                        "label": "Up to 12,000 BTU (bedroom / office)"
                    },
                    {
                        "value": "12to18k",
                        "label": "12,000 – 18,000 BTU (living room)"
                    },
                    {
                        "value": "over18k",
                        "label": "18,000+ BTU (heavy / two-person lift)"
                    },
                    {
                        "value": "unknown",
                        "label": "Not sure — I'll send the model label"
                    }
                ]
            },
            {
                "label": "Sleeve Condition & Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "upto12k": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Sleeve fits — seat, foam seal, startup test"
                        },
                        {
                            "value": "md",
                            "label": "Install + old unit pulled and carried out"
                        },
                        {
                            "value": "lg",
                            "label": "Install + trim / gap work or grille cleanup + old unit out"
                        }
                    ],
                    "12to18k": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Sleeve fits — seat, foam seal, startup test"
                        },
                        {
                            "value": "md",
                            "label": "Install + old unit pulled and carried out"
                        },
                        {
                            "value": "lg",
                            "label": "Install + trim / gap work or grille cleanup + old unit out"
                        }
                    ],
                    "over18k": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Sleeve fits — seat, foam seal, startup test"
                        },
                        {
                            "value": "md",
                            "label": "Install + old unit pulled and carried out"
                        },
                        {
                            "value": "lg",
                            "label": "Install + trim / gap work or grille cleanup + old unit out"
                        }
                    ],
                    "unknown": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Straight swap into an existing sleeve"
                        },
                        {
                            "value": "md",
                            "label": "Swap + old unit removed from the wall"
                        },
                        {
                            "value": "lg",
                            "label": "Swap + sleeve trim / seal work + old unit out"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            upto12k: { sm: [175, 245], md: [230, 315], lg: [305, 410] },
            '12to18k': { sm: [215, 290], md: [275, 375], lg: [355, 480] },
            over18k: { sm: [275, 375], md: [345, 465], lg: [435, 580] },
            unknown: { sm: [175, 375], md: [230, 465], lg: [305, 580] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers labor to fit a unit into an existing sleeve: fit check, foam seal, trim review, drainage slope and a startup test. AC unit, sleeve, grille and trim materials are not included. We do not cut new wall openings, replace or re-set sleeves, cut masonry or touch the facade — that work is not handyman scope and goes to your building and a licensed masonry / facade contractor or GC. New outlets, dedicated circuits and any 208V/230V/240V change go to a NYC Licensed Master Electrician on the permit path. No refrigerant or sealed-system work. Until we see the model label, the \"not sure\" range spans every unit size on this page — send a photo and we tighten it before booking."
    },
    "ac-ptac": {
        "title": "PTAC Installation Estimate",
        "subtitle": "Select your PTAC job type and scope for an estimated price range.",
        "categories": [
            {
                "label": "PTAC Job Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose job type…"
                    },
                    {
                        "value": "swap",
                        "label": "Like-for-like replacement (same sleeve & plug)"
                    },
                    {
                        "value": "brand-change",
                        "label": "Different brand / model (adapter & grille check)"
                    },
                    {
                        "value": "first-fit",
                        "label": "First unit into an existing empty sleeve"
                    },
                    {
                        "value": "reseat",
                        "label": "Re-seat, re-seal or drainage correction"
                    },
                    {
                        "value": "multi",
                        "label": "Multiple units (hotel / building / office)"
                    }
                ]
            },
            {
                "label": "Scope per Visit",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "swap": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — sleeve OK, old unit stays on site"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — old unit carried out to storage / curb"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — sleeve cleanup & insulation + old unit out"
                        }
                    ],
                    "brand-change": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — sleeve fits, grille reused"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — adapter / trim kit + old unit out"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — adapter + grille swap + sleeve cleanup"
                        }
                    ],
                    "first-fit": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — sleeve clean and ready"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — sleeve cleaned, sealed and insulated"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — sleeve prep + trim / grille fit + drain check"
                        }
                    ],
                    "reseat": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Pull, reseat and re-seal 1 unit"
                        },
                        {
                            "value": "md",
                            "label": "Reseat + drain pan / condensate path correction"
                        },
                        {
                            "value": "lg",
                            "label": "Reseat + insulation, trim and grille correction"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "2–3 units, same visit — same scope each"
                        },
                        {
                            "value": "md",
                            "label": "4–6 units, same visit — same scope each"
                        },
                        {
                            "value": "lg",
                            "label": "7–12 units, scheduled by floor — same scope each"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            swap: { sm: [315, 430], md: [410, 545], lg: [515, 685] },
            'brand-change': { sm: [375, 495], md: [475, 620], lg: [595, 780] },
            'first-fit': { sm: [360, 475], md: [455, 595], lg: [565, 740] },
            reseat: { sm: [265, 360], md: [340, 455], lg: [425, 565] },
            multi: { sm: [900, 1055], md: [1055, 1250], lg: [1275, 1560] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers labor: sleeve assessment, insulation check, secure mounting of the packaged unit, trim and gap review, condensate path check and a heat/cool test cycle. PTAC unit, sleeve, grille, adapter kits and trim are not included. Send the model number, sleeve photos and the electrical label first — plug type, amperage and voltage are verified before booking. New sleeves, new or enlarged sleeve openings and any facade change are not handyman scope and go to your building and a licensed masonry / facade contractor or GC. New circuits, rewiring, receptacle changes and any 208V/230V/240V work go to a NYC Licensed Master Electrician on the permit path. No refrigerant or sealed-system work. Multi-unit pricing assumes the same scope on every unit; 13+ units — send a floor list and we quote from a walkthrough."
    },
    "ac-portable": {
        "title": "Portable AC Setup Estimate",
        "subtitle": "Select your window type and setup scope for an estimated price range.",
        "categories": [
            {
                "label": "Window / Vent Path or Job Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose window type…"
                    },
                    {
                        "value": "double-hung",
                        "label": "Double-hung window (standard kit)"
                    },
                    {
                        "value": "slider",
                        "label": "Slider window or sliding door"
                    },
                    {
                        "value": "casement",
                        "label": "Casement / outswing window"
                    },
                    {
                        "value": "tall-narrow",
                        "label": "Tall or odd-shaped opening (custom panel)"
                    },
                    {
                        "value": "multi",
                        "label": "Multiple portable units, one visit"
                    },
                    {
                        "value": "unsure",
                        "label": "Not sure — I'll send window photos"
                    }
                ]
            },
            {
                "label": "Setup Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "double-hung": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — kit fits, hose routed, cooling check"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — panel trim, weatherstrip seal + drain setup"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — custom-cut insert, long hose route + drain setup"
                        }
                    ],
                    "slider": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — kit fits, hose routed, cooling check"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — panel extension / trim + weatherstrip seal"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — full-height insert for a sliding door + drain setup"
                        }
                    ],
                    "casement": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — adapter kit fits as supplied"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — panel cut to fit + weatherstrip seal"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — custom-cut insert + drain setup"
                        }
                    ],
                    "tall-narrow": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — kit fits with minor trim"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — panel trimmed / extended + sealed"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — custom-cut insert + drain setup"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "2 units — standard kit fit each"
                        },
                        {
                            "value": "md",
                            "label": "3–4 units — standard kit fit each"
                        },
                        {
                            "value": "lg",
                            "label": "5–8 units, scheduled by room — standard kit fit each"
                        }
                    ],
                    "unsure": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — basic vent kit + hose routing"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — trim, sealing and drainage setup"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — a custom vent panel is likely"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'double-hung': { sm: [150, 200], md: [180, 260], lg: [280, 405] },
            slider: { sm: [150, 220], md: [205, 300], lg: [325, 470] },
            casement: { sm: [180, 265], md: [250, 360], lg: [390, 560] },
            'tall-narrow': { sm: [170, 245], md: [230, 335], lg: [360, 520] },
            multi: { sm: [300, 395], md: [380, 595], lg: [520, 900] },
            unsure: { sm: [150, 265], md: [180, 360], lg: [280, 560] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers setup labor: venting-kit fit, panel trimming where practical, weatherstrip sealing, exhaust hose routing without sharp bends, drainage-mode setup and a cooling check. The portable unit, manufacturer window kit, adapter panels and weatherstrip materials are not included unless quoted. An existing window, sliding door or an already-approved exterior vent is required. We do not cut new wall openings or new exterior vent penetrations — that is facade / structural work and goes to your building and a licensed contractor. We never vent into a dryer duct, a chimney or a shared shaft. No refrigerant or sealed-system work. Multi-unit pricing assumes the standard kit fit on every unit; 9+ units — send a room list and we quote from a walkthrough. Until we see photos, the \"not sure\" range spans every window type on this page."
    },
    "ac-bracket": {
        "title": "AC Bracket Installation Estimate",
        "subtitle": "Select your support type, then the floor level and scope, for an estimated price range.",
        "categories": [
            {
                "label": "Support Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose support type…"
                    },
                    {
                        "value": "universal",
                        "label": "Universal support bracket (under-unit)"
                    },
                    {
                        "value": "no-drill",
                        "label": "No-drill / sill-mount bracket"
                    },
                    {
                        "value": "rail",
                        "label": "Mounting rail / angle support (fastened inside)"
                    },
                    {
                        "value": "heavy-duty",
                        "label": "Heavy-duty bracket (15,000+ BTU unit)"
                    },
                    {
                        "value": "manufacturer",
                        "label": "Manufacturer-specific / building-required support"
                    },
                    {
                        "value": "unsure",
                        "label": "Not sure — I'll send window photos"
                    }
                ]
            },
            {
                "label": "Floor Level & Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "universal": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1st–5th floor — bracket only"
                        },
                        {
                            "value": "md",
                            "label": "6th floor+, masonry sill or COI — bracket only · or 1st–5th floor — bracket + AC seated and sealed"
                        },
                        {
                            "value": "lg",
                            "label": "6th floor+, masonry sill or COI — bracket + AC seated, sealed and stability-tested"
                        }
                    ],
                    "no-drill": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1st–5th floor — bracket only"
                        },
                        {
                            "value": "md",
                            "label": "6th floor+, masonry sill or COI — bracket only · or 1st–5th floor — bracket + AC seated and sealed"
                        },
                        {
                            "value": "lg",
                            "label": "6th floor+, masonry sill or COI — bracket + AC seated, sealed and stability-tested"
                        }
                    ],
                    "rail": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1st–5th floor — rail / angles only"
                        },
                        {
                            "value": "md",
                            "label": "6th floor+, masonry sill or COI — rail only · or 1st–5th floor — rail + AC seated and sealed"
                        },
                        {
                            "value": "lg",
                            "label": "6th floor+, masonry sill or COI — rail + AC seated, sealed and stability-tested"
                        }
                    ],
                    "heavy-duty": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1st–5th floor — bracket only"
                        },
                        {
                            "value": "md",
                            "label": "6th floor+, masonry sill or COI — bracket only · or 1st–5th floor — bracket + two-person AC lift"
                        },
                        {
                            "value": "lg",
                            "label": "6th floor+, masonry sill or COI — bracket + two-person AC lift, sealed and stability-tested"
                        }
                    ],
                    "manufacturer": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1st–5th floor — support only"
                        },
                        {
                            "value": "md",
                            "label": "6th floor+, masonry sill or COI — support only · or 1st–5th floor — support + AC seated and sealed"
                        },
                        {
                            "value": "lg",
                            "label": "6th floor+, masonry sill or COI — support + AC seated, sealed and stability-tested"
                        }
                    ],
                    "unsure": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1st–5th floor — support only"
                        },
                        {
                            "value": "md",
                            "label": "6th floor+, masonry sill or COI — support only · or 1st–5th floor — support + AC seated and sealed"
                        },
                        {
                            "value": "lg",
                            "label": "6th floor+, masonry sill or COI — support + AC seated, sealed and stability-tested"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            universal: { sm: [175, 240], md: [225, 315], lg: [315, 430] },
            'no-drill': { sm: [175, 225], md: [205, 285], lg: [285, 390] },
            rail: { sm: [175, 245], md: [235, 320], lg: [320, 440] },
            'heavy-duty': { sm: [225, 315], md: [300, 420], lg: [410, 560] },
            manufacturer: { sm: [205, 285], md: [275, 375], lg: [375, 515] },
            unsure: { sm: [175, 315], md: [205, 420], lg: [285, 560] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers labor: unit-weight and BTU-label review, window, sill and clearance check, bracket compatibility against the manufacturer's instructions, fastening into a sound existing sill or window frame, seating the AC where that tier includes it, gap sealing and a stability test. Bracket hardware and the AC unit are not included unless quoted. NYC DOB guidance requires window ACs to be securely supported and kept out of fire-escape windows and other required exits — we will not install one there. Rebuilding or repairing a sill, masonry and facade restoration, and fabricated or building-approved custom steel supports are not handyman scope — those go to a licensed masonry / facade contractor or your building's GC. If the sill is cracked, spalling, rotted or loose we stop and flag it instead of anchoring into it. Anchoring into a facade or a landmark building needs management approval and usually a COI, and we do not start without it. Until we see photos, the \"not sure\" range spans every support type on this page."
    },
    "ac-cleaning": {
        "title": "AC Deep Cleaning Estimate",
        "subtitle": "Select your unit type and cleaning depth for an estimated price range.",
        "categories": [
            {
                "label": "Unit Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose unit type…"
                    },
                    {
                        "value": "window",
                        "label": "Window AC"
                    },
                    {
                        "value": "ptac",
                        "label": "PTAC / through-wall unit"
                    },
                    {
                        "value": "mini-split",
                        "label": "Ductless mini-split indoor head (accessible)"
                    },
                    {
                        "value": "portable",
                        "label": "Portable AC"
                    },
                    {
                        "value": "multi-mixed",
                        "label": "Multiple units in one visit"
                    }
                ]
            },
            {
                "label": "Cleaning Depth / Quantity",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "window": [
                        {
                            "value": "",
                            "label": "Choose depth…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — cover, filter, accessible coil rinse"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — deep clean: blower area, drain pan, odor treatment"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — heavy buildup, or unit pulled from the window for full access"
                        }
                    ],
                    "ptac": [
                        {
                            "value": "",
                            "label": "Choose depth…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — front cover, filters, accessible coil"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — deep clean: blower wheel + drain pan"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — heavy buildup, or chassis pulled for full access"
                        }
                    ],
                    "mini-split": [
                        {
                            "value": "",
                            "label": "Choose depth…"
                        },
                        {
                            "value": "sm",
                            "label": "1 head — filters, louvers, accessible coil"
                        },
                        {
                            "value": "md",
                            "label": "1 head — bib wash: coil + blower wheel"
                        },
                        {
                            "value": "lg",
                            "label": "1 head — heavy buildup: extended bib wash + drain pan flush"
                        }
                    ],
                    "portable": [
                        {
                            "value": "",
                            "label": "Choose depth…"
                        },
                        {
                            "value": "sm",
                            "label": "1 unit — filters, accessible coil, hose"
                        },
                        {
                            "value": "md",
                            "label": "1 unit — deep clean + tank / drain service"
                        },
                        {
                            "value": "lg",
                            "label": "1 unit — heavy buildup: full strip-down + tank / drain service"
                        }
                    ],
                    "multi-mixed": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "2–3 units, same visit — standard depth each"
                        },
                        {
                            "value": "md",
                            "label": "4–6 units, same visit — standard depth each"
                        },
                        {
                            "value": "lg",
                            "label": "7–12 units (building / hotel floor) — standard depth each"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            window: { sm: [150, 190], md: [190, 250], lg: [250, 340] },
            ptac: { sm: [165, 215], md: [215, 290], lg: [295, 400] },
            'mini-split': { sm: [180, 240], md: [230, 310], lg: [310, 420] },
            portable: { sm: [150, 190], md: [185, 240], lg: [250, 330] },
            'multi-mixed': { sm: [430, 615], md: [565, 835], lg: [740, 1150] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers accessible cleaning only: cover removal, filter wash, accessible coil rinse, blower-area cleaning, drain pan cleaning, reassembly and a performance check. Cleaning supplies are included; replacement filters and parts are not. No refrigerant, sealed-system or inaccessible exterior work — and cleaning will not fix a failed compressor or a unit low on refrigerant. We do not certify mold clearance or perform environmental mold remediation; heavy growth, recurring odor or water damage is flagged and routed to an HVAC specialist or a licensed remediation contractor. Multi-unit pricing assumes the standard cleaning depth on every unit — heavy buildup, a pulled chassis or a unit pulled from the window is added per unit after photos. 13+ units — send a floor list and we quote from a walkthrough."
    },
    "ac-removal": {
        "title": "AC Removal Estimate",
        "subtitle": "Select your unit type and where the unit needs to go for an estimated price range.",
        "categories": [
            {
                "label": "Unit Type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose unit type…"
                    },
                    {
                        "value": "window-small",
                        "label": "Window AC up to 12,000 BTU"
                    },
                    {
                        "value": "window-large",
                        "label": "Window AC 12,000+ BTU (two-person lift)"
                    },
                    {
                        "value": "through-wall",
                        "label": "Through-wall / sleeve unit"
                    },
                    {
                        "value": "ptac",
                        "label": "PTAC unit"
                    },
                    {
                        "value": "multi",
                        "label": "Multiple units (end of season / building)"
                    }
                ]
            },
            {
                "label": "Bracket & Where It Goes",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "window-small": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Unit out, stays in the apartment — window closed & sealed"
                        },
                        {
                            "value": "md",
                            "label": "Unit + bracket out, left inside the apartment"
                        },
                        {
                            "value": "lg",
                            "label": "Unit + bracket out, carried down & disposal coordinated"
                        }
                    ],
                    "window-large": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Unit out, stays in the apartment — window closed & sealed"
                        },
                        {
                            "value": "md",
                            "label": "Unit + bracket out, left inside the apartment"
                        },
                        {
                            "value": "lg",
                            "label": "Unit + bracket out, carried down & disposal coordinated"
                        }
                    ],
                    "through-wall": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Unit pulled from the sleeve, sleeve covered / sealed"
                        },
                        {
                            "value": "md",
                            "label": "Unit + bracket out, left inside the apartment"
                        },
                        {
                            "value": "lg",
                            "label": "Unit + bracket out, carried down & disposal coordinated"
                        }
                    ],
                    "ptac": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Unit pulled from the sleeve, left on site"
                        },
                        {
                            "value": "md",
                            "label": "Unit + bracket out, left inside the apartment"
                        },
                        {
                            "value": "lg",
                            "label": "Unit + bracket out, carried down & disposal coordinated"
                        }
                    ],
                    "multi": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "2–3 units, same visit — same scope each"
                        },
                        {
                            "value": "md",
                            "label": "4–6 units, same visit — same scope each"
                        },
                        {
                            "value": "lg",
                            "label": "7–12 units, scheduled by floor — same scope each"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'window-small': { sm: [165, 210], md: [195, 260], lg: [260, 350] },
            'window-large': { sm: [190, 255], md: [245, 325], lg: [325, 430] },
            'through-wall': { sm: [165, 215], md: [220, 295], lg: [295, 390] },
            ptac: { sm: [165, 220], md: [225, 300], lg: [300, 400] },
            multi: { sm: [480, 665], md: [610, 870], lg: [870, 1250] }
        },
        "cta": {
            "text": "Get Exact Quote",
            "href": "/#contact"
        },
        "disclaimer": "Covers removal labor: safe takedown, bracket removal when requested, window closed, locked and checked for loose panels or sharp hardware, weatherstrip or foam seal where appropriate, and moving the unit to an agreed spot in the building or curbside. Disposal and carter fees are not included — in NYC, older CFC/HCFC (Freon) units normally need a DSNY appointment before collection, and newer R32 or R290 units may need manufacturer take-back or a private carter; we coordinate that path but do not bill it as labor. No refrigerant recovery or sealed-system work. We can cover, cap or weather-seal an empty sleeve, but removing the sleeve itself, patching the wall opening and any facade or exterior work are not handyman scope — those go to your building and a licensed masonry / facade contractor or GC. Multi-unit pricing assumes the same scope on every unit; 13+ units — send a floor list and we quote from a walkthrough."
    },
    "lock-installation": {
        "title": "Lock Installation Estimate",
        "subtitle": "Pick your lock type and how many doors for an estimated price range.",
        "categories": [
            {
                "label": "What are we installing?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose lock type…"
                    },
                    {
                        "value": "deadbolt",
                        "label": "Deadbolt (single or double cylinder)"
                    },
                    {
                        "value": "knob-lever",
                        "label": "Knob or lever set (interior doors)"
                    },
                    {
                        "value": "smart",
                        "label": "Smart / keypad / WiFi lock"
                    },
                    {
                        "value": "mortise",
                        "label": "Mortise lock or apartment cylinder"
                    },
                    {
                        "value": "strike",
                        "label": "Strike plate, latch alignment, reinforcement"
                    },
                    {
                        "value": "other",
                        "label": "Other door hardware"
                    }
                ]
            },
            {
                "label": "Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "deadbolt": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 deadbolt — existing bore, direct swap"
                        },
                        {
                            "value": "md",
                            "label": "1 deadbolt — new bore drilled + strike prep"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 deadbolts / multiple doors"
                        }
                    ],
                    "knob-lever": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 knob or lever set — existing bore"
                        },
                        {
                            "value": "md",
                            "label": "2–3 interior door sets"
                        },
                        {
                            "value": "lg",
                            "label": "4+ door sets (full apartment)"
                        }
                    ],
                    "smart": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Retrofit over existing deadbolt (interior-side only)"
                        },
                        {
                            "value": "md",
                            "label": "Full smart deadbolt swap + app / WiFi setup"
                        },
                        {
                            "value": "lg",
                            "label": "New bore, or metal / fire-rated apartment door"
                        }
                    ],
                    "mortise": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Cylinder swap in existing mortise body"
                        },
                        {
                            "value": "md",
                            "label": "Mortise body + trim replacement"
                        },
                        {
                            "value": "lg",
                            "label": "Metal fire door / heavy prep or pocket rework"
                        }
                    ],
                    "strike": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 door — strike adjust + latch alignment"
                        },
                        {
                            "value": "md",
                            "label": "1 door — strike relocation + reinforcement plate"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 doors, or jamb repair before reinforcing"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 item (chain guard, viewer, closer)"
                        },
                        {
                            "value": "md",
                            "label": "2–3 items or 1 door fully re-hardwared"
                        },
                        {
                            "value": "lg",
                            "label": "4+ items / several doors"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            deadbolt: { sm: [165, 225], md: [210, 290], lg: [290, 435] },
            'knob-lever': { sm: [165, 210], md: [210, 305], lg: [315, 470] },
            smart: { sm: [215, 290], md: [300, 405], lg: [430, 580] },
            mortise: { sm: [175, 250], md: [265, 385], lg: [385, 575] },
            strike: { sm: [165, 200], md: [195, 280], lg: [285, 430] },
            other: { sm: [165, 220], md: [220, 330], lg: [330, 500] }
        },
        "cta": {
            "text": "Get My Lock Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only — the lock hardware is yours to supply. Includes door and bore check, backset and thickness fit, strike plate, and a full key / thumb-turn / latch test. Smart locks: send the product link and photos of both sides of the door first so clearance, battery access, and WiFi or hub requirements are confirmed before the visit. Rekeying, lockouts, and lost keys are locksmith work — we'll say so rather than book it. Building or fire-code limits on apartment entry doors still come from your management."
    },
    "blind-installation": {
        "title": "Blind & Shade Installation Estimate",
        "subtitle": "Pick your blind type and how many windows for an estimated price range.",
        "categories": [
            {
                "label": "Blind or shade type",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose blind type…"
                    },
                    {
                        "value": "roller",
                        "label": "Roller / solar shade"
                    },
                    {
                        "value": "cellular",
                        "label": "Cellular / honeycomb shade"
                    },
                    {
                        "value": "slat",
                        "label": "Venetian / faux-wood / mini blind"
                    },
                    {
                        "value": "roman",
                        "label": "Roman or blackout shade (side channels)"
                    },
                    {
                        "value": "motorized",
                        "label": "Motorized / battery smart shade"
                    },
                    {
                        "value": "other",
                        "label": "Other window covering"
                    }
                ]
            },
            {
                "label": "How many windows?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "roller": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / whole apartment"
                        }
                    ],
                    "cellular": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / whole apartment"
                        }
                    ],
                    "slat": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / whole apartment"
                        }
                    ],
                    "roman": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / whole apartment"
                        }
                    ],
                    "motorized": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / whole apartment"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows"
                        },
                        {
                            "value": "lg",
                            "label": "6+ windows / whole apartment"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            roller: { sm: [150, 210], md: [230, 340], lg: [420, 700] },
            cellular: { sm: [150, 215], md: [240, 355], lg: [395, 590] },
            slat: { sm: [155, 225], md: [255, 375], lg: [420, 630] },
            roman: { sm: [165, 240], md: [270, 395], lg: [440, 660] },
            motorized: { sm: [225, 350], md: [330, 480], lg: [545, 810] },
            other: { sm: [150, 220], md: [240, 360], lg: [400, 600] }
        },
        "cta": {
            "text": "Get My Blind Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only — blinds, brackets, and any special anchors are yours to supply. Includes measuring, inside vs. outside mount decision, bracket layout, leveling, and a raise / lower / tilt / stop test on every window. Old-blind removal, cutting stock blinds to width, plaster, tile, masonry or steel-frame anchoring, and clearance work around radiators, AC units, or deep trim add to the range. Send the product link plus window width and height first — wrong sizing is the one thing photos can't fix on site. Hardwired motorized shades need the power feed done by a licensed electrician; we install battery and plug-in units."
    },
    "door-installation": {
        "title": "Door Installation Estimate",
        "subtitle": "Pick your door type and scope for an estimated price range.",
        "categories": [
            {
                "label": "What kind of door?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose door type…"
                    },
                    {
                        "value": "slab",
                        "label": "Interior slab door (reuse existing frame)"
                    },
                    {
                        "value": "prehung",
                        "label": "Pre-hung door (new jamb included)"
                    },
                    {
                        "value": "closet",
                        "label": "Closet door — bi-fold or bypass/sliding"
                    },
                    {
                        "value": "barn",
                        "label": "Barn door — track and hardware"
                    },
                    {
                        "value": "pocket",
                        "label": "Pocket door — slab or track hardware"
                    },
                    {
                        "value": "storm",
                        "label": "Storm / screen door (exterior)"
                    }
                ]
            },
            {
                "label": "Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "slab": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 door — same size, existing hinge and bore lines up"
                        },
                        {
                            "value": "md",
                            "label": "1 door — trim to fit, mortise hinges, bore for hardware"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 doors"
                        }
                    ],
                    "prehung": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 door — opening square, casing reused"
                        },
                        {
                            "value": "md",
                            "label": "1 door — shim and level, new casing installed"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 doors"
                        }
                    ],
                    "closet": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 opening — bi-fold pair on existing track"
                        },
                        {
                            "value": "md",
                            "label": "1 opening — bypass/sliding with new track"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 closet openings"
                        }
                    ],
                    "barn": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Single door — track into studs"
                        },
                        {
                            "value": "md",
                            "label": "Single door — header board over plaster/masonry"
                        },
                        {
                            "value": "lg",
                            "label": "Double doors or oversized / heavy slab"
                        }
                    ],
                    "pocket": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Re-hang a slab on the existing pocket track"
                        },
                        {
                            "value": "md",
                            "label": "Track, rollers, and hardware replacement"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 pocket doors — slab, track and hardware on existing pocket frames"
                        }
                    ],
                    "storm": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Direct swap into an existing storm-door frame"
                        },
                        {
                            "value": "md",
                            "label": "New storm door — drill, shim, seal, closer"
                        },
                        {
                            "value": "lg",
                            "label": "Oversized or out-of-square opening"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            slab: { sm: [195, 265], md: [280, 390], lg: [430, 610] },
            prehung: { sm: [390, 530], md: [520, 700], lg: [850, 1150] },
            closet: { sm: [210, 290], md: [280, 380], lg: [430, 610] },
            barn: { sm: [310, 430], md: [490, 730], lg: [535, 765] },
            pocket: { sm: [285, 410], md: [340, 475], lg: [510, 725] },
            storm: { sm: [245, 340], md: [340, 475], lg: [475, 670] }
        },
        "cta": {
            "text": "Get My Door Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only — doors, jambs, casing, and hardware are yours to supply (we can recommend sizes and suppliers). Includes measuring, hanging, hinge mortising, latch and strike fitting, floor clearance, and a swing test. Painting, staining, and finish trim are quoted separately. Out-of-square openings, loose or rotted jambs, and uneven floors get flagged with the adjustment needed before we book. Cutting a new opening, removing or re-framing studs, and anything at DOB permit level is not handyman scope and goes to a licensed contractor — a pocket-door frame kit is stud framing, so that part goes to your contractor and we hang the slab and fit the track and hardware once the frame is in. Confirm slab size and swing direction before the visit — label each door if you're doing several."
    },
    "door-repair": {
        "title": "Door Repair Estimate",
        "subtitle": "Tell us what the door is doing and we'll show an estimated price range.",
        "categories": [
            {
                "label": "What's wrong with the door?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the problem…"
                    },
                    {
                        "value": "sticking",
                        "label": "Sticks, rubs, sags, or won't close"
                    },
                    {
                        "value": "latch",
                        "label": "Won't latch — strike plate is off"
                    },
                    {
                        "value": "hardware",
                        "label": "Handle, knob, hinge, or door closer"
                    },
                    {
                        "value": "frame",
                        "label": "Damaged jamb, frame, or trim"
                    },
                    {
                        "value": "hole",
                        "label": "Hole, dent, or scratch in the door"
                    },
                    {
                        "value": "slider",
                        "label": "Closet slider or bi-fold off its track"
                    }
                ]
            },
            {
                "label": "Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "sticking": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 door — hinge adjustment / minor shave"
                        },
                        {
                            "value": "md",
                            "label": "1 door — plane the edge, re-hang, prime the cut"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 doors, or a warped slab we review for replacement"
                        }
                    ],
                    "latch": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 door — strike adjustment"
                        },
                        {
                            "value": "md",
                            "label": "1 door — strike relocation + latch mortise rework"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 doors, or frame movement corrected first"
                        }
                    ],
                    "hardware": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 knob/handle, or one pair of hinges"
                        },
                        {
                            "value": "md",
                            "label": "1 door — full hardware set or a door closer"
                        },
                        {
                            "value": "lg",
                            "label": "2+ doors / full apartment hardware refresh"
                        }
                    ],
                    "frame": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Loose stop, trim, or jamb screws"
                        },
                        {
                            "value": "md",
                            "label": "Split jamb repair / strike-area reinforcement"
                        },
                        {
                            "value": "lg",
                            "label": "Jamb section replaced + new casing"
                        }
                    ],
                    "hole": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Small dent or scratch — fill and sand, primer-ready"
                        },
                        {
                            "value": "md",
                            "label": "Knob-size hollow-core hole — backer, fill, sand"
                        },
                        {
                            "value": "lg",
                            "label": "Large hole or multiple panels, or slab replacement review"
                        }
                    ],
                    "slider": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 opening — back on track, rollers adjusted"
                        },
                        {
                            "value": "md",
                            "label": "1 opening — new rollers, track, or floor guides"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 openings / full bypass hardware replacement"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            sticking: { sm: [165, 205], md: [205, 295], lg: [305, 455] },
            latch: { sm: [165, 195], md: [190, 275], lg: [280, 415] },
            hardware: { sm: [165, 205], md: [205, 295], lg: [320, 475] },
            frame: { sm: [165, 235], md: [255, 370], lg: [475, 780] },
            hole: { sm: [165, 220], md: [220, 310], lg: [320, 475] },
            slider: { sm: [165, 215], md: [220, 310], lg: [345, 505] }
        },
        "cta": {
            "text": "Get My Door Repair Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor and standard fasteners, shims, and filler included; replacement hardware, jamb stock, and paint are yours to supply or we pick them up at cost. Every repair ends with an open / close / latch test, not just a tightened screw. Patched and filled areas are left primer-ready — finish painting is a separate quote. A warped slab that needs replacing, damage from an active leak, or frame movement from building settling usually means a material pickup or second visit, and we tell you that before booking instead of calling it a quick adjustment. Fire-rated apartment entry doors have building and code limits: changes there need management sign-off. Backed by our 1-year workmanship warranty."
    },
    "drywall-repair": {
        "title": "Drywall Patch & Repair Estimate",
        "subtitle": "Pick the damage and the finish you need for an estimated price range.",
        "categories": [
            {
                "label": "What are we fixing?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the damage…"
                    },
                    {
                        "value": "small-holes",
                        "label": "Nail, screw, and anchor holes"
                    },
                    {
                        "value": "hole",
                        "label": "Hole — doorknob to fist size"
                    },
                    {
                        "value": "large-hole",
                        "label": "Large opening — 12″+ or an access cut-out"
                    },
                    {
                        "value": "crack",
                        "label": "Cracks — wall or ceiling seams"
                    },
                    {
                        "value": "water",
                        "label": "Water-stained or water-damaged drywall"
                    },
                    {
                        "value": "texture",
                        "label": "Texture match / skim coat an area"
                    }
                ]
            },
            {
                "label": "Size & finish level",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "small-holes": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Up to 9 holes, one room — primer-ready"
                        },
                        {
                            "value": "md",
                            "label": "10–20 holes across 2–3 rooms — primed"
                        },
                        {
                            "value": "lg",
                            "label": "21–40 holes, up to a studio or 1BR — primed + touch-up in your paint"
                        }
                    ],
                    "hole": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 hole — patch, sand, primer-ready"
                        },
                        {
                            "value": "md",
                            "label": "2–3 holes — patch, texture match, primed"
                        },
                        {
                            "value": "lg",
                            "label": "4+ holes, or 1 hole + repaint the full wall (your paint)"
                        }
                    ],
                    "large-hole": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 opening — backer, tape, 3 coats, primer-ready"
                        },
                        {
                            "value": "md",
                            "label": "1 opening — + texture match and primed"
                        },
                        {
                            "value": "lg",
                            "label": "Multiple openings / access cuts, all primed"
                        }
                    ],
                    "crack": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 short crack (under 3 ft) — tape and finish"
                        },
                        {
                            "value": "md",
                            "label": "Long or multiple cracks, or one ceiling seam"
                        },
                        {
                            "value": "lg",
                            "label": "Ceiling cracks across a room — taped, feathered, primed"
                        }
                    ],
                    "water": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Small stained area — cut out, patch, stain-block, prime"
                        },
                        {
                            "value": "md",
                            "label": "Wall or ceiling section up to about 4 sq ft — source already fixed"
                        },
                        {
                            "value": "lg",
                            "label": "Larger section or several areas — once the leak is fixed and the area is dry"
                        }
                    ],
                    "texture": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Blend one small patch area into existing texture"
                        },
                        {
                            "value": "md",
                            "label": "Skim one wall section smooth"
                        },
                        {
                            "value": "lg",
                            "label": "Skim a full wall or ceiling"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'small-holes': { sm: [165, 205], md: [205, 305], lg: [560, 850] },
            hole: { sm: [200, 310], md: [250, 360], lg: [390, 560] },
            'large-hole': { sm: [350, 500], md: [480, 680], lg: [700, 1000] },
            crack: { sm: [165, 230], md: [255, 370], lg: [410, 600] },
            water: { sm: [205, 295], md: [310, 450], lg: [480, 705] },
            texture: { sm: [165, 245], md: [275, 395], lg: [440, 645] }
        },
        "cta": {
            "text": "Get My Drywall Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor plus standard compound, tape, mesh, and backing included. Paint is not — we prime the patch, and we'll apply your paint for touch-up where the color is available. Compound needs drying time between coats, so larger repairs are often two visits and the range reflects that. Orange peel, knockdown, and smooth finishes are blended as closely as the existing texture, paint age, and lighting allow; an invisible match on an aged wall isn't guaranteed. Active leaks, mold, loose plaster, and cracks that keep coming back get flagged and routed out first — a hidden leak to a Licensed Master Plumber, mold to a licensed remediation contractor, structural movement to your building — because compound fixes none of them. Water-damaged board is replaced only after the source is fixed, the area is dry, and there is no mold. Whole-apartment punch lists above a 1BR are quoted on our apartment turnover page, not here. Suspected asbestos or lead in pre-1980 plaster is routed to a licensed abatement contractor. Backed by our 1-year workmanship warranty."
    },
    "caulking": {
        "title": "Caulking & Sealing Estimate",
        "subtitle": "Pick the area and roughly how much joint for an estimated price range.",
        "categories": [
            {
                "label": "Where does it need sealing?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the area…"
                    },
                    {
                        "value": "tub-shower",
                        "label": "Tub or shower surround"
                    },
                    {
                        "value": "sink-counter",
                        "label": "Sink, vanity, or countertop edge"
                    },
                    {
                        "value": "backsplash",
                        "label": "Kitchen backsplash and counter seam"
                    },
                    {
                        "value": "window-door",
                        "label": "Window and door perimeter (drafts)"
                    },
                    {
                        "value": "trim",
                        "label": "Baseboard, trim, and crown gaps"
                    },
                    {
                        "value": "other",
                        "label": "Other joint or gap"
                    }
                ]
            },
            {
                "label": "How much, and is old caulk coming out?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "tub-shower": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One tub or shower — fresh bead on a clean, sound joint"
                        },
                        {
                            "value": "md",
                            "label": "One tub/shower — strip old caulk, clean, re-seal (to ~20 ft)"
                        },
                        {
                            "value": "lg",
                            "label": "Two bathrooms, or one bath with heavy old-caulk buildup stripped and fully re-sealed"
                        }
                    ],
                    "sink-counter": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 sink or vanity edge (under 8 ft)"
                        },
                        {
                            "value": "md",
                            "label": "2–3 fixtures, old caulk removed"
                        },
                        {
                            "value": "lg",
                            "label": "Full bathroom or kitchen fixture set"
                        }
                    ],
                    "backsplash": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One run under 8 linear ft"
                        },
                        {
                            "value": "md",
                            "label": "8–20 linear ft — strip and re-seal"
                        },
                        {
                            "value": "lg",
                            "label": "Full kitchen perimeter + appliance gaps"
                        }
                    ],
                    "window-door": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1–2 windows — interior perimeter"
                        },
                        {
                            "value": "md",
                            "label": "3–5 windows / doors — draft sealing"
                        },
                        {
                            "value": "lg",
                            "label": "6+ openings / whole-apartment draft seal"
                        }
                    ],
                    "trim": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "One room — baseboard and trim gaps"
                        },
                        {
                            "value": "md",
                            "label": "2–3 rooms"
                        },
                        {
                            "value": "lg",
                            "label": "Full apartment — paintable caulk ahead of painting"
                        }
                    ],
                    "other": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Short run, under 8 linear ft"
                        },
                        {
                            "value": "md",
                            "label": "8–20 linear ft"
                        },
                        {
                            "value": "lg",
                            "label": "More than 20 linear ft / multiple areas"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'tub-shower': { sm: [150, 195], md: [190, 280], lg: [305, 460] },
            'sink-counter': { sm: [150, 180], md: [175, 260], lg: [265, 400] },
            backsplash: { sm: [150, 190], md: [195, 290], lg: [305, 460] },
            'window-door': { sm: [150, 200], md: [210, 315], lg: [350, 535] },
            trim: { sm: [150, 210], md: [230, 345], lg: [375, 570] },
            other: { sm: [150, 190], md: [200, 300], lg: [325, 490] }
        },
        "cta": {
            "text": "Get My Caulking Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor and standard sealant included — mold-resistant silicone for wet areas, paintable acrylic for trim, polyurethane where movement is a factor. We choose per joint instead of using one tube everywhere. Stripping old or moldy caulk, scraping heavy buildup, and joints that need surface cleaning first add to the range. Silicone only bonds to a clean, dry joint, so a wet area usually needs to stay unused for 24 hours after we finish. Surface mold on the old bead comes out with the bead, but mold in or behind the wall — or mold that keeps coming back — is remediation work for a licensed contractor, not a caulk job. If there's an active leak, soft drywall, or loose tile, we flag it for the right trade before sealing — caulk will hide a leak, not fix it. Facade, roof, and exterior above-grade joints are outside handyman scope. Backed by our 1-year workmanship warranty."
    },
    "cabinet-hardware": {
        "title": "Cabinet Hardware Installation Estimate",
        "subtitle": "Pick your hardware situation and piece count for an estimated price range.",
        "categories": [
            {
                "label": "What's the situation?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the job…"
                    },
                    {
                        "value": "knobs-existing",
                        "label": "Knobs — existing holes line up"
                    },
                    {
                        "value": "pulls-existing",
                        "label": "Pulls — existing holes, same center-to-center"
                    },
                    {
                        "value": "new-holes",
                        "label": "No holes yet — template and drill from scratch"
                    },
                    {
                        "value": "respace",
                        "label": "Existing holes are wrong — fill, touch up, re-drill"
                    },
                    {
                        "value": "hinges",
                        "label": "Hinges — replace or upgrade to soft-close"
                    },
                    {
                        "value": "slides",
                        "label": "Drawer slides — replace or adjust"
                    }
                ]
            },
            {
                "label": "How many pieces?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "knobs-existing": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–10 knobs"
                        },
                        {
                            "value": "md",
                            "label": "11–25 knobs"
                        },
                        {
                            "value": "lg",
                            "label": "26+ knobs (full kitchen)"
                        }
                    ],
                    "pulls-existing": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–10 pulls"
                        },
                        {
                            "value": "md",
                            "label": "11–25 pulls"
                        },
                        {
                            "value": "lg",
                            "label": "26+ pulls (full kitchen)"
                        }
                    ],
                    "new-holes": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–10 pieces"
                        },
                        {
                            "value": "md",
                            "label": "11–25 pieces"
                        },
                        {
                            "value": "lg",
                            "label": "26+ pieces (full kitchen)"
                        }
                    ],
                    "respace": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–10 pieces"
                        },
                        {
                            "value": "md",
                            "label": "11–25 pieces"
                        },
                        {
                            "value": "lg",
                            "label": "26+ pieces (full kitchen)"
                        }
                    ],
                    "hinges": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–10 hinges"
                        },
                        {
                            "value": "md",
                            "label": "11–25 hinges"
                        },
                        {
                            "value": "lg",
                            "label": "26+ hinges (full kitchen)"
                        }
                    ],
                    "slides": [
                        {
                            "value": "",
                            "label": "Choose quantity…"
                        },
                        {
                            "value": "sm",
                            "label": "1–3 drawers"
                        },
                        {
                            "value": "md",
                            "label": "4–8 drawers"
                        },
                        {
                            "value": "lg",
                            "label": "9+ drawers"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'knobs-existing': { sm: [150, 180], md: [180, 255], lg: [255, 375] },
            'pulls-existing': { sm: [150, 185], md: [190, 275], lg: [280, 420] },
            'new-holes': { sm: [150, 215], md: [245, 360], lg: [395, 590] },
            respace: { sm: [285, 420], md: [490, 730], lg: [790, 1180] },
            hinges: { sm: [150, 200], md: [215, 315], lg: [345, 520] },
            slides: { sm: [150, 215], md: [245, 360], lg: [395, 590] }
        },
        "cta": {
            "text": "Get My Hardware Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only — knobs, pulls, hinges, and slides are yours to supply. Send the product link and, for pulls, the center-to-center measurement, plus a photo of the fronts showing whether holes already exist; wrong pull sizing is the most common reason a job stalls. Includes a drilling jig or template, spacing layout, alignment checked across the whole run, and secure mounting. Filling and re-drilling mis-spaced holes takes real time and the filled spot isn't always invisible on painted, laminate, or thermofoil doors — we'll do one door first and show you before committing the kitchen. Re-spacing runs roughly double a from-scratch install and usually needs a second visit while filler cures — the range reflects that. Cabinet boxes, door replacement, and refacing are separate quotes."
    },
    "window-repair": {
        "title": "Window Repair Estimate",
        "subtitle": "Tell us what the window is doing and how many for an estimated price range.",
        "categories": [
            {
                "label": "What's the problem?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the problem…"
                    },
                    {
                        "value": "stuck",
                        "label": "Stuck, painted shut, or won't stay open"
                    },
                    {
                        "value": "hardware",
                        "label": "Lock, latch, handle, or crank operator"
                    },
                    {
                        "value": "balance",
                        "label": "Broken balance, spring, or sash cord"
                    },
                    {
                        "value": "weatherstrip",
                        "label": "Drafts — weatherstripping and seals"
                    },
                    {
                        "value": "screen",
                        "label": "Screen torn, loose, or missing"
                    },
                    {
                        "value": "glass",
                        "label": "Cracked or broken glass"
                    }
                ]
            },
            {
                "label": "Scope",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "stuck": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 window — free the sash, clean and wax the track"
                        },
                        {
                            "value": "md",
                            "label": "2–3 windows, or paint-sealed and needs scoring"
                        },
                        {
                            "value": "lg",
                            "label": "4+ windows / a full room serviced"
                        }
                    ],
                    "hardware": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 window — latch or lock replacement"
                        },
                        {
                            "value": "md",
                            "label": "2–3 windows, or a crank operator swap"
                        },
                        {
                            "value": "lg",
                            "label": "4+ windows"
                        }
                    ],
                    "balance": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 window — one balance/spring set, part in hand"
                        },
                        {
                            "value": "md",
                            "label": "1 window — both balances, sash removed and re-set"
                        },
                        {
                            "value": "lg",
                            "label": "2–3 windows"
                        }
                    ],
                    "weatherstrip": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 window — replace weatherstrip, seal drafts"
                        },
                        {
                            "value": "md",
                            "label": "2–4 windows"
                        },
                        {
                            "value": "lg",
                            "label": "5+ windows / whole-apartment draft seal"
                        }
                    ],
                    "screen": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 screen — re-mesh or spline repair"
                        },
                        {
                            "value": "md",
                            "label": "2–4 screens"
                        },
                        {
                            "value": "lg",
                            "label": "5+ screens, or new frames measured and ordered"
                        }
                    ],
                    "glass": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "1 single-pane sash — glass cut, glazed, re-set"
                        },
                        {
                            "value": "md",
                            "label": "1 single-pane sash — measure, order, return to install"
                        },
                        {
                            "value": "lg",
                            "label": "1 standard-size insulated glass unit (IGU) — measured, ordered, installed on a return visit"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            stuck: { sm: [150, 195], md: [260, 420], lg: [365, 545] },
            hardware: { sm: [150, 200], md: [225, 330], lg: [370, 555] },
            balance: { sm: [165, 240], md: [240, 350], lg: [400, 600] },
            weatherstrip: { sm: [150, 195], md: [215, 315], lg: [360, 540] },
            screen: { sm: [150, 190], md: [180, 265], lg: [290, 435] },
            glass: { sm: [190, 275], md: [290, 430], lg: [430, 645] }
        },
        "cta": {
            "text": "Get My Window Repair Quote",
            "href": "/#contact"
        },
        "disclaimer": "Labor only — balances, latches, operators, weatherstrip, screen mesh, and glass are priced separately once we see the window. Includes diagnosis and repeated open / close / lock testing after the repair, not a single try. Glass is measured first and almost always needs a second visit once the pane or IGU arrives; oversized, tempered, laminated, and landmark-building glass goes to a specialty glazier — we refer those out early instead of pricing them here. Full window or frame replacement, facade work, exterior access, and anything at DOB permit level is outside handyman scope. Pre-1980 buildings: painted sashes can involve lead paint, which changes the method — we tell you before we start scraping. Backed by our 1-year workmanship warranty."
    },
    "apartment-turnover": {
        "title": "Apartment Turnover Estimate",
        "subtitle": "Pick the unit size and how deep the punch list goes for a planning range.",
        "categories": [
            {
                "label": "What are we turning over?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the unit…"
                    },
                    {
                        "value": "single-room",
                        "label": "One room or one bathroom only"
                    },
                    {
                        "value": "studio",
                        "label": "Studio / alcove studio"
                    },
                    {
                        "value": "1br",
                        "label": "1 bedroom"
                    },
                    {
                        "value": "2br",
                        "label": "2 bedroom"
                    },
                    {
                        "value": "3br",
                        "label": "3+ bedroom or duplex"
                    },
                    {
                        "value": "office",
                        "label": "Small office or commercial unit"
                    }
                ]
            },
            {
                "label": "How deep is the punch list?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "single-room": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Light — anchor holes patched, fixtures tightened, caulk touch-up"
                        },
                        {
                            "value": "md",
                            "label": "Standard — patches, caulk, door and hardware adjustments"
                        },
                        {
                            "value": "lg",
                            "label": "Deep — repairs + blinds + hardware + patch-and-prep for paint"
                        }
                    ],
                    "studio": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Light — anchor holes patched, fixtures tightened, caulk touch-up"
                        },
                        {
                            "value": "md",
                            "label": "Standard — patches, caulk, doors, locks, blinds, hardware"
                        },
                        {
                            "value": "lg",
                            "label": "Deep — multi-room repairs + fixtures + patch-and-prep for paint"
                        }
                    ],
                    "1br": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Light — anchor holes patched, fixtures tightened, caulk touch-up"
                        },
                        {
                            "value": "md",
                            "label": "Standard — patches, caulk, doors, locks, blinds, hardware"
                        },
                        {
                            "value": "lg",
                            "label": "Deep — multi-room repairs + fixtures + patch-and-prep for paint"
                        }
                    ],
                    "2br": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Light — anchor holes patched, fixtures tightened, caulk touch-up"
                        },
                        {
                            "value": "md",
                            "label": "Standard — patches, caulk, doors, locks, blinds, hardware"
                        },
                        {
                            "value": "lg",
                            "label": "Deep — multi-room repairs + fixtures + patch-and-prep for paint"
                        }
                    ],
                    "3br": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Light — anchor holes patched, fixtures tightened, caulk touch-up"
                        },
                        {
                            "value": "md",
                            "label": "Standard — patches, caulk, doors, locks, blinds, hardware"
                        },
                        {
                            "value": "lg",
                            "label": "Deep — multi-room repairs + fixtures + patch-and-prep for paint"
                        }
                    ],
                    "office": [
                        {
                            "value": "",
                            "label": "Choose scope…"
                        },
                        {
                            "value": "sm",
                            "label": "Light — wall patches, loose fixtures, door adjustments"
                        },
                        {
                            "value": "md",
                            "label": "Standard — patches, doors, locks, blinds, hardware, fixtures"
                        },
                        {
                            "value": "lg",
                            "label": "Deep — multi-room repairs + fixtures + patch-and-prep for paint"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            'single-room': { sm: [195, 290], md: [330, 490], lg: [520, 760] },
            studio: { sm: [280, 420], md: [480, 720], lg: [780, 1150] },
            '1br': { sm: [380, 560], md: [650, 970], lg: [1050, 1550] },
            '2br': { sm: [520, 780], md: [900, 1350], lg: [1450, 2150] },
            '3br': { sm: [750, 1120], md: [1300, 1950], lg: [2600, 4000] },
            office: { sm: [380, 560], md: [680, 1000], lg: [1150, 1700] }
        },
        "cta": {
            "text": "Send My Turnover Punch List",
            "href": "/#contact"
        },
        "disclaimer": "A planning range for a bundled make-ready visit, not a fixed bid — turnover work is confirmed from your room-by-room task list and photos, and the final scope is approved before anything starts. Labor only: blinds, locks, hardware, fixtures, filler, and paint are supplied by you or picked up at cost. Interior painting, floor refinishing, and tile work are separate quotes. Not included and routed to the right licensed trade: new circuits or 240V, panel work, gas piping, new or hidden plumbing lines, sealed-system appliance work, structural changes, DOB permit-level work, and large demolition or debris removal. Send COI wording, elevator and work-hour rules, super contact, and your deadline with the list — building approval still comes from management, not from us."
    },
    "coi-handyman": {
        "title": "COI Handyman Estimate",
        "subtitle": "Pick the work and what your building requires for an estimated price range.",
        "categories": [
            {
                "label": "What work does the unit need?",
                "id": "series",
                "options": [
                    {
                        "value": "",
                        "label": "Choose the work…"
                    },
                    {
                        "value": "mounting",
                        "label": "Mounting — TV, shelves, mirrors, art, curtain rods"
                    },
                    {
                        "value": "assembly",
                        "label": "Furniture assembly / closet system"
                    },
                    {
                        "value": "repairs",
                        "label": "Repairs — doors, locks, drywall, caulking"
                    },
                    {
                        "value": "fixtures",
                        "label": "Fixture swaps — lights, faucets, hardware"
                    },
                    {
                        "value": "ac",
                        "label": "Window AC install or removal"
                    },
                    {
                        "value": "punch-list",
                        "label": "Multi-task punch list / move-in setup"
                    }
                ]
            },
            {
                "label": "What does the building require?",
                "id": "size",
                "dependsOn": "series",
                "optionSets": {
                    "mounting": [
                        {
                            "value": "",
                            "label": "Choose building requirements…"
                        },
                        {
                            "value": "sm",
                            "label": "COI only — certificate holder + additional insured wording"
                        },
                        {
                            "value": "md",
                            "label": "COI + management packet, elevator or freight reservation"
                        },
                        {
                            "value": "lg",
                            "label": "COI + vendor/alteration agreement, work-hour limits, floor protection, super escort"
                        }
                    ],
                    "assembly": [
                        {
                            "value": "",
                            "label": "Choose building requirements…"
                        },
                        {
                            "value": "sm",
                            "label": "COI only — certificate holder + additional insured wording"
                        },
                        {
                            "value": "md",
                            "label": "COI + management packet, elevator or freight reservation"
                        },
                        {
                            "value": "lg",
                            "label": "COI + vendor/alteration agreement, work-hour limits, floor protection, super escort"
                        }
                    ],
                    "repairs": [
                        {
                            "value": "",
                            "label": "Choose building requirements…"
                        },
                        {
                            "value": "sm",
                            "label": "COI only — certificate holder + additional insured wording"
                        },
                        {
                            "value": "md",
                            "label": "COI + management packet, elevator or freight reservation"
                        },
                        {
                            "value": "lg",
                            "label": "COI + vendor/alteration agreement, work-hour limits, floor protection, super escort"
                        }
                    ],
                    "fixtures": [
                        {
                            "value": "",
                            "label": "Choose building requirements…"
                        },
                        {
                            "value": "sm",
                            "label": "COI only — certificate holder + additional insured wording"
                        },
                        {
                            "value": "md",
                            "label": "COI + management packet, elevator or freight reservation"
                        },
                        {
                            "value": "lg",
                            "label": "COI + vendor/alteration agreement, work-hour limits, floor protection, super escort"
                        }
                    ],
                    "ac": [
                        {
                            "value": "",
                            "label": "Choose building requirements…"
                        },
                        {
                            "value": "sm",
                            "label": "COI only — certificate holder + additional insured wording"
                        },
                        {
                            "value": "md",
                            "label": "COI + management packet, elevator or freight reservation"
                        },
                        {
                            "value": "lg",
                            "label": "COI + vendor/alteration agreement, work-hour limits, floor protection, super escort"
                        }
                    ],
                    "punch-list": [
                        {
                            "value": "",
                            "label": "Choose building requirements…"
                        },
                        {
                            "value": "sm",
                            "label": "COI only — certificate holder + additional insured wording"
                        },
                        {
                            "value": "md",
                            "label": "COI + management packet, elevator or freight reservation"
                        },
                        {
                            "value": "lg",
                            "label": "COI + vendor/alteration agreement, work-hour limits, floor protection, super escort"
                        }
                    ]
                }
            }
        ],
        "pricing": {
            mounting: { sm: [195, 300], md: [280, 400], lg: [370, 520] },
            assembly: { sm: [195, 300], md: [280, 400], lg: [370, 520] },
            repairs: { sm: [225, 320], md: [300, 430], lg: [520, 780] },
            fixtures: { sm: [215, 300], md: [285, 400], lg: [370, 520] },
            ac: { sm: [245, 340], md: [320, 450], lg: [420, 590] },
            'punch-list': { sm: [340, 490], md: [430, 620], lg: [850, 1400] }
        },
        "cta": {
            "text": "Start My COI Review",
            "href": "/#contact"
        },
        "disclaimer": "The COI itself is free — this range is the work, labor only, including the real time that building coordination adds (elevator and freight reservations, restricted work hours, floor and lobby protection, super escort). Materials and fixtures are supplied by you or picked up at cost. Send the building's COI sample, certificate holder name and address, additional insured wording, management contact, service address, and your dates and we'll review before scheduling. A COI is not building approval: alteration agreements, board sign-off, and work-hour rules still come from management. New circuits or 240V, panel work, gas piping, new or hidden plumbing lines, sealed-system refrigerant work, roof or structural changes, and DOB permit-level alterations require a Licensed Master Electrician, Licensed Master Plumber, or a permitted contractor — we flag those before booking rather than after."
    }
});

export default function calculator(container) {
    const configKey = container.dataset.config || 'ikea';
    const cfg = CONFIGS[configKey];
    if (!cfg) {
        // Hub configs are derived from the leaf prices below and live in their own
        // file, fetched only on the nine hub pages that ask for one. Inlining them
        // would put 46KB on every page that renders any calculator.
        if (configKey.startsWith('hub-') && !calculator._hubsLoaded) {
            calculator._hubsLoaded = true;
            fetch('/assets/data/hub-calculators.json')
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                    if (!data || !data[configKey]) return;
                    Object.assign(CONFIGS, data);
                    calculator(container);
                })
                .catch(() => {});
        }
        return;
    }

    // State
    let selected = {};

    // Build HTML
    container.innerHTML = `
        <div class="mod-calc">
            <div class="mod-calc__header">
                <span class="section-tag">Instant Estimate</span>
                <h2 class="section-title">${cfg.title}</h2>
                <p class="mod-calc__subtitle">${cfg.subtitle}</p>
            </div>
            <div class="mod-calc__body">
                <div class="mod-calc__selectors">
                    ${cfg.categories.map(cat => `
                        <div class="mod-calc__field" data-field="${cat.id}">
                            <label class="mod-calc__label" for="calc-${cat.id}">${cat.label}</label>
                            <div class="mod-calc__select-wrap">
                                <select class="mod-calc__select" id="calc-${cat.id}" data-cat="${cat.id}"
                                    ${cat.dependsOn ? 'disabled' : ''}>
                                    ${cat.options ? cat.options.map(o =>
        `<option value="${o.value}">${o.label}</option>`
    ).join('') : '<option value="">Choose…</option>'}
                                </select>
                                <svg class="mod-calc__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mod-calc__result" aria-live="polite">
                    <div class="mod-calc__result-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                        </svg>
                        <span>${cfg.placeholder || 'Select service details to see estimate'}</span>
                    </div>
                    <div class="mod-calc__result-price" style="display:none">
                        <div class="mod-calc__price-label">${cfg.priceLabel || 'Estimated Price'}</div>
                        <div class="mod-calc__price-range">
                            <span class="mod-calc__price-lo">$0</span>
                            <span class="mod-calc__price-sep">–</span>
                            <span class="mod-calc__price-hi">$0</span>
                        </div>
                        <p class="mod-calc__disclaimer mod-calc__result-note" style="display:none;font-weight:500"></p>
                        <button type="button" class="btn btn--accent btn--lg mod-calc__cta">${cfg.cta.text}</button>
                        <p class="mod-calc__disclaimer">${cfg.disclaimer}</p>
                        <p class="mod-calc__disclaimer" style="margin-top:6px;font-weight:500">${cfg.floorNote || '⚠️ Minimum repair visit: $150 (any install/attach job)'}</p>
                        <p class="mod-calc__disclaimer" style="margin-top:4px">Price shown is for the work only — NYC sales tax (8.875%) is added separately where applicable. Some capital-improvement installs are tax-exempt with Form ST-124; we'll confirm on your invoice.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // References
    const selects = container.querySelectorAll('.mod-calc__select');
    const placeholder = container.querySelector('.mod-calc__result-placeholder');
    const priceBox = container.querySelector('.mod-calc__result-price');
    const priceLo = container.querySelector('.mod-calc__price-lo');
    const priceHi = container.querySelector('.mod-calc__price-hi');
    const sizeSelect = container.querySelector('[data-cat="size"]');
    const sizeField = container.querySelector('[data-field="size"]');
    let hasUserInteractedWithCalculator = false;
    let hasTrackedCalculatorResult = false;

    // Event: series change → populate size options
    selects.forEach(sel => {
        sel.addEventListener('change', () => {
            hasUserInteractedWithCalculator = true;
            const cat = sel.dataset.cat;
            selected[cat] = sel.value;

            if (cat === 'series' && sizeSelect) {
                const optSet = cfg.categories[1].optionSets[sel.value];
                if (optSet) {
                    sizeSelect.innerHTML = optSet.map(o =>
                        `<option value="${o.value}">${o.label}</option>`
                    ).join('');
                    sizeSelect.disabled = false;
                    sizeSelect.value = '';
                    selected.size = '';
                    if (sizeField) sizeField.classList.add('mod-calc__field--active');
                } else {
                    sizeSelect.innerHTML = '<option value="">Choose…</option>';
                    sizeSelect.disabled = true;
                    selected.size = '';
                    if (sizeField) sizeField.classList.remove('mod-calc__field--active');
                }
            }

            updatePrice();
        });
    });

    // Repair ASAP pricing model — single source of truth, kept in sync with the CRM
    // Knowledge Base so the website and the AI quote the same thing.
    //   REPAIR_MINIMUM ($150): floor for any actual WORK (install / attach / mount /
    //     assemble). This calculator is about work, so every figure it shows or writes
    //     into a lead honors this minimum. A real lead used to arrive as "Double Rod —
    //     1 window (estimated $55–$90)" — below the work minimum.
    //   ASSESSMENT_VISIT_FEE ($99): FOUNDATION ONLY — intentionally not rendered here.
    //     The on-site assessment visit (photos, notes, meter test, NO repair work),
    //     CREDITED toward the project if the customer proceeds; photo / remote estimates
    //     are free. Reserved for the future estimate-only / appliance-diagnostic pages so
    //     they share one source and never quote $99 for work.
    //   SALES_TAX_RATE (8.875% NYC): disclosure-only — shown as a separate note, never
    //     baked into the figure (most jobs are taxable labor, but a subset are non-taxable
    //     capital improvements with Form ST-124, so we don't hard-add it to every quote).
    const PRICING = { REPAIR_MINIMUM: 150, ASSESSMENT_VISIT_FEE: 99, SALES_TAX_RATE: 0.08875 };
    function isAssessmentPath(lo, hi) {
        // A config prices an out-of-scope symptom as the assessment visit
        // (e.g. "breaker trips repeatedly" — we diagnose and route, we don't
        // sell the repair). Exactly [99, 99] means that path, never work.
        return lo === PRICING.ASSESSMENT_VISIT_FEE && hi === PRICING.ASSESSMENT_VISIT_FEE;
    }

    function flooredRange(lo, hi) {
        // Visit mode prices non-work paths (free photo estimate, $99 credited
        // assessment) — those are legitimate sub-$150 figures, so no floor.
        if (cfg.mode === 'visit') return [lo, hi];
        // Same exemption in menu mode for the explicit assessment path,
        // otherwise a "$99, credited" option would render as $150.
        if (isAssessmentPath(lo, hi)) return [lo, hi];
        /* THERE IS DELIBERATELY NO GAS EXEMPTION HERE, and it is the one place where a
           rendered figure and the stored cell differ.
           dryer/gas/sm and range/cooktop/sm are frozen at $125-$180 and $110-$165 by Local
           Law 429 (2025) — the catalog carries them at status "frozen", the generator copies
           them byte-for-byte and never applies the floor to the DATA, and
           pricing/calculator-price-projection.json records both the stored pair and the pair
           this function renders. What the customer is shown is still floored to $150,
           because:
             - the owner's rule is unconditional: $150 is the minimum for work performed, and
               a page offering a $125 gas dryer install contradicts it in public;
             - gas install cannot lawfully be sold without a Licensed Master Plumber right
               now anyway, so the sub-minimum figure would be advertising a job we cannot
               take;
             - the CRM mirrors this exact function (lib/pricing/website-price-table.ts
               flooredRange), so floor-here / floor-there keeps site and CRM agreeing on the
               figure a lead was shown. Exempting gas on one side only would create a
               mismatch on every gas lead.
           This is unchanged behaviour: calc-2026-08-01 rendered $150-$180 for that cell too.
           tests/pricing-catalog-projection.test.mjs pins all three facts — stored value
           frozen, rendered value floored, and the two recorded side by side. */
        return [Math.max(lo, PRICING.REPAIR_MINIMUM), Math.max(hi, PRICING.REPAIR_MINIMUM)];
    }

    function buildQuoteSnapshot(input) {
        /* One implementation, and it lives in main.js, because the window-AC calculator
           lives there too and both must write identical key names. Every page carrying
           data-module="calculator" loads /main.js (all 93 of them), and this runs on a CTA
           click long after load, so the function is there. If it somehow were not, the lead
           still carries calculator_estimate exactly as it does today — nothing regresses. */
        return window.repairAsapBuildQuoteSnapshot?.({ ...input, priceVersion: CALC_PRICE_VERSION }) || null;
    }

    function updatePrice() {
        const series = selected.series;
        const size = selected.size;

        if (!series || !size || !cfg.pricing[series] || !cfg.pricing[series][size]) {
            placeholder.style.display = '';
            priceBox.style.display = 'none';
            return;
        }

        const [lo, hi] = flooredRange(...cfg.pricing[series][size]);

        if (hasUserInteractedWithCalculator && !hasTrackedCalculatorResult) {
            hasTrackedCalculatorResult = true;
            window.repairAsapTrackEvent?.('calculator_result', {
                event_category: 'calculator',
                calculator_config: configKey,
                service: detectServiceFromURL() || '',
                calculator_series: series,
                calculator_size: size,
                estimate_low: lo,
                estimate_high: hi,
                page_path: window.location.pathname,
            });
        }

        // Animate numbers; collapse to a single figure when the floor makes lo === hi
        // (e.g. one curtain rod → "$150", not an awkward "$150–$150").
        const sep = container.querySelector('.mod-calc__price-sep');
        if (lo === 0 && hi === 0) {
            priceLo.textContent = 'FREE';
            priceHi.style.display = 'none';
            if (sep) sep.style.display = 'none';
        } else {
            animateNumber(priceLo, lo);
            if (hi > lo) {
                animateNumber(priceHi, hi);
                priceHi.style.display = '';
                if (sep) sep.style.display = '';
            } else {
                priceHi.style.display = 'none';
                if (sep) sep.style.display = 'none';
            }
        }

        // Per-option note: visit-mode paths, or the assessment escape used by
        // menu-mode configs for symptoms we diagnose but do not repair.
        const noteEl = container.querySelector('.mod-calc__result-note');
        if (noteEl) {
            const note = isAssessmentPath(lo, hi)
                ? 'On-site assessment — credited toward the work if we do the job. This symptom needs eyes on it before anyone quotes a repair, and some fixes route to a licensed trade.'
                : cfg.resultNotes?.[size];
            noteEl.textContent = note || '';
            noteEl.style.display = note ? '' : 'none';
        }

        placeholder.style.display = 'none';
        priceBox.style.display = '';
        priceBox.classList.remove('mod-calc__result-price--visible');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                priceBox.classList.add('mod-calc__result-price--visible');
            });
        });
    }

    function animateNumber(el, target) {
        const duration = 600;
        const start = parseInt(el.textContent.replace(/\D/g, '')) || 0;
        const startTime = performance.now();

        function tick(now) {
            /* Clamp at BOTH ends. requestAnimationFrame hands the callback the FRAME's
               start timestamp, and that timestamp can PRECEDE the performance.now() taken
               above: the frame's rendering update begins, a task inside it runs this code,
               and the callback is then serviced by the same frame. `now - startTime` is
               negative, `progress` is negative, `1 - (1 - progress)^3` is negative, and the
               price box renders a NEGATIVE number for the first frame or two before
               counting up.
               Measured on the live page (b50ee4e6), visible tab, real Chrome, CPU throttled
               6x — a mid-range phone: /services/general-repairs/apartment-turnover/ with
               1br/md rendered "$-31 – $0", then "$-31 – $-55", then "$108 – $-55" before
               settling on the correct $850 – $1500. Reproduced on 4 of 4 runs at 6x and
               20x. Only the upper bound was clamped, so nothing caught it. */
            const elapsed = Math.max(0, now - startTime);
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * eased);
            el.textContent = `$${current}`;
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    // ---- CTA: open quote modal with pre-filled description ----
    const ctaBtn = container.querySelector('.mod-calc__cta');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const series = selected.series;
            const size = selected.size;

            // Build human-readable summary from selections
            let description = '';
            /* Same estimate, in fields instead of prose. The CRM used to receive the price
               only inside `description`, so nothing downstream could read it without
               parsing English. This is a record of what the price box was showing — the
               figures come from the same flooredRange() call that rendered them, and the
               free-photo path deliberately carries no price at all. */
            let snapshot = null;
            if (series && size && cfg.pricing[series]?.[size]) {
                const [lo, hi] = flooredRange(...cfg.pricing[series][size]);

                // Get readable labels from the dropdown options
                const seriesSelect = container.querySelector('[data-cat="series"]');
                const sizeSelectEl = container.querySelector('[data-cat="size"]');
                const seriesLabel = seriesSelect?.selectedOptions?.[0]?.text || series;
                const sizeLabel = sizeSelectEl?.selectedOptions?.[0]?.text || size;

                // Which of the three paths the customer is on, and the selection wording
                // that goes with it. `path` mirrors the branches below one-for-one.
                let path;
                let selectionText;
                // Price is for the work only; NYC sales tax is separate (disclosed below).
                if (cfg.mode === 'visit') {
                    const pathText = size === 'photo'
                        ? 'free photo estimate requested'
                        : size === 'visit'
                            ? '$99 on-site assessment, credited toward the work'
                            : `estimated $${lo}–$${hi}, work only — NYC sales tax separate`;
                    // Drop the label's own "(...)" price hint so it isn't repeated next to pathText
                    const cleanSizeLabel = sizeLabel.replace(/\s*\([^)]*\)\s*$/, '');
                    selectionText = `${seriesLabel} — ${cleanSizeLabel}`;
                    path = size === 'photo'
                        ? 'photo_estimate'
                        : size === 'visit'
                            ? 'assessment_99'
                            : (hi > lo ? 'range' : 'single');
                    description = `${selectionText} (${pathText})`;
                } else if (isAssessmentPath(lo, hi)) {
                    selectionText = `${seriesLabel} — ${sizeLabel}`;
                    path = 'assessment_99';
                    description = `${selectionText} ($99 on-site assessment, credited toward the work; repair scope confirmed on site)`;
                } else {
                    selectionText = `${seriesLabel} — ${sizeLabel}`;
                    path = hi > lo ? 'range' : 'single';
                    description = hi > lo
                        ? `${selectionText} (estimated $${lo}–$${hi}, work only — NYC sales tax separate)`
                        : `${selectionText} (estimated $${lo} minimum repair visit, work only — NYC sales tax separate)`;
                }

                snapshot = buildQuoteSnapshot({
                    configKey,
                    path,
                    // The figures are always handed over; the builder decides which paths
                    // may report a price. 'range' and 'single' do. 'photo_estimate' and
                    // 'assessment_99' do not — the first showed no figure at all, and the
                    // second showed a $99 assessment VISIT fee, which is not a price for
                    // the work and must never reach the CRM as one. Both keep their exact
                    // wording in calculator_estimate. See REPAIR_ASAP_PRICED_QUOTE_PATHS
                    // in main.js.
                    low: lo,
                    high: hi,
                    // The price box renders "FREE" for the free photo path, one figure when
                    // the range collapses, and "$lo–$hi" otherwise (see updatePrice above).
                    rangeText: (lo === 0 && hi === 0) ? 'FREE' : (hi > lo ? `$${lo}–$${hi}` : `$${lo}`),
                    selectionText,
                    displayText: description,
                });
            }

            // Store for quote-modal custom_fields.
            // calculator_estimate keeps its exact historical wording — leads going back to
            // 2026-07 are stored in that form. The snapshot adds fields, it replaces nothing.
            window._calcQuoteData = {
                ...(snapshot || {}),
                calculator_config: configKey,
                calculator_series: series || '',
                calculator_size: size || '',
                calculator_estimate: description
            };

            // Open the quote modal
            if (typeof window.openQuoteModal === 'function') {
                const service = detectServiceFromURL();
                window.repairAsapTrackEvent?.('calculator_quote_click', {
                    event_category: 'calculator',
                    calculator_config: configKey,
                    service: service || '',
                    calculator_series: series || '',
                    calculator_size: size || '',
                    page_path: window.location.pathname,
                });
                window.openQuoteModal(service, { preserveCalcData: true });

                // Pre-fill modal message textarea
                setTimeout(() => {
                    const msgField = document.getElementById('modal-message');
                    if (msgField && description) {
                        msgField.value = description;
                        msgField.classList.add('success');
                    }
                }, 100);
            }
        });
    }

    // Helper: detect service from URL (same logic as quote-modal)
    function detectServiceFromURL() {
        const SERVICE_MAP = {
            'furniture-assembly': 'Furniture Assembly',
            'tv-wall-mounting': 'TV & Wall Mounting',
            'appliance-services': 'Appliance Services',
            'flooring-installation': 'Flooring Installation',
            'painting': 'Painting & Wall Finishes',
            'ac-installation-cleaning': 'AC Installation & Cleaning',
            'plumbing': 'Plumbing',
            'electrical': 'Electrical',
            'general-repairs': 'General Repairs'
        };
        const path = window.location.pathname;
        for (const [slug, value] of Object.entries(SERVICE_MAP)) {
            if (path.includes('/services/' + slug)) return value;
        }
        return null;
    }
}
