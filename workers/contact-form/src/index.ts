/**
 * Heiser Contact Form Worker
 * Receives form submissions and sends branded emails via SendGrid
 * Logs leads to CDP (BigQuery) for full journey tracking
 */

interface Env {
  SENDGRID_API_KEY: string;
  GCP_SERVICE_ACCOUNT_JSON: string;
  RECIPIENT_EMAILS: string; // Comma-separated list of recipients
  FROM_EMAIL: string;
  FROM_NAME: string;
  REDIRECT_URL: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceType: string;
  message: string;
  pdUserId?: string; // pixel user ID for journey tracking
  sessionId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
    }

    try {
      // Parse form data
      const formData = await request.formData();
      const data: FormData = {
        firstName: formData.get('firstName') as string || '',
        lastName: formData.get('lastName') as string || '',
        email: formData.get('email') as string || '',
        phone: formData.get('phone') as string || '',
        serviceType: formData.get('serviceType') as string || '',
        message: formData.get('message') as string || '',
        // Capture pixel tracking data for journey attribution
        pdUserId: formData.get('_pd_uid') as string || '',
        sessionId: formData.get('_pd_session') as string || '',
        referrer: formData.get('_referrer') as string || request.headers.get('Referer') || '',
        utmSource: formData.get('utm_source') as string || '',
        utmMedium: formData.get('utm_medium') as string || '',
        utmCampaign: formData.get('utm_campaign') as string || '',
      };

      // Validate required fields
      if (!data.firstName || !data.lastName || !data.email || !data.serviceType || !data.message) {
        return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
      }

      // Generate lead ID for tracking
      const leadId = crypto.randomUUID();

      // Log lead to CDP (BigQuery) for journey tracking - don't block on this
      const cdpPromise = logLeadToCDP(env, data, leadId).catch(err => {
        console.error('CDP logging failed:', err);
      });

      // Send notification email to all recipients
      const notificationSent = await sendNotificationEmail(env, data, leadId);
      if (!notificationSent) {
        return jsonResponse({ success: false, error: 'Failed to send notification' }, 500);
      }

      // Send confirmation email to form submitter
      await sendConfirmationEmail(env, data);

      // Wait for CDP logging to complete (but don't fail if it doesn't)
      await cdpPromise;

      // Check if request wants JSON response (AJAX) or redirect (form submission)
      const acceptHeader = request.headers.get('Accept') || '';
      if (acceptHeader.includes('application/json')) {
        return jsonResponse({ success: true, leadId });
      }

      // Redirect to thank you page
      return Response.redirect(env.REDIRECT_URL, 302);

    } catch (error) {
      console.error('Form processing error:', error);
      return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
  },
};

async function sendNotificationEmail(env: Env, data: FormData, leadId: string): Promise<boolean> {
  const html = generateNotificationEmailHtml(data, leadId);

  // Parse recipient emails from comma-separated string
  const recipients = env.RECIPIENT_EMAILS.split(',').map(email => ({ email: email.trim() }));

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: recipients,
          subject: `New Quote Request: ${data.serviceType} - ${data.firstName} ${data.lastName}`,
        },
      ],
      from: {
        email: env.FROM_EMAIL,
        name: env.FROM_NAME,
      },
      reply_to: {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
      },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`SendGrid error: ${response.status} - ${error}`);
    return false;
  }

  return true;
}

async function sendConfirmationEmail(env: Env, data: FormData): Promise<boolean> {
  const html = generateConfirmationEmailHtml(data);

  // Use first recipient as reply-to
  const primaryRecipient = env.RECIPIENT_EMAILS.split(',')[0].trim();

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: data.email, name: `${data.firstName} ${data.lastName}` }],
          subject: `Thanks for contacting The Heiser Group!`,
        },
      ],
      from: {
        email: env.FROM_EMAIL,
        name: 'The Heiser Group',
      },
      reply_to: {
        email: primaryRecipient,
        name: 'The Heiser Group',
      },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`SendGrid confirmation error: ${response.status} - ${error}`);
    return false;
  }

  return true;
}

// ============================================
// CDP / BigQuery Integration
// ============================================

async function logLeadToCDP(env: Env, data: FormData, leadId: string): Promise<void> {
  try {
    const accessToken = await getGCPAccessToken(env);
    if (!accessToken) {
      console.error('Failed to get GCP access token');
      return;
    }

    const projectId = 'spray-squad-cdp';
    const datasetId = 'cdp';
    const tableId = 'leads';

    // Hash PII for privacy
    const emailHash = await sha256(data.email.toLowerCase().trim());
    const phoneHash = data.phone ? await sha256(normalizePhone(data.phone)) : null;

    const row = {
      lead_id: leadId,
      brand_id: 'heiser',
      pd_user_id: data.pdUserId || null,
      session_id: data.sessionId || null,
      created_at: new Date().toISOString(),

      // Contact info (hashed for privacy, raw for CRM)
      email: data.email,
      email_hash: emailHash,
      phone: data.phone || null,
      phone_hash: phoneHash,
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,

      // Lead details
      service_type: data.serviceType,
      message: data.message,
      lead_source: data.utmSource || 'direct',
      lead_medium: data.utmMedium || null,
      lead_campaign: data.utmCampaign || null,
      referrer: data.referrer || null,

      // Status tracking
      status: 'new',
      qualified: null,
      converted: null,
      revenue: null,
    };

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets/${datasetId}/tables/${tableId}/insertAll`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rows: [{ insertId: leadId, json: row }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`BigQuery insert error: ${response.status} - ${error}`);
      return;
    }

    const result = await response.json() as { insertErrors?: unknown[] };
    if (result.insertErrors && result.insertErrors.length > 0) {
      console.error('BigQuery insert errors:', JSON.stringify(result.insertErrors));
    } else {
      console.log(`Lead ${leadId} logged to CDP`);
    }
  } catch (error) {
    console.error('CDP logging error:', error);
  }
}

async function getGCPAccessToken(env: Env): Promise<string | null> {
  try {
    const serviceAccount = JSON.parse(env.GCP_SERVICE_ACCOUNT_JSON);

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/bigquery.insertdata',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    const jwt = await signJWT(header, payload, serviceAccount.private_key);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      console.error('GCP token error:', await response.text());
      return null;
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error('Failed to get GCP access token:', error);
    return null;
  }
}

async function signJWT(header: object, payload: object, privateKeyPem: string): Promise<string> {
  const encoder = new TextEncoder();

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${unsignedToken}.${signatureB64}`;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? '1' + digits : digits;
}

function generateConfirmationEmailHtml(data: FormData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #D1623C; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">The Heiser Group</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Professional Cleaning Services</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1A2B3D; font-size: 24px; font-weight: 600;">Thanks for reaching out, ${escapeHtml(data.firstName)}!</h2>

              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                We've received your request for <strong>${escapeHtml(data.serviceType)}</strong> and will get back to you within 24 hours (usually much sooner).
              </p>

              <!-- What You Submitted -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #1A2B3D; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Message</h3>
                <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
              </div>

              <!-- What Happens Next -->
              <h3 style="margin: 0 0 16px; color: #1A2B3D; font-size: 18px; font-weight: 600;">What happens next?</h3>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #D1623C; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</span>
                        </td>
                        <td style="color: #333; font-size: 15px;">We'll review your request and any specific details you've shared.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #D1623C; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</span>
                        </td>
                        <td style="color: #333; font-size: 15px;">A team member will reach out to discuss your needs and provide a quote.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #D1623C; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</span>
                        </td>
                        <td style="color: #333; font-size: 15px;">Once approved, we'll schedule your service at a time that works for you.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Need to reach us sooner? Give us a call!
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="tel:+17735455200" style="display: inline-block; background-color: #1A2B3D; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">(773) 545-5200</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1A2B3D; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">The Heiser Group</p>
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                Professional Cleaning Services in Lake County, IL
              </p>
              <p style="margin: 16px 0 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                <a href="https://heisergroup.com" style="color: rgba(255,255,255,0.7); text-decoration: none;">heisergroup.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function generateNotificationEmailHtml(data: FormData, leadId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #D1623C; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">New Quote Request</h1>
                    <p style="margin: 4px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">The Heiser Group Website</p>
                  </td>
                  <td align="right" valign="middle">
                    <span style="color: #ffffff; font-size: 12px; opacity: 0.8;">Lead #${escapeHtml(leadId.slice(0, 8))}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Service Type Banner -->
          <tr>
            <td style="background-color: #1A2B3D; padding: 16px 32px;">
              <p style="margin: 0; color: #ffffff; font-size: 16px;">
                <strong>Service:</strong> ${escapeHtml(data.serviceType)}
              </p>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <h2 style="margin: 0 0 16px; color: #1A2B3D; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Contact Information</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; padding: 16px;">
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e9ecef;">
                          <span style="color: #6c757d; font-size: 12px; text-transform: uppercase;">Name</span><br>
                          <span style="color: #1A2B3D; font-size: 16px; font-weight: 500;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e9ecef;">
                          <span style="color: #6c757d; font-size: 12px; text-transform: uppercase;">Email</span><br>
                          <a href="mailto:${escapeHtml(data.email)}" style="color: #D1623C; font-size: 16px; text-decoration: none;">${escapeHtml(data.email)}</a>
                        </td>
                      </tr>
                      ${data.phone ? `
                      <tr>
                        <td style="padding: 12px 16px;">
                          <span style="color: #6c757d; font-size: 12px; text-transform: uppercase;">Phone</span><br>
                          <a href="tel:${escapeHtml(data.phone)}" style="color: #D1623C; font-size: 16px; text-decoration: none;">${escapeHtml(data.phone)}</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px; color: #1A2B3D; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Message</h2>
                    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; border-left: 4px solid #D1623C;">
                      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Actions -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-right: 8px;">
                    <a href="mailto:${escapeHtml(data.email)}?subject=Re: Your Quote Request - The Heiser Group" style="display: inline-block; background-color: #D1623C; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Reply to ${escapeHtml(data.firstName)}</a>
                  </td>
                  ${data.phone ? `
                  <td align="center" style="padding-left: 8px;">
                    <a href="tel:${escapeHtml(data.phone)}" style="display: inline-block; background-color: #1A2B3D; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Call ${escapeHtml(data.firstName)}</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 32px; border-top: 1px solid #e9ecef;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                      This message was sent from the contact form at heisergroup.com
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                      Powered by <a href="https://point.dog" style="color: #D1623C; text-decoration: none;">point.dog</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
