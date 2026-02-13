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
        const body = await response.json().catch(() => ({ error: 'Unknown error' }));
        // Return error info instead of throwing for 409 duplicates
        if (response.status === 409) {
          return { ok: false, status: response.status, message: body.error || 'Already registered' };
        }
        throw new Error(body.error || `HTTP ${response.status}`);
      }

      const text = await response.text();
      const data = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;
      return { ok: true, data };
    } catch (error) {
      console.error(`API call failed: ${url}`, error);
      throw error;
    }
  }

  async getAllAttendees(): Promise<Attendee[]> {
    const res = await this.fetchWithError('/api/attendees');
    return (res as { ok: true; data: Attendee[] }).data ?? [];
  }

  async createAttendee(data: RSVPFormData): Promise<Attendee | { ok: false; status: number; message: string }> {
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

  async getEmailStatus(): Promise<{ configured: boolean; link: string }> {
    const res = await fetch(`${API_BASE_URL}/api/send-email`);
    const data = await res.json().catch(() => ({ configured: false, link: 'https://resend.com/api-keys' }));
    return { configured: Boolean(data?.configured), link: data?.link || 'https://resend.com/api-keys' };
  }
}

export const apiService = new ApiService();