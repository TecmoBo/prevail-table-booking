import { db } from './db';
import { addMinutes, format, parse, isWithinInterval, parseISO } from 'date-fns';

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours_open: string;
  hours_close: string;
  num_tables: number;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
  available: boolean;
}

export interface Booking {
  id: number;
  location_id: number;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_id?: string;
  created_at: string;
}

// Get all locations
export function getLocations(): Location[] {
  return db.prepare('SELECT * FROM locations ORDER BY name').all() as Location[];
}

// Get location by ID
export function getLocation(id: number): Location | undefined {
  return db.prepare('SELECT * FROM locations WHERE id = ?').get(id) as Location | undefined;
}

// Generate time slots for a given date and location
export function getAvailableSlots(locationId: number, date: string): TimeSlot[] {
  const location = getLocation(locationId);
  if (!location) return [];

  // Parse location hours
  const openTime = parse(location.hours_open, 'HH:mm', new Date());
  const closeTime = parse(location.hours_close, 'HH:mm', new Date());

  // Generate 30-minute slots
  const slots: TimeSlot[] = [];
  let currentTime = openTime;

  while (currentTime < closeTime) {
    const slotStart = format(currentTime, 'HH:mm');
    const slotEnd = format(addMinutes(currentTime, 30), 'HH:mm');

    // Check if slot is available (not booked or blocked)
    const isAvailable = checkSlotAvailable(locationId, date, slotStart, slotEnd);

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: isAvailable,
    });

    currentTime = addMinutes(currentTime, 30);
  }

  return slots;
}

// Check if a specific time slot is available
function checkSlotAvailable(
  locationId: number,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  // Check for existing bookings
  const existingBookings = db
    .prepare(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE location_id = ? 
       AND booking_date = ? 
       AND status != 'cancelled'
       AND (
         (start_time <= ? AND end_time > ?) OR
         (start_time < ? AND end_time >= ?)
       )`
    )
    .get(locationId, date, startTime, startTime, endTime, endTime) as { count: number };

  if (existingBookings.count > 0) return false;

  // Check for blocked times
  const blockedTimes = db
    .prepare(
      `SELECT COUNT(*) as count FROM blocked_times 
       WHERE location_id = ? 
       AND date = ? 
       AND (
         (start_time <= ? AND end_time > ?) OR
         (start_time < ? AND end_time >= ?)
       )`
    )
    .get(locationId, date, startTime, startTime, endTime, endTime) as { count: number };

  return blockedTimes.count === 0;
}

// Create a new booking
export function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Booking {
  const result = db
    .prepare(
      `INSERT INTO bookings 
       (location_id, booking_date, start_time, end_time, customer_name, customer_email, customer_phone, party_size, status, payment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      booking.location_id,
      booking.booking_date,
      booking.start_time,
      booking.end_time,
      booking.customer_name,
      booking.customer_email,
      booking.customer_phone,
      booking.party_size,
      booking.status,
      booking.payment_id
    );

  return getBooking(result.lastInsertRowid as number)!;
}

// Get booking by ID
export function getBooking(id: number): Booking | undefined {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;
}

// Get bookings for a location on a specific date
export function getBookingsForDate(locationId: number, date: string): Booking[] {
  return db
    .prepare(
      `SELECT * FROM bookings 
       WHERE location_id = ? 
       AND booking_date = ? 
       AND status != 'cancelled'
       ORDER BY start_time`
    )
    .all(locationId, date) as Booking[];
}

// Cancel a booking
export function cancelBooking(id: number): boolean {
  const result = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', id);
  return result.changes > 0;
}

// Block time for a location
export function blockTime(
  locationId: number,
  date: string,
  startTime: string,
  endTime: string,
  reason: string,
  createdBy?: number
) {
  return db
    .prepare(
      `INSERT INTO blocked_times (location_id, date, start_time, end_time, reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(locationId, date, startTime, endTime, reason, createdBy);
}

// Get upcoming bookings (for POS alerts)
export function getUpcomingBookings(locationId: number, minutesAhead: number = 10): Booking[] {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');
  const futureTime = format(addMinutes(now, minutesAhead), 'HH:mm');

  return db
    .prepare(
      `SELECT * FROM bookings 
       WHERE location_id = ? 
       AND booking_date = ? 
       AND start_time >= ? 
       AND start_time <= ?
       AND status = 'confirmed'
       ORDER BY start_time`
    )
    .all(locationId, today, currentTime, futureTime) as Booking[];
}
