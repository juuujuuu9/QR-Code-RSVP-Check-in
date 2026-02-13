import type { Attendee, RSVPFormData, CheckInResult } from '@/types/attendee';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4321';

class ApiService {
  private async fetchWithError(url: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed: ${url}`, error);
      throw error;
    }
  }

  async getAllAttendees(): Promise<Attendee[]> {
    return this.fetchWithError('/api/attendees');
  }

  async createAttendee(data: RSVPFormData): Promise<Attendee> {
    return this.fetchWithError('/api/attendees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendee(id: string): Promise<void> {
    return this.fetchWithError('/api/attendees', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  async checkInAttendee(qrData: string): Promise<CheckInResult> {
    return this.fetchWithError('/api/checkin', {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }

  async sendEmail(attendeeId: string, qrCodeBase64: string): Promise<void> {
    return this.fetchWithError('/api/send-email', {
      method: 'POST',
      body: JSON.stringify({ attendeeId, qrCodeBase64 }),
    });
  }
}

export const apiService = new ApiService();