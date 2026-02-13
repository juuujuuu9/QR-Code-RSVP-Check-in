import type { APIRoute } from 'astro';
import { getAttendeeById, checkInAttendee, getAttendeeByEmail } from '../../lib/database-index.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { qrData } = await request.json();
    
    if (!qrData) {
      return new Response(JSON.stringify({ error: 'QR data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let attendeeData;
    try {
      attendeeData = JSON.parse(qrData);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid QR code format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id, email } = attendeeData;
    
    if (!id && !email) {
      return new Response(JSON.stringify({ error: 'QR code must contain attendee ID or email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find attendee by ID or email
    let attendee = id ? await getAttendeeById(id) : await getAttendeeByEmail(email);
    
    if (!attendee) {
      return new Response(JSON.stringify({ error: 'Attendee not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already checked in
    if (attendee.checkedIn) {
      return new Response(JSON.stringify({ 
        error: 'Already checked in',
        attendee: {
          ...attendee,
          message: `${attendee.firstName} ${attendee.lastName} was already checked in at ${new Date(attendee.checkedInAt!).toLocaleString()}`
        }
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check in the attendee
    const updatedAttendee = await checkInAttendee(attendee.id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      attendee: updatedAttendee,
      message: `${updatedAttendee.firstName} ${updatedAttendee.lastName} checked in successfully!`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in POST /api/checkin:', error);
    return new Response(JSON.stringify({ error: 'Failed to process check-in' }), {
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