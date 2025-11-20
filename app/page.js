// app/page.jsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const searchParams = useSearchParams();
  const user = searchParams.get('user');
  const role = searchParams.get('role');

  // Kalau sudah login
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Selamat Datang, {user}! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Kamu login sebagai <strong>{role === 'admin' ? 'ADMIN' : 'USER'}</strong>
          </p>
          <p className="text-gray-500 mb-6">
            Dashboard Perpustakaan Digital
          </p>
          <Link 
            href="/logout" 
            className="text-blue-600 underline text-sm"
          >
            Logout
          </Link>
        </div>
      </div>
    );
  }

  // Kalau belum login
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Perpustakaan Digital</h1>
        <Link href="/login" className="text-2xl text-blue-600 underline">
          Klik di sini untuk Login
        </Link>
        <p className="mt-4 text-gray-500">atau <Link href="/register" className="text-blue-600 underline">Daftar</Link> dulu</p>
      </div>
    </div>
  );
}