const CANONICAL_HOST = 'asap.repair';

const PRESERVE_PATH_HOSTS = new Set([
    'www.asap.repair',
    'asap-repair.netlify.app',
]);

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

    if (PRESERVE_PATH_HOSTS.has(url.hostname)) {
        url.hostname = CANONICAL_HOST;
        url.pathname = canonicalPathname(url.pathname);
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
