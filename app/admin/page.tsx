'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // TODO: Implement proper authentication
    // For MVP, use a hardcoded check
    if (formData.email === 'admin@prevailcoffee.com' && formData.password === 'prevail2026') {
      // Store auth token (use proper JWT in production)
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">☕</div>
            <h1 className="text-2xl font-bold text-gray-900">Prevail Coffee</h1>
            <p className="text-gray-600 mt-1">Manager Dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                placeholder="admin@prevailcoffee.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Log In
            </button>
          </form>

          {/* Temporary Credentials Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>MVP Credentials:</strong><br />
              Email: admin@prevailcoffee.com<br />
              Password: prevail2026
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-amber-700 hover:text-amber-900 text-sm">
            ← Back to booking
          </a>
        </div>
      </div>
    </main>
  );
}
