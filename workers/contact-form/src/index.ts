/**
 * Heiser Contact Form Worker
 * Receives form submissions and sends branded emails via SendGrid
 */

interface Env {
  SENDGRID_API_KEY: string;
  HEISER_EMAIL: string;
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
      };

      // Validate required fields
      if (!data.firstName || !data.lastName || !data.email || !data.serviceType || !data.message) {
        return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
      }

      // Send notification email to Heiser
      const notificationSent = await sendNotificationEmail(env, data);
      if (!notificationSent) {
        return jsonResponse({ success: false, error: 'Failed to send notification' }, 500);
      }

      // Send confirmation email to form submitter
      await sendConfirmationEmail(env, data);

      // Check if request wants JSON response (AJAX) or redirect (form submission)
      const acceptHeader = request.headers.get('Accept') || '';
      if (acceptHeader.includes('application/json')) {
        return jsonResponse({ success: true });
      }

      // Redirect to thank you page
      return Response.redirect(env.REDIRECT_URL, 302);

    } catch (error) {
      console.error('Form processing error:', error);
      return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
  },
};

async function sendNotificationEmail(env: Env, data: FormData): Promise<boolean> {
  const html = generateNotificationEmailHtml(data);

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: env.HEISER_EMAIL }],
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
        email: env.HEISER_EMAIL,
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

function generateNotificationEmailHtml(data: FormData): string {
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
                    <span style="color: #ffffff; font-size: 12px; opacity: 0.8;">via point.dog</span>
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
