'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfToday } from 'date-fns';

interface Location {
  id: number;
  name: string;
}

export default function BlockTimes() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    location_id: 0,
    date: format(startOfToday(), 'yyyy-MM-dd'),
    start_time: '08:00',
    end_time: '10:00',
    reason: 'peak_hours',
    custom_reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
          setFormData((prev) => ({ ...prev, location_id: data.locations[0].id }));
        }
      })
      .catch(console.error);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      // TODO: Create API endpoint for blocking times
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error blocking times:', error);
      alert('Failed to block times');
    } finally {
      setSubmitting(false);
    }
  };

  const reasonLabel =
    formData.reason === 'other' ? formData.custom_reason : formData.reason.replace('_', ' ');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="mr-4 text-amber-700 hover:text-amber-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Block Time Slots</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                id="location"
                required
                value={formData.location_id}
                onChange={(e) =>
                  setFormData({ ...formData, location_id: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600"
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={format(startOfToday(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="start"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600"
                />
              </div>
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="end"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value="peak_hours"
                    checked={formData.reason === 'peak_hours'}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Peak hours / rush</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value="private_event"
                    checked={formData.reason === 'private_event'}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Private event</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value="maintenance"
                    checked={formData.reason === 'maintenance'}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Maintenance</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    checked={formData.reason === 'other'}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>

                {formData.reason === 'other' && (
                  <input
                    type="text"
                    placeholder="Specify reason..."
                    value={formData.custom_reason}
                    onChange={(e) => setFormData({ ...formData, custom_reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 ml-6"
                  />
                )}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                ✓ Time slots blocked successfully
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Blocking...' : 'Block These Times'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> Blocked times will prevent customers from booking these slots.
          Existing bookings will not be affected.
        </div>
      </div>
    </main>
  );
}
