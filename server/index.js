import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { getAllAttendees, getAttendeeById, getAttendeeByEmail, createAttendee, checkInAttendee, deleteAttendee } from './db.js';
import { sendQRCodeEmail } from './email.js';

const app = express();
const PORT = Number(process.env.PORT) || 5173;
const RESEND_LINK = 'https://resend.com/api-keys';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';

app.use(express.json());

// CORS: allow configured origin(s); comma-separated in production
if (CORS_ORIGIN) {
  app.use((req, res, next) => {
    const origins = CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
    const origin = req.headers.origin;
    if (origin && origins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}

// --- API routes (same behavior as former Astro backend) ---

app.get('/api/send-email', (req, res) => {
  res.json({ configured: Boolean(process.env.RESEND_API_KEY), link: RESEND_LINK });
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { attendeeId, qrCodeBase64 } = req.body || {};
    if (!attendeeId || !qrCodeBase64) {
      return res.status(400).json({ error: 'Attendee ID and QR code are required' });
    }
    const attendee = await getAttendeeById(attendeeId);
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    const result = await sendQRCodeEmail(attendee, qrCodeBase64);
    if (result.success) {
      console.log('Email sent to', attendee.email);
      return res.json({ success: true });
    }
    console.error('Send email failed:', result.error);
    res.status(500).json({ error: result.error || 'Failed to send email' });
  } catch (err) {
    console.error('POST /api/send-email', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/attendees', async (req, res) => {
  try {
    const attendees = await getAllAttendees();
    res.json(attendees);
  } catch (err) {
    console.error('GET /api/attendees', err);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

app.post('/api/attendees', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.firstName || !data.lastName || !data.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const attendee = await createAttendee(data);
    res.status(201).json(attendee);
  } catch (err) {
    const msg = err?.message || '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('POST /api/attendees', err);
    res.status(500).json({ error: 'Failed to create attendee' });
  }
});

app.delete('/api/attendees', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Attendee ID is required' });
    const deleted = await deleteAttendee(id);
    if (!deleted) return res.status(404).json({ error: 'Attendee not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/attendees', err);
    res.status(500).json({ error: 'Failed to delete attendee' });
  }
});

app.post('/api/checkin', async (req, res) => {
  try {
    const { qrData } = req.body || {};
    if (!qrData) return res.status(400).json({ error: 'QR data is required' });
    let attendeeData;
    try {
      attendeeData = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    const { id, email } = attendeeData;
    if (!id && !email) {
      return res.status(400).json({ error: 'QR code must contain attendee ID or email' });
    }
    let attendee = id ? await getAttendeeById(id) : await getAttendeeByEmail(email);
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    if (attendee.checkedIn) {
      return res.status(409).json({
        error: 'Already checked in',
        attendee: { ...attendee, message: `${attendee.firstName} ${attendee.lastName} was already checked in at ${new Date(attendee.checkedInAt).toLocaleString()}` },
      });
    }
    const updated = await checkInAttendee(attendee.id);
    res.json({
      success: true,
      attendee: updated,
      message: `${updated.firstName} ${updated.lastName} checked in successfully!`,
    });
  } catch (err) {
    console.error('POST /api/checkin', err);
    res.status(500).json({ error: 'Failed to process check-in' });
  }
});

// --- Dev: Vite middleware; Prod: static files ---
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  const dist = path.join(path.dirname(__dirname), 'dist');
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (isDev) console.log('(Vite dev mode — one process)');
  if (!process.env.DATABASE_URL) console.warn('DATABASE_URL not set — /api/attendees will fail.');
  else console.log('Database: configured');
  if (CORS_ORIGIN) console.log('CORS: allowed origins:', CORS_ORIGIN);
  if (!process.env.RESEND_API_KEY) console.warn('RESEND_API_KEY not set — emails will not be sent.');
  else if (!process.env.FROM_EMAIL) console.warn('FROM_EMAIL not set — using default sender.');
  else console.log('Email: configured (FROM_EMAIL:', process.env.FROM_EMAIL + ')');
});
