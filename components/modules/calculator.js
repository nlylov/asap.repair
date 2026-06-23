/* ============================================
   Module: Instant Quote Calculator
   Usage: <div data-module="calculator" data-config="ikea"></div>
   ============================================ */

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
            kallax: { sm: [65, 99], md: [99, 150], lg: [150, 220] },
            pax: { sm: [120, 180], md: [200, 310], lg: [310, 450] },
            malm: { sm: [65, 99], md: [85, 130], lg: [120, 190] },
            hemnes: { sm: [75, 115], md: [115, 165], lg: [180, 280] },
            besta: { sm: [99, 150], md: [165, 260], lg: [260, 400] },
            billy: { sm: [50, 85], md: [115, 165], lg: [180, 260] },
            nordli: { sm: [65, 110], md: [99, 150], lg: [150, 230] },
            other: { sm: [50, 99], md: [99, 165], lg: [165, 290] }
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
            platform: { sm: [65, 99], md: [85, 125], lg: [99, 150] },
            storage: { sm: [99, 150], md: [125, 200], lg: [165, 290] },
            bunk: { sm: [125, 180], md: [165, 250], lg: [230, 350] },
            loft: { sm: [115, 165], md: [150, 230], lg: [200, 310] },
            adjustable: { sm: [65, 110], md: [85, 130], lg: [150, 230] },
            daybed: { sm: [65, 110], md: [99, 150], lg: [130, 200] },
            other: { sm: [50, 99], md: [85, 150], lg: [130, 250] }
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
            freestanding: { sm: [85, 130], md: [130, 200], lg: [200, 310] },
            armoire: { sm: [99, 150], md: [150, 230], lg: [230, 350] },
            'closet-system': { sm: [125, 200], md: [230, 350], lg: [350, 530] },
            'sliding-door': { sm: [130, 200], md: [200, 310], lg: [310, 450] },
            'walk-in': { sm: [165, 250], md: [250, 390], lg: [390, 620] },
            other: { sm: [65, 130], md: [130, 230], lg: [230, 370] }
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
            'floating-vanity': { sm: [99, 150], md: [150, 230], lg: [230, 350] },
            'wall-cabinet': { sm: [65, 110], md: [130, 210], lg: [230, 350] },
            'floating-desk': { sm: [85, 130], md: [130, 200], lg: [200, 310] },
            'wall-unit': { sm: [99, 165], md: [180, 295], lg: [295, 450] },
            'floating-shelf': { sm: [50, 85], md: [99, 165], lg: [165, 260] },
            other: { sm: [50, 99], md: [99, 180], lg: [180, 310] }
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
            small: { sm: [99, 150], md: [130, 180], lg: [165, 230] },
            medium: { sm: [125, 180], md: [165, 230], lg: [200, 280] },
            large: { sm: [165, 230], md: [200, 290], lg: [250, 350] },
            xlarge: { sm: [230, 310], md: [280, 370], lg: [330, 450] }
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
            floating: { sm: [50, 85], md: [99, 165], lg: [165, 260] },
            bracket: { sm: [40, 65], md: [85, 130], lg: [130, 210] },
            ledge: { sm: [40, 65], md: [75, 125], lg: [125, 200] },
            heavy: { sm: [65, 110], md: [130, 210], lg: [210, 330] },
            corner: { sm: [50, 85], md: [99, 155], lg: [155, 250] },
            other: { sm: [40, 85], md: [85, 150], lg: [150, 250] }
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
            single: { sm: [40, 65], md: [99, 165], lg: [165, 260] },
            double: { sm: [55, 90], md: [130, 210], lg: [210, 330] },
            ceiling: { sm: [65, 110], md: [150, 250], lg: [250, 380] },
            bay: { sm: [85, 130], md: [130, 200], lg: [230, 350] },
            tension: { sm: [25, 40], md: [55, 99], lg: [99, 165] },
            other: { sm: [40, 85], md: [99, 180], lg: [180, 295] }
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
            vanity: { sm: [50, 75], md: [75, 115], lg: [115, 180] },
            'full-length': { sm: [50, 85], md: [85, 130], lg: [130, 200] },
            decorative: { sm: [40, 65], md: [65, 110], lg: [110, 165] },
            oversized: { sm: [99, 150], md: [150, 230], lg: [200, 310] },
            frameless: { sm: [55, 90], md: [90, 140], lg: [140, 215] },
            other: { sm: [40, 85], md: [85, 150], lg: [150, 250] }
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
            ceiling: { sm: [125, 180], md: [165, 250], lg: [230, 330] },
            wall: { sm: [99, 150], md: [130, 200], lg: [180, 280] },
            shelf: { sm: [50, 85], md: [85, 130], lg: [115, 180] },
            other: { sm: [85, 150], md: [150, 230], lg: [230, 350] }
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
            fixed: { sm: [99, 150], md: [150, 230], lg: [230, 330] },
            pulldown: { sm: [65, 110], md: [110, 165], lg: [165, 250] },
            motorized: { sm: [125, 190], md: [190, 290], lg: [290, 410] },
            'tab-tension': { sm: [130, 200], md: [200, 310], lg: [310, 450] },
            other: { sm: [65, 125], md: [125, 200], lg: [200, 330] }
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
            simple: { sm: [50, 85], md: [85, 130], lg: [130, 200] },
            lshaped: { sm: [85, 130], md: [130, 200], lg: [200, 295] },
            standing: { sm: [65, 110], md: [110, 165], lg: [165, 250] },
            executive: { sm: [99, 150], md: [165, 250], lg: [250, 370] },
            gaming: { sm: [55, 99], md: [99, 165], lg: [165, 260] },
            other: { sm: [50, 99], md: [99, 165], lg: [165, 280] }
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
            standard: { sm: [50, 85], md: [85, 125], lg: [125, 180] },
            tall: { sm: [55, 90], md: [90, 140], lg: [140, 200] },
            wide: { sm: [65, 110], md: [110, 165], lg: [165, 250] },
            combo: { sm: [65, 110], md: [110, 165], lg: [165, 230] },
            nightstand: { sm: [35, 55], md: [55, 99], lg: [90, 140] },
            other: { sm: [40, 85], md: [85, 150], lg: [150, 230] }
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
            vertical: { sm: [280, 410], md: [410, 615], lg: [615, 900] },
            horizontal: { sm: [280, 410], md: [410, 575], lg: [575, 820] },
            cabinet: { sm: [330, 490], md: [490, 740], lg: [740, 1150] },
            bookcase: { sm: [330, 490], md: [490, 740], lg: [740, 1070] },
            'desk-combo': { sm: [370, 530], md: [530, 820], lg: [820, 1230] },
            other: { sm: [280, 450], md: [450, 700], lg: [700, 1070] }
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
            framed: { sm: [35, 55], md: [65, 115], lg: [125, 215] },
            canvas: { sm: [35, 55], md: [65, 115], lg: [125, 200] },
            'gallery-wall': { sm: [99, 165], md: [165, 260], lg: [260, 395] },
            heavy: { sm: [65, 110], md: [110, 165], lg: [165, 260] },
            'mirror-decor': { sm: [40, 65], md: [65, 115], lg: [115, 180] },
            other: { sm: [35, 65], md: [65, 130], lg: [130, 230] }
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
            kitchen: { sm: [65, 115], md: [165, 290], lg: [330, 530] },
            bathroom: { sm: [50, 85], md: [85, 150], lg: [150, 250] },
            ikea: { sm: [65, 110], md: [130, 210], lg: [230, 350] },
            laundry: { sm: [65, 115], md: [150, 250], lg: [260, 410] },
            floating: { sm: [65, 110], md: [130, 210], lg: [230, 350] },
            other: { sm: [50, 99], md: [115, 200], lg: [215, 350] }
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
            swap: { sm: [125, 180], md: [165, 230], lg: [200, 290] },
            new: { sm: [200, 290], md: [290, 410], lg: [410, 620] },
            builtin: { sm: [150, 215], md: [215, 310], lg: [310, 450] },
            other: { sm: [125, 200], md: [200, 330], lg: [330, 490] }
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
            electric: { sm: [99, 150], md: [150, 215], lg: [230, 330] },
            gas: { sm: [125, 180], md: [180, 260], lg: [290, 410] },
            ventless: { sm: [110, 165], md: [165, 250], lg: [250, 370] },
            stackable: { sm: [125, 180], md: [180, 260], lg: [260, 370] },
            other: { sm: [99, 165], md: [165, 260], lg: [260, 410] }
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
            otr: { sm: [99, 150], md: [150, 230], lg: [230, 345] },
            builtin: { sm: [110, 165], md: [165, 250], lg: [250, 370] },
            undermount: { sm: [85, 130], md: [130, 200], lg: [200, 310] },
            drawer: { sm: [125, 180], md: [180, 280], lg: [280, 410] },
            other: { sm: [85, 150], md: [150, 250], lg: [250, 370] }
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
                    { value: 'gas-freestanding', label: 'Gas Freestanding Range' },
                    { value: 'electric-freestanding', label: 'Electric Freestanding Range' },
                    { value: 'slide-in', label: 'Slide-In Range (Gas or Electric)' },
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
            'electric-freestanding': { sm: [99, 150], md: [150, 215], lg: [230, 330] },
            'slide-in': { sm: [125, 180], md: [180, 280], lg: [280, 410] },
            'wall-oven': { sm: [150, 215], md: [215, 310], lg: [330, 490] },
            cooktop: { sm: [110, 165], md: [165, 250], lg: [260, 395] },
            other: { sm: [99, 180], md: [180, 290], lg: [290, 450] }
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
            freestanding: { sm: [85, 130], md: [130, 200], lg: [215, 310] },
            'french-door': { sm: [99, 150], md: [150, 215], lg: [230, 330] },
            'side-by-side': { sm: [99, 150], md: [150, 215], lg: [215, 310] },
            'counter-depth': { sm: [125, 180], md: [180, 280], lg: [290, 410] },
            mini: { sm: [50, 85], md: [85, 130], lg: [130, 215] },
            other: { sm: [85, 150], md: [150, 250], lg: [250, 370] }
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
            stacked: { sm: [165, 250], md: [250, 345], lg: [370, 530] },
            sidebyside: { sm: [165, 250], md: [250, 345], lg: [370, 530] },
            allinone: { sm: [125, 180], md: [180, 260], lg: [290, 410] },
            'laundry-center': { sm: [150, 215], md: [215, 310], lg: [330, 475] },
            other: { sm: [150, 230], md: [230, 345], lg: [345, 530] }
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
            topload: { sm: [99, 150], md: [150, 215], lg: [230, 330] },
            frontload: { sm: [110, 165], md: [165, 250], lg: [250, 360] },
            stackable: { sm: [110, 165], md: [165, 230], lg: [250, 345] },
            portable: { sm: [50, 85], md: [85, 130], lg: [130, 200] },
            other: { sm: [99, 165], md: [165, 250], lg: [250, 370] }
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

export default function calculator(container) {
    const configKey = container.dataset.config || 'ikea';
    const cfg = CONFIGS[configKey];
    if (!cfg) return;

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
                        <div class="mod-calc__price-label">Estimated Price</div>
                        <div class="mod-calc__price-range">
                            <span class="mod-calc__price-lo">$0</span>
                            <span class="mod-calc__price-sep">–</span>
                            <span class="mod-calc__price-hi">$0</span>
                        </div>
                        <button type="button" class="btn btn--accent btn--lg mod-calc__cta">${cfg.cta.text}</button>
                        <p class="mod-calc__disclaimer">${cfg.disclaimer}</p>
                        <p class="mod-calc__disclaimer" style="margin-top:6px;font-weight:500">⚠️ Minimum repair visit: $150 (any install/attach job)</p>
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

    // Event: series change → populate size options
    selects.forEach(sel => {
        sel.addEventListener('change', () => {
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
    function flooredRange(lo, hi) {
        return [Math.max(lo, PRICING.REPAIR_MINIMUM), Math.max(hi, PRICING.REPAIR_MINIMUM)];
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

        // Animate numbers; collapse to a single figure when the floor makes lo === hi
        // (e.g. one curtain rod → "$150", not an awkward "$150–$150").
        const sep = container.querySelector('.mod-calc__price-sep');
        animateNumber(priceLo, lo);
        if (hi > lo) {
            animateNumber(priceHi, hi);
            priceHi.style.display = '';
            if (sep) sep.style.display = '';
        } else {
            priceHi.style.display = 'none';
            if (sep) sep.style.display = 'none';
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
            const elapsed = now - startTime;
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
            if (series && size && cfg.pricing[series]?.[size]) {
                const [lo, hi] = flooredRange(...cfg.pricing[series][size]);

                // Get readable labels from the dropdown options
                const seriesSelect = container.querySelector('[data-cat="series"]');
                const sizeSelectEl = container.querySelector('[data-cat="size"]');
                const seriesLabel = seriesSelect?.selectedOptions?.[0]?.text || series;
                const sizeLabel = sizeSelectEl?.selectedOptions?.[0]?.text || size;

                // Price is for the work only; NYC sales tax is separate (disclosed below).
                description = hi > lo
                    ? `${seriesLabel} — ${sizeLabel} (estimated $${lo}–$${hi}, work only — NYC sales tax separate)`
                    : `${seriesLabel} — ${sizeLabel} (estimated $${lo} minimum repair visit, work only — NYC sales tax separate)`;
            }

            // Store for quote-modal custom_fields
            window._calcQuoteData = {
                calculator_config: configKey,
                calculator_series: series || '',
                calculator_size: size || '',
                calculator_estimate: description
            };

            // Open the quote modal
            if (typeof window.openQuoteModal === 'function') {
                const service = detectServiceFromURL();
                window.openQuoteModal(service);

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
