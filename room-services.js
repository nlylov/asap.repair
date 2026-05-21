/**
 * Interactive Services by Room — Homepage Block
 * Scoped, isolated from production scripts.
 */
(function () {
  'use strict';
  var PHONE = '+17753107770';
  var rooms = [
    { id:'living', label:'Living Room', img:'/assets/rooms/living.png',
      headline:'Explore the living room',
      intro:'Mounting and display work can make the main room feel finished.',
      services:['living-projector','living-screen','living-shelves','living-art','living-curtain','living-light','living-furniture'] },
    { id:'bedroom', label:'Bedroom', img:'/assets/rooms/bedroom.png',
      headline:'Explore the bedroom',
      intro:'Assembly, mounting, and storage setup help a bedroom feel move-in ready.',
      services:['bed-tv','bed-bed','bed-dresser','bed-closet','bed-curtain','bed-mirror','bed-shelf','bed-furniture'] },
    { id:'kitchen', label:'Kitchen', img:'/assets/rooms/kitchen.png',
      headline:'Explore the kitchen',
      intro:'Focused installs and adjustments for the busiest room in the home.',
      services:['kit-dishwasher','kit-faucet','kit-backsplash','kit-cabinets','kit-hardware','kit-plumbing','kit-outlet','kit-light'] },
    { id:'bathroom', label:'Bathroom', img:'/assets/rooms/bathroom.png',
      headline:'Explore the bathroom',
      intro:'Careful mounting, clean finishing, and practical minor repair help.',
      services:['bath-caulk','bath-faucet','bath-mirror','bath-vanity','bath-toilet','bath-towel','bath-plumbing','bath-light'] },
    { id:'walls', label:'Walls & Floors', img:'/assets/rooms/walls.png',
      headline:'Walls, floors & finishes',
      intro:'Wall repair, painting, flooring, and small fixes that make the home feel cared for.',
      services:['wall-flooring','wall-checker','wall-wallpaper','wall-painting','wall-drywall','wall-baseboard','wall-door','wall-general'] },
    { id:'ac', label:'AC & Utility', img:'/assets/rooms/ac.png',
      headline:'AC & utility area',
      intro:'Window AC, appliance setup, and small utility-area tasks.',
      services:['ac-install','ac-clean','ac-appliance','ac-shelf','ac-outlet','ac-general'] },
    { id:'outdoor', label:'Outdoor', img:'/assets/rooms/outdoor.png',
      headline:'Backyard & outdoor',
      intro:'Gazebo, shed, outdoor lighting, furniture, and exterior help.',
      services:['out-gazebo','out-shed','out-light','out-paint','out-furniture','out-fence','out-general'] }
  ];

  var S = {
    'living-projector':{ room:'Living Room', title:'Projector Installation', x:68,y:6, side:'left',
      desc:'Mounting and placement help for home projectors, with attention to wall/ceiling surface and room layout.',
      send:['Projector model','Ceiling photo','Room layout photo'],
      tags:['Ceiling mount','Wall mount','Cable routing'],
      url:'/services/tv-wall-mounting/projector-installation/' },
    'living-screen':{ room:'Living Room', title:'Projector Screen', x:38,y:32, side:'right',
      desc:'Screen mounting and alignment for living rooms, media rooms, and apartments.',
      send:['Screen size','Wall photo','Room width'],
      tags:['Pull-down screen','Fixed frame','Wall mount'],
      url:'/services/tv-wall-mounting/projector-screen-installation/' },
    'living-shelves':{ room:'Living Room', title:'Shelf Mounting', x:6,y:28, side:'right',
      desc:'Floating shelves and wall storage installed level, secure, and placed to fit the room.',
      send:['Shelf type/photo','Wall photo','Stud location'],
      tags:['Floating shelves','Book ledges','Wall storage'],
      url:'/services/tv-wall-mounting/shelf-installation/' },
    'living-art':{ room:'Living Room', title:'Picture Hanging', x:14,y:48, side:'right',
      desc:'Framed art, gallery walls, and mirrors hung with clean spacing and the right hardware.',
      send:['Art dimensions','Wall photo','Layout preference'],
      tags:['Gallery walls','Heavy art','Mirror hanging'],
      url:'/services/tv-wall-mounting/art-installation/' },
    'living-curtain':{ room:'Living Room', title:'Curtain Rod Installation', x:78,y:16, side:'left',
      desc:'Curtain rods, drapery hardware, and window treatments installed with proper alignment.',
      send:['Window photo','Rod type','Curtain weight'],
      tags:['Curtain rods','Drapery hardware','Blinds'],
      url:'/services/tv-wall-mounting/curtain-rod-installation/' },
    'living-light':{ room:'Living Room', title:'Light Fixture Replacement', x:48,y:22, side:'left',
      desc:'Replacement of existing light fixtures where safe and appropriate.',
      send:['Current fixture photo','New fixture model','Ceiling type'],
      tags:['Pendant lights','Chandeliers','Sconces'],
      url:'/services/electrical/light-fixture-installation/' },
    'living-furniture':{ room:'Living Room', title:'Furniture Assembly', x:55,y:72, side:'left',
      desc:'Sofas, tables, media consoles, and other furniture assembled and placed.',
      send:['Furniture brand/model','Box photo','Room photo'],
      tags:['Media console','Sofa legs','Coffee table'],
      url:'/services/furniture-assembly/' },

    'bed-tv':{ room:'Bedroom', title:'TV Mounting', x:22,y:40, side:'right',
      desc:'Secure TV mounting with clean placement and cable management options depending on wall type.',
      send:['TV size/model','Wall photo','Mount type'],
      tags:['Fixed mount','Full-motion','Cable management'],
      url:'/services/tv-wall-mounting/tv-mounting/' },
    'bed-bed':{ room:'Bedroom', title:'Bed Assembly', x:60,y:62, side:'left',
      desc:'Bed frames, headboards, and bedroom furniture assembled cleanly and securely.',
      send:['Bed brand/model','Box count','Room photo'],
      tags:['Bed frames','Storage beds','Headboards'],
      url:'/services/furniture-assembly/bed-assembly/' },
    'bed-dresser':{ room:'Bedroom', title:'Dresser Assembly', x:20,y:60, side:'right',
      desc:'Dressers and storage furniture assembled so drawers and hardware line up properly.',
      send:['Dresser model','Hardware photo','Room space'],
      tags:['Dressers','Nightstands','Anti-tip anchor'],
      url:'/services/furniture-assembly/dresser-assembly/' },
    'bed-closet':{ room:'Bedroom', title:'Closet / Wardrobe Assembly', x:92,y:40, side:'left',
      desc:'Wardrobes, closet systems, and storage units assembled and installed where appropriate.',
      send:['Wardrobe model','Wall/closet photo','Hardware'],
      tags:['Wardrobes','Closet organizers','PAX systems'],
      url:'/services/furniture-assembly/wardrobe-assembly/' },
    'bed-curtain':{ room:'Bedroom', title:'Blinds / Curtain Rod', x:48,y:12, side:'left',
      desc:'Window treatment hardware installed with careful alignment.',
      send:['Window photo','Rod or blind type','Measurements'],
      tags:['Curtain rods','Blackout blinds','Roman shades'],
      url:'/services/general-repairs/blind-installation/' },
    'bed-mirror':{ room:'Bedroom', title:'Mirror Mounting', x:76,y:30, side:'left',
      desc:'Mirrors mounted safely based on wall type and weight.',
      send:['Mirror size/weight','Wall photo','Mounting preference'],
      tags:['Round mirrors','Full-length','Heavy mirrors'],
      url:'/services/tv-wall-mounting/mirror-installation/' },
    'bed-shelf':{ room:'Bedroom', title:'Shelf Mounting', x:18,y:18, side:'right',
      desc:'Bedroom shelves and wall storage mounted cleanly.',
      send:['Shelf photo','Wall type','Weight estimate'],
      tags:['Floating shelves','Book ledges','Display shelves'],
      url:'/services/tv-wall-mounting/shelf-installation/' },
    'bed-furniture':{ room:'Bedroom', title:'Furniture Assembly', x:75,y:72, side:'left',
      desc:'IKEA, Wayfair, West Elm, Amazon, and other customer-purchased furniture assembled.',
      send:['Brand/model','Number of boxes','Room photo'],
      tags:['IKEA','Wayfair','West Elm','Amazon'],
      url:'/services/furniture-assembly/' },

    'kit-dishwasher':{ room:'Kitchen', title:'Dishwasher Installation', x:82,y:62, side:'left',
      desc:'Dishwasher installation using existing connections, with checks for fit, leveling, and leaks.',
      send:['Dishwasher model','Under-counter photo','Connection photo'],
      tags:['Replacement installs','Leveling','Connection checks'],
      url:'/services/appliance-services/dishwasher-installation/' },
    'kit-faucet':{ room:'Kitchen', title:'Faucet Replacement', x:62,y:42, side:'left',
      desc:'Faucet replacement and fixture help using existing plumbing connections.',
      send:['New faucet model','Under-sink photo','Current faucet photo'],
      tags:['Faucet swap','Sprayer setup','Leak help'],
      url:'/services/plumbing/faucet-installation/' },
    'kit-backsplash':{ room:'Kitchen', title:'Backsplash Installation', x:72,y:30, side:'left',
      desc:'Small backsplash and tile-related installation help where appropriate.',
      send:['Tile type','Wall area photo','Measurements'],
      tags:['Subway tile','Small tile fixes','Wall prep'],
      url:'/services/general-repairs/' },
    'kit-cabinets':{ room:'Kitchen', title:'Cabinet Adjustments', x:52,y:16, side:'left',
      desc:'Cabinet doors, hinges, alignment, and small adjustments.',
      send:['Cabinet photo','Issue description','Hardware type'],
      tags:['Door alignment','Hinge swaps','Soft-close'],
      url:'/services/general-repairs/' },
    'kit-hardware':{ room:'Kitchen', title:'Cabinet Hardware', x:42,y:52, side:'right',
      desc:'Handles, pulls, knobs, and cabinet hardware installed cleanly.',
      send:['Hardware photo','Number of pieces','Cabinet type'],
      tags:['Pulls','Knobs','Handles'],
      url:'/services/general-repairs/cabinet-hardware-installation/' },
    'kit-plumbing':{ room:'Kitchen', title:'Minor Plumbing Help', x:56,y:58, side:'left',
      desc:'Minor fixture and under-sink help. For major plumbing or licensed work, we\'ll let you know.',
      send:['Under-sink photo','Issue photo','Description'],
      tags:['Leak checks','Disposal help','P-trap'],
      url:'/services/plumbing/' },
    'kit-outlet':{ room:'Kitchen', title:'Outlet Help', x:54,y:35, side:'right',
      desc:'Existing outlet replacement or fixture-related help only where appropriate.',
      send:['Outlet photo','Location','Issue description'],
      tags:['Outlet replacement','Cover plates','GFCI'],
      url:'/services/electrical/outlet-installation/' },
    'kit-light':{ room:'Kitchen', title:'Light Fixture Replacement', x:24,y:8, side:'right',
      desc:'Replacement of existing kitchen light fixtures where safe and appropriate.',
      send:['Current fixture photo','New fixture model','Ceiling type'],
      tags:['Pendant lights','Under-cabinet','Recessed'],
      url:'/services/electrical/light-fixture-installation/' },

    'bath-caulk':{ room:'Bathroom', title:'Bathroom Caulking', x:68,y:72, side:'left',
      desc:'Clean silicone replacement for tubs, showers, sinks, and wet areas.',
      send:['Tub/shower photo','Problem area photo','Caulk color preference'],
      tags:['Tub caulking','Shower seams','Sink edges'],
      url:'/services/general-repairs/caulking/' },
    'bath-faucet':{ room:'Bathroom', title:'Faucet Repair / Replacement', x:30,y:52, side:'right',
      desc:'Bathroom faucet and fixture help using existing connections.',
      send:['Current faucet photo','New faucet model','Under-sink photo'],
      tags:['Faucet replacement','Handles','Spray hose'],
      url:'/services/plumbing/faucet-installation/' },
    'bath-mirror':{ room:'Bathroom', title:'Mirror Mounting', x:25,y:25, side:'right',
      desc:'Bathroom mirrors mounted with care based on size, wall type, and weight.',
      send:['Mirror dimensions','Wall type','Weight'],
      tags:['LED mirrors','Medicine cabinets','Heavy mirrors'],
      url:'/services/tv-wall-mounting/mirror-installation/' },
    'bath-vanity':{ room:'Bathroom', title:'Vanity Help', x:28,y:65, side:'right',
      desc:'Vanity-related assembly, adjustment, and installation help where appropriate.',
      send:['Vanity model','Bathroom photo','Plumbing photo'],
      tags:['Assembly','Adjustment','Hardware'],
      url:'/services/plumbing/bathroom-fixture-installation/' },
    'bath-toilet':{ room:'Bathroom', title:'Toilet Repair', x:84,y:78, side:'left',
      desc:'Minor toilet repair and replacement help where appropriate.',
      send:['Toilet photo','Issue description','Model if known'],
      tags:['Running toilet','Seat replacement','Flapper'],
      url:'/services/plumbing/toilet-installation/' },
    'bath-towel':{ room:'Bathroom', title:'Towel Bar Installation', x:88,y:52, side:'left',
      desc:'Towel bars, hooks, shelves, and bathroom accessories mounted securely.',
      send:['Hardware photo','Wall type','Location preference'],
      tags:['Towel bars','Hooks','Shelves'],
      url:'/services/general-repairs/' },
    'bath-plumbing':{ room:'Bathroom', title:'Minor Plumbing Repairs', x:35,y:78, side:'right',
      desc:'Minor fixture and leak troubleshooting. For major plumbing or licensed work, we\'ll let you know.',
      send:['Problem area photo','Description','Under-sink photo'],
      tags:['Leak checks','Drain help','Fixture issues'],
      url:'/services/plumbing/leak-repair/' },
    'bath-light':{ room:'Bathroom', title:'Light Fixture Replacement', x:12,y:14, side:'right',
      desc:'Replacement of existing bathroom light fixtures where safe and appropriate.',
      send:['Current fixture','New fixture model','Location'],
      tags:['Vanity lights','Sconces','Ceiling fixtures'],
      url:'/services/electrical/light-fixture-installation/' },

    'wall-flooring':{ room:'Walls & Floors', title:'Flooring Installation', x:58,y:82, side:'left',
      desc:'Flooring installation help for suitable materials and rooms, with careful cuts and transitions.',
      send:['Floor material','Room photo','Square footage'],
      tags:['Laminate','Vinyl plank','Click-lock'],
      url:'/services/flooring-installation/' },
    'wall-checker':{ room:'Walls & Floors', title:'Checkerboard Flooring', x:30,y:82, side:'right',
      desc:'Patterned floor installation such as black-and-white checkerboard layouts where appropriate.',
      send:['Room photo','Floor dimensions','Pattern preference'],
      tags:['B&W pattern','Peel & stick','Vinyl tile'],
      url:'/services/painting/checkerboard-floor-painting/' },
    'wall-wallpaper':{ room:'Walls & Floors', title:'Wallpaper Installation', x:10,y:38, side:'right',
      desc:'Wallpaper and wall covering installation for feature walls and rooms.',
      send:['Wallpaper rolls/link','Wall photo','Wall dimensions'],
      tags:['Feature walls','Peel & stick','Paste wallpaper'],
      url:'/services/painting/wallpaper-installation/' },
    'wall-painting':{ room:'Walls & Floors', title:'Painting', x:82,y:35, side:'left',
      desc:'Interior painting and wall finish help, including prep and touch-ups.',
      send:['Wall photo','Room size','Color preference'],
      tags:['Accent walls','Touch-ups','Full room'],
      url:'/services/painting/interior-painting/' },
    'wall-drywall':{ room:'Walls & Floors', title:'Drywall Repair', x:82,y:18, side:'left',
      desc:'Drywall patching, wall repair, and surface prep.',
      send:['Damage photo','Size estimate','Wall type'],
      tags:['Hole patching','Crack repair','Skim coat'],
      url:'/services/general-repairs/drywall-repair/' },
    'wall-baseboard':{ room:'Walls & Floors', title:'Baseboard / Trim Help', x:18,y:68, side:'right',
      desc:'Baseboards, trim, small finish carpentry, and detail work.',
      send:['Area photo','Trim type','Linear footage'],
      tags:['Baseboard install','Quarter round','Shoe molding'],
      url:'/services/flooring-installation/baseboard-installation/' },
    'wall-door':{ room:'Walls & Floors', title:'Door Hardware / Lock', x:42,y:38, side:'right',
      desc:'Door handles, locks, hinges, and hardware replacement.',
      send:['Current hardware photo','New hardware','Door type'],
      tags:['Handles','Deadbolts','Hinges'],
      url:'/services/general-repairs/lock-installation/' },
    'wall-general':{ room:'Walls & Floors', title:'General Repairs', x:62,y:62, side:'left',
      desc:'Small repairs and punch-list fixes around the home.',
      send:['Problem photo','Description','Location'],
      tags:['Wall mounting','Small repairs','Punch list'],
      url:'/services/general-repairs/' },

    'ac-install':{ room:'AC & Utility', title:'Window AC Installation', x:52,y:42, side:'left',
      desc:'Window AC unit installation and setup help for apartments and homes.',
      send:['AC model','Window photo','Window measurements'],
      tags:['Window units','Bracket install','Seal/foam'],
      url:'/services/ac-installation-cleaning/window-ac-installation/' },
    'ac-clean':{ room:'AC & Utility', title:'AC Cleaning', x:52,y:58, side:'left',
      desc:'Basic AC cleaning and maintenance help for window or portable units where appropriate.',
      send:['AC unit photo','Filter photo','Unit age'],
      tags:['Filter cleaning','Coil wash','Seasonal service'],
      url:'/services/ac-installation-cleaning/ac-deep-cleaning/' },
    'ac-appliance':{ room:'AC & Utility', title:'Appliance Help', x:82,y:38, side:'left',
      desc:'Small appliance setup and installation help depending on the appliance and connections.',
      send:['Appliance model','Location photo','Connection type'],
      tags:['Setup','Installation','Connections'],
      url:'/services/appliance-services/' },
    'ac-shelf':{ room:'AC & Utility', title:'Shelf Mounting', x:18,y:22, side:'right',
      desc:'Utility shelves and storage mounted where appropriate.',
      send:['Shelf type','Wall photo','Weight estimate'],
      tags:['Wall shelves','Utility storage','Brackets'],
      url:'/services/tv-wall-mounting/shelf-installation/' },
    'ac-outlet':{ room:'AC & Utility', title:'Outlet Help', x:18,y:78, side:'right',
      desc:'Existing outlet-related help where safe and appropriate. If licensed electrical work is required, we\'ll let you know.',
      send:['Outlet photo','Issue description','Location'],
      tags:['Outlet replacement','Cover plates','GFCI'],
      url:'/services/electrical/outlet-installation/' },
    'ac-general':{ room:'AC & Utility', title:'General Repairs', x:50,y:82, side:'left',
      desc:'Small repair and setup tasks around the room.',
      send:['Problem photo','Description','Location'],
      tags:['Small repairs','Setup help','Maintenance'],
      url:'/services/general-repairs/' },

    'out-gazebo':{ room:'Outdoor', title:'Gazebo Assembly', x:18,y:38, side:'right',
      desc:'Gazebo and outdoor structure assembly for yards, patios, and outdoor spaces.',
      send:['Gazebo model','Assembly area photo','Box count'],
      tags:['Hardtop','Soft-top','Steel frame'],
      url:'/services/general-repairs/gazebo-assembly/' },
    'out-shed':{ room:'Outdoor', title:'Storage Shed Assembly', x:45,y:32, side:'left',
      desc:'Plastic or prefab storage shed assembly, including common Home Depot / Lowe\'s style sheds.',
      send:['Shed model','Assembly area photo','Foundation'],
      tags:['Resin sheds','Wood sheds','Prefab kits'],
      url:'/services/general-repairs/' },
    'out-light':{ room:'Outdoor', title:'Outdoor Light Replacement', x:88,y:32, side:'left',
      desc:'Replacement of existing outdoor light fixtures where safe and appropriate.',
      send:['Current fixture','New fixture','Location photo'],
      tags:['Lanterns','Sconces','Motion lights'],
      url:'/services/electrical/light-fixture-installation/' },
    'out-paint':{ room:'Outdoor', title:'Exterior Painting', x:88,y:55, side:'left',
      desc:'Exterior touch-up and painting help where appropriate.',
      send:['Area photo','Surface type','Color preference'],
      tags:['Touch-ups','Trim paint','Small areas'],
      url:'/services/painting/' },
    'out-furniture':{ room:'Outdoor', title:'Patio Furniture Assembly', x:58,y:58, side:'left',
      desc:'Outdoor furniture, patio sets, and storage pieces assembled.',
      send:['Furniture model','Box count','Assembly area'],
      tags:['Dining sets','Lounge chairs','Umbrellas'],
      url:'/services/furniture-assembly/' },
    'out-fence':{ room:'Outdoor', title:'Fence / Gate Hardware', x:78,y:48, side:'left',
      desc:'Small fence, gate, latch, and hardware help where appropriate.',
      send:['Gate/fence photo','Hardware type','Issue'],
      tags:['Gate latches','Hinges','Lock hardware'],
      url:'/services/general-repairs/' },
    'out-general':{ room:'Outdoor', title:'General Outdoor Repairs', x:55,y:78, side:'right',
      desc:'Small exterior repairs and setup tasks.',
      send:['Problem photo','Description','Location'],
      tags:['Small repairs','Mounting','Assembly'],
      url:'/services/general-repairs/' }
  };

  /* DOM refs */
  var slides = document.querySelectorAll('.rsm-slide');
  var callouts = document.querySelectorAll('.rsm-callout');
  var prevBtn = document.getElementById('rsmPrev');
  var nextBtn = document.getElementById('rsmNext');
  var viewport = document.getElementById('rsmViewport');
  var dotsWrap = document.getElementById('rsmDots');
  var chipsWrap = document.getElementById('rsmChips');
  var detRoom = document.getElementById('rsmDetailRoom');
  var detTitle = document.getElementById('rsmDetailTitle');
  var detCopy = document.getElementById('rsmDetailCopy');
  var detSendTitle = document.getElementById('rsmSendTitle');
  var detTags = document.getElementById('rsmDetailTags');
  var detText = document.getElementById('rsmTextLink');
  var detLearn = document.getElementById('rsmLearnLink');
  if (!slides.length || !viewport) return;

  var idx = 0, activeService = null, touchX = 0, touchY = 0;

  function smsHref(topic) {
    return 'sms:' + PHONE + '?body=' + encodeURIComponent('Hi, I need help with ' + topic + '. Photos:');
  }

  function renderTags(arr) {
    return arr.map(function(t){ return '<li>' + t + '</li>'; }).join('');
  }

  function clearCallouts() {
    callouts.forEach(function(c){ c.classList.remove('is-active'); });
    document.querySelectorAll('.rsm-service-chip').forEach(function(c){ c.setAttribute('aria-pressed','false'); });
  }

  function showRoomIntro(room) {
    activeService = null;
    clearCallouts();
    detRoom.textContent = room.label;
    detTitle.textContent = room.headline;
    detCopy.textContent = room.intro;
    detSendTitle.style.display = 'none';
    detTags.innerHTML = room.services.map(function(sid){
      var s = S[sid]; if (!s) return '';
      return '<li><a href="' + s.url + '">' + s.title + '</a></li>';
    }).join('');
    detText.href = smsHref(room.label + ' services');
    detLearn.href = '/services/';
    detLearn.textContent = 'All Services';
  }

  function showService(sid) {
    var s = S[sid]; if (!s) return;
    activeService = sid;
    clearCallouts();
    callouts.forEach(function(c){ if(c.dataset.service===sid) c.classList.add('is-active'); });
    document.querySelectorAll('.rsm-service-chip').forEach(function(c){ if(c.dataset.service===sid) c.setAttribute('aria-pressed','true'); });
    detRoom.textContent = s.room;
    detTitle.textContent = s.title;
    detCopy.textContent = s.desc;
    detSendTitle.style.display = '';
    detTags.innerHTML = s.send.map(function(t){ return '<li>' + t + '</li>'; }).join('');
    detText.href = smsHref(s.title);
    detLearn.href = s.url;
    detLearn.textContent = 'Learn More';
  }

  function buildChips(room) {
    chipsWrap.innerHTML = room.services.map(function(sid) {
      var s = S[sid]; if (!s) return '';
      return '<button class="rsm-service-chip" type="button" data-service="' + sid + '" aria-pressed="false">' + s.title + '</button>';
    }).join('');
  }

  function setRoom(i) {
    idx = ((i % rooms.length) + rooms.length) % rooms.length;
    slides.forEach(function(sl, si) {
      var on = si === idx;
      sl.classList.toggle('is-active', on);
      sl.setAttribute('aria-hidden', on ? 'false' : 'true');
      sl.querySelectorAll('.rsm-callout').forEach(function(c){ c.tabIndex = on ? 0 : -1; });
    });
    dotsWrap.querySelectorAll('.rsm-room-dot').forEach(function(d, di) {
      d.setAttribute('aria-current', di === idx ? 'true' : 'false');
    });
    buildChips(rooms[idx]);
    showRoomIntro(rooms[idx]);
  }

  /* Build room dots */
  dotsWrap.innerHTML = rooms.map(function(r,i) {
    return '<li><button class="rsm-room-dot" type="button" data-idx="'+i+'" aria-current="'+(i===0?'true':'false')+'">'+r.label+'</button></li>';
  }).join('');

  /* Events */
  var hover = window.matchMedia('(hover:hover) and (pointer:fine)');
  callouts.forEach(function(c) {
    c.addEventListener('mouseenter', function() {
      if (hover.matches && slides[idx].contains(c)) showService(c.dataset.service);
    });
    c.addEventListener('click', function() {
      if (!slides[idx].contains(c)) return;
      var sid = c.dataset.service;
      if (activeService === sid && S[sid]) {
        window.location.href = S[sid].url;
      } else {
        showService(sid);
      }
    });
  });

  chipsWrap.addEventListener('click', function(e) {
    var chip = e.target.closest('.rsm-service-chip');
    if (chip) showService(chip.dataset.service);
  });

  prevBtn.addEventListener('click', function(){ setRoom(idx - 1); });
  nextBtn.addEventListener('click', function(){ setRoom(idx + 1); });

  dotsWrap.addEventListener('click', function(e) {
    var dot = e.target.closest('[data-idx]');
    if (dot) setRoom(Number(dot.dataset.idx));
  });

  document.addEventListener('keydown', function(e) {
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft') setRoom(idx - 1);
    if (e.key === 'ArrowRight') setRoom(idx + 1);
  });

  viewport.addEventListener('touchstart', function(e) {
    if (!e.changedTouches.length) return;
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  viewport.addEventListener('touchend', function(e) {
    if (!e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) setRoom(dx < 0 ? idx + 1 : idx - 1);
  }, { passive: true });

  /* Accordion */
  document.querySelectorAll('.rsm-accordion__trigger').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  viewport.setAttribute('tabindex', '0');
  setRoom(0);
})();
