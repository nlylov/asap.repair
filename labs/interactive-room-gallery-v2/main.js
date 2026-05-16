/**
 * Repair ASAP — Interactive Room Gallery v2 (prototype)
 * Self-contained. No production scripts, tracking, or widgets touched.
 */
(function () {
    'use strict';

    const PHONE = '+17753107770';

    const rooms = [
        {
            id: 'living',
            label: 'Living room',
            intro: 'Mounting and display work that finishes the main room without turning it into a construction project.',
            services: ['living-tv', 'living-shelves', 'living-art', 'living-projector']
        },
        {
            id: 'kitchen',
            label: 'Kitchen',
            intro: 'A few focused installs and adjustments to upgrade the busiest room in the apartment.',
            services: ['kitchen-dishwasher', 'kitchen-faucet', 'kitchen-cabinets', 'kitchen-backsplash']
        },
        {
            id: 'bathroom',
            label: 'Bathroom',
            intro: 'Careful mounting, clean finishing, and practical minor repair help in tight, wet spaces.',
            services: ['bath-caulk', 'bath-faucet', 'bath-mirror', 'bath-plumbing']
        },
        {
            id: 'bedroom',
            label: 'Bedroom',
            intro: 'Assembly, anchoring, and storage setup that makes the bedroom feel organized and move-in ready.',
            services: ['bed-assembly', 'bed-furniture', 'bed-dresser', 'bed-closet']
        },
        {
            id: 'hallway',
            label: 'Walls & details',
            intro: 'Wall repair, painting, lighting, and small fixes — the details that make the whole home feel cared for.',
            services: ['hall-drywall', 'hall-painting', 'hall-light', 'hall-general']
        }
    ];

    const services = {
        'living-tv': {
            room: 'Living room',
            title: 'TV mounting',
            description: 'Secure mounting with clean placement and cable management options based on wall type and viewing angle.',
            tags: ['Fixed mount', 'Full-motion', 'Cable management', 'Wall-type guidance'],
            url: '/services/tv-wall-mounting/tv-mounting/'
        },
        'living-shelves': {
            room: 'Living room',
            title: 'Shelf mounting',
            description: 'Floating shelves and wall storage installed level, secure, and placed to fit the room rather than fight it.',
            tags: ['Floating shelves', 'Book ledges', 'Wall storage', 'Stud & anchor'],
            url: '/services/tv-wall-mounting/shelf-installation/'
        },
        'living-art': {
            room: 'Living room',
            title: 'Picture hanging',
            description: 'Framed art, gallery walls, and mirrors hung with clean spacing and the right hardware for the wall.',
            tags: ['Gallery walls', 'Mirror hanging', 'Heavy art', 'Layout help'],
            url: '/services/tv-wall-mounting/art-installation/'
        },
        'living-projector': {
            room: 'Living room',
            title: 'Media setup',
            description: 'Projector mounts, soundbar installs, and media-device placement with cable routing kept tidy.',
            tags: ['Projector', 'Soundbar', 'Streaming devices', 'Cable routing'],
            url: '/services/tv-wall-mounting/'
        },

        'kitchen-dishwasher': {
            room: 'Kitchen',
            title: 'Dishwasher installation',
            description: 'Replacement installs using existing connections, with checks for fit, leveling, drain routing, and visible leaks.',
            tags: ['Replacement install', 'Leveling', 'Drain check', 'Fit review'],
            url: '/services/appliance-services/dishwasher-installation/'
        },
        'kitchen-faucet': {
            room: 'Kitchen',
            title: 'Faucet replacement',
            description: 'Kitchen faucet swaps and fixture help for common replacements and small sink-area issues.',
            tags: ['Faucet swap', 'Sprayer setup', 'Small leaks', 'Sink fixtures'],
            url: '/services/plumbing/faucet-installation/'
        },
        'kitchen-cabinets': {
            room: 'Kitchen',
            title: 'Cabinet adjustments',
            description: 'Cabinet doors, pulls, hinges, and small alignment fixes that make everyday storage feel right.',
            tags: ['Door alignment', 'Hinges', 'Pulls & handles', 'Small fixes'],
            url: '/services/general-repairs/cabinet-hardware-installation/'
        },
        'kitchen-backsplash': {
            room: 'Kitchen',
            title: 'Backsplash help',
            description: 'Small backsplash, touch-up, and finish-detail help for areas around counters and sinks.',
            tags: ['Small tile fixes', 'Finish details', 'Caulk touch-ups', 'Wall prep'],
            url: '/services/general-repairs/'
        },

        'bath-caulk': {
            room: 'Bathroom',
            title: 'Bathroom caulking',
            description: 'Clean silicone replacement around tubs, showers, sinks, and wet areas — refreshes the finish without a remodel.',
            tags: ['Tub caulking', 'Shower silicone', 'Sink edges', 'Old caulk removal'],
            url: '/services/general-repairs/caulking/'
        },
        'bath-faucet': {
            room: 'Bathroom',
            title: 'Faucet & fixture help',
            description: 'Bathroom faucets, sink fixtures, and accessory updates handled carefully around tile, counters, and vanity surfaces.',
            tags: ['Faucet replacement', 'Accessory mounting', 'Sink fixtures', 'Small adjustments'],
            url: '/services/plumbing/faucet-installation/'
        },
        'bath-mirror': {
            room: 'Bathroom',
            title: 'Mirror & vanity mounting',
            description: 'Mirrors, medicine cabinets, and vanity-area wall items mounted securely with attention to wall type.',
            tags: ['Mirror mount', 'Medicine cabinets', 'Vanity accessories', 'Tile-aware'],
            url: '/services/tv-wall-mounting/mirror-installation/'
        },
        'bath-plumbing': {
            room: 'Bathroom',
            title: 'Minor plumbing repairs',
            description: 'Small plumbing repair help for common sink, toilet, fixture, and leak-related issues where appropriate.',
            tags: ['Leak checks', 'Toilet help', 'Sink repairs', 'Fixture troubleshooting'],
            url: '/services/plumbing/leak-repair/'
        },

        'bed-assembly': {
            room: 'Bedroom',
            title: 'Bed assembly',
            description: 'Bed frames, storage beds, and wall beds assembled with the right sequence, hardware, and alignment.',
            tags: ['Bed frames', 'Storage beds', 'Wall beds', 'Move-in setup'],
            url: '/services/furniture-assembly/bed-assembly/'
        },
        'bed-furniture': {
            room: 'Bedroom',
            title: 'Furniture assembly',
            description: 'Beds, dressers, wardrobes, desks, and other furniture assembled cleanly and secured when needed.',
            tags: ['Flat-pack', 'Anchoring', 'Desks', 'Bedroom setup'],
            url: '/services/furniture-assembly/'
        },
        'bed-dresser': {
            room: 'Bedroom',
            title: 'Dresser help',
            description: 'Dressers and bedroom storage assembled so drawers, doors, and hardware line up properly.',
            tags: ['Dressers', 'Nightstands', 'Drawer alignment', 'Anti-tip anchors'],
            url: '/services/furniture-assembly/dresser-assembly/'
        },
        'bed-closet': {
            room: 'Bedroom',
            title: 'Closet & wardrobe assembly',
            description: 'Wardrobes, closet organizers, shelves, and rods assembled or adjusted for better storage.',
            tags: ['Wardrobes', 'Closet organizers', 'Shelves & rods', 'Storage setup'],
            url: '/services/furniture-assembly/wardrobe-assembly/'
        },

        'hall-drywall': {
            room: 'Walls & details',
            title: 'Drywall repair',
            description: 'Drywall patching and small repairs for holes, dents, cracks, and everyday wall damage.',
            tags: ['Hole patching', 'Crack repair', 'Wall prep', 'Touch-up ready'],
            url: '/services/general-repairs/drywall-repair/'
        },
        'hall-painting': {
            room: 'Walls & details',
            title: 'Painting',
            description: 'Interior paint help for accent walls, touch-ups, small rooms, and refreshed wall areas.',
            tags: ['Accent walls', 'Touch-ups', 'Room painting', 'Paint prep'],
            url: '/services/painting/'
        },
        'hall-light': {
            room: 'Walls & details',
            title: 'Light fixture help',
            description: 'Common ceiling lights, sconces, and fixture updates installed with a clean, finished look.',
            tags: ['Ceiling fixtures', 'Sconces', 'Chandeliers', 'Fixture swaps'],
            url: '/services/electrical/light-fixture-installation/'
        },
        'hall-general': {
            room: 'Walls & details',
            title: 'General repairs',
            description: 'Small interior repairs, mounting, hardware, and finishing details that help the home feel complete.',
            tags: ['Wall mounting', 'Small repairs', 'Hardware', 'Punch list'],
            url: '/services/general-repairs/'
        }
    };

    /* ----------- Element refs ----------- */

    const scenes = Array.from(document.querySelectorAll('.scene'));
    const callouts = Array.from(document.querySelectorAll('.callout'));
    const stageFrame = document.getElementById('stageFrame');
    const stageViewport = document.getElementById('stageViewport');
    const prevBtn = document.getElementById('prevRoom');
    const nextBtn = document.getElementById('nextRoom');
    const roomNumberEl = document.getElementById('roomNumber');
    const stageTitleEl = document.getElementById('stageTitle');
    const detailCategory = document.getElementById('detailCategory');
    const detailTitle = document.getElementById('detailTitle');
    const detailCopy = document.getElementById('detailCopy');
    const detailTags = document.getElementById('detailTags');
    const detailEl = document.querySelector('.detail');
    const textPhotosLink = document.getElementById('textPhotosLink');
    const learnMoreLink = document.getElementById('learnMoreLink');
    const chipsTrack = document.getElementById('serviceChips');
    const floorList = document.getElementById('roomDots');

    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');

    let activeRoomIndex = 0;
    let activeServiceId = null;
    let touchStartX = 0;
    let touchStartY = 0;

    /* ----------- Helpers ----------- */

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function smsHref(topic) {
        return 'sms:' + PHONE + '?body=' + encodeURIComponent('Hi, I need help with ' + topic + '. Photos:');
    }

    function clearActiveCallouts() {
        callouts.forEach(function (c) {
            c.classList.remove('is-active');
            c.setAttribute('aria-pressed', 'false');
        });
    }

    function flashDetail() {
        if (!detailEl) return;
        detailEl.classList.remove('is-flash');
        // Force reflow so animation restarts.
        void detailEl.offsetWidth;
        detailEl.classList.add('is-flash');
    }

    function renderTags(tags) {
        detailTags.innerHTML = (tags || []).map(function (t) {
            return '<li>' + t + '</li>';
        }).join('');
    }

    /* ----------- Render: room intro ----------- */

    function renderRoomIntro(room) {
        activeServiceId = null;
        clearActiveCallouts();

        roomNumberEl.textContent = pad2(activeRoomIndex + 1);
        stageTitleEl.textContent = room.label;
        detailCategory.textContent = room.label;
        detailTitle.textContent = 'Pick an object to explore';
        detailCopy.textContent = room.intro;

        const previewTags = (room.services || [])
            .map(function (sid) { return services[sid] && services[sid].title; })
            .filter(Boolean);
        renderTags(previewTags);

        textPhotosLink.href = smsHref(room.label + ' services');
        learnMoreLink.href = '/services/';
        learnMoreLink.textContent = 'Browse all services →';

        updateChipsSelection(null);
        flashDetail();
    }

    /* ----------- Render: service ----------- */

    function renderService(serviceId) {
        const s = services[serviceId];
        if (!s) return;

        activeServiceId = serviceId;
        clearActiveCallouts();

        callouts.forEach(function (c) {
            if (c.dataset.service === serviceId) {
                c.classList.add('is-active');
                c.setAttribute('aria-pressed', 'true');
            }
        });

        detailCategory.textContent = s.room;
        detailTitle.textContent = s.title;
        detailCopy.textContent = s.description;
        renderTags(s.tags);

        textPhotosLink.href = smsHref(s.title);
        learnMoreLink.href = s.url || '/services/';
        learnMoreLink.textContent = 'Learn more →';

        updateChipsSelection(serviceId);
        flashDetail();
    }

    /* ----------- Room switching ----------- */

    function setRoom(index, opts) {
        const total = rooms.length;
        activeRoomIndex = ((index % total) + total) % total;

        scenes.forEach(function (scene, i) {
            const isActive = i === activeRoomIndex;
            scene.classList.toggle('is-active', isActive);
            scene.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            scene.querySelectorAll('.callout').forEach(function (c) {
                c.tabIndex = isActive ? 0 : -1;
            });
        });

        const room = rooms[activeRoomIndex];
        renderChips(room);
        updateFloor(activeRoomIndex);
        renderRoomIntro(room);

        if (opts && opts.focusFrame) {
            stageFrame.focus({ preventScroll: true });
        }
    }

    /* ----------- Service chips ----------- */

    function renderChips(room) {
        chipsTrack.innerHTML = (room.services || []).map(function (sid, i) {
            const s = services[sid];
            if (!s) return '';
            return [
                '<button class="stage__chip" type="button" role="tab"',
                ' data-service="', sid, '" aria-selected="false">',
                '<span class="stage__chip__num">', pad2(i + 1), '</span>',
                '<span>', s.title, '</span>',
                '</button>'
            ].join('');
        }).join('');
    }

    function updateChipsSelection(serviceId) {
        Array.from(chipsTrack.children).forEach(function (chip) {
            chip.setAttribute('aria-selected', chip.dataset.service === serviceId ? 'true' : 'false');
        });
    }

    chipsTrack.addEventListener('click', function (e) {
        const chip = e.target.closest('.stage__chip');
        if (!chip) return;
        renderService(chip.dataset.service);
    });

    /* ----------- Floor plan / room nav ----------- */

    function buildFloor() {
        floorList.innerHTML = rooms.map(function (room, i) {
            return [
                '<li>',
                '<button class="stage__floor-item" type="button" role="tab"',
                ' data-room-index="', i, '" aria-current="', i === 0 ? 'true' : 'false', '">',
                '<span class="stage__floor-num">', pad2(i + 1), '</span>',
                '<span>', room.label, '</span>',
                '</button>',
                '</li>'
            ].join('');
        }).join('');
    }

    function updateFloor(index) {
        Array.from(floorList.querySelectorAll('.stage__floor-item')).forEach(function (item, i) {
            item.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
    }

    floorList.addEventListener('click', function (e) {
        const item = e.target.closest('.stage__floor-item');
        if (!item) return;
        setRoom(Number(item.dataset.roomIndex), { focusFrame: false });
    });

    /* ----------- Callout interactions ----------- */

    function calloutInActiveScene(c) {
        return scenes[activeRoomIndex] && scenes[activeRoomIndex].contains(c);
    }

    callouts.forEach(function (c) {
        c.setAttribute('aria-pressed', 'false');

        c.addEventListener('mouseenter', function () {
            if (!hoverCapable.matches) return;
            if (!calloutInActiveScene(c)) return;
            renderService(c.dataset.service);
        });

        c.addEventListener('focus', function () {
            if (!calloutInActiveScene(c)) return;
            renderService(c.dataset.service);
        });

        c.addEventListener('click', function () {
            if (!calloutInActiveScene(c)) return;
            renderService(c.dataset.service);
        });
    });

    /* ----------- Arrows + keyboard + swipe ----------- */

    prevBtn.addEventListener('click', function () { setRoom(activeRoomIndex - 1); });
    nextBtn.addEventListener('click', function () { setRoom(activeRoomIndex + 1); });

    document.addEventListener('keydown', function (e) {
        const tag = e.target && e.target.tagName;
        if (tag && /input|textarea|select/i.test(tag)) return;
        if (e.key === 'ArrowLeft') setRoom(activeRoomIndex - 1);
        if (e.key === 'ArrowRight') setRoom(activeRoomIndex + 1);
    });

    stageViewport.addEventListener('touchstart', function (e) {
        if (!e.changedTouches.length) return;
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    stageViewport.addEventListener('touchend', function (e) {
        if (!e.changedTouches.length) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            setRoom(dx < 0 ? activeRoomIndex + 1 : activeRoomIndex - 1);
        }
    }, { passive: true });

    /* ----------- Boot ----------- */

    buildFloor();
    setRoom(0);
})();
