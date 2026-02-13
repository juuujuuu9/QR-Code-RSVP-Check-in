# Event RSVP & Check-in System - Complete Setup Guide

## 🚀 Overview

This guide will help you set up the complete Event RSVP & Check-in System with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Astro + TypeScript + Node.js
- **Database**: Neon PostgreSQL
- **Email**: Resend API
- **QR Codes**: Client-side generation and scanning

## 📁 Project Structure

```
project/
├── frontend/                 # React frontend (your current app)
│   ├── src/
│   │   ├── App.tsx          # Main application (updated to use API)
│   │   ├── services/api.ts  # API service layer
│   │   └── ...
│   └── package.json
├── backend/                  # Astro backend API
│   ├── src/
│   │   ├── pages/api/       # API endpoints
│   │   ├── lib/            # Database and email services
│   │   └── types/          # TypeScript types
│   ├── astro.config.mjs    # Astro configuration
│   └── package.json
└── SETUP_GUIDE.md          # This file
```

## 🔧 Step 1: Database Setup (Neon PostgreSQL)

### 1.1 Create Neon Database
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy your database URL (it looks like: `postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require`)

### 1.2 Run Database Schema
```sql
-- Copy and run the contents of backend/setup-database.sql in your Neon dashboard
-- This creates the attendees table and sample data
```

## 📧 Step 2: Email Setup (Resend)

### 2.1 Get Resend API Key
1. Go to [https://resend.com](https://resend.com)
2. Sign up for an account
3. Create an API key
4. Verify your domain or use the testing domain

## ⚙️ Step 3: Backend Configuration

### 3.1 Update Environment Variables
Edit `backend/.env`:
```env
DATABASE_URL=your_neon_database_url_here
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=your_verified_email@yourdomain.com
CORS_ORIGIN=http://localhost:5173
```

### 3.2 Install Backend Dependencies
```bash
cd backend
npm install
```

### 3.3 Start Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:4321`

## 🎨 Step 4: Frontend Configuration

### 4.1 Update Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:4321
```

### 4.2 Replace App.tsx
Replace your current `src/App.tsx` with the new API-based version:
```bash
cp src/App-new.tsx src/App.tsx
```

### 4.3 Update API Service
Make sure the API service is correctly configured in `src/services/api.ts`

## 🚀 Step 5: Start Both Servers

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🔍 Step 6: Test the Integration

### 6.1 Test API Endpoints
Open your browser and test:
- `http://localhost:4321/api/attendees` - Should return empty array or sample data

### 6.2 Test Frontend
Open `http://localhost:5173` and:
1. Register a new attendee
2. Check if data appears in admin dashboard
3. Test QR code generation and scanning

## 🔧 API Endpoints

### Attendees
- `GET /api/attendees` - Get all attendees
- `POST /api/attendees` - Create new attendee
- `DELETE /api/attendees` - Delete attendee

### Check-in
- `POST /api/checkin` - Process QR code check-in

### Email
- `POST /api/send-email` - Send QR code email

## 📋 Database Schema

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
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Security**: Use connection pooling and prepared statements
3. **CORS**: Configure CORS properly for production
4. **Rate Limiting**: Add rate limiting for API endpoints
5. **Input Validation**: All inputs are validated on the backend

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check that frontend and backend ports match your setup

2. **Database Connection Errors**
   - Verify your Neon database URL is correct
   - Check that your IP is allowed in Neon settings

3. **Camera Not Working**
   - Ensure HTTPS in production (camera requires secure context)
   - Check browser permissions

4. **Email Not Sending**
   - Verify Resend API key
   - Check that your domain is verified in Resend

## 🚀 Deployment

### Backend Deployment (Vercel/Railway/Render)
1. Push backend code to GitHub
2. Connect to your deployment platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables
4. Update API URL to production backend

## 📞 Support

For issues:
1. Check browser console for errors
2. Check backend logs
3. Verify all environment variables
4. Ensure database is accessible

## 🎯 Next Steps

1. **Custom Styling**: Update colors and branding in `tailwind.config.js`
2. **Additional Features**: Add event management, multiple events
3. **Analytics**: Add attendance analytics and reporting
4. **Mobile App**: Consider building a dedicated mobile app
5. **Real-time Updates**: Add WebSocket for real-time check-in updates

---

**Need help?** Check the browser console and backend logs first, then review the troubleshooting section above.