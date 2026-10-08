# Contact Form Worker

Cloudflare Worker that handles contact form submissions for heisergroup.com.

## Endpoint

```
POST https://heiser-contact-form.point-dog-digital.workers.dev
```

## What It Does

1. Receives form submission (name, email, phone, message, service)
2. Filters spam (`src/spam.ts`) and silently returns success for it
3. Sends notification email to Heiser team via SendGrid
4. Sends confirmation email to form submitter (never echoes their message, so the form can't relay spam links)
5. Returns JSON response

## Spam Filtering

Rejected submissions return the normal success response and log `Spam rejected` with a reason (Workers Logs in the Cloudflare dashboard). Rules:

- Honeypot `website` field filled
- Service or position not one of the site's options
- Bot-style names (digits, repeated first/last, trailing two capitals like `CarlosnumZQ`)
- Phone that isn't a valid US number
- Link in name or message, non-Latin script (including Cyrillic), or a message with no words
- Matching first and last name, or whitespace-only name parts after normalization

`Origin`/`Referer` are not trusted for blocking (bots spoof them). Run `npm test` in this directory before deploy.

## Recipients

Form submissions are sent to:
- mike@point.dog
- matthew@heisergroup.com
- david@heisergroup.com

## Environment Variables

Set in Cloudflare Workers dashboard:

| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key for sending emails |

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

## Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Contact name |
| `email` | Yes | Contact email |
| `phone` | No | Phone number |
| `message` | Yes | Message content |
| `service` | No | Service interested in |

## Response

```json
{
  "success": true,
  "message": "Thank you! We'll be in touch soon."
}
```

---

**Last Updated:** January 2026
