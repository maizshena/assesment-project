// components/auth/LoginForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
      alert(data.error);
    } else {
      if (data.user.role === 'ADMIN') {
        console.log('Role terdeteksi: ADMIN → ke /dashboard');
        window.location.href = '/dashboard';
    } else {
        console.log('Role terdeteksi: USER → ke /home');
        window.location.href = '/home';
    }
    }
  } catch (error) {
    alert('Terjadi kesalahan jaringan');
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">E-Mail Address*</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="masukkan email kamu"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password*</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition disabled:opacity-70"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}