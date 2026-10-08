import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from './index';
import { spamContactSamples } from './spam-samples';

const env = {
  SENDGRID_API_KEY: 'test-key',
  GCP_SERVICE_ACCOUNT_JSON: '{}',
  RECIPIENT_EMAILS: 'mike@point.dog',
  FROM_EMAIL: 'forms@point.dog',
  FROM_NAME: 'point.dog Forms',
  REDIRECT_URL: 'https://heisergroup.com/thank-you',
};

function buildContactRequest(fields: Record<string, string>): Request {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value);
  }
  return new Request('https://heiser-contact-form.test/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Origin: 'https://heisergroup.com',
    },
    body,
  });
}

describe('contact form worker fetch', () => {
  let sendGridCalls = 0;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    sendGridCalls = 0;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.includes('sendgrid.com')) {
        sendGridCalls += 1;
        return new Response(null, { status: 202 });
      }
      if (url.includes('oauth2.googleapis.com') || url.includes('bigquery.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'test' }), { status: 200 });
      }
      return originalFetch(input);
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns success without sending mail for spam samples', async () => {
    for (const sample of spamContactSamples) {
      sendGridCalls = 0;
      const response = await worker.fetch(buildContactRequest(sample.fields), env);
      const json = await response.json() as { success: boolean; leadId?: string };

      expect(response.status, sample.label).toBe(200);
      expect(json.success, sample.label).toBe(true);
      expect(json.leadId, sample.label).toBeUndefined();
      expect(sendGridCalls, sample.label).toBe(0);
    }
  });

  it('would send notification mail for a legitimate submission', async () => {
    const response = await worker.fetch(
      buildContactRequest({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '7735550100',
        serviceType: 'monthly',
        message: 'Please call me about monthly cleaning in Mundelein.',
      }),
      env,
    );

    const json = await response.json() as { success: boolean; leadId?: string };
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.leadId).toBeDefined();
    expect(sendGridCalls).toBeGreaterThanOrEqual(1);
  });

  it('returns 400 without sending mail when lastName is only whitespace', async () => {
    const response = await worker.fetch(
      buildContactRequest({
        firstName: 'elopVema',
        lastName: ' ',
        email: 'bot@example.com',
        phone: '',
        serviceType: 'commercial',
        message: 'Need a quote for my office please',
      }),
      env,
    );

    expect(response.status).toBe(400);
    expect(sendGridCalls).toBe(0);
  });

  it('does not require Origin/Referer headers for spam filtering', async () => {
    const body = new FormData();
    const fields = spamContactSamples[0].fields;
    for (const [key, value] of Object.entries(fields)) {
      body.set(key, value);
    }

    const response = await worker.fetch(
      new Request('https://heiser-contact-form.test/', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      }),
      env,
    );

    expect(sendGridCalls).toBe(0);
    expect(response.status).toBe(200);
  });
});
