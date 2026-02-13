import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

let sql = null;

function getDb() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    sql = neon(url);
  }
  return sql;
}

function rowToAttendee(row) {
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
    rsvpAt: row.rsvp_at,
  };
}

export async function getAllAttendees() {
  const db = getDb();
  const rows = await db`SELECT * FROM attendees ORDER BY rsvp_at DESC`;
  return rows.map(rowToAttendee);
}

export async function getAttendeeById(id) {
  const db = getDb();
  const rows = await db`SELECT * FROM attendees WHERE id = ${id}`;
  return rows.length ? rowToAttendee(rows[0]) : null;
}

export async function getAttendeeByEmail(email) {
  const db = getDb();
  const rows = await db`SELECT * FROM attendees WHERE email = ${email}`;
  return rows.length ? rowToAttendee(rows[0]) : null;
}

export async function createAttendee(data) {
  const db = getDb();
  const id = Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
  const rows = await db`
    INSERT INTO attendees (id, first_name, last_name, email, phone, company, dietary_restrictions, checked_in, rsvp_at)
    VALUES (${id}, ${data.firstName}, ${data.lastName}, ${data.email}, ${data.phone ?? ''}, ${data.company ?? ''}, ${data.dietaryRestrictions ?? ''}, false, NOW())
    RETURNING *
  `;
  return rowToAttendee(rows[0]);
}

export async function checkInAttendee(id) {
  const db = getDb();
  const rows = await db`
    UPDATE attendees SET checked_in = true, checked_in_at = NOW() WHERE id = ${id}
    RETURNING *
  `;
  if (!rows.length) throw new Error('Attendee not found');
  return rowToAttendee(rows[0]);
}

export async function deleteAttendee(id) {
  const db = getDb();
  const rows = await db`DELETE FROM attendees WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
