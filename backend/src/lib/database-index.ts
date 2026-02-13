// Database service index - conditionally loads real or mock database

let databaseService: any;

// Check if database is configured
const databaseUrl = import.meta.env.DATABASE_URL;

if (databaseUrl && databaseUrl !== 'your_neon_database_url_here' && !databaseUrl.includes('username:password')) {
  // Use real database
  console.log('✅ Using real PostgreSQL database');
  databaseService = await import('./database.js');
} else {
  // Use mock database for testing
  console.log('📝 Using mock database for testing');
  databaseService = await import('./mock-database.js');
}

export const {
  getAllAttendees,
  getAttendeeById,
  createAttendee,
  checkInAttendee,
  deleteAttendee,
  getAttendeeByEmail
} = databaseService;