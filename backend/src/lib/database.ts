import { neon } from '@neondatabase/serverless';
import type { Attendee, RSVPFormData } from '../types/attendee.js';

let sql: any = null;

function getDatabase() {
  if (!sql) {
    const databaseUrl = import.meta.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(databaseUrl);
  }
  return sql;
}

export async function getAllAttendees(): Promise<Attendee[]> {
  try {
    const sql = getDatabase();
    const attendees = await sql`SELECT * FROM attendees ORDER BY rsvp_at DESC`;
    return attendees.map((row: any) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      dietaryRestrictions: row.dietary_restrictions,
      checkedIn: row.checked_in,
      checkedInAt: row.checked_in_at,
      rsvpAt: row.rsvp_at
    }));
  } catch (error) {
    console.error('Error fetching attendees:', error);
    throw error;
  }
}

export async function getAttendeeById(id: string): Promise<Attendee | null> {
  try {
    const sql = getDatabase();
    const attendees = await sql`SELECT * FROM attendees WHERE id = ${id}`;
    if (attendees.length === 0) return null;
    
    const row = attendees[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      dietaryRestrictions: row.dietary_restrictions,
      checkedIn: row.checked_in,
      checkedInAt: row.checked_in_at,
      rsvpAt: row.rsvp_at
    };
  } catch (error) {
    console.error('Error fetching attendee:', error);
    throw error;
  }
}

export async function createAttendee(data: RSVPFormData): Promise<Attendee> {
  try {
    const sql = getDatabase();
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const result = await sql`
      INSERT INTO attendees (id, first_name, last_name, email, phone, company, dietary_restrictions, checked_in, rsvp_at)
      VALUES (${id}, ${data.firstName}, ${data.lastName}, ${data.email}, ${data.phone}, ${data.company}, ${data.dietaryRestrictions}, false, NOW())
      RETURNING *
    `;
    
    const row = result[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      dietaryRestrictions: row.dietary_restrictions,
      checkedIn: row.checked_in,
      checkedInAt: row.checked_in_at,
      rsvpAt: row.rsvp_at
    };
  } catch (error) {
    console.error('Error creating attendee:', error);
    throw error;
  }
}

export async function checkInAttendee(id: string): Promise<Attendee> {
  try {
    const sql = getDatabase();
    const result = await sql`
      UPDATE attendees 
      SET checked_in = true, checked_in_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw new Error('Attendee not found');
    }
    
    const row = result[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      dietaryRestrictions: row.dietary_restrictions,
      checkedIn: row.checked_in,
      checkedInAt: row.checked_in_at,
      rsvpAt: row.rsvp_at
    };
  } catch (error) {
    console.error('Error checking in attendee:', error);
    throw error;
  }
}

export async function deleteAttendee(id: string): Promise<boolean> {
  try {
    const sql = getDatabase();
    const result = await sql`DELETE FROM attendees WHERE id = ${id}`;
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting attendee:', error);
    throw error;
  }
}

export async function getAttendeeByEmail(email: string): Promise<Attendee | null> {
  try {
    const sql = getDatabase();
    const attendees = await sql`SELECT * FROM attendees WHERE email = ${email}`;
    if (attendees.length === 0) return null;
    
    const row = attendees[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      dietaryRestrictions: row.dietary_restrictions,
      checkedIn: row.checked_in,
      checkedInAt: row.checked_in_at,
      rsvpAt: row.rsvp_at
    };
  } catch (error) {
    console.error('Error fetching attendee by email:', error);
    throw error;
  }
}