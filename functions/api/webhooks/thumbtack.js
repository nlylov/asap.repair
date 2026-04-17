// Cloudflare Pages Function — transparent forwarder for Thumbtack webhooks.
//
// Thumbtack's API integration was registered against an asap.repair URL, and the
// vendor does not allow easy reconfiguration of the registered webhook URL. To
// keep that integration working without touching Thumbtack itself, this Pages
// Function intercepts POST/GET requests to `https://asap.repair/api/webhooks/thumbtack`
// and proxies them transparently to the live CRM at
// `https://crm.asap.repair/api/webhooks/thumbtack`.
//
// To remove this hop:
//   1. Contact Thumbtack and request the registered webhook URL be changed to
//      `https://crm.asap.repair/api/webhooks/thumbtack` (or
//      `https://app.bazas.ai/api/webhooks/thumbtack` once that domain is added
//      as a Railway custom domain on the bazas-crm service).
//   2. Once Thumbtack confirms, delete this file (and the `functions/` folder
//      if no other forwarders remain) and redeploy.

const TARGET = 'https://crm.asap.repair/api/webhooks/thumbtack';

const PASSTHROUGH_HEADERS = [
    'content-type',
    'authorization',
    'x-webhook-secret',
    'x-thumbtack-signature',
    'x-tt-signature',
    'x-signature',
    'user-agent',
];

async function forward(request) {
    const startedAt = Date.now();
    const url = new URL(request.url);
    const targetUrl = `${TARGET}${url.search || ''}`;

    const fwdHeaders = new Headers();
    fwdHeaders.set('X-Forwarded-By', 'asap.repair-cf-pages');
    fwdHeaders.set('X-Forwarded-Host', url.host);
    for (const h of PASSTHROUGH_HEADERS) {
        const v = request.headers.get(h);
        if (v) fwdHeaders.set(h, v);
    }
    if (!fwdHeaders.has('content-type')) {
        fwdHeaders.set('content-type', 'application/json');
    }

    const init = {
        method: request.method,
        headers: fwdHeaders,
        redirect: 'follow',
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = await request.arrayBuffer();
    }

    let upstream;
    try {
        upstream = await fetch(targetUrl, init);
    } catch (err) {
        return new Response(JSON.stringify({
            error: 'Bad Gateway — CF Pages forwarder could not reach CRM',
            target: targetUrl,
            message: err.message,
        }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }

    const respHeaders = new Headers();
    const passResp = ['content-type', 'cache-control', 'etag'];
    for (const h of passResp) {
        const v = upstream.headers.get(h);
        if (v) respHeaders.set(h, v);
    }
    respHeaders.set('X-Forwarded-Target', targetUrl);
    respHeaders.set('X-Forwarded-Latency-Ms', String(Date.now() - startedAt));

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: respHeaders,
    });
}

export const onRequestPost = ({ request }) => forward(request);
export const onRequestGet = ({ request }) => forward(request);

export function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET, POST, OPTIONS',
            'access-control-allow-headers': 'content-type, authorization, x-thumbtack-signature, x-webhook-secret',
            'access-control-max-age': '86400',
        },
    });
}
