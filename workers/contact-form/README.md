# Contact Form Worker

Cloudflare Worker that handles contact form submissions for heisergroup.com.

## Endpoint

```
POST https://heiser-contact-form.point-dog-digital.workers.dev
```

## What It Does

1. Receives form submission (name, email, phone, message, service)
2. Sends notification email to Heiser team via SendGrid
3. Sends confirmation email to form submitter
4. Returns JSON response

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
npx wrangler deploy
```

## Local Development

```bash
cd workers/contact-form
npx wrangler dev
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
