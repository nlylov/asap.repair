/* ============================================
   Module: Photo Quote Form → API Submission
   Usage: <div data-module="photo-drop"></div>

   Renders an inline quote form with photo upload,
   submits to the Vercel proxy API (same as modal).
   Auto-detects service from URL path.
   ============================================ */

const API_URL = 'https://crm.asap.repair/api/widget/quote';

// Map URL path segments → service display names
const SERVICE_MAP = {
    'furniture-assembly': 'Furniture Assembly',
    'tv-wall-mounting': 'TV & Wall Mounting',
    'appliance-services': 'Appliance Services',
    'flooring-installation': 'Flooring Installation',
    'painting': 'Painting & Wall Finishes',
    'ac-installation-cleaning': 'AC Installation & Cleaning',
    'plumbing': 'Plumbing',
    'electrical': 'Electrical',
    'general-repairs': 'General Repairs',
};

function detectService() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    // Check /services/{hub-slug}/
    if (segments.length >= 2 && segments[0] === 'services') {
        return SERVICE_MAP[segments[1]] || '';
    }
    return '';
}

async function compressImage(file, maxW = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxW) { h = (h * maxW) / w; w = maxW; }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl.split(',')[1]); // base64 only
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export default function photoDrop(container) {
    const detectedService = detectService();
    const uid = 'pd-' + Math.random().toString(36).slice(2, 8);

    container.innerHTML = `
        <div class="mod-photo">
            <span class="section-tag">Quick Estimate</span>
            <h2 class="section-title">Send a Photo, <span class="text-accent">Get a Quote</span></h2>
            <p class="mod-photo__subtitle">Upload a photo, leave your number — we'll text you a flat-rate quote within 30 minutes.</p>
            <div class="mod-photo__form-wrap">
                <form class="mod-photo__form" id="${uid}-form" novalidate>
                    <!-- Photo Upload -->
                    <div class="form-group">
                        <label class="form-label">Attach Photos <span style="color:var(--text-muted);font-weight:400">(optional, up to 5)</span></label>
                        <div class="photo-drop" id="${uid}-drop">
                            <input type="file" id="${uid}-fileinput" accept="image/*" multiple style="display:none">
                            <div class="photo-drop__prompt" id="${uid}-prompt">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <span>Drop photos here or <strong>browse</strong></span>
                                <span class="photo-drop__hint">JPG, PNG — max 5 MB each</span>
                            </div>
                            <div class="photo-drop__preview" id="${uid}-preview"></div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="${uid}-name" class="form-label">Full Name</label>
                            <input type="text" id="${uid}-name" class="form-input" placeholder="John Smith" required>
                            <span class="form-error">Please enter your name</span>
                        </div>
                        <div class="form-group">
                            <label for="${uid}-phone" class="form-label">Phone Number</label>
                            <input type="tel" id="${uid}-phone" class="form-input" placeholder="+1 (775) 000-0000" required>
                            <span class="form-error">Please enter a valid phone number</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${uid}-email" class="form-label">Email <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
                            <input type="email" id="${uid}-email" class="form-input" placeholder="john@example.com">
                            <span class="form-error">Please enter a valid email</span>
                        </div>
                        <div class="form-group">
                            <label for="${uid}-zip" class="form-label">ZIP Code <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
                            <input type="text" id="${uid}-zip" class="form-input" placeholder="10001" maxlength="5" inputmode="numeric" pattern="[0-9]{5}">
                            <span class="form-error">Please enter a valid 5-digit ZIP</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="${uid}-msg" class="form-label">Notes <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
                        <textarea id="${uid}-msg" class="form-input form-textarea" rows="3" placeholder="Anything we should know? (stairs, wall type, quantity...)"></textarea>
                    </div>

                    <div class="form-group form-consent">
                        <label class="consent-label">
                            <input type="checkbox" id="${uid}-consent" required>
                            <span class="consent-check"></span>
                            <span class="consent-text">I agree to the <a href="/privacy-policy/" target="_blank">Privacy Policy</a> and <a href="/terms-of-service/" target="_blank">Terms of Service</a>, and consent to receive text messages. Message &amp; data rates may apply.</span>
                        </label>
                        <span class="form-error">You must agree to continue</span>
                    </div>

                    <button type="submit" class="btn btn--accent btn--lg btn--full" id="${uid}-submit">
                        <span class="btn__text">Send Request</span>
                        <span class="btn__loader"></span>
                    </button>
                </form>
                <div id="${uid}-success" style="display:none;text-align:center;padding:40px 20px;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:20px">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3 style="font-size:22px;margin-bottom:10px;">Quote Request Received</h3>
                    <p style="color:var(--text-secondary);font-size:15px;line-height:1.7;">Thank you! We'll text you a flat-rate quote within 30 minutes.</p>
                </div>
            </div>
        </div>
    `;

    // --- Photo handling ---
    const drop = container.querySelector(`#${uid}-drop`);
    const fileInput = container.querySelector(`#${uid}-fileinput`);
    const preview = container.querySelector(`#${uid}-preview`);
    const prompt = container.querySelector(`#${uid}-prompt`);
    let selectedPhotos = [];

    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });

    function addFiles(files) {
        Array.from(files).forEach(async (file) => {
            if (selectedPhotos.length >= 5) return;
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) return;

            const base64 = await compressImage(file);
            selectedPhotos.push({ base64, name: file.name, type: 'image/jpeg' });
            renderPreviews();
        });
    }

    function renderPreviews() {
        preview.innerHTML = '';
        if (selectedPhotos.length > 0) prompt.style.display = 'none';
        else { prompt.style.display = ''; return; }

        selectedPhotos.forEach((p, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'photo-thumb';
            thumb.innerHTML = `
                <img src="data:image/jpeg;base64,${p.base64}" alt="${p.name}">
                <button type="button" class="photo-thumb__remove" data-idx="${i}" aria-label="Remove">×</button>
            `;
            preview.appendChild(thumb);
        });

        preview.querySelectorAll('.photo-thumb__remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedPhotos.splice(parseInt(btn.dataset.idx), 1);
                renderPreviews();
            });
        });
    }

    // --- Form submission ---
    const form = container.querySelector(`#${uid}-form`);
    const submitBtn = container.querySelector(`#${uid}-submit`);
    const successEl = container.querySelector(`#${uid}-success`);

    function showError(input) {
        input.classList.add('error');
        input.closest('.form-group')?.classList.add('has-error');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
        form.querySelectorAll('.form-input').forEach(i => i.classList.remove('error', 'success'));

        let isValid = true;

        // Required inputs
        form.querySelectorAll('.form-input[required]').forEach(input => {
            if (!input.value.trim()) { showError(input); isValid = false; }
            else input.classList.add('success');
        });

        // Email format
        const email = form.querySelector(`#${uid}-email`);
        if (email?.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            showError(email); isValid = false;
        }

        // Phone digits
        const phone = form.querySelector(`#${uid}-phone`);
        if (phone?.value.trim() && phone.value.replace(/\D/g, '').length < 10) {
            showError(phone); isValid = false;
        }

        // ZIP
        const zip = form.querySelector(`#${uid}-zip`);
        if (zip?.value.trim() && !/^\d{5}$/.test(zip.value.trim())) {
            showError(zip); isValid = false;
        }

        // Consent
        const consent = form.querySelector(`#${uid}-consent`);
        if (consent && !consent.checked) {
            consent.closest('.form-group')?.classList.add('has-error');
            isValid = false;
        }

        if (!isValid) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const payload = {
            name: form.querySelector(`#${uid}-name`).value.trim(),
            phone: phone.value.trim(),
            email: email?.value.trim() || '',
            zip: zip?.value.trim() || '',
            service: detectedService,
            message: form.querySelector(`#${uid}-msg`)?.value.trim() || '',
            photos: selectedPhotos.map(p => ({ data: p.base64, name: p.name, type: p.type })),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                form.style.display = 'none';
                successEl.style.display = 'block';
            } else {
                alert(result.error || 'Something went wrong. Please try again or call us.');
            }
        } catch (err) {
            console.error('Quote submission error:', err);
            alert('Network error. Please try again or call us at +1 (775) 310-7770.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}
