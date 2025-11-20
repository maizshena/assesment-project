'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white text-gray-900 p-6 min-h-screen">
      
      <nav className="space-y-3">
        <Link href="/dashboard" className={`block py-3 px-4 rounded-lg transition ${pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
          Dashboard
        </Link>
        <Link href="/books" className={`block py-3 px-4 rounded-lg transition ${pathname.startsWith('/admin/books') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
          Kelola Buku
        </Link>
        <Link href="/loan_history" className={`block py-3 px-4 rounded-lg transition ${pathname.startsWith('/admin/loan-history') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
          Peminjaman
        </Link>
        
        <div className="pt-8 mt-8 border-t border-white/20">
          <Link href="/" className="block py-3 px-4 rounded-lg hover:bg-white/10">
            Logout
          </Link>
        </div>
      </nav>
    </div>
  );
}