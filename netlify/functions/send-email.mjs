/**
 * Netlify Function — /api/send-email
 * Sends application status notification emails via Gmail SMTP (Nodemailer).
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD set in Netlify environment variables.
 *
 * Expected POST body:
 *   { applicantName, applicantEmail, position, status, applicationDate? }
 *
 * status: "accepted" | "rejected"
 */

import nodemailer from 'nodemailer';

/**
 * Build a clean, branded HTML email for application status notifications.
 */
function buildEmailHTML({ applicantName, position, status, applicationDate }) {
  const firstName = applicantName.split(' ')[0];
  const isAccepted = status === 'accepted';
  const accentColor = isAccepted ? '#1A3A2A' : '#6F7F83';
  const badgeColor = isAccepted ? '#D4A017' : '#6F7F83';
  const badgeText = isAccepted ? 'Application Accepted' : 'Application Update';
  const dateStr = applicationDate
    ? new Date(applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  const bodyContent = isAccepted
    ? `
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        Dear ${firstName},
      </p>
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        We are thrilled to inform you that your application for the position of
        <strong style="color:${accentColor};">${position}</strong> at Lifewood has been
        <strong style="color:#D4A017;">accepted</strong>!
      </p>
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        Congratulations! Your qualifications and experience stood out among many applicants,
        and we believe you will be a fantastic addition to our team.
      </p>

      <div style="background:#f8f6f1;border-left:4px solid #D4A017;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="font-size:15px;font-weight:700;color:#1A3A2A;margin:0 0 12px;">
          <span style="margin-right:8px;">&#128203;</span>Next Steps
        </p>
        <ol style="font-size:14px;line-height:1.8;color:#2a2a2a;margin:0;padding-left:20px;">
          <li>Our HR team will reach out to you within <strong>3-5 business days</strong> with onboarding details.</li>
          <li>Please prepare a valid government-issued ID for verification purposes.</li>
          <li>You will receive a separate email with your employment contract and start date information.</li>
          <li>If you have any questions in the meantime, please email us at <a href="mailto:hr@lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;font-weight:600;">hr@lifewoodwebsite.com</a>.</li>
        </ol>
      </div>

      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        We are excited to welcome you to the Lifewood family and look forward to the contributions
        you will bring to our mission of empowering businesses with AI-powered data solutions.
      </p>
    `
    : `
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        Dear ${firstName},
      </p>
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        Thank you for your interest in the
        <strong style="color:${accentColor};">${position}</strong> position at Lifewood
        and for taking the time to apply.
      </p>
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        After careful consideration, we regret to inform you that we have decided to move forward
        with other candidates whose profiles more closely match our current needs for this role.
      </p>
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        This decision does not reflect on your abilities or potential. We were genuinely impressed
        by your application and encourage you to apply for future openings that align with your skills
        and experience.
      </p>

      <div style="background:#f8f6f1;border-left:4px solid #6F7F83;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="font-size:15px;font-weight:700;color:#1A3A2A;margin:0 0 8px;">
          <span style="margin-right:8px;">&#128161;</span>Stay Connected
        </p>
        <p style="font-size:14px;line-height:1.7;color:#2a2a2a;margin:0;">
          We encourage you to keep an eye on our
          <a href="https://lifewoodwebsite.com/careers" style="color:#D4A017;text-decoration:none;font-weight:600;">Careers page</a>
          for new opportunities. Your profile will be kept on file, and we may reach out if a
          suitable position becomes available.
        </p>
      </div>

      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        We sincerely appreciate your interest in joining Lifewood and wish you the very
        best in your career journey.
      </p>
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${badgeText} — Lifewood</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,58,42,0.08);">

      <!-- Header Banner with Logo -->
      <div style="background:linear-gradient(135deg,#1A3A2A 0%,#0D2A1E 100%);padding:32px 40px;text-align:center;">
        <!-- Logo -->
        <img src="https://lifewoodwebsite.com/lifewood%20official%20logo/use%20this.png" alt="Lifewood Logo" style="max-width:200px;height:auto;margin:0 auto 20px;display:block;" />
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#F5F1EB;letter-spacing:0.5px;">
          LIFEWOOD
        </h1>
        <p style="margin:0;font-size:13px;color:rgba(245,241,235,0.6);letter-spacing:1px;text-transform:uppercase;">
          Data Technology
        </p>
      </div>

      <!-- Status Badge -->
      <div style="text-align:center;padding:28px 40px 0;">
        <span style="display:inline-block;background:${badgeColor};color:#fff;padding:6px 20px;border-radius:50px;font-size:13px;font-weight:700;letter-spacing:0.5px;">
          ${badgeText}
        </span>
      </div>

      <!-- Body Content -->
      <div style="padding:24px 40px 32px;">
        ${bodyContent}
      </div>

      <!-- Application Details -->
      <div style="background:#faf9f7;padding:20px 40px;border-top:1px solid #eee;">
        <table style="width:100%;font-size:13px;color:#555;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#1A3A2A;">Position:</td>
            <td style="padding:4px 0;text-align:right;">${position}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#1A3A2A;">Applied:</td>
            <td style="padding:4px 0;text-align:right;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#1A3A2A;">Status:</td>
            <td style="padding:4px 0;text-align:right;">
              <span style="color:${badgeColor};font-weight:700;">
                ${isAccepted ? 'Accepted' : 'Not Selected'}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1A3A2A;">
          Lifewood Data Technology
        </p>
        <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
          Empowering businesses with AI-powered data solutions across 30+ countries.
          <br />
          <a href="mailto:hr@lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;">hr@lifewoodwebsite.com</a>
          &nbsp;&middot;&nbsp;
          <a href="https://lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;">lifewoodwebsite.com</a>
        </p>
      </div>
    </div>

    <!-- Unsubscribe / Legal -->
    <p style="text-align:center;font-size:11px;color:#aaa;margin:20px 0 0;line-height:1.6;">
      This is an automated notification from Lifewood regarding your job application.
      <br />
      If you did not apply for a position at Lifewood, please disregard this email.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error('[send-email] GMAIL_USER or GMAIL_APP_PASSWORD is not configured.');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email service not configured.' }) };
  }

  try {
    const { applicantName, applicantEmail, position, status, applicationDate } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!applicantName || typeof applicantName !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'applicantName is required.' }) };
    }
    if (!applicantEmail || typeof applicantEmail !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'applicantEmail is required.' }) };
    }
    if (!position || typeof position !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'position is required.' }) };
    }
    if (status !== 'accepted' && status !== 'rejected') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'status must be "accepted" or "rejected".' }) };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email address.' }) };
    }

    const subject = status === 'accepted'
      ? `Congratulations! Your Application for ${position} Has Been Accepted — Lifewood`
      : `Application Update: ${position} — Lifewood`;

    const html = buildEmailHTML({ applicantName, position, status, applicationDate });

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `Lifewood <${gmailUser}>`,
      to: applicantEmail,
      subject,
      html,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        emailId: info.messageId,
        message: `Email sent to ${applicantEmail}`,
      }),
    };
  } catch (err) {
    console.error('[send-email] Internal error:', err);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Failed to send email.', details: err.message || 'Unknown error' }),
    };
  }
};
