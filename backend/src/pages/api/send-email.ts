import type { APIRoute } from 'astro';
import { sendQRCodeEmail } from '../../lib/email.js';
import { getAttendeeById } from '../../lib/database.js';

const RESEND_LINK = 'https://resend.com/api-keys';

export const GET: APIRoute = async () => {
  const configured = Boolean(process.env.RESEND_API_KEY);
  return new Response(
    JSON.stringify({ configured, link: RESEND_LINK }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { attendeeId, qrCodeBase64 } = await request.json();
    
    if (!attendeeId || !qrCodeBase64) {
      return new Response(JSON.stringify({ error: 'Attendee ID and QR code are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get attendee from database
    const attendee = await getAttendeeById(attendeeId);
    if (!attendee) {
      return new Response(JSON.stringify({ error: 'Attendee not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send email
    const result = await sendQRCodeEmail(attendee, qrCodeBase64);
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: result.error || 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in POST /api/send-email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};