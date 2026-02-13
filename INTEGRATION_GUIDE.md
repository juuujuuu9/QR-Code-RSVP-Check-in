# Event RSVP & Check-in System - Integration Guide

## Overview
This React application provides a complete RSVP and check-in system with unique QR codes for each attendee. Here's how to integrate it with your existing **Astro + Neon DB + Resend** stack.

## Features

### 1. **RSVP Form** (`/rsvp` tab)
- Collects attendee information (name, email, phone, company, dietary restrictions)
- Generates unique QR codes for each registration
- Shows email preview with QR code (ready for Resend integration)
- Stores data in localStorage (replace with Neon DB in production)

### 2. **Check-in Scanner** (`/checkin` tab)
- Real-time QR code scanning using camera
- Instant check-in validation
- Shows attendee details on successful scan
- Prevents duplicate check-ins

### 3. **Admin Dashboard** (`/admin` tab)
- View all attendees with search/filter
- Check-in statistics (total, checked in, pending)
- Manual check-in toggle
- Export to CSV
- Individual QR code viewing
- Delete attendees

## Integration with Your Stack

### 1. Neon DB Integration

Replace the localStorage calls with Neon DB queries:

```typescript
// Instead of:
const [attendees, setAttendees] = useState<Attendee[]>(() => {
  const saved = localStorage.getItem('event-attendees');
  return saved ? JSON.parse(saved) : [];
});

// Use:
const [attendees, setAttendees] = useState<Attendee[]>([]);

useEffect(() => {
  // Fetch from Neon DB
  fetch('/api/attendees')
    .then(res => res.json())
    .then(data => setAttendees(data));
}, []);
```

Create API endpoints in your Astro project:

```typescript
// src/pages/api/attendees.ts
import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.DATABASE_URL);

export const GET: APIRoute = async () => {
  const attendees = await sql`SELECT * FROM attendees`;
  return new Response(JSON.stringify(attendees), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const result = await sql`
    INSERT INTO attendees (id, first_name, last_name, email, phone, company, dietary_restrictions, checked_in, rsvp_at)
    VALUES (${data.id}, ${data.firstName}, ${data.lastName}, ${data.email}, ${data.phone}, ${data.company}, ${data.dietaryRestrictions}, false, NOW())
    RETURNING *
  `;
  return new Response(JSON.stringify(result[0]), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### 2. Resend Email Integration

When an attendee RSVPs, send them an email with their QR code:

```typescript
// src/pages/api/send-qr-email.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const { attendee, qrCodeBase64 } = await request.json();
  
  await resend.emails.send({
    from: 'Event Team <events@yourdomain.com>',
    to: attendee.email,
    subject: 'Your Event Registration QR Code',
    html: `
      <h1>You're Registered!</h1>
      <p>Hi ${attendee.firstName},</p>
      <p>Thank you for RSVPing. Here's your QR code for check-in:</p>
      <img src="${qrCodeBase64}" alt="Your QR Code" />
      <p>Show this at the event entrance.</p>
    `
  });
  
  return new Response(JSON.stringify({ success: true }));
};
```

### 3. Database Schema (Neon/PostgreSQL)

```sql
CREATE TABLE attendees (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company VARCHAR(255),
  dietary_restrictions TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  rsvp_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_attendees_checked_in ON attendees(checked_in);
```

### 4. Environment Variables

Add to your `.env` file:

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname
RESEND_API_KEY=re_xxxxxxxx
```

## File Structure

```
app/
├── src/
│   ├── App.tsx              # Main application with all components
│   ├── App.css              # Custom styles
│   ├── types/
│   │   ├── attendee.ts      # Attendee type definitions
│   │   └── global.d.ts      # Global types for QR libraries
│   └── ...
├── index.html               # CDN links for QR libraries
└── INTEGRATION_GUIDE.md     # This file
```

## Usage Flow

1. **Attendee RSVPs**: Fill form → QR generated → Email sent via Resend
2. **At Event**: Staff opens Check-in tab → Scans QR → Attendee checked in
3. **Admin**: Monitor real-time stats, export data, manage attendees

## QR Code Data Format

The QR code contains a JSON object:

```json
{
  "id": "unique-attendee-id",
  "email": "attendee@example.com"
}
```

This allows quick lookup and verification without exposing sensitive data.

## Security Considerations

1. **Validate QR codes server-side** - Don't trust client-side data
2. **Rate limiting** - Prevent brute force QR scanning
3. **HTTPS only** - Ensure secure transmission
4. **CORS policies** - Restrict API access to your domain

## Customization

### Styling
- Edit `App.css` for custom styles
- Uses Tailwind CSS with shadcn/ui components
- Modify color scheme in `tailwind.config.js`

### QR Code Appearance
- Size: Change `width` and `height` in QRCode options
- Colors: Modify `colorDark` and `colorLight`
- Error correction: Adjust `correctLevel` (0-3)

## Testing

1. Open the RSVP tab and submit a test registration
2. Download the QR code
3. Open the Check-in tab and scan the QR code
4. Verify the attendee appears in the Admin dashboard

## Deployment

The app is built as a static site in the `dist/` folder. Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

For Astro integration, you can:
1. Build this React app separately
2. Embed it in an Astro page using an iframe
3. Or migrate the components to React islands in Astro

## Support

For issues or questions:
1. Check browser console for errors
2. Verify camera permissions for QR scanning
3. Ensure localStorage is enabled (or switch to Neon DB)
