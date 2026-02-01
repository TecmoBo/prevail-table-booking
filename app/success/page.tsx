'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Booking {
  id: number;
  location_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  status: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push('/');
      return;
    }

    // Fetch booking details
    Promise.all([
      fetch(`/api/bookings?id=${bookingId}`).then((res) => res.json()),
      fetch(`/api/locations`).then((res) => res.json()),
    ])
      .then(([bookingData, locationsData]) => {
        setBooking(bookingData.booking);
        const loc = locationsData.locations.find(
          (l: Location) => l.id === bookingData.booking.location_id
        );
        setLocation(loc);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading booking:', error);
        setLoading(false);
      });
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!booking || !location) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-red-600">Booking not found</div>
      </div>
    );
  }

  const formattedDate = format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy');

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-md mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h1>
          <p className="text-gray-600">Your table is reserved</p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Reservation Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-gray-900">{location.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">
                {booking.start_time} - {booking.end_time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmation:</span>
              <span className="font-mono text-sm text-gray-900">#{booking.id}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Confirmation sent to:</strong>
            </p>
            <p className="text-sm text-gray-900">{booking.customer_email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // TODO: Generate iCal file
              alert('Calendar export coming soon!');
            }}
            className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            📅 Add to Calendar
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-white text-amber-700 font-semibold rounded-lg border-2 border-amber-600 hover:bg-amber-50 transition-colors"
          >
            Book Another Table
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-700 font-medium mb-2">See you soon!</p>
          <p className="text-amber-700 italic">Together We Prevail</p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
