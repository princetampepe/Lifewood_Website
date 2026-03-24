/**
 * Vercel Serverless Function — /api/send-email
 * Sends application status notification emails via Gmail SMTP (Nodemailer).
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD set in Vercel env vars.
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
        We are excited to let you know that your application for the position of
        <strong style="color:${accentColor};">${position}</strong> at Lifewood has been
        <strong style="color:#D4A017;">accepted!</strong>
      </p>
      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        As the next step in our hiring process, you will be invited for an <strong>onsite interview</strong>.
        Our HR team will be reaching out to you within <strong>3-5 business days</strong> to confirm the exact
        date, time, and venue. Please keep an eye on your email and phone for our follow-up.
      </p>

      <div style="background:#f8f6f1;border-left:4px solid #D4A017;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="font-size:15px;font-weight:700;color:#1A3A2A;margin:0 0 12px;">
          <span style="margin-right:8px;">📋</span>What to Prepare
        </p>
        <ol style="font-size:14px;line-height:1.8;color:#2a2a2a;margin:0;padding-left:20px;">
          <li>A valid <strong>government-issued ID</strong> for verification purposes.</li>
          <li>An updated copy of your <strong>resume</strong> and any supporting documents.</li>
          <li>Be ready to discuss your background, skills, and experience related to the <strong>${position}</strong> role.</li>
          <li>For any questions, feel free to reach out at <a href="mailto:hr@lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;font-weight:600;">hr@lifewoodwebsite.com</a>.</li>
        </ol>
      </div>

      <p style="font-size:16px;line-height:1.7;color:#2a2a2a;margin:0 0 16px;">
        We are looking forward to meeting you and learning more about what you can bring to the Lifewood team.
        See you soon!
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
          <span style="margin-right:8px;">💡</span>Stay Connected
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
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif;color:#333;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">

    <!-- Clean Card -->
    <div style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header with Logo Only -->
      <div style="padding:48px 30px 40px;text-align:center;border-bottom:1px solid #f0f0f0;">
        <img src="https://lifewoodwebsite.com/lifewood%20official%20logo/use%20this.png" alt="Lifewood" style="max-width:240px;height:auto;display:block;margin:0 auto;" />
      </div>

      <!-- Status Badge -->
      <div style="text-align:center;padding:32px 30px 0;">
        <span style="display:inline-block;background:${badgeColor};color:#fff;padding:10px 28px;border-radius:50px;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">
          ${badgeText}
        </span>
      </div>

      <!-- Body Content -->
      <div style="padding:32px 30px;">
        ${bodyContent}
      </div>

      <!-- Details Box -->
      <div style="background:#fafafa;padding:20px 30px;border-top:1px solid #f0f0f0;">
        <table style="width:100%;font-size:13px;" cellpadding="0" cellspacing="0">
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:8px 0;font-weight:600;color:#555;">Position</td>
            <td style="padding:8px 0;text-align:right;color:#333;">${position}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:8px 0;font-weight:600;color:#555;">Applied</td>
            <td style="padding:8px 0;text-align:right;color:#333;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#555;">Status</td>
            <td style="padding:8px 0;text-align:right;color:${badgeColor};font-weight:700;">
              ${isAccepted ? 'Accepted' : 'Not Selected'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="padding:24px 30px;text-align:center;border-top:1px solid #f0f0f0;background:#fafafa;font-size:12px;">
        <p style="margin:0 0 8px;">
          <a href="mailto:hr@lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;font-weight:600;">hr@lifewoodwebsite.com</a>
          &nbsp;•&nbsp;
          <a href="https://lifewoodwebsite.com" style="color:#D4A017;text-decoration:none;font-weight:600;">lifewoodwebsite.com</a>
        </p>
        <p style="margin:0;color:#999;font-size:11px;">
          This is an automated notification from Lifewood.
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
    console.error('[send-email] GMAIL_USER or GMAIL_APP_PASSWORD is not configured.');
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  try {
    const { applicantName, applicantEmail, position, status, applicationDate } = req.body;

    // Validate required fields
    if (!applicantName || typeof applicantName !== 'string') {
      return res.status(400).json({ error: 'applicantName is required.' });
    }
    if (!applicantEmail || typeof applicantEmail !== 'string') {
      return res.status(400).json({ error: 'applicantEmail is required.' });
    }
    if (!position || typeof position !== 'string') {
      return res.status(400).json({ error: 'position is required.' });
    }
    if (status !== 'accepted' && status !== 'rejected') {
      return res.status(400).json({ error: 'status must be "accepted" or "rejected".' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const subject = status === 'accepted'
      ? `Your Application for ${position} Has Been Accepted — Lifewood`
      : `Application Update: ${position} — Lifewood`;

    const html = buildEmailHTML({
      applicantName,
      position,
      status,
      applicationDate,
    });

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

    return res.status(200).json({
      success: true,
      emailId: info.messageId,
      message: `Email sent to ${applicantEmail}`,
    });
  } catch (err) {
    console.error('[send-email] Internal error:', err);
    return res.status(502).json({
      error: 'Failed to send email.',
      details: err.message || 'Unknown error',
    });
  }
}
