import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const QR_CID = 'qrcode';

/** Extract raw base64 from data URL; Resend API expects base64 string, not Buffer. */
function dataUrlToBase64(dataUrl) {
  const match = /^data:image\/\w+;base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid QR data URL');
  return match[1];
}

export async function sendQRCodeEmail(attendee, qrCodeBase64) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service not configured' };
  }
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.FROM_NAME || 'Times10';
  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

  let attachmentContent;
  try {
    attachmentContent = dataUrlToBase64(qrCodeBase64);
  } catch (e) {
    console.error('Invalid QR code data URL:', e);
    return { success: false, error: 'Invalid QR code image' };
  }

  const attachments = [
    {
      filename: 'qrcode.png',
      content: attachmentContent,
      contentType: 'image/png',
      inlineContentId: QR_CID,
    },
  ];

  const { data, error } = await resend.emails.send({
    from,
    to: attendee.email,
    subject: 'Your Event Registration QR Code',
    attachments,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d63a2e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .qr-container { text-align: center; margin: 20px 0; }
          .qr-code { border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; background: white; }
          .check-in-note { font-size: 1.1em; color: #d63a2e; margin: 12px 0 4px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header"><h1>You're Registered!</h1></div>
        <div class="content">
          <p>Hi <strong>${attendee.firstName} ${attendee.lastName}</strong>,</p>
          <p>Thank you for registering — we're excited to have you! Your unique QR code is below.</p>
          <div class="qr-container">
            <img src="cid:${QR_CID}" alt="Your QR Code" class="qr-code" />
            <p class="check-in-note"><strong>Scan this at check-in.</strong></p>
            <p><em>Show this code on your phone when you arrive.</em></p>
          </div>
          <div class="details">
            <h3>Registration Details:</h3>
            <p><strong>Name:</strong> ${attendee.firstName} ${attendee.lastName}</p>
            <p><strong>Email:</strong> ${attendee.email}</p>
            ${attendee.company ? `<p><strong>Company:</strong> ${attendee.company}</p>` : ''}
            ${attendee.dietaryRestrictions ? `<p><strong>Dietary Restrictions:</strong> ${attendee.dietaryRestrictions}</p>` : ''}
            <p><strong>Registration Date:</strong> ${new Date(attendee.rsvpAt).toLocaleDateString()}</p>
          </div>
          <p>We look forward to seeing you at the event!</p>
        </div>
        <div class="footer"><p>This is an automated message. Please do not reply to this email.</p></div>
      </body>
      </html>
    `,
  });
  if (error) {
    console.error('Resend API error:', error);
    const msg = String(error.message || '');
    // Resend 403: domain not verified or can only send to your own email
    if (msg.includes('own email') || msg.includes('verify a domain') || msg.includes('not verified')) {
      return {
        success: false,
        error: 'Resend: Verify your domain at resend.com/domains so you can send to any email. Until then, set FROM_EMAIL=onboarding@resend.dev in .env and only RSVP using the email you signed up to Resend with.',
      };
    }
    return { success: false, error: error.message };
  }
  return { success: true, data };
}
