// Cloudflare Pages Function — enrich widget visit pings with edge geo context.
//
// The CRM can read geo headers, but direct browser requests to crm.asap.repair
// may not pass city/region data through the hosting layer. Keeping only the
// visit ping on asap.repair lets Cloudflare add request.cf metadata while the
// actual chat/message flow continues to call the CRM directly.

const TARGET = 'https://crm.asap.repair/api/widget/visit';

const PASSTHROUGH_HEADERS = [
    'content-type',
    'user-agent',
    'accept-language',
    'origin',
];

function setIfValue(headers, name, value) {
    if (value) headers.set(name, String(value));
}

async function forward(request) {
    const startedAt = Date.now();
    const url = new URL(request.url);
    const targetUrl = `${TARGET}${url.search || ''}`;

    const fwdHeaders = new Headers();
    fwdHeaders.set('X-Forwarded-By', 'asap.repair-cf-pages-widget-visit');
    fwdHeaders.set('X-Forwarded-Host', url.host);
    for (const h of PASSTHROUGH_HEADERS) {
        const v = request.headers.get(h);
        if (v) fwdHeaders.set(h, v);
    }
    if (!fwdHeaders.has('content-type')) {
        fwdHeaders.set('content-type', 'application/json');
    }

    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
    setIfValue(fwdHeaders, 'x-forwarded-for', clientIp);
    setIfValue(fwdHeaders, 'x-real-ip', clientIp);
    setIfValue(fwdHeaders, 'x-geo-city', request.cf?.city);
    setIfValue(fwdHeaders, 'x-geo-region', request.cf?.regionCode || request.cf?.region);
    setIfValue(fwdHeaders, 'x-geo-country', request.cf?.country);

    let upstream;
    try {
        upstream = await fetch(targetUrl, {
            method: request.method,
            headers: fwdHeaders,
            body: await request.arrayBuffer(),
            redirect: 'follow',
        });
    } catch (err) {
        return new Response(JSON.stringify({
            error: 'Bad Gateway — CF Pages widget visit forwarder could not reach CRM',
            target: targetUrl,
            message: err instanceof Error ? err.message : String(err),
        }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }

    const respHeaders = new Headers();
    const passResp = ['content-type', 'cache-control'];
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

export function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'POST, OPTIONS',
            'access-control-allow-headers': 'content-type',
            'access-control-max-age': '86400',
        },
    });
}
