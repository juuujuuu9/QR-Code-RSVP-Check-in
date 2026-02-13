import { Resend } from 'resend';
import type { Attendee } from '../types/attendee.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendQRCodeEmail(attendee: Attendee, qrCodeBase64: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'events@yourdomain.com',
      to: attendee.email,
      subject: 'Your Event Registration QR Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .qr-container { text-align: center; margin: 20px 0; }
            .qr-code { border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; background: white; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>You're Registered!</h1>
          </div>
          
          <div class="content">
            <p>Hi <strong>${attendee.firstName} ${attendee.lastName}</strong>,</p>
            
            <p>Thank you for registering for our event! Your registration has been confirmed. Please find your QR code below which you'll need to present at the event entrance for check-in.</p>
            
            <div class="qr-container">
              <img src="${qrCodeBase64}" alt="Your QR Code" class="qr-code" />
              <p><em>Show this QR code at the event entrance</em></p>
            </div>
            
            <div class="details">
              <h3>Registration Details:</h3>
              <p><strong>Name:</strong> ${attendee.firstName} ${attendee.lastName}</p>
              <p><strong>Email:</strong> ${attendee.email}</p>
              ${attendee.company ? `<p><strong>Company:</strong> ${attendee.company}</p>` : ''}
              ${attendee.dietaryRestrictions ? `<p><strong>Dietary Restrictions:</strong> ${attendee.dietaryRestrictions}</p>` : ''}
              <p><strong>Registration Date:</strong> ${new Date(attendee.rsvpAt).toLocaleDateString()}</p>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>We look forward to seeing you at the event!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending QR code email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}