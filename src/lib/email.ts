import nodemailer from 'nodemailer';
import { CATEGORY_LABELS } from './utils';

// Configure transporter with environment variables
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || `"PropDesk IT Alerts" <${smtpUser || 'noreply@propdeskit.com'}>`;
const adminNotificationEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || smtpUser;

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export interface SendNewTicketAlertParams {
  ticket: {
    ticketNumber: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    requesterName: string;
    requesterEmail: string;
    createdAt?: Date | string;
    status?: string;
  };
  company: {
    name: string;
    prefix: string;
  };
  appUrl?: string;
}

export async function sendNewTicketNotification({
  ticket,
  company,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: SendNewTicketAlertParams) {
  if (!adminNotificationEmail) {
    console.log(`[Email Service] NOTIFICATION_EMAIL or SMTP_USER not set. Alert email skipped for ${ticket.ticketNumber}`);
    return { success: false, reason: 'No notification email configured' };
  }

  const categoryLabel = (CATEGORY_LABELS as any)[ticket.category]?.label || ticket.category;
  const priorityColor = ticket.priority === 'CRITICAL' ? '#dc2626' : ticket.priority === 'HIGH' ? '#ea580c' : '#2563eb';
  const ticketUrl = `${appUrl}/tickets`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #0f172a; padding: 24px; color: #ffffff; text-align: left; border-bottom: 3px solid ${priorityColor}; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
          .priority-badge { background-color: ${priorityColor}; color: #ffffff; }
          .ticket-id { font-family: monospace; font-size: 18px; font-weight: bold; color: #60a5fa; }
          .content { padding: 24px; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .info-table td.label { font-weight: 600; color: #64748b; width: 35%; background: #f8fafc; }
          .desc-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 4px; font-size: 14px; line-height: 1.5; color: #334155; }
          .btn-container { text-align: center; margin-top: 24px; }
          .btn { background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; }
          .footer { padding: 16px; background: #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="ticket-id">[${ticket.ticketNumber}]</span>
              <span class="badge priority-badge">Priority ${ticket.priority}</span>
            </div>
            <h2 style="margin: 10px 0 0 0; font-size: 18px; color: #ffffff;">${ticket.title}</h2>
          </div>
          
          <div class="content">
            <p style="margin-top: 0; font-size: 14px; color: #475569;">
              A new IT incident report has been submitted via the support portal:
            </p>

            <table class="info-table">
              <tr>
                <td class="label">Company (Real Estate):</td>
                <td><strong>${company.name}</strong> (${company.prefix})</td>
              </tr>
              <tr>
                <td class="label">Requester User:</td>
                <td><strong>${ticket.requesterName}</strong></td>
              </tr>
              <tr>
                <td class="label">Requester Email:</td>
                <td><a href="mailto:${ticket.requesterEmail}">${ticket.requesterEmail}</a></td>
              </tr>
              <tr>
                <td class="label">Technical Category:</td>
                <td>${categoryLabel}</td>
              </tr>
              <tr>
                <td class="label">Initial Status:</td>
                <td><strong style="color: #ea580c;">OPEN (Pending)</strong></td>
              </tr>
            </table>

            <h4 style="margin: 16px 0 8px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">
              Reported Issue Description:
            </h4>
            <div class="desc-box">
              ${ticket.description.replace(/\n/g, '<br>')}
            </div>

            <div class="btn-container">
              <a href="${ticketUrl}" class="btn">
                View & Manage Incident in Dashboard →
              </a>
            </div>
          </div>

          <div class="footer">
            PropDesk IT Support System • Automated Support Dispatch Notification
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service - Simulated] Configure SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables to send live emails.`);
    console.log(`[Email Service] Recipient: ${adminNotificationEmail}`);
    console.log(`[Email Service] Subject: 🚨 [NEW INCIDENT - ${ticket.priority}] ${ticket.ticketNumber}: ${ticket.title}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: adminNotificationEmail,
      subject: `🚨 [NEW INCIDENT - ${ticket.priority}] ${ticket.ticketNumber}: ${ticket.title} (${company.name})`,
      html: htmlContent,
    });

    console.log(`[Email Service] Alert email delivered successfully. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Service Error] Failed to send email alert:`, error.message);
    return { success: false, error: error.message };
  }
}
