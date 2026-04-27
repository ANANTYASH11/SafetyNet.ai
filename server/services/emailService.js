/**
 * services/emailService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SafetyNet.ai — Transactional Email Service (Nodemailer + Gmail SMTP)
 *
 * Sends welcome email to new users on registration.
 * Fires in the background — never blocks the API response.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const nodemailer = require('nodemailer');
const logger     = require('../config/logger');

/* ── SMTP transporter ───────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'anantyashh21@gmail.com',
    pass: process.env.SMTP_PASS || 'ddfn mlrb wvfj cvmx',
  },
  tls: { rejectUnauthorized: false },
});

/* ── Welcome email HTML template ───────────────────────────────── */
function buildWelcomeHTML(name) {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to SafetyNet.ai</title>
</head>
<body style="margin:0;padding:0;background:#09090f;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid rgba(124,58,237,0.25);box-shadow:0 32px 80px rgba(0,0,0,0.6);">

        <!-- Header gradient bar -->
        <tr>
          <td style="background:linear-gradient(135deg,#3b0764,#6d28d9,#4c1d95);padding:40px 48px;text-align:center;">
            <!-- Logo row -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:rgba(255,255,255,0.15);border-radius:14px;padding:12px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                        <span style="font-size:28px;line-height:1;">🛡️</span>
                      </td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <span style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.03em;">SafetyNet<span style="color:#c4b5fd;">.ai</span></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 10px;color:white;font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;">
              Welcome aboard, ${firstName}! 🎉
            </h1>
            <p style="margin:0;color:rgba(196,181,253,0.9);font-size:15px;line-height:1.6;">
              Your AI-powered financial safety net is now active.
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0f0f1a;padding:48px 48px 36px;">

            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.75;">
              Hi <strong style="color:#e2e8f0;">${firstName}</strong>,<br/><br/>
              Thank you for joining <strong style="color:#a78bfa;">SafetyNet.ai</strong> — India's first AI-powered emergency fund calculator. 
              You've taken the most important step toward financial security.
            </p>

            <!-- What you get section -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:14px;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;color:#c4b5fd;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">What you get with your account</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${[
                      ['🧠', 'AI Risk Analysis', 'Powered by LLaMA-3.3-70b via Groq — 14 financial factors analysed in real time'],
                      ['📊', 'XGBoost ML Prediction', 'Trained on 8,000 Indian household profiles — R² = 0.949 accuracy'],
                      ['💾', 'Save & Compare Reports', 'Track how your financial health improves over time'],
                      ['📄', 'Downloadable PDF Reports', 'Professional reports with 3-tier investment blueprint'],
                      ['🎯', '12-Month Roadmap', 'Personalised savings plan with monthly milestones'],
                    ].map(([emoji, title, desc]) => `
                    <tr>
                      <td style="padding:8px 0;vertical-align:top;width:32px;">
                        <span style="font-size:18px;">${emoji}</span>
                      </td>
                      <td style="padding:8px 0 8px 12px;vertical-align:top;">
                        <strong style="color:#e2e8f0;font-size:14px;">${title}</strong><br/>
                        <span style="color:#64748b;font-size:13px;line-height:1.5;">${desc}</span>
                      </td>
                    </tr>`).join('')}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Stats strip -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
              <tr>
                ${[['68%', 'Indians have zero emergency fund'],['6–12×', 'Monthly expenses — recommended buffer'],['~2 min', 'To complete your analysis']].map(([val, label]) => `
                <td style="text-align:center;padding:16px 8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;width:33%;">
                  <div style="color:#a78bfa;font-size:22px;font-weight:800;line-height:1;">${val}</div>
                  <div style="color:#475569;font-size:11px;margin-top:6px;line-height:1.4;">${label}</div>
                </td>`).join('<td style="width:8px;"></td>')}
              </tr>
            </table>

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
              <tr>
                <td align="center">
                  <a href="http://localhost:5173" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:-0.01em;box-shadow:0 8px 28px rgba(124,58,237,0.45);">
                    Start Your Analysis →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Demo credentials hint -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:18px 22px;">
                  <p style="margin:0 0 6px;color:#10b981;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">💡 Pro Tip</p>
                  <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                    Your account is ready. Sign in at <strong style="color:#94a3b8;">SafetyNet.ai</strong> and run your first analysis — it takes under 2 minutes.
                    Make sure to fill all 14 factors for the most accurate AI risk score.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">
              If you didn't create this account, you can safely ignore this email.<br/>
              Need help? Reply to this email or reach us at <a href="mailto:anantyashh21@gmail.com" style="color:#a78bfa;text-decoration:none;">anantyashh21@gmail.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#09090f;border-top:1px solid rgba(255,255,255,0.06);padding:24px 48px;text-align:center;">
            <p style="margin:0 0 8px;color:#1e293b;font-size:12px;">
              <span style="color:#334155;">SafetyNet.ai</span>
              <span style="color:#1e293b;margin:0 8px;">·</span>
              <span style="color:#334155;">AI Emergency Fund Calculator</span>
              <span style="color:#1e293b;margin:0 8px;">·</span>
              <span style="color:#334155;">India</span>
            </p>
            <p style="margin:0;color:#1e293b;font-size:11px;">
              No financial data is stored on our servers. All calculations happen locally.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

/* ── Plain-text fallback ────────────────────────────────────────── */
function buildWelcomeText(name) {
  const firstName = name.split(' ')[0];
  return `Welcome to SafetyNet.ai, ${firstName}!

Your AI-powered financial safety net is now active.

What you get:
• AI Risk Analysis — powered by LLaMA-3.3-70b via Groq
• XGBoost ML Prediction — trained on 8,000 Indian household profiles
• Save & Compare Reports
• Downloadable PDF reports
• 12-Month savings roadmap

Get started: http://localhost:5173

— The SafetyNet.ai Team`;
}

/* ── Public API ─────────────────────────────────────────────────── */

/**
 * Send welcome email to a newly registered user.
 * Non-blocking — logs success/failure, never throws.
 *
 * @param {string} toEmail  Recipient email
 * @param {string} name     Full name of the user
 */
async function sendWelcomeEmail(toEmail, name) {
  try {
    const info = await transporter.sendMail({
      from:    '"SafetyNet.ai" <anantyashh21@gmail.com>',
      to:      toEmail,
      subject: `Welcome to SafetyNet.ai, ${name.split(' ')[0]}! 🛡️`,
      text:    buildWelcomeText(name),
      html:    buildWelcomeHTML(name),
    });
    logger.info('Welcome email sent', { to: toEmail, messageId: info.messageId });
  } catch (err) {
    // Never block registration on email failure
    logger.warn('Welcome email failed (non-critical)', {
      to:    toEmail,
      error: err.message,
    });
  }
}

module.exports = { sendWelcomeEmail };
