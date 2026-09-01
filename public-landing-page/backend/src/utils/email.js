const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Create the best available transporter:
 * 1. Brevo SMTP (if BREVO_API_KEY set) — instant, free, no App Password needed
 * 2. Gmail SMTP (if SMTP_USER + SMTP_PASSWORD set and valid)
 * 3. Ethereal (dev fallback — preview URL logged to console)
 */
async function getTransporter() {
    // Option 1: Brevo (most reliable, instant delivery)
    if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes('your_')) {
        logger.info('📧 Using Brevo SMTP');
        return nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER,
                pass: process.env.BREVO_API_KEY
            }
        });
    }

    // Option 2: Gmail with App Password (must be exactly 16 chars)
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const isGmailReady = smtpUser && smtpPass &&
        smtpUser.includes('@') &&
        !smtpUser.includes('your_') &&
        !smtpPass.includes('your_') &&
        smtpPass.replace(/\s/g, '').length === 16;

    if (isGmailReady) {
        logger.info(`📧 Using Gmail SMTP: ${smtpUser}`);
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: smtpUser, pass: smtpPass.replace(/\s/g, '') }
        });
    }

    // Option 3: Ethereal dev fallback
    logger.warn('📧 No email provider configured — using Ethereal (dev preview only)');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
}

function buildWelcomeHtml({ officerName, officerEmail, password, department, loginUrl }) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">CivicPath</h1>
            <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Government Complaint Management System</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:20px;">Welcome, ${officerName}!</h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:14px;line-height:1.6;">
              You have been registered as an officer on CivicPath. Here are your login credentials.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1.5px solid #bfdbfe;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">Your Login Credentials</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:7px 0;border-bottom:1px solid #dbeafe;font-size:13px;color:#6b7280;">Department</td>
                      <td style="padding:7px 0;border-bottom:1px solid #dbeafe;font-size:13px;color:#1e3a5f;font-weight:600;text-align:right;">${department}</td></tr>
                  <tr><td style="padding:7px 0;border-bottom:1px solid #dbeafe;font-size:13px;color:#6b7280;">Email</td>
                      <td style="padding:7px 0;border-bottom:1px solid #dbeafe;font-size:13px;color:#1e3a5f;font-weight:600;text-align:right;">${officerEmail}</td></tr>
                  <tr><td style="padding:7px 0;font-size:13px;color:#6b7280;">Password</td>
                      <td style="padding:7px 0;text-align:right;">
                        <span style="font-family:monospace;background:#1e3a5f;color:#fff;padding:3px 10px;border-radius:6px;font-size:14px;font-weight:700;">${password}</span>
                      </td></tr>
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:12px 16px;font-size:13px;color:#92400e;">
                ⚠️ <strong>Security Notice:</strong> This password is shown only once. Please change it after first login.
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;text-decoration:none;padding:13px 36px;border-radius:10px;font-weight:700;font-size:14px;">
                  Login to CivicPath →
                </a>
              </td></tr>
            </table>
            <p style="color:#9ca3af;font-size:11px;text-align:center;margin:24px 0 0;">
              This is an automated message — please do not reply.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;">© ${new Date().getFullYear()} CivicPath · Government Complaint Management</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendOfficerWelcomeEmail({ officerName, officerEmail, password, department, loginUrl }) {
    try {
        const transporter = await getTransporter();
        const fromName = process.env.EMAIL_FROM_NAME || 'CivicPath';
        const fromEmail = process.env.BREVO_SMTP_USER || process.env.SMTP_USER || 'noreply@civicpath.gov';

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: officerEmail,
            subject: 'Welcome to CivicPath — Your Login Credentials',
            html: buildWelcomeHtml({ officerName, officerEmail, password, department, loginUrl }),
            text: `Welcome ${officerName}!\n\nDepartment: ${department}\nEmail: ${officerEmail}\nPassword: ${password}\n\nLogin: ${loginUrl}`
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) logger.info(`📧 Ethereal preview: ${previewUrl}`);
        logger.info(`📧 Email sent to ${officerEmail} (${info.messageId})`);
        return { success: true, messageId: info.messageId, previewUrl };
    } catch (error) {
        logger.error(`📧 Email failed to ${officerEmail}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function resendOfficerCredentials({ officerName, officerEmail, department, loginUrl }) {
    try {
        const transporter = await getTransporter();
        const fromName = process.env.EMAIL_FROM_NAME || 'CivicPath';
        const fromEmail = process.env.BREVO_SMTP_USER || process.env.SMTP_USER || 'noreply@civicpath.gov';

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: officerEmail,
            subject: 'CivicPath — Login Reminder',
            html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
              <h2 style="color:#1e3a5f;">Login Reminder</h2>
              <p>Hi ${officerName}, your CivicPath login details:</p>
              <p><strong>Email:</strong> ${officerEmail}</p>
              <p><strong>Department:</strong> ${department}</p>
              <a href="${loginUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Login →</a>
            </div>`,
            text: `Hi ${officerName}, login at: ${loginUrl} with email: ${officerEmail}`
        });

        logger.info(`📧 Reminder sent to ${officerEmail}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`📧 Reminder failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

module.exports = { sendOfficerWelcomeEmail, resendOfficerCredentials };
