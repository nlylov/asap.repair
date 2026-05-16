/* ============================================
   REPAIR ASAP LLC — Main JavaScript
   ============================================ */

// ---- Google Places Autocomplete ----
function initPlacesAutocomplete() {
  const addressFields = [
    { input: document.getElementById('inline-address'), zip: document.getElementById('zip') },
    { input: document.getElementById('modal-address'), zip: document.getElementById('modal-zip') },
  ];

  addressFields.forEach(({ input, zip }) => {
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      // Set the full formatted address
      input.value = place.formatted_address;
      input.classList.remove('error');
      input.classList.add('success');

      // Auto-fill ZIP code
      const zipComponent = place.address_components.find(c =>
        c.types.includes('postal_code')
      );
      if (zipComponent && zip) {
        zip.value = zipComponent.short_name;
        zip.classList.remove('error');
        zip.classList.add('success');
      }
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
  });
}
// Make it a global callback for the Google Maps script
window.initPlacesAutocomplete = initPlacesAutocomplete;

/* --------------------------------------------------
   PAGE-SPECIFIC INIT (runs immediately on DOMContentLoaded)
   These features don't depend on the dynamically loaded
   header/footer components.
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  // ---- GA4 Conversion Event Tracking ----
  function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

  // Track all phone link clicks
  document.addEventListener('click', (e) => {
    const telLink = e.target.closest('a[href^="tel:"]');
    if (telLink) {
      trackEvent('phone_click', {
        event_category: 'contact',
        event_label: telLink.textContent.trim(),
        link_url: telLink.href,
      });
    }

    // Track SMS link clicks
    const smsLink = e.target.closest('a[href^="sms:"]');
    if (smsLink) {
      trackEvent('sms_click', {
        event_category: 'contact',
        event_label: smsLink.textContent.trim(),
        link_url: smsLink.href,
      });
    }
  });

  // ---- Mobile Sticky CTA Bar (hide when footer visible) ----
  const stickyBar = document.getElementById('mobileStickyCtaBar');
  if (stickyBar) {
    const footerEl = document.getElementById('site-footer');
    if (footerEl) {
      const stickyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          stickyBar.classList.toggle('hidden', entry.isIntersecting);
        });
      }, { threshold: 0.1 });
      stickyObserver.observe(footerEl);
    }
  }

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

  // Date change → fetch time slots
  if (inlineDateInput) {
    const today = new Date().toISOString().split('T')[0];
    inlineDateInput.setAttribute('min', today);

    inlineDateInput.addEventListener('change', async () => {
      const date = inlineDateInput.value;
      if (inlineDateClear) inlineDateClear.style.display = date ? 'block' : 'none';
      if (!date || !inlineTimeSlotGroup || !inlineTimeSlotsEl) return;

      inlineTimeInput.value = '';
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
        inlineTimeSlotsEl.innerHTML = '<p class="time-slots__empty">Failed to load times. You can still submit without a time selection.</p>';
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
      if (inlineAddressInput) { inlineAddressInput.value = ''; inlineAddressInput.classList.remove('error', 'success'); }
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

      // Validate ZIP code (optional normally, REQUIRED when booking)
      const zip = form.querySelector('#zip');
      if (inlineDateInput && inlineDateInput.value) {
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
      if (inlineDateInput && inlineDateInput.value && inlineAddressInput) {
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

      // Time slot required when date is selected
      if (inlineDateInput && inlineDateInput.value && inlineTimeInput && !inlineTimeInput.value) {
        if (inlineTimeSlotGroup) inlineTimeSlotGroup.classList.add('has-error');
        isValid = false;
      }

      if (isValid) {
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const payload = {
          name: form.querySelector('#name').value.trim(),
          phone: form.querySelector('#phone').value.trim(),
          email: email?.value.trim() || '',
          zip: zip?.value.trim() || '',
          service: service.value,
          date: form.querySelector('#date')?.value || '',
          message: form.querySelector('#message')?.value.trim() || '',
          photos: [],
          time: inlineTimeInput?.value || '',
          address: inlineAddressInput?.value?.trim() || '',
        };

        try {
          const response = await fetch('https://crm.asap.repair/api/widget/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // GA4: Track successful form submission
            trackEvent('quote_form_submit', {
              event_category: 'lead',
              event_label: payload.service || 'unknown',
              form_type: 'inline',
            });
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
                  <p style="color:var(--text-secondary); font-size:16px; line-height:1.7;">Thank you! We'll get back to you within 30 minutes during business hours.</p>
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
        tier = 'Standard Install'; badgeColor = '#22c55e';
      } else if (score <= 5) {
        tier = 'Advanced Install'; badgeColor = '#f59e0b';
      } else {
        tier = 'Photo Review Required'; badgeColor = '#ef4444';
      }

      // Update price
      if (qty > 1) {
        labelEl.textContent = `Estimated Flat Rate (${qty} units)`;
        priceEl.innerHTML = `$${totalLo}&ndash;$${totalHi} <span style="font-size:0.55em;opacity:0.7;">($${perUnitLo}&ndash;$${perUnitHi}/unit)</span>`;
      } else {
        labelEl.textContent = 'Estimated Flat Rate';
        priceEl.innerHTML = `$${totalLo}&ndash;$${totalHi}`;
      }

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
    }

    // Wire up event handlers
    [btuSel, qtySel, windowSel, floorSel, buildingSel].forEach(el => {
      if (el) el.addEventListener('change', updateCalc);
    });

    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
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

        // Store structured data for CRM custom fields (picked up by quote-modal.js)
        const priceNums = price.replace(/[^0-9–\-]/g, '').split(/[–\-]/);
        window._calcQuoteData = {
          btu_size: selOpt(btuSel)?.value || '',
          qty: selOpt(qtySel)?.value || '1',
          window_type: selOpt(windowSel)?.value || '',
          floor: selOpt(floorSel)?.value || '',
          building: selOpt(buildingSel)?.value || '',
          addons: activeToggles.join(', '),
          estimated_low: priceNums[0]?.trim() || '',
          estimated_high: priceNums[1]?.trim() || '',
          estimated_range: price,
          source_page: 'window-ac-installation',
        };

        // Open the quote modal (selects "AC Installation & Cleaning" service automatically)
        if (typeof window.openQuoteModal === 'function') {
          window.openQuoteModal('AC Installation & Cleaning');
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
