/* ============================================
   Component Loader — Header & Footer
   Fetches /components/header.html and footer.html,
   injects them, then fires 'components-loaded'.
   ============================================ */
(function () {
    'use strict';

    const ASSET_VERSION = '20260801a';
    const versionedAsset = (path) => `${path}?v=${ASSET_VERSION}`;

    // Single source of truth for the browser Google Maps (Places) loader.
    // Loaded on every page so the quote-modal address field gets autocomplete
    // site-wide, not just on the homepage. Key is referrer-restricted to asap.repair.
    window.__repairAsapPlacesScriptSrc = window.__repairAsapPlacesScriptSrc
        || 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDt_R6gxJoHBQXQcu2m-qLLYIfcadMVGPw&libraries=places&loading=async&callback=initPlacesAutocomplete';
    const localHostnames = new Set(['localhost', '127.0.0.1', '::1']);
    const useExtensionlessComponents = window.location.protocol !== 'file:' && !localHostnames.has(window.location.hostname);

    const fetchComponent = async (path) => {
        const primaryPath = useExtensionlessComponents ? path : `${path}.html`;
        const response = await fetch(versionedAsset(primaryPath));
        if (response.ok || primaryPath.endsWith('.html')) {
            return response;
        }
        return fetch(versionedAsset(`${path}.html`));
    };

    async function loadComponents() {
        try {
            const [headerRes, footerRes, modalRes] = await Promise.all([
                fetchComponent('/components/header'),
                fetchComponent('/components/footer'),
                fetchComponent('/components/quote-modal')
            ]);

            const headerEl = document.getElementById('site-header');
            const footerEl = document.getElementById('site-footer');

            if (headerEl && headerRes.ok) {
                headerEl.innerHTML = await headerRes.text();
                headerEl.classList.add('loaded');
            }

            if (footerEl && footerRes.ok) {
                footerEl.innerHTML = await footerRes.text();
                footerEl.classList.add('loaded');
            }

            // Inject quote modal into body
            if (modalRes.ok) {
                const modalDiv = document.createElement('div');
                modalDiv.id = 'site-quote-modal';
                modalDiv.innerHTML = await modalRes.text();
                document.body.appendChild(modalDiv);

                // Load modal JS
                const modalScript = document.createElement('script');
                modalScript.src = versionedAsset('/components/quote-modal.js');
                modalScript.defer = true;
                document.body.appendChild(modalScript);
            }

            // Signal to main.js that DOM components are ready
            document.dispatchEvent(new Event('components-loaded'));

            // Auto-discover and load spoke-page modules
            document.querySelectorAll('[data-module]').forEach(el => {
                const name = el.dataset.module;
                import(versionedAsset(`/components/modules/${name}.js`))
                    .then(m => { if (m.default) m.default(el); })
                    .catch(err => console.warn(`[loader] Module "${name}" not found:`, err));
            });

            // Load chatbot on all pages
            const chatScript = document.createElement('script');
            chatScript.src = versionedAsset('/chat.js');
            chatScript.defer = true;
            document.body.appendChild(chatScript);

            // Load related-content component when placeholder exists
            if (document.getElementById('related-content')) {
                const rcScript = document.createElement('script');
                rcScript.src = versionedAsset('/components/related-content.js');
                rcScript.defer = true;
                document.body.appendChild(rcScript);
            }
        } catch (err) {
            console.error('[loader] Failed to load components:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadComponents);
    } else {
        loadComponents();
    }
})();
