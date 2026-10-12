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

Turnstile spam protection is **already configured**:
- The Turnstile widget (site key `0x4AAAAAAFUdamJArF6SI61g`) is hardcoded in the Astro component
- The worker secret `TURNSTILE_SECRET_KEY` is already set in the worker

The widget always renders on the form. The worker skips Turnstile verification (and logs once) when the secret is not set, so deploying the site before the worker won't break the form.

### Deploy Order

When deploying changes that affect both the site and worker:

1. **Build and deploy the Pages site first**:
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=heiser
   ```

2. **Then merge to main** — this triggers `deploy-contact-form.yml` which auto-deploys the worker and turns on Turnstile enforcement.

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
