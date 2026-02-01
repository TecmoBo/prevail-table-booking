'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfToday } from 'date-fns';

interface Location {
  id: number;
  name: string;
}

interface Booking {
  id: number;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const isAuth = localStorage.getItem('admin_auth');
    if (!isAuth) {
      router.push('/admin');
      return;
    }

    // Fetch locations
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations);
        if (data.locations.length > 0) {
          setSelectedLocation(data.locations[0].id);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, [router]);

  useEffect(() => {
    if (!selectedLocation) return;

    // Fetch today's bookings for selected location
    const today = format(startOfToday(), 'yyyy-MM-dd');
    // Note: Would need a proper API endpoint for this
    // For now, using placeholder data
    setTodayBookings([]);
  }, [selectedLocation]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-sm text-gray-600">Prevail Coffee - Table Reservations</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Location Selector */}
        <div className="mb-6">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Select Location
          </label>
          <select
            id="location"
            value={selectedLocation || ''}
            onChange={(e) => setSelectedLocation(parseInt(e.target.value))}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Today's Reservations */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Reservations ({format(startOfToday(), 'MMM d, yyyy')})
            </h2>
          </div>
          <div className="p-6">
            {todayBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reservations today
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {booking.start_time} - {booking.end_time}
                      </div>
                      <div className="text-sm text-gray-600">{booking.customer_name}</div>
                      <div className="text-xs text-gray-500">{booking.customer_email}</div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/calendar')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-900 mb-1">View Calendar</h3>
            <p className="text-sm text-gray-600">See all upcoming bookings</p>
          </button>

          <button
            onClick={() => router.push('/admin/block')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-2">🚫</div>
            <h3 className="font-semibold text-gray-900 mb-1">Block Times</h3>
            <p className="text-sm text-gray-600">Mark unavailable slots</p>
          </button>

          <button
            onClick={() => alert('Coming soon!')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
            <p className="text-sm text-gray-600">Configure hours & tables</p>
          </button>
        </div>

        {/* POS Integration Note */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">🔔 POS Integration</h3>
          <p className="text-sm text-blue-800 mb-3">
            Set up Square Terminal API to receive 10-minute pre-arrival alerts on your POS screen.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Configure Alerts
          </button>
        </div>
      </div>
    </main>
  );
}
