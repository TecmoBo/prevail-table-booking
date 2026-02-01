'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, addDays, startOfToday } from 'date-fns';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationId = searchParams.get('location');

  const [location, setLocation] = useState<Location | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    if (!locationId) {
      router.push('/');
      return;
    }

    // Fetch location details
    fetch(`/api/locations`)
      .then((res) => res.json())
      .then((data) => {
        const loc = data.locations.find((l: Location) => l.id === parseInt(locationId));
        setLocation(loc);
        setLoading(false);
      })
      .catch(console.error);
  }, [locationId, router]);

  useEffect(() => {
    if (!locationId || !selectedDate) return;

    // Fetch available slots
    fetch(`/api/slots?locationId=${locationId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots))
      .catch(console.error);
  }, [locationId, selectedDate]);

  const handleContinue = () => {
    if (selectedSlot && locationId) {
      const params = new URLSearchParams({
        location: locationId,
        date: selectedDate,
        start: selectedSlot.start,
        end: selectedSlot.end,
      });
      router.push(`/confirm?${params.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

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

        {location && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
            <p className="text-gray-600">
              {location.address}, {location.city}, {location.state}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Date Selection */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {dates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedSlot(null);
                  }}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs">{format(date, 'EEE')}</div>
                  <div className="font-semibold">{format(date, 'd')}</div>
                  <div className="text-xs">{format(date, 'MMM')}</div>
                </button>
              );
            })}
          </div>

          {/* Time Slot Selection */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Available Times ({format(new Date(selectedDate), 'MMM d')})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading time slots...</div>
            ) : (
              slots.map((slot) => (
                <button
                  key={`${slot.start}-${slot.end}`}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                  disabled={!slot.available}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedSlot?.start === slot.start
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-50 hover:bg-amber-50 border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {slot.start} - {slot.end}
                    </span>
                    {!slot.available && (
                      <span className="text-sm">(Booked)</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedSlot}
          className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
