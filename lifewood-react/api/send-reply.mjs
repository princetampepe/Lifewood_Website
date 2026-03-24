/**
 * Vercel Serverless Function — /api/send-reply
 * Sends a generic email reply from admin to contact sender via Gmail SMTP.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD set in Vercel env vars.
 *
 * Expected POST body:
 *   { recipientEmail, recipientName, subject, message }
 */

import nodemailer from 'nodemailer';

function buildReplyEmailHTML({ recipientName, subject, message }) {
  const firstName = recipientName.split(' ')[0];

  const bodyContent = `
    <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px;">
      Dear ${firstName},
    </p>
    
    <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px;">
      Thank you for reaching out to us. We appreciate your message!
    </p>

    <div style="background:#f9f9f9;border-left:3px solid #D4A017;border-radius:6px;padding:16px 18px;margin:24px 0;">
      <p style="font-size:13px;font-weight:600;color:#555;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.3px;">
        Re: ${subject || 'Your Message'}
      </p>
      <p style="font-size:14px;line-height:1.8;color:#333;margin:0;white-space:pre-wrap;">${message}</p>
    </div>

    <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px;">
      If you have any further questions, please don't hesitate to reach out.
    </p>

    <p style="font-size:15px;margin:0 0 8px;">
      Best regards,<br/>
      <strong>The Lifewood Team</strong>
    </p>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Response from Lifewood</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif;color:#333;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">

    <!-- Clean Card -->
    <div style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header with Logo Only -->
      <div style="padding:48px 30px 40px;text-align:center;border-bottom:1px solid #f0f0f0;">
        <img src="https://lifewoodwebsite.com/lifewood%20official%20logo/use%20this.png" alt="Lifewood" style="max-width:240px;height:auto;display:block;margin:0 auto;" />
      </div>

      <!-- Body Content -->
      <div style="padding:32px 30px;">
        ${bodyContent}
      </div>

      <!-- Footer -->
      <div style="padding:24px 30px;text-align:center;border-top:1px solid #f0f0f0;background:#fafafa;font-size:12px;">
        <p style="margin:0 0 8px;">
          <a href="mailto:support@lifewood.com" style="color:#D4A017;text-decoration:none;font-weight:600;">support@lifewood.com</a>
          &nbsp;•&nbsp;
          <a href="https://lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;font-weight:600;">lifewoodwebsite.com</a>
        </p>
        <p style="margin:0;color:#999;font-size:11px;">
          This is an automated email from Lifewood.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error('[send-reply] GMAIL_USER or GMAIL_APP_PASSWORD is not configured.');
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  try {
    const { recipientEmail, recipientName, subject, message } = req.body;

    // Validate required fields
    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return res.status(400).json({ error: 'recipientEmail is required.' });
    }
    if (!recipientName || typeof recipientName !== 'string') {
      return res.status(400).json({ error: 'recipientName is required.' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ error: 'Invalid email address.' });
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

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Reply sent successfully!',
    });
  } catch (error) {
    console.error('[send-reply] Error:', error.message);
    return res.status(500).json({
      error: 'Failed to send email. Please try again.',
      details: error.message,
    });
  }
}
