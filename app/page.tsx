'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading locations:', error);
        setLoading(false);
      });
  }, []);

  const handleContinue = () => {
    if (selectedLocation) {
      router.push(`/book?location=${selectedLocation}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-md mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Prevail Coffee</h1>
          <h2 className="text-2xl text-amber-800 mb-4">Reserve Your Spot</h2>
          <p className="text-lg text-amber-700 italic">Together We Prevail</p>
        </div>

        {/* Location Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Select Location
          </h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading locations...</div>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <label
                  key={location.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedLocation === location.id
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="location"
                    value={location.id}
                    checked={selectedLocation === location.id}
                    onChange={() => setSelectedLocation(location.id)}
                    className="sr-only"
                  />
                  <div className="font-semibold text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-600">
                    {location.address}, {location.city}, {location.state}
                  </div>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedLocation}
            className="w-full mt-6 py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Book a 30-minute slot at our communal table</p>
          <p className="mt-2">Perfect for work, coffee dates, or community gatherings</p>
        </div>
      </div>
    </main>
  );
}
