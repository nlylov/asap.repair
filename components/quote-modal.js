/* ============================================
   Quote Modal — Open, Close, Photo Upload, Validate, Submit to Vercel API
   ============================================ */
(function () {
    'use strict';

    const API_URL = 'https://crm.asap.repair/api/widget/quote';
    const SLOTS_API = 'https://crm.asap.repair/api/calendar/slots';
    const MAX_PHOTOS = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const modal = document.getElementById('quoteModal');
    if (!modal) return;

    // Re-init Places Autocomplete for dynamically loaded modal address field
    if (window.initPlacesAutocomplete && typeof google !== 'undefined') {
        window.initPlacesAutocomplete();
    }

    const backdrop = modal.querySelector('.quote-modal__backdrop');
    const closeBtn = document.getElementById('quoteModalClose');
    const form = document.getElementById('quoteModalForm');
    const submitBtn = document.getElementById('quoteModalSubmit');
    const successEl = document.getElementById('quoteModalSuccess');
    const serviceSelect = document.getElementById('modal-service');
    const dateInput = document.getElementById('modal-date');

    // Photo upload elements
    const photoDrop = document.getElementById('photoDrop');
    const photoInput = document.getElementById('photoInput');
    const photoPrompt = document.getElementById('photoPrompt');
    const photoPreview = document.getElementById('photoPreview');

    // Time slot elements
    const timeSlotGroup = document.getElementById('timeSlotGroup');
    const timeSlotsEl = document.getElementById('timeSlots');
    const timeInput = document.getElementById('modal-time');
    const addressGroup = document.getElementById('addressGroup');
    const addressInput = document.getElementById('modal-address');

    let selectedPhotos = []; // Array of { file, dataUrl, base64, name, type }

    // Set min date
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        // Fetch available slots when date changes
        dateInput.addEventListener('change', async () => {
            const date = dateInput.value;
            if (!date || !timeSlotGroup || !timeSlotsEl) return;

            // Reset previous selection
            timeInput.value = '';
            timeSlotGroup.style.display = 'block';
            // Show address field and mark ZIP required when date is selected
            if (addressGroup) {
                addressGroup.style.display = 'block';
                // Re-init Places Autocomplete for modal address field once it's visible
                if (addressInput && !addressInput._placesInitialized && typeof google !== 'undefined' && google.maps && google.maps.places) {
                    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
                        types: ['address'],
                        componentRestrictions: { country: 'us' },
                        fields: ['address_components', 'formatted_address'],
                    });
                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (!place.address_components) return;
                        addressInput.value = place.formatted_address;
                        addressInput.classList.remove('error');
                        addressInput.classList.add('success');
                        // Auto-fill ZIP
                        const zipComp = place.address_components.find(c => c.types.includes('postal_code'));
                        const zipEl = form.querySelector('#modal-zip');
                        if (zipComp && zipEl) {
                            zipEl.value = zipComp.short_name;
                            zipEl.classList.remove('error');
                            zipEl.classList.add('success');
                        }
                    });
                    // Prevent Enter from submitting form in autocomplete dropdown
                    addressInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            const pac = document.querySelector('.pac-container');
                            if (pac && pac.style.display !== 'none') e.preventDefault();
                        }
                    });
                    addressInput._placesInitialized = true;
                }
            }
            // Mark ZIP as required for booking
            const zipLabel = form.querySelector('#modal-zip')?.closest('.form-group')?.querySelector('.form-label');
            if (zipLabel && !zipLabel.querySelector('.zip-required')) {
                zipLabel.innerHTML = zipLabel.innerHTML.replace('(optional)', '<span class="zip-required" style="color:var(--accent);font-weight:500">*</span>');
            }
            timeSlotsEl.innerHTML = '<div class="time-slots__loading"><span class="spinner-sm"></span> Loading available times...</div>';

            try {
                const resp = await fetch(`${SLOTS_API}?date=${date}`);
                const data = await resp.json();

                if (!data.slots || data.slots.length === 0) {
                    timeSlotsEl.innerHTML = '<p class="time-slots__empty">No available times on this date. Please try another day.</p>';
                    return;
                }

                // Render slot pills
                timeSlotsEl.innerHTML = data.slots.map((slot, i) => {
                    const raw = data.raw?.[i] || slot;
                    return `<button type="button" class="time-slot" data-time="${raw}" data-label="${slot}">${slot}</button>`;
                }).join('');

                // Add click handlers
                timeSlotsEl.querySelectorAll('.time-slot').forEach(btn => {
                    btn.addEventListener('click', () => {
                        timeSlotsEl.querySelectorAll('.time-slot').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        timeInput.value = btn.dataset.time;
                        // Clear error if shown
                        const grp = timeSlotGroup;
                        if (grp) grp.classList.remove('has-error');
                    });
                });
            } catch (err) {
                timeSlotsEl.innerHTML = '<p class="time-slots__empty">Failed to load times. You can still submit without a time selection.</p>';
            }
        });
    }

    // ---- Clear Date Button ----
    const dateClearBtn = document.getElementById('dateClear');
    if (dateInput && dateClearBtn) {
        dateInput.addEventListener('change', () => {
            dateClearBtn.style.display = dateInput.value ? 'block' : 'none';
        });
        dateClearBtn.addEventListener('click', () => {
            dateInput.value = '';
            dateClearBtn.style.display = 'none';
            if (timeSlotGroup) timeSlotGroup.style.display = 'none';
            if (timeSlotsEl) timeSlotsEl.innerHTML = '';
            if (timeInput) timeInput.value = '';
            if (addressGroup) { addressGroup.style.display = 'none'; }
            if (addressInput) { addressInput.value = ''; addressInput.classList.remove('error', 'success'); }
            // Restore ZIP as optional
            const zipLabel = form.querySelector('#modal-zip')?.closest('.form-group')?.querySelector('.form-label');
            if (zipLabel && zipLabel.querySelector('.zip-required')) {
                zipLabel.innerHTML = 'ZIP Code <span style="color:var(--text-muted);font-weight:400">(optional)</span>';
            }
        });
    }

    // ---- Open ----
    window.openQuoteModal = function (serviceValue) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // Lock body scroll (iOS-safe)
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';

        // Auto-select service if passed
        if (serviceValue && serviceSelect) {
            const option = Array.from(serviceSelect.options).find(o =>
                o.value === serviceValue || o.value.toLowerCase().includes(serviceValue)
            );
            if (option) {
                serviceSelect.value = option.value;
                serviceSelect.classList.add('success');
            }
        }

        // Focus first input
        setTimeout(() => {
            const firstInput = form.querySelector('input:not([type=hidden]):not([type=file])');
            if (firstInput) firstInput.focus();
        }, 400);
    };

    // ---- Abandoned Form Nudge ----
    let nudgeTimer = null;
    function startNudgeTimer() {
        clearNudgeTimer();
        nudgeTimer = setTimeout(() => {
            if (!modal.classList.contains('active')) return;
            if (submitBtn.classList.contains('loading')) return;
            // Check if form has some data but hasn't been submitted
            const hasData = form.querySelector('#modal-name')?.value || form.querySelector('#modal-phone')?.value;
            if (hasData && form.style.display !== 'none') {
                const nudge = document.createElement('div');
                nudge.className = 'form-nudge';
                nudge.innerHTML = '💡 Need help? Call us at <a href="tel:+17753107770" style="color:var(--accent);font-weight:600">+1 (775) 310-7770</a>';
                nudge.id = 'formNudge';
                if (!document.getElementById('formNudge')) {
                    submitBtn.parentNode.insertBefore(nudge, submitBtn);
                }
            }
        }, 120000); // 2 minutes
    }
    function clearNudgeTimer() {
        if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
        const existing = document.getElementById('formNudge');
        if (existing) existing.remove();
    }

    // ---- Returning Customer Detection ----
    const phoneField = form.querySelector('#modal-phone');
    const nameField = form.querySelector('#modal-name');
    const CUSTOMER_API = 'https://crm.asap.repair/api/widget/check-customer';
    let customerChecked = false;

    if (phoneField) {
        phoneField.addEventListener('blur', async () => {
            const digits = phoneField.value.replace(/\D/g, '');
            if (digits.length < 10 || customerChecked) return;
            customerChecked = true;

            try {
                const resp = await fetch(`${CUSTOMER_API}?phone=${encodeURIComponent(phoneField.value)}`);
                const data = await resp.json();
                if (data.found && data.name) {
                    // Auto-fill name if empty
                    if (nameField && !nameField.value.trim()) {
                        nameField.value = data.name;
                        nameField.classList.add('success');
                    }
                    // Show welcome banner
                    if (!document.getElementById('welcomeBanner')) {
                        const banner = document.createElement('div');
                        banner.id = 'welcomeBanner';
                        banner.className = 'welcome-banner';
                        banner.innerHTML = `👋 Welcome back, <strong>${data.name}</strong>! Great to see you again.`;
                        const header = modal.querySelector('.quote-modal__header');
                        if (header) header.after(banner);
                    }
                }
            } catch (e) { /* silent */ }
        });
    }

    // ---- Close ----
    function resetForm() {
        form.reset();
        form.style.display = '';
        successEl.style.display = 'none';
        form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
        form.querySelectorAll('.form-input').forEach(i => i.classList.remove('error', 'success'));
        selectedPhotos = [];
        if (photoPreview) { photoPreview.innerHTML = ''; photoPreview.style.display = 'none'; }
        if (photoPrompt) photoPrompt.style.display = '';
        if (timeSlotGroup) timeSlotGroup.style.display = 'none';
        if (timeSlotsEl) timeSlotsEl.innerHTML = '';
        if (timeInput) timeInput.value = '';
        if (addressGroup) addressGroup.style.display = 'none';
        if (addressInput) { addressInput.value = ''; addressInput.classList.remove('error', 'success'); }
        if (dateClearBtn) dateClearBtn.style.display = 'none';
        customerChecked = false;
        const wb = document.getElementById('welcomeBanner');
        if (wb) wb.remove();
        clearNudgeTimer();
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        // Restore body scroll (iOS-safe)
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
        // Reset after close animation
        setTimeout(resetForm, 400);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // ---- Service Mapping ----
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

    function detectServiceFromURL() {
        const path = window.location.pathname;
        for (const [slug, value] of Object.entries(SERVICE_MAP)) {
            if (path.includes('/services/' + slug)) return value;
        }
        return null;
    }

    // ---- CTA Interceptors ----
    document.addEventListener('click', (e) => {
        // Handle button[data-open-quote]
        const quoteBtn = e.target.closest('[data-open-quote]');
        if (quoteBtn && quoteBtn.tagName !== 'A') {
            e.preventDefault();
            // Close mobile overlay if open
            const overlay = document.querySelector('.nav-overlay.active');
            if (overlay) {
                const burger = document.getElementById('burger');
                if (burger) burger.classList.remove('active');
                overlay.classList.remove('active');
                setTimeout(() => { overlay.remove(); }, 400);
                document.body.style.overflow = '';
            }
            const service = quoteBtn.dataset.service || detectServiceFromURL();
            openQuoteModal(service);
            return;
        }

        // Handle anchor links to #contact
        const link = e.target.closest('a[href*="#contact"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href === '#contact' && window.location.pathname === '/') return;

        if (href === '/#contact' || href === '#contact') {
            e.preventDefault();
            const service = link.dataset.service || detectServiceFromURL();
            openQuoteModal(service);
        }
    });

    // ---- Photo Upload ----
    if (photoDrop) {
        // Click to browse
        photoDrop.addEventListener('click', (e) => {
            if (e.target.closest('.photo-drop__remove')) return;
            photoInput.click();
        });

        // File input change
        photoInput.addEventListener('change', () => {
            addFiles(photoInput.files);
            photoInput.value = '';
        });

        // Drag & Drop
        photoDrop.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoDrop.classList.add('dragover');
        });

        photoDrop.addEventListener('dragleave', () => {
            photoDrop.classList.remove('dragover');
        });

        photoDrop.addEventListener('drop', (e) => {
            e.preventDefault();
            photoDrop.classList.remove('dragover');
            addFiles(e.dataTransfer.files);
        });
    }

    /**
     * Compress an image file via Canvas: resize to max 1200px, JPEG 0.7 quality.
     * Returns a Promise resolving to { dataUrl, base64 }.
     */
    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const MAX_DIM = 1200;
                let w = img.width;
                let h = img.height;

                if (w > MAX_DIM || h > MAX_DIM) {
                    if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
                    else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                const base64 = dataUrl.split(',')[1];
                resolve({ dataUrl, base64 });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    function addFiles(fileList) {
        const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));

        for (const file of files) {
            if (selectedPhotos.length >= MAX_PHOTOS) break;
            if (file.size > MAX_FILE_SIZE) {
                alert(`"${file.name}" exceeds the 5 MB limit.`);
                continue;
            }
            // Check if already added
            if (selectedPhotos.some(p => p.name === file.name && p.file.size === file.size)) continue;

            compressImage(file).then(({ dataUrl, base64 }) => {
                selectedPhotos.push({
                    file,
                    dataUrl,
                    base64,
                    name: file.name,
                    type: 'image/jpeg', // always JPEG after compression
                });
                renderPhotoPreviews();
            }).catch(() => {
                // Fallback: use original if compression fails
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result;
                    const base64 = dataUrl.split(',')[1];
                    selectedPhotos.push({ file, dataUrl, base64, name: file.name, type: file.type });
                    renderPhotoPreviews();
                };
                reader.readAsDataURL(file);
            });
        }
    }

    function removePhoto(index) {
        selectedPhotos.splice(index, 1);
        renderPhotoPreviews();
    }

    function renderPhotoPreviews() {
        if (!photoPreview || !photoPrompt) return;

        if (selectedPhotos.length === 0) {
            photoPrompt.style.display = '';
            photoPreview.innerHTML = '';
            photoPreview.style.display = 'none';
            return;
        }

        photoPrompt.style.display = 'none';
        photoPreview.style.display = 'flex';
        photoPreview.innerHTML = selectedPhotos.map((photo, i) => `
      <div class="photo-drop__thumb">
        <img src="${photo.dataUrl}" alt="${photo.name}">
        <button type="button" class="photo-drop__remove" onclick="event.stopPropagation();window._removeQuotePhoto(${i})" aria-label="Remove">&times;</button>
      </div>
    `).join('');

        // Show "add more" button if under limit
        if (selectedPhotos.length < MAX_PHOTOS) {
            photoPreview.innerHTML += `
        <div class="photo-drop__add" onclick="event.stopPropagation();document.getElementById('photoInput').click()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      `;
        }
    }

    // Expose remove function globally for onclick handlers
    window._removeQuotePhoto = removePhoto;

    // ---- Validation ----
    function showError(input) {
        input.classList.add('error');
        input.closest('.form-group').classList.add('has-error');
    }

    function clearError(input) {
        input.classList.remove('error');
        input.closest('.form-group').classList.remove('has-error');
    }

    form.querySelectorAll('.form-input[required]').forEach(input => {
        input.addEventListener('blur', function () {
            if (this.value.trim()) {
                clearError(this);
                this.classList.add('success');
            }
        });
        input.addEventListener('input', function () {
            if (this.classList.contains('error') && this.value.trim()) {
                clearError(this);
            }
        });
    });

    // ---- Submit ----
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous errors
        form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
        form.querySelectorAll('.form-input').forEach(i => i.classList.remove('error', 'success'));

        let isValid = true;

        // Required text inputs
        form.querySelectorAll('.form-input[required]').forEach(input => {
            if (!input.value.trim()) {
                showError(input);
                isValid = false;
            } else {
                input.classList.add('success');
            }
        });

        // Email
        const email = form.querySelector('#modal-email');
        if (email && email.value.trim()) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                showError(email);
                isValid = false;
            } else {
                email.classList.add('success');
            }
        }

        // Phone
        const phone = form.querySelector('#modal-phone');
        if (phone && phone.value.trim()) {
            const phoneDigits = phone.value.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                showError(phone);
                isValid = false;
            } else {
                phone.classList.add('success');
            }
        }

        // Service
        if (serviceSelect && !serviceSelect.value) {
            showError(serviceSelect);
            isValid = false;
        } else if (serviceSelect) {
            serviceSelect.classList.add('success');
        }

        // ZIP code (optional normally, REQUIRED when booking a date)
        const zip = form.querySelector('#modal-zip');
        if (dateInput && dateInput.value) {
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

        // Consent checkbox (required)
        const consent = form.querySelector('#modal-consent');
        if (consent && !consent.checked) {
            const consentGroup = consent.closest('.form-group');
            if (consentGroup) consentGroup.classList.add('has-error');
            isValid = false;
        }

        // Address (required only when date is selected = booking a visit)
        if (dateInput && dateInput.value && addressInput) {
            const addr = addressInput.value.trim();
            if (!addr || addr.length < 10 || !/[a-zA-Z]/.test(addr)) {
                showError(addressInput);
                isValid = false;
                // Update error text for clarity
                const errSpan = addressInput.closest('.form-group')?.querySelector('.form-error');
                if (errSpan) errSpan.textContent = addr.length < 10 ? 'Please enter a full street address (e.g., 123 Main St, Apt 4B, New York)' : 'Address must include a street name';
            } else {
                addressInput.classList.add('success');
            }
        }

        // Time slot required when date is selected
        if (dateInput && dateInput.value && timeInput && !timeInput.value) {
            if (timeSlotGroup) timeSlotGroup.classList.add('has-error');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Build payload
        const payload = {
            name: form.querySelector('#modal-name').value.trim(),
            phone: form.querySelector('#modal-phone').value.trim(),
            email: form.querySelector('#modal-email')?.value.trim() || '',
            zip: form.querySelector('#modal-zip')?.value.trim() || '',
            service: serviceSelect ? serviceSelect.value : '',
            date: form.querySelector('#modal-date')?.value || '',
            message: form.querySelector('#modal-message')?.value.trim() || '',
            photos: selectedPhotos.map(p => ({
                data: p.base64,
                name: p.name,
                type: p.type,
            })),
            time: timeInput?.value || '',
            address: addressInput?.value?.trim() || '',
            // CRM custom fields from the smart calculator (set by main.js when CTA clicked)
            custom_fields: window._calcQuoteData ? { ...window._calcQuoteData } : {},
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Dynamic success screen
                const titleEl = document.getElementById('successTitle');
                const msgEl = document.getElementById('successMessage');
                const detailsEl = document.getElementById('successBookingDetails');

                if (result.booked && payload.time) {
                    // Parse the time for display
                    let timeLabel = '';
                    const activeSlot = timeSlotsEl?.querySelector('.time-slot.active');
                    timeLabel = activeSlot?.dataset?.label || payload.time;

                    titleEl.textContent = 'Appointment Confirmed! 📅';
                    msgEl.textContent = 'Your visit has been scheduled. Our technician will text you 30 minutes before arrival.';
                    detailsEl.style.display = 'block';
                    detailsEl.innerHTML = [
                        `<div class="booking-detail"><span>📅</span> <strong>${payload.date}</strong> at <strong>${timeLabel}</strong></div>`,
                        payload.address ? `<div class="booking-detail"><span>📍</span> ${payload.address}</div>` : '',
                        `<div class="booking-detail"><span>🔧</span> ${payload.service || 'Handyman Service'}</div>`,
                    ].filter(Boolean).join('');
                } else {
                    titleEl.textContent = 'Quote Request Received';
                    msgEl.textContent = 'Thank you! We\'ll get back to you within 30 minutes during business hours.';
                    detailsEl.style.display = 'none';
                }

                form.style.display = 'none';
                successEl.style.display = 'block';
                selectedPhotos = [];
                clearNudgeTimer();
            } else {
                // Race condition: slot may have been taken
                const errMsg = result.error || 'Something went wrong.';
                if (errMsg.includes('slot') || errMsg.includes('Booking failed') || errMsg.includes('409')) {
                    alert('That time slot was just taken! Please select another time.');
                    // Re-fetch slots for the date
                    if (dateInput.value) dateInput.dispatchEvent(new Event('change'));
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
    });

    // ---- Success Close Button ----
    const successCloseBtn = document.getElementById('successCloseBtn');
    if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

    // ---- Start nudge on form interaction ----
    form.addEventListener('input', () => { if (!nudgeTimer) startNudgeTimer(); }, { once: true });
})();
