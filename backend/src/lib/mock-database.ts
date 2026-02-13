import type { Attendee, RSVPFormData } from '../types/attendee.js';

// Mock in-memory database for testing
let mockAttendees: Attendee[] = [
  {
    id: 'sample1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-0123',
    company: 'Tech Corp',
    dietaryRestrictions: 'Vegetarian',
    checkedIn: false,
    rsvpAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample2',
    lastName: 'Smith',
    firstName: 'Jane',
    email: 'jane.smith@example.com',
    phone: '+1 555-0124',
    company: 'Design Studio',
    dietaryRestrictions: '',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 86400000).toISOString(),
    rsvpAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export async function getAllAttendees(): Promise<Attendee[]> {
  return [...mockAttendees];
}

export async function getAttendeeById(id: string): Promise<Attendee | null> {
  return mockAttendees.find(a => a.id === id) || null;
}

export async function createAttendee(data: RSVPFormData): Promise<Attendee> {
  // Check if email already exists
  const existing = mockAttendees.find(a => a.email === data.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const newAttendee: Attendee = {
    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    ...data,
    checkedIn: false,
    rsvpAt: new Date().toISOString(),
  };
  
  mockAttendees.push(newAttendee);
  return newAttendee;
}

export async function checkInAttendee(id: string): Promise<Attendee> {
  const attendee = mockAttendees.find(a => a.id === id);
  if (!attendee) {
    throw new Error('Attendee not found');
  }
  
  if (attendee.checkedIn) {
    return attendee; // Already checked in
  }
  
  attendee.checkedIn = true;
  attendee.checkedInAt = new Date().toISOString();
  return attendee;
}

export async function deleteAttendee(id: string): Promise<boolean> {
  const initialLength = mockAttendees.length;
  mockAttendees = mockAttendees.filter(a => a.id !== id);
  return mockAttendees.length < initialLength;
}

export async function getAttendeeByEmail(email: string): Promise<Attendee | null> {
  return mockAttendees.find(a => a.email === email) || null;
}