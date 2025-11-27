// components/BookDetailModal.jsx
"use client";

import { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  User,
  Calendar,
  FileText,
  Globe,
  Heart,
  Share2,
  Clock,
  TrendingUp,
} from "lucide-react";
import BookCard from "./BookCard";

export default function BookDetailModal({ isbn, onClose }) {
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    async function fetchBookDetails() {
      try {
        setError(null);
        console.log("Fetching book with ISBN:", isbn); // Debug log
        
        const res = await fetch(`/api/books/${isbn}`);
        console.log("Response status:", res.status); // Debug log
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch book");
        }
        
        const data = await res.json();
        console.log("Received data:", data); // Debug log
        
        setBook(data.book);
        setRelatedBooks(data.relatedBooks || []);
      } catch (error) {
        console.error("Error fetching book:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (isbn) {
      fetchBookDetails();
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isbn]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleBorrow = async () => {
    if (borrowing) return;
    
    setBorrowing(true);
    try {
      // TODO: Implement actual borrow API call
      const res = await fetch("/api/loans/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn: book.isbn })
      });

      if (res.ok) {
        alert("Buku berhasil dipinjam! 🎉");
        onClose();
        // Refresh page or update state
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal meminjam buku");
      }
    } catch (error) {
      console.error("Borrow error:", error);
      alert("Terjadi kesalahan saat meminjam buku");
    } finally {
      setBorrowing(false);
    }
  };

  if (!isbn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Memuat detail buku...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Buku Tidak Ditemukan
              </h3>
              <p className="text-gray-600 mb-2">
                {error}
              </p>
              <p className="text-sm text-gray-500">
                ISBN: {isbn}
              </p>
            </div>
          ) : book ? (
            <>
              {/* Book Detail Section */}
              <div className="grid md:grid-cols-3 gap-8 mb-10">
                {/* Book Cover */}
                <div className="md:col-span-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="relative w-full rounded-2xl shadow-2xl object-cover aspect-[3/4]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button 
                      onClick={handleBorrow}
                      disabled={book.status !== "AVAILABLE" || borrowing}
                      className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        book.status === "AVAILABLE" && !borrowing
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-purple-500/50 hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      {borrowing ? "Memproses..." : book.status === "AVAILABLE" ? "Pinjam Buku" : "Tidak Tersedia"}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-3 border-2 border-gray-200 hover:border-indigo-600 rounded-xl font-semibold text-gray-700 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" />
                        Simpan
                      </button>
                      <button className="py-3 border-2 border-gray-200 hover:border-indigo-600 rounded-xl font-semibold text-gray-700 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Bagikan
                      </button>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Stok Tersedia
                      </span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {book.stock}
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                        style={{
                          width: `${Math.min((book.stock / 10) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                        book.status === "AVAILABLE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {book.status === "AVAILABLE"
                        ? "Tersedia"
                        : "Tidak Tersedia"}
                    </span>
                  </div>

                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    {book.title}
                  </h1>

                  <div className="flex items-center gap-2 text-xl text-gray-600 mb-6">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{book.author}</span>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Penerbit</p>
                        <p className="font-semibold text-gray-900">
                          {book.publisher}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tahun Terbit</p>
                        <p className="font-semibold text-gray-900">
                          {book.publication_year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Halaman</p>
                        <p className="font-semibold text-gray-900">
                          {book.pages} halaman
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bahasa</p>
                        <p className="font-semibold text-gray-900">
                          {book.language}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900">
                          {book.totalBorrows}
                        </span>{" "}
                        kali dipinjam
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900">128</span>{" "}
                        favorit
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Deskripsi
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {book.description ||
                        "Deskripsi tidak tersedia untuk buku ini."}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="mt-6">
                    <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
                      📚 {book.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Books Section */}
              {relatedBooks.length > 0 && (
                <section className="border-t border-gray-200 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <TrendingUp className="w-7 h-7 text-purple-600" />
                      Buku Sejenis
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {relatedBooks.map((relatedBook) => (
                      <button
                        key={relatedBook.isbn}
                        onClick={() => {
                          setLoading(true);
                          setBook(null);
                          // Fetch new book
                          fetch(`/api/books/${relatedBook.isbn}`)
                            .then((res) => res.json())
                            .then((data) => {
                              setBook(data.book);
                              setRelatedBooks(data.relatedBooks);
                              setLoading(false);
                              document
                                .querySelector(".overflow-y-auto")
                                .scrollTo(0, 0);
                            });
                        }}
                        className="group text-left"
                      >
                        <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                          <BookCard book={relatedBook} size="small" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}