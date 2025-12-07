'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Heart, 
  Calendar,
  X,
  Bookmark,
  Clock,
  User as UserIcon,
  FileText,
  Tag
} from 'lucide-react';

export default function BooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBooks();
      fetchWishlist();
      fetchCategories();
    }
  }, [status, search, category]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleAddWishlist = async (bookId) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_email: session.user.email,
          book_id: bookId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Added to wishlist successfully!');
        fetchWishlist();
      } else {
        alert(data.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('An error occurred');
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
        alert('Loan request submitted successfully! Waiting for admin approval.');
        setShowModal(false);
        fetchBooks();
      } else {
        alert(data.error || 'Failed to submit loan request');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('An error occurred');
    }
  };

  const isInWishlist = (bookId) => {
    return wishlist.some((item) => item.book_id === bookId);
  };

  const openBookDetail = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading books...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-10 pr-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Browse Books</h2>
            <p className="text-sm text-gray-500 mt-1">Discover and borrow books from our collection</p>
          </div>
        </div>

        {/* Search & Filter */}
        <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Books Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No books found</p>
            </div>
          ) : (
            books.map((book) => (
              <div
                key={book.id}
                onClick={() => openBookDetail(book)}
                className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  )}
                  
                  {/* Wishlist Badge */}
                  {isInWishlist(book.id) && (
                    <div className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                  )}

                  {/* Available Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      book.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {book.available > 0 ? `${book.available} Available` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{book.author}</p>

                  {book.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                      {book.category}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="pt-60 text-sm text-gray-400 py-6">
          © {new Date().getFullYear()} Puskata — Browse Books
        </footer>
      </div>

      {/* Book Detail Modal */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Book Cover Section */}
              <div className="relative h-64 bg-gradient-to-br from-emerald-100 via-sky-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                {selectedBook.cover_image ? (
                  <img
                    src={selectedBook.cover_image}
                    alt={selectedBook.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-24 h-24 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
                  <p className="text-white/90 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {selectedBook.author}
                  </p>
                </div>
              </div>

              {/* Book Details */}
              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Tag className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedBook.category || 'N/A'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Published</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedBook.published_year || 'N/A'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Pages</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedBook.pages || 'N/A'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Available</p>
                    <p className={`text-sm font-semibold ${selectedBook.available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedBook.available}/{selectedBook.quantity}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                {selectedBook.publisher && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Publisher</p>
                    <p className="text-base font-medium text-gray-900">{selectedBook.publisher}</p>
                  </div>
                )}

                {selectedBook.isbn && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="text-base font-mono text-gray-900">{selectedBook.isbn}</p>
                  </div>
                )}

                {/* Description */}
                {selectedBook.description && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedBook.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleAddWishlist(selectedBook.id);
                      setShowModal(false);
                    }}
                    disabled={isInWishlist(selectedBook.id)}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition shadow-sm hover:shadow-md ${
                      isInWishlist(selectedBook.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(selectedBook.id) ? 'fill-current' : ''}`} />
                    {isInWishlist(selectedBook.id) ? 'In Wishlist' : 'Add to Wishlist'}
                  </button>

                  <button
                    onClick={() => handleBorrow(selectedBook.id)}
                    disabled={selectedBook.available === 0}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md"
                  >
                    <BookOpen className="w-5 h-5" />
                    {selectedBook.available === 0 ? 'Out of Stock' : 'Borrow Book'}
                  </button>
                </div>

                {/* Loan Info */}
                <div className="rounded-lg bg-sky-50 border border-sky-200 p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-sky-900 mb-1">Loan Period</p>
                      <p className="text-xs text-sky-700">
                        Standard loan period is 14 days. Your request will be reviewed by admin before approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}