# Contact Form Worker

Cloudflare Worker that handles contact form submissions for heisergroup.com.

## Endpoint

```
POST https://heiser-contact-form.point-dog-digital.workers.dev
```

## What It Does

1. Receives form submission (name, email, phone, message, service)
2. Validates origin and optional Turnstile token
3. Filters spam (`src/spam.ts`) and silently returns success for it
4. Sends notification email to Heiser team via SendGrid
5. Sends confirmation email to form submitter (never echoes their message, so the form can't relay spam links)
6. Logs `Lead sent` with form type, timestamp, and SendGrid status code on success
7. Returns JSON response

## Spam Filtering

Rejected submissions return the normal success response (to avoid tipping off bots) and log with a reason (Workers Logs in the Cloudflare dashboard):

- **Origin/Referer check**: Blocks requests not from allowed hosts. Logs `Blocked origin` with the source value.
- **Turnstile check** (if enabled): Blocks requests with missing or invalid Turnstile tokens.
- **Honeypot**: `website` field filled → spam
- **Content checks**: Bot-style names, non-US phones, links in messages, non-Latin script, etc.

## Recipients

Form submissions are sent to:
- mike@point.dog
- matthew@heisergroup.com
- david@heisergroup.com

## Environment Variables

Set in `wrangler.toml` or Cloudflare Workers dashboard:

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Comma-separated allowed origin hosts. Defaults to `heisergroup.com,www.heisergroup.com`. `localhost` and `127.0.0.1` are always included for dev. |

## Secrets

Set via `wrangler secret put <NAME>`:

| Secret | Description |
|--------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key for sending emails |
| `GCP_SERVICE_ACCOUNT_JSON` | GCP service account JSON for BigQuery CDP logging |
| `TURNSTILE_SECRET_KEY` | (Optional) Cloudflare Turnstile secret key. If set, Turnstile verification is enabled. |

## Turnstile Setup

To enable Turnstile spam protection:

1. **Create a Turnstile widget** in the Cloudflare dashboard:
   - Go to Cloudflare Dashboard → Turnstile → Add Widget
   - Add hostnames: `heisergroup.com`, `www.heisergroup.com`, `localhost`
   - Widget mode: Managed (recommended)
   - Copy the Site Key and Secret Key

2. **Set the worker secret**:
   ```bash
   cd workers/contact-form
   wrangler secret put TURNSTILE_SECRET_KEY
   # Paste the secret key when prompted
   ```

3. **Set the site key in Vercel** (for the Astro site):
   - Go to Vercel Dashboard → heisergroup → Settings → Environment Variables
   - Add `PUBLIC_TURNSTILE_SITE_KEY` with the Site Key value
   - Redeploy the site

The form widget renders automatically when the site key is set. The worker skips Turnstile verification (and logs once) when the secret is not set, so deploying before keys exist won't break the form.

## Deployment

```bash
cd workers/contact-form
npm run deploy
```

`--config wrangler.toml` is required: without it wrangler picks up the site's root `wrangler.jsonc` and fails.

## Local Development

```bash
cd workers/contact-form
npm run dev
```

## Testing

```bash
cd workers/contact-form
npm test
```

## Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| `firstName` | Yes | First name |
| `lastName` | Yes | Last name |
| `email` | Yes | Contact email |
| `phone` | No | Phone number |
| `serviceType` | Yes | Service type (contact form) |
| `message` | Yes | Message content |
| `cf-turnstile-response` | Required if Turnstile enabled | Turnstile token (auto-added by widget) |

## Response

```json
{
  "success": true,
  "leadId": "uuid-of-lead"
}
```

---

**Last Updated:** October 2026
