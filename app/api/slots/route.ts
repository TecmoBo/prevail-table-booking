import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/booking-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const date = searchParams.get('date');

    if (!locationId || !date) {
      return NextResponse.json(
        { error: 'locationId and date are required' },
        { status: 400 }
      );
    }

    const slots = getAvailableSlots(parseInt(locationId), date);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
