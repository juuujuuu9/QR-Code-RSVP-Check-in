-- Event RSVP & Check-in System Database Schema

-- Create attendees table
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

-- Create indexes for better performance
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_attendees_checked_in ON attendees(checked_in);
CREATE INDEX idx_attendees_rsvp_at ON attendees(rsvp_at);

-- Insert sample data (optional)
INSERT INTO attendees (id, first_name, last_name, email, phone, company, dietary_restrictions, checked_in, rsvp_at) VALUES
('sample1', 'John', 'Doe', 'john.doe@example.com', '+1 555-0123', 'Tech Corp', 'Vegetarian', false, NOW() - INTERVAL '2 days'),
('sample2', 'Jane', 'Smith', 'jane.smith@example.com', '+1 555-0124', 'Design Studio', '', true, NOW() - INTERVAL '1 day');

-- Create a function to get attendance statistics
CREATE OR REPLACE FUNCTION get_attendance_stats()
RETURNS TABLE(
  total_attendees BIGINT,
  checked_in_count BIGINT,
  pending_count BIGINT,
  check_in_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_attendees,
    COUNT(*) FILTER (WHERE checked_in = true)::BIGINT as checked_in_count,
    COUNT(*) FILTER (WHERE checked_in = false)::BIGINT as pending_count,
    ROUND(COUNT(*) FILTER (WHERE checked_in = true)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) as check_in_rate
  FROM attendees;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your Neon setup)
-- GRANT ALL PRIVILEGES ON TABLE attendees TO your_username;
-- GRANT USAGE ON SCHEMA public TO your_username;