// app/(user)/home/page.jsx
"use client";

import { Search, Bell, Clock, TrendingUp, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import BookCard from "@/components/BookCard";
import BookDetailModal from "@/components/BookDetailModal";

export default function UserHomePage() {
  const [collections, setCollections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedBookIsbn, setSelectedBookIsbn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/user/home");
        if (res.ok) {
          const data = await res.json();
          setCollections(data.collections);
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleBookClick = (isbn) => {
    setSelectedBookIsbn(isbn);
  };

  const closeModal = () => {
    setSelectedBookIsbn(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari judul, penulis, atau ISBN..."
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button className="relative p-3 hover:bg-gray-100 rounded-full transition-all hover:scale-110">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl cursor-pointer hover:scale-105 transition-all">
                HP
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <section className="mt-10 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Clock className="w-9 h-9 text-indigo-600" />
                  Your Collection
                </h2>

                {collections.length > 0 && (
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm hover:underline">
                    Lihat Semua →
                  </button>
                )}
              </div>

              {collections.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-gray-100">
                  <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-14 h-14 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Belum ada buku yang dipinjam
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Yuk cari buku favoritmu dan mulai membaca!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {collections.map((book) => (
                    <button
                      key={book.isbn}
                      onClick={() => handleBookClick(book.isbn)}
                      className="text-left"
                    >
                      <BookCard book={book} size="small" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <TrendingUp className="w-9 h-9 text-purple-600" />
                  Our Recommendation
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {recommendations.map((book) => (
                  <button
                    key={book.isbn}
                    onClick={() => handleBookClick(book.isbn)}
                    className="group text-left"
                  >
                    <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                      <BookCard book={book} size="medium" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center mt-16">
                <button className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 text-lg">
                  Muat lebih banyak buku
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Book Detail Modal */}
      {selectedBookIsbn && (
        <BookDetailModal isbn={selectedBookIsbn} onClose={closeModal} />
      )}
    </div>
  );
}