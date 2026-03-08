import nodemailer from "nodemailer";
import { invitationEmailHtml } from "./templates";

const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn(
    "SMTP_USER or SMTP_PASS is not set. Invitation emails will fail until configured."
  );
}

const transporter =
  SMTP_USER && SMTP_PASS
    ? (() => {
      console.log("[Mailer] Initializing transporter with user:", SMTP_USER);
      return nodemailer.createTransport({
        host: SMTP_HOST || "smtp.gmail.com",
        port: SMTP_PORT ? Number(SMTP_PORT) : 587,
        secure: SMTP_PORT ? Number(SMTP_PORT) === 465 : false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });
    })()
    : (() => {
      console.warn("[Mailer] Transporter NOT initialized - SMTP_USER or SMTP_PASS missing.");
      return null;
    })();

export async function sendInvitationEmail(params: {
  email: string;
  firstName: string;
  lastName: string;
  qrCode: string;
}) {
  console.log(`[Mailer] Starting invitation email process for: ${params.email}`);

  if (!transporter) {
    console.warn("[Mailer] Transporter not configured; skipping invitation email send.");
    return;
  }

  try {
    const base64QR = params.qrCode.replace(/^data:image\/png;base64,/, '');

    const mailOptions = {
      from: `"Clube Culture ISGI Team" <${SMTP_USER}>`,
      to: params.email,
      subject: 'Invitation au Ftour Collectif à ISGI Marrakech',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; padding: 40px 30px 20px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 12px 24px; border-radius: 30px; margin-bottom: 20px;">
                <span style="color: white; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Invitation Officielle</span>
              </div>
              <h1 style="color: #f8fafc; font-size: 26px; margin: 15px 0 5px;">Ftour Collectif</h1>
              <p style="color: #94a3b8; font-size: 16px; margin: 0;">ISGI Marrakech</p>
            </div>
            <div style="padding: 20px 30px;">
              <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #94a3b8; margin: 0 0 5px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Invité(e)</p>
                <p style="color: #f8fafc; font-size: 20px; font-weight: 600; margin: 0;">${params.firstName} ${params.lastName}</p>
              </div>
              <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="flex:1; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.1);">
                  <p style="color: #94a3b8; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Date</p>
                  <p style="color: #f8fafc; font-size: 16px; font-weight: 600; margin: 0;">12/03/2026</p>
                </div>
                <div style="flex:1; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.1);">
                  <p style="color: #94a3b8; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Heure</p>
                  <p style="color: #f8fafc; font-size: 16px; font-weight: 600; margin: 0;">17:30</p>
                </div>
              </div>
            </div>
            <div style="text-align: center; padding: 10px 30px 30px;">
              <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Présentez ce QR Code à l'entrée</p>
              <div style="display: inline-block; background: white; padding: 15px; border-radius: 12px;">
                <img src="cid:qrcode" alt="QR Code" style="width: 180px; height: 180px;" />
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #64748b; font-size: 12px; margin: 0;">InvitesHub • Gestion d'invitations</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: base64QR,
          encoding: 'base64',
          cid: 'qrcode',
        }
      ],
    };

    console.log("[Mailer] Sending email via transporter...");
    const info = await transporter.sendMail(mailOptions);
    console.log("[Mailer] Email sent successfully! ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("[Mailer] Unexpected error in sendInvitationEmail:", error);
    throw error;
  }
}
