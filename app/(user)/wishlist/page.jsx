'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, 
  BookOpen, 
  Trash2, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, session, router]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchWishlist = async () => {
    try {
      const params = new URLSearchParams();
      params.append('userEmail', session.user.email);
      
      const response = await fetch(`/api/wishlist?${params}`);
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    if (!confirm('Remove this book from your wishlist?')) return;

    try {
      const params = new URLSearchParams();
      params.append('bookId', bookId);
      params.append('userEmail', session.user.email);
      
      const response = await fetch(`/api/wishlist?${params}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Book removed from wishlist!', 'success');
        fetchWishlist();
      } else {
        showToast('Failed to remove book', 'error');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('An error occurred', 'error');
    }
  };

  const handleBorrow = async (bookId) => {
    const loanDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: session.user.email,
          book_id: bookId,
          loan_date: loanDate,
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Loan request submitted successfully!', 'success');
        // Remove from wishlist after borrowing
        const params = new URLSearchParams();
        params.append('bookId', bookId);
        params.append('userEmail', session.user.email);
        await fetch(`/api/wishlist?${params}`, { method: 'DELETE' });
        fetchWishlist();
      } else {
        showToast(data.error || 'Failed to submit loan request', 'error');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      showToast('An error occurred', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-10 pr-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500 fill-current" />
              My Wishlist
            </h2>
            <p className="text-sm text-gray-500 mt-1">Books you want to read later</p>
          </div>
          <div className="text-sm text-gray-500">
            {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">
                Start adding books you'd like to read to your wishlist
              </p>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 font-semibold shadow-lg shadow-emerald-500/30 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                Browse Books
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {item.cover_image ? (
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  )}

                  {/* Heart Badge */}
                  <div className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>

                  {/* Available Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.available > 0 ? `${item.available} Available` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">by {item.author}</p>
                  </div>

                  {item.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                      {item.category}
                    </span>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Added {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleBorrow(item.book_id)}
                      disabled={item.available <= 0}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {item.available <= 0 ? 'Out of Stock' : 'Borrow'}
                    </button>
                    <button
                      onClick={() => handleRemove(item.book_id)}
                      className="inline-flex items-center justify-center gap-1.5 bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 text-sm font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <footer className="pt-60 text-sm text-gray-400 py-6">
          © {new Date().getFullYear()} Puskata — My Wishlist
        </footer>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}