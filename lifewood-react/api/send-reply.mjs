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

    <!-- Footer -->
    <div style="padding:24px 40px;text-align:center;border-top:1px solid #eee;margin-top:32px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1A3A2A;">
        Lifewood Data Technology
      </p>
      <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
        Empowering businesses with AI-powered data solutions.
        <br />
        <a href="mailto:support@lifewood.com" style="color:#D4A017;text-decoration:none;">support@lifewood.com</a>
      </p>
    </div>
  `;

  return bodyContent;
}

export default async function handler(req, res) {
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
