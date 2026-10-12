import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../src/index';

const mockEnv = {
  SENDGRID_API_KEY: 'test-sendgrid-key',
  GCP_SERVICE_ACCOUNT_JSON: JSON.stringify({
    client_email: 'test@test.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7\n-----END PRIVATE KEY-----',
  }),
  RECIPIENT_EMAILS: 'test@example.com',
  FROM_EMAIL: 'forms@test.com',
  FROM_NAME: 'Test Forms',
  REDIRECT_URL: 'https://heisergroup.com/thank-you',
  ALLOWED_ORIGINS: '',
  TURNSTILE_SECRET_KEY: '',
};

function createFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

function createRequest(
  formData: FormData,
  options: { origin?: string | null; referer?: string | null; accept?: string } = {}
): Request {
  const headers = new Headers({
    'Accept': options.accept || 'application/json',
  });
  if (options.origin !== null && options.origin !== undefined) {
    headers.set('Origin', options.origin);
  }
  if (options.referer !== null && options.referer !== undefined) {
    headers.set('Referer', options.referer);
  }
  return new Request('https://heiser-contact-form.point-dog-digital.workers.dev', {
    method: 'POST',
    headers,
    body: formData,
  });
}

const validContactForm = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@example.com',
  phone: '773-555-1234',
  serviceType: 'commercial',
  message: 'I need a quote for office cleaning',
};

describe('Origin/Referer Allowlist', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('allows requests from heisergroup.com', async () => {
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://heisergroup.com' });
    const response = await worker.fetch(request, mockEnv);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('allows requests from www.heisergroup.com', async () => {
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://www.heisergroup.com' });
    const response = await worker.fetch(request, mockEnv);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('allows requests from localhost for dev', async () => {
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'http://localhost:4321' });
    const response = await worker.fetch(request, mockEnv);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('blocks requests with null/missing origin and logs "Blocked origin"', async () => {
    const formData = createFormData(validContactForm);
    // Use Accept: text/html so we get redirect instead of JSON
    const request = createRequest(formData, { origin: null, accept: 'text/html' });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://heisergroup.com/thank-you');
    expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked origin', '(none)');
  });

  it('blocks requests from foreign origin and logs "Blocked origin" with value', async () => {
    const formData = createFormData(validContactForm);
    // Use Accept: text/html so we get redirect instead of JSON
    const request = createRequest(formData, { origin: 'https://malicious-site.com', accept: 'text/html' });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(302);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked origin', 'https://malicious-site.com');
  });

  it('falls back to Referer when Origin is missing', async () => {
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { 
      origin: null, 
      referer: 'https://heisergroup.com/contact' 
    });
    const response = await worker.fetch(request, mockEnv);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('respects ALLOWED_ORIGINS env var when set', async () => {
    const envWithCustomOrigins = {
      ...mockEnv,
      ALLOWED_ORIGINS: 'custom-site.com,another-site.com',
    };
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://custom-site.com' });
    const response = await worker.fetch(request, envWithCustomOrigins);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('allows heiser preview site', async () => {
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://heiser-site.point-dog-digital.workers.dev' });
    const response = await worker.fetch(request, mockEnv);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Turnstile Verification', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('skips Turnstile verification when TURNSTILE_SECRET_KEY is unset', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://heisergroup.com' });
    const response = await worker.fetch(request, mockEnv);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('validates Turnstile token when secret is set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('challenges.cloudflare.com')) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(null, { status: 202 });
    }));

    const envWithTurnstile = {
      ...mockEnv,
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    };
    const formData = createFormData({
      ...validContactForm,
      'cf-turnstile-response': 'valid-token',
    });
    const request = createRequest(formData, { origin: 'https://heisergroup.com' });
    const response = await worker.fetch(request, envWithTurnstile);

    const data = await response.json() as { success: boolean };
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects submission with missing Turnstile token when secret is set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    
    const envWithTurnstile = {
      ...mockEnv,
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    };
    const formData = createFormData(validContactForm);
    // Use text/html Accept to get redirect response
    const request = createRequest(formData, { origin: 'https://heisergroup.com', accept: 'text/html' });
    const response = await worker.fetch(request, envWithTurnstile);

    expect(response.status).toBe(302);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Spam rejected',
      expect.stringContaining('missing turnstile token')
    );
  });

  it('rejects submission when Turnstile verification fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('challenges.cloudflare.com')) {
        return new Response(JSON.stringify({ success: false }), { status: 200 });
      }
      return new Response(null, { status: 202 });
    }));

    const envWithTurnstile = {
      ...mockEnv,
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    };
    const formData = createFormData({
      ...validContactForm,
      'cf-turnstile-response': 'invalid-token',
    });
    // Use text/html Accept to get redirect response
    const request = createRequest(formData, { origin: 'https://heisergroup.com', accept: 'text/html' });
    const response = await worker.fetch(request, envWithTurnstile);

    expect(response.status).toBe(302);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Spam rejected',
      expect.stringContaining('failed turnstile verification')
    );
  });
});

describe('SendGrid Logging', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('logs "Lead sent" with form type, timestamp, and SendGrid status on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    
    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://heisergroup.com' });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Lead sent',
      expect.objectContaining({
        formType: 'contact',
        sendGridStatus: 202,
      })
    );
  });

  it('logs error with SendGrid status on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('api.sendgrid.com')) {
        return new Response('Unauthorized', { status: 401 });
      }
      return new Response(null, { status: 202 });
    }));

    const formData = createFormData(validContactForm);
    const request = createRequest(formData, { origin: 'https://heisergroup.com' });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/SendGrid.*401/)
    );
  });

  it('logs "Lead sent" for careers form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    
    const careersForm = {
      form_type: 'careers',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '773-555-9876',
      position: 'scrub-crew-lead',
      message: 'I am interested in joining the team',
    };
    const formData = createFormData(careersForm);
    const request = createRequest(formData, { origin: 'https://heisergroup.com' });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Lead sent',
      expect.objectContaining({
        formType: 'careers',
        sendGridStatus: 202,
      })
    );
  });
});
