const CANONICAL_HOST = 'asap.repair';

const PRESERVE_PATH_HOSTS = new Set([
    'www.asap.repair',
    'asap-repair.netlify.app',
]);

const ROOT_ONLY_HOSTS = new Set([
    'api.asap.repair',
]);

export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (PRESERVE_PATH_HOSTS.has(url.hostname)) {
        url.hostname = CANONICAL_HOST;
        return Response.redirect(url.toString(), 301);
    }

    if (ROOT_ONLY_HOSTS.has(url.hostname)) {
        url.hostname = CANONICAL_HOST;
        url.pathname = '/';
        url.search = '';
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
