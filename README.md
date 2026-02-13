# 🎉 Event RSVP & Check-in System

A modern, full-stack event management application that streamlines attendee registration, QR code generation, and real-time check-in tracking. Perfect for conferences, workshops, meetups, and corporate events.

## 🎯 Purpose

This application solves the common pain points of event management by providing:
- **Seamless Registration**: Easy-to-use RSVP form with validation
- **QR Code Integration**: Automatic unique QR code generation for each attendee
- **Contactless Check-in**: Real-time camera-based QR code scanning
- **Live Dashboard**: Real-time attendance tracking and statistics
- **Email Confirmation**: Automated QR code delivery via email
- **Data Export**: CSV export for event analytics and reporting

## 🏗️ Tech Stack

### Frontend
- **React 19.2.0** - Modern UI framework with hooks and context
- **TypeScript** - Type-safe development with strict configuration
- **Vite 7.3.0** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components built on Radix UI
- **Lucide React** - Consistent icon library
- **React Hook Form + Zod** - Form validation and schema validation
- **Sonner** - Elegant toast notifications
- **HTML5 QR Code** - Browser-based QR code scanning

### Backend
- **Astro 5.17.2** - Fast, content-focused web framework
- **TypeScript** - Full type safety across the stack
- **Node.js** - Server runtime with standalone mode
- **@astrojs/node** - Node.js adapter for production deployment

### Database & Services
- **Neon PostgreSQL** - Serverless PostgreSQL with connection pooling
- **Resend** - Modern email API for transactional emails
- **QR Code Libraries** - Client-side QR generation and scanning

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Vite** - Hot module replacement and fast builds

## ✨ Key Features

### 1. **RSVP Registration System**
- Clean, intuitive registration form
- Real-time validation with helpful error messages
- Dietary restrictions and special requirements collection
- Automatic duplicate email prevention
- Instant QR code generation upon registration

### 2. **QR Code Management**
- Unique QR codes generated for each attendee
- High-quality, printable QR codes
- Embedded attendee data for secure verification
- Email delivery with branded templates

### 3. **Contactless Check-in**
- Real-time camera-based QR code scanning
- Instant attendee verification
- Duplicate check-in prevention
- Mobile-optimized scanning experience
- Offline capability with local validation

### 4. **Admin Dashboard**
- Real-time attendance statistics
- Search and filter functionality
- Individual attendee management
- Manual check-in override
- CSV export for analytics
- QR code preview and re-sending

### 5. **Email Integration**
- Automated confirmation emails
- Professional HTML email templates
- QR code embedded in email
- Customizable branding and messaging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Camera-enabled device for QR scanning

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd event-rsvp-system
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

3. **Set up the backend (optional for full database integration)**
   ```bash
   cd backend
   npm install
   npm run dev
   # Backend runs on http://localhost:4321
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

## 📊 Application Flow

```
1. Attendee Registration
   ├── Fill out RSVP form
   ├── System validates input
   ├── Generates unique QR code
   └── Shows confirmation + QR code

2. Email Confirmation (with backend)
   ├── Automatic email sent
   ├── QR code attached
   └── Registration details included

3. Event Check-in
   ├── Staff opens check-in scanner
   ├── Scans attendee QR code
   ├── System validates and checks in
   └── Updates live statistics

4. Admin Management
   ├── View all registrations
   ├── Monitor check-in progress
   ├── Export attendance data
   └── Manage individual attendees
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:4321
```

**Backend (.env)**
```env
DATABASE_URL=postgresql://username:password@neon-host/dbname
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your@email.com
```

### Database Schema

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

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev          # Start backend server
npm run build        # Build backend
npm run preview      # Preview backend
```

## 🚀 Deployment

### Frontend Deployment
The frontend builds to static files and can be deployed to:
- **Vercel** - Zero-config deployment
- **Netlify** - Drag-and-drop deployment
- **GitHub Pages** - Free hosting for public repos
- **Any static hosting** - S3, Firebase, etc.

### Backend Deployment
The backend uses Astro's Node.js adapter and can be deployed to:
- **Vercel** - Serverless functions
- **Railway** - Full-stack platform
- **Render** - Cloud platform
- **Digital Ocean** - VPS hosting

## 🔒 Security Features

- **Input Validation** - All form inputs validated server-side
- **Email Validation** - Format and uniqueness checks
- **CORS Protection** - Configured for specific origins
- **QR Code Security** - Encoded data validation
- **Database Security** - Parameterized queries
- **Environment Variables** - Sensitive data protection

## 📱 Browser Support

- **Chrome/Edge** 90+ ✅
- **Firefox** 88+ ✅  
- **Safari** 14+ ✅
- **Mobile Browsers** ✅

*Camera access required for QR code scanning*

## 🎯 Use Cases

- **Corporate Events** - Employee training, all-hands meetings
- **Conferences** - Speaker sessions, workshops, networking events
- **Meetups** - Tech meetups, community gatherings
- **Workshops** - Educational events, training sessions
- **Social Events** - Parties, reunions, celebrations

## 📈 Performance Features

- **Lazy Loading** - Components load on demand
- **Optimistic Updates** - UI updates before API confirmation
- **Client-side Caching** - Reduces unnecessary API calls
- **Efficient Re-renders** - React optimization patterns
- **Image Optimization** - QR codes optimized for display

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

Having issues? Check these resources:
- **Browser Console** - Look for JavaScript errors
- **Backend Logs** - Check for API errors
- **Camera Permissions** - Ensure camera access is granted
- **Network Tab** - Verify API calls are successful

For additional help, please check the troubleshooting section in `SETUP_GUIDE.md`.

---

**Built with ❤️ for event organizers everywhere**