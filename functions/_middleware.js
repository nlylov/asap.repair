const CANONICAL_HOST = 'asap.repair';

// Internal repo paths that must never be served publicly.
// The files stay in the repo (docs, sources, tooling) — the edge just refuses them.
const PRIVATE_PATH_PREFIXES = [
    '/docs/',
    '/deploy/',
    '/scripts/',
    '/tests/',
    '/_data/',
    '/gbp-images/',
];

const PRIVATE_PATHS = new Set([
    '/AGENTS.md',
    '/web_gallery.json',
    '/website_picks_final.json',
]);

function isPrivatePath(pathname) {
    if (PRIVATE_PATHS.has(pathname)) return true;
    return PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const PRESERVE_PATH_HOSTS = new Set([
    'www.asap.repair',
    'asap-repair.pages.dev',
    'asap-repair.netlify.app',
]);

function isPreservePathHost(hostname) {
    return PRESERVE_PATH_HOSTS.has(hostname) || hostname.endsWith('.asap-repair.pages.dev');
}

const LEGACY_PATH_REDIRECTS = new Map([
    ['/ac_install', '/services/ac-installation-cleaning/'],
    ['/ac_install/', '/services/ac-installation-cleaning/'],
    ['/ac-installation-cleaning', '/services/ac-installation-cleaning/'],
    ['/ac-installation-cleaning/', '/services/ac-installation-cleaning/'],
    ['/services/ac-installation-cleaning', '/services/ac-installation-cleaning/'],
]);

function canonicalPathname(pathname) {
    const lastSegment = pathname.split('/').pop() || '';
    const hasFileExtension = lastSegment.includes('.');

    if (pathname !== '/' && !pathname.endsWith('/') && !hasFileExtension) {
        return `${pathname}/`;
    }

    return pathname;
}

export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (isPrivatePath(url.pathname)) {
        return new Response('Not found', {
            status: 404,
            headers: { 'X-Robots-Tag': 'noindex, nofollow' },
        });
    }

    if (url.hostname === 'api.asap.repair' && url.pathname.startsWith('/api/')) {
        return context.next();
    }

    const legacyRedirectPath = LEGACY_PATH_REDIRECTS.get(url.pathname);
    if (legacyRedirectPath) {
        url.hostname = CANONICAL_HOST;
        url.pathname = legacyRedirectPath;
        return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === 'api.asap.repair') {
        url.hostname = CANONICAL_HOST;
        url.pathname = canonicalPathname(url.pathname);
        return Response.redirect(url.toString(), 301);
    }

    if (isPreservePathHost(url.hostname)) {
        url.hostname = CANONICAL_HOST;
        url.pathname = canonicalPathname(url.pathname);
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
