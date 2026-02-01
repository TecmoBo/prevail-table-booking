import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBooking } from '@/lib/booking-utils';
import { z } from 'zod';

const bookingSchema = z.object({
  location_id: z.number(),
  booking_date: z.string(), // YYYY-MM-DD
  start_time: z.string(), // HH:mm
  end_time: z.string(),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().optional(),
  party_size: z.number().default(6),
  payment_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    // TODO: Verify payment_id with Square before confirming booking
    // For now, mark as confirmed if payment_id is provided
    const status = validatedData.payment_id ? 'confirmed' : 'pending';

    const booking = createBooking({
      ...validatedData,
      status,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const booking = getBooking(parseInt(id));

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
