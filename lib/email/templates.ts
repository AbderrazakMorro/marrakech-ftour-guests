export function invitationEmailHtml(params: {
  guestName: string;
  qrDataUrl: string;
}) {
  const { guestName, qrDataUrl } = params;

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Marrakech Ftour Invitation</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background-color: #1B0B0A;
          color: #FDF4E3;
        }
        .pattern {
          background-image:
            radial-gradient(circle at 1px 1px, rgba(199,154,59,0.25) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .card {
          max-width: 640px;
          margin: 0 auto;
          padding: 32px 24px 40px;
          border-radius: 24px;
          background: linear-gradient(145deg, #2C1512 0%, #1B0B0A 45%, #3B1B16 100%);
          border: 1px solid rgba(199,154,59,0.35);
          box-shadow: 0 24px 80px rgba(0,0,0,0.85);
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(199,154,59,0.1);
          border: 1px solid rgba(199,154,59,0.45);
          color: #F1D7A3;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .lantern {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: radial-gradient(circle at 30% 0%, #FFE6A7, #E67E22 45%, #6E2C00 100%);
          border: 1px solid rgba(253,244,227,0.85);
          box-shadow:
            0 0 24px rgba(248,196,113,0.7),
            0 16px 40px rgba(0,0,0,0.75);
        }
        .qr-wrapper {
          margin-top: 28px;
          padding: 18px 18px 20px;
          border-radius: 22px;
          background: radial-gradient(circle at top, rgba(199,154,59,0.25), transparent 60%);
          border: 1px dashed rgba(241,215,163,0.7);
        }
        .qr-img {
          display: block;
          margin: 8px auto 0;
          width: 180px;
          height: 180px;
          border-radius: 16px;
          background-color: #FDF4E3;
          padding: 12px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.75);
        }
        .footer {
          margin-top: 26px;
          font-size: 11px;
          color: rgba(253,244,227,0.7);
        }
        @media (prefers-color-scheme: light) {
          body {
            background-color: #FDF4E3;
            color: #2C1512;
          }
        }
      </style>
    </head>
    <body class="pattern">
      <div style="padding: 32px 16px;">
        <div class="card">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td align="left" style="padding-bottom: 18px;">
                <span class="pill">
                  <span style="width: 7px; height: 7px; border-radius: 999px; background:#C79A3B; box-shadow:0 0 0 4px rgba(199,154,59,0.35);"></span>
                  <span>MARRAKECH RAMADAN FTOUR</span>
                </span>
              </td>
              <td align="right" style="padding-bottom: 18px;">
                <div class="lantern"></div>
              </td>
            </tr>
          </table>

          <h1 style="font-size: 26px; line-height: 1.25; margin: 0 0 8px; color:#FDF4E3;">
            ${guestName}, your lantern is reserved.
          </h1>
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: rgba(253,244,227,0.88);">
            You are warmly invited to join us for an intimate
            <strong style="color:#F1D7A3;">Ramadan ftour in Marrakech</strong>.
            Under soft lantern light and geometric zellige patterns, we will
            gather to break the fast and share a moment of gratitude.
          </p>
          <p style="margin: 0 0 18px; font-size: 13px; line-height: 1.6; color: rgba(253,244,227,0.8);">
            Please present the QR code below upon arrival so we can welcome you
            and mark your presence. Each invitation is uniquely linked to you.
          </p>

          <div class="qr-wrapper">
            <p style="margin: 0; font-size: 12px; text-align: center; text-transform: uppercase; letter-spacing: 0.16em; color:#F1D7A3;">
              Your Invitation QR Code
            </p>
            <img
              class="qr-img"
              src="${qrDataUrl}"
              alt="Your Marrakech ftour invitation QR code."
            />
            <p style="margin: 12px 0 0; font-size: 11px; text-align: center; color: rgba(253,244,227,0.75);">
              Keep this QR code safe. You can present it on your phone or print it.
            </p>
          </div>

          <div style="margin-top: 22px; font-size: 13px; line-height: 1.6; color: rgba(253,244,227,0.85);">
            <p style="margin: 0 0 4px;">We look forward to sharing this blessed evening with you.</p>
            <p style="margin: 0;"><em>Bessaha wa raha,</em><br/>The Ftour Reception Team</p>
          </div>

          <div class="footer">
            If you did not expect this invitation, you can safely ignore this email.
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}


