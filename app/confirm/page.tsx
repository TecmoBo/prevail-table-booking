'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  addToCalendar: boolean;
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const locationId = searchParams.get('location');
  const date = searchParams.get('date');
  const startTime = searchParams.get('start');
  const endTime = searchParams.get('end');

  const [location, setLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    addToCalendar: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!locationId || !date || !startTime || !endTime) {
      router.push('/');
      return;
    }

    // Fetch location details
    fetch(`/api/locations`)
      .then((res) => res.json())
      .then((data) => {
        const loc = data.locations.find((l: Location) => l.id === parseInt(locationId));
        setLocation(loc);
      })
      .catch(console.error);
  }, [locationId, date, startTime, endTime, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Process Square payment here
      // For now, create booking without payment
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: parseInt(locationId!),
          booking_date: date,
          start_time: startTime,
          end_time: endTime,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          party_size: 6,
          // payment_id: 'square_payment_id_here'  // Wade will wire Square integration
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to success page
        router.push(`/success?booking=${data.booking.id}`);
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!location || !date || !startTime || !endTime) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy');
  const formattedTime = `${startTime} - ${endTime}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="text-amber-700 hover:text-amber-900 mb-6 flex items-center"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Reservation</h2>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
          <div className="space-y-2 text-gray-700">
            <div>
              <span className="font-medium">Location:</span> {location.name}
            </div>
            <div>
              <span className="font-medium">Date:</span> {formattedDate}
            </div>
            <div>
              <span className="font-medium">Time:</span> {formattedTime}
            </div>
            <div>
              <span className="font-medium">Party Size:</span> Up to 6 people
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Your Information</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="calendar"
                checked={formData.addToCalendar}
                onChange={(e) => setFormData({ ...formData, addToCalendar: e.target.checked })}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-600"
              />
              <label htmlFor="calendar" className="ml-2 text-sm text-gray-700">
                Add to my calendar
              </label>
            </div>
          </div>
        </form>

        {/* Payment Section - Placeholder */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Payment</h3>
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-600 mb-2">
              <span className="text-2xl font-bold text-gray-900">$5.00</span>
              <span className="text-sm"> deposit</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Applied as cafe credit</p>
            <div className="bg-amber-100 text-amber-800 text-sm p-3 rounded">
              Square payment integration will be added here
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating reservation...' : 'Confirm & Reserve (Free for now)'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment via Square
        </p>
      </div>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
