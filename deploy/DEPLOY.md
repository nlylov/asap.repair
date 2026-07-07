# Deprecated Deployment Notes: Old Quote API Route

Deprecated: this file describes the old Vercel/proxy quote-route setup. The
current Repair ASAP site deploys from the canonical GitHub repository
`nlylov/asap.repair` to the Cloudflare Pages project `asap-repair`, with the
local worktree at `/Users/nikita/Developer/asap.repair`.

Do not use this file as the current production deployment procedure. It remains
only as historical context for the old proxy migration.

## 1. Copy the API route handler
Copy `api-quote.js` to your Vercel project:

```bash
cp deploy/api-quote.js "/path/to/repair-asap-proxy-main/api/quote.js"
```

## 2. Add the route to api/index.js
Add these two lines in the **ROUTES** section of `api/index.js`, before the `app.get('/api/health'...)` line:

```javascript
// --- ROUTE: Quote Form Submission ---
const handleQuoteSubmission = require('./quote');
app.post('/api/quote', handleQuoteSubmission);
```

## 3. Update CORS in lib/config.js
Add the new site domain to `allowedOrigins`:

```javascript
cors: {
    allowedOrigins: [
        'https://asap.repair',
        'https://www.asap.repair',
        'https://api.asap.repair',
        'https://sitehandy.netlify.app',     // historical Netlify preview
        'http://127.0.0.1:5500',             // ← ADD THIS for dev
        process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
    ].filter(Boolean),
```

## 4. Deploy to Vercel

```bash
cd repair-asap-proxy-main
git add .
git commit -m "Add quote form API route with GHL photo upload"
git push  # or: vercel deploy --prod
```

No new env variables needed — the route uses the existing `PROSBUDDY_API_TOKEN` and `PROSBUDDY_LOCATION_ID`.
