const CANONICAL_HOST = 'asap.repair';

const PRESERVE_PATH_HOSTS = new Set([
    'www.asap.repair',
    'asap-repair.netlify.app',
    'api.asap.repair',
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

    if (PRESERVE_PATH_HOSTS.has(url.hostname)) {
        url.hostname = CANONICAL_HOST;
        url.pathname = canonicalPathname(url.pathname);
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
