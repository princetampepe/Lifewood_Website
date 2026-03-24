/**
 * Netlify Function — /api/send-reply
 * Sends a generic email reply from admin to contact sender via Gmail SMTP.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD set in Netlify environment variables.
 *
 * Expected POST body:
 *   { recipientEmail, recipientName, subject, message }
 */

import nodemailer from 'nodemailer';

function buildReplyEmailHTML({ recipientName, subject, message }) {
  const firstName = recipientName.split(' ')[0];

  const bodyContent = `
    <div style="font-family:'Segoe UI',Roboto,sans-serif;color:#2a2a2a;line-height:1.6;">
      <p style="font-size:16px;margin:0 0 16px;">
        Dear ${firstName},
      </p>
      
      <p style="font-size:16px;margin:0 0 16px;">
        Thank you for reaching out to us. We appreciate your message and are here to help!
      </p>

      <div style="background:#f5f5f5;border-left:4px solid #D4A017;border-radius:8px;padding:16px 20px;margin:24px 0;">
        <p style="font-size:14px;font-weight:600;color:#1A3A2A;margin:0 0 8px;">
          <strong>Re: ${subject || 'Your Message'}</strong>
        </p>
        <p style="font-size:14px;color:#2a2a2a;margin:0;white-space:pre-wrap;">${message}</p>
      </div>

      <p style="font-size:16px;margin:0 0 16px;">
        If you have any further questions or concerns, please don't hesitate to reach out.
      </p>

      <p style="font-size:16px;margin:0 0 8px;">
        Best regards,<br/>
        <strong>Lifewood Data Technology Team</strong>
      </p>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Response from Lifewood</title>
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

      <!-- Body Content -->
      <div style="padding:24px 40px 32px;">
        ${bodyContent}
      </div>

      <!-- Footer -->
      <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1A3A2A;">
          Lifewood Data Technology
        </p>
        <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
          Empowering businesses with AI-powered data solutions across 30+ countries.
          <br />
          <a href="mailto:support@lifewood.com" style="color:#D4A017;text-decoration:none;">support@lifewood.com</a>
          &nbsp;&middot;&nbsp;
          <a href="https://lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;">lifewoodwebsite.com</a>
        </p>
      </div>
    </div>

    <!-- Legal -->
    <p style="text-align:center;font-size:11px;color:#aaa;margin:20px 0 0;line-height:1.6;">
      This is an automated email from Lifewood. Please do not reply directly to this email.
    </p>
  </div>
</body>
</html>
  `.trim();
}
      </p>
    </div>
  `;

  return bodyContent;
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
    console.error('[send-reply] GMAIL_USER or GMAIL_APP_PASSWORD is not configured.');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email service not configured.' }) };
  }

  try {
    const { recipientEmail, recipientName, subject, message } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'recipientEmail is required.' }) };
    }
    if (!recipientName || typeof recipientName !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'recipientName is required.' }) };
    }
    if (!message || typeof message !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'message is required.' }) };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email address.' }) };
    }

    const emailSubject = subject || 'Response from Lifewood Data Technology';
    const html = buildReplyEmailHTML({ recipientName, subject, message });

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
      to: recipientEmail,
      subject: emailSubject,
      html,
    });

    console.log('[send-reply] Email sent:', info.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: 'Reply sent successfully!',
      }),
    };
  } catch (error) {
    console.error('[send-reply] Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email. Please try again.',
        details: error.message,
      }),
    };
  }
};
