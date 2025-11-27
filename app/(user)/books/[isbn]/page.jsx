// app/(user)/books/[isbn]/page.jsx

import {
  Search,
  Bell,
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  FileText,
  Globe,
  TrendingUp,
  Heart,
  Share2,
  Clock
} from "lucide-react";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import pool from "@/lib/db";

async function getBookDetails(isbn) {
  try {
    // Get book details
    const [bookRows] = await pool.execute(
      `
      SELECT 
        isbn,
        title,
        author,
        publisher,
        publication_year,
        pages,
        language,
        description,
        cover_image AS coverUrl,
        stock,
        category,
        CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status,
        created_at
      FROM books
      WHERE isbn = ?
      `,
      [isbn]
    );

    if (bookRows.length === 0) {
      return null;
    }

    const book = bookRows[0];

    // Get related books (same category)
    const [relatedBooks] = await pool.execute(
      `
      SELECT 
        isbn,
        title,
        author,
        cover_image AS coverUrl,
        stock,
        CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status
      FROM books
      WHERE category = ? AND isbn != ?
      ORDER BY RAND()
      LIMIT 6
      `,
      [book.category, isbn]
    );

    // Get total borrowed count
    const [borrowStats] = await pool.execute(
      `
      SELECT COUNT(DISTINCT l.id) as total_borrows
      FROM loans l
      JOIN loan_details ld ON l.id = ld.loan_id
      WHERE ld.isbn = ?
      `,
      [isbn]
    );

    return {
      book: {
        ...book,
        totalBorrows: borrowStats[0]?.total_borrows || 0
      },
      relatedBooks
    };
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
}

export default async function BookDetailPage({ params }) {
  // Await params untuk Next.js 15+
  const { isbn } = await params;
  const data = await getBookDetails(isbn);

  // Handle jika buku tidak ditemukan
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buku Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">ISBN yang kamu cari tidak ada di database</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const { book, relatedBooks } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - sama seperti home page */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
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
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Beranda
        </Link>

        {/* Book Detail Section */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-12">
          <div className="grid md:grid-cols-3 gap-10">
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
                <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {book.status === "AVAILABLE" ? "Pinjam Buku" : "Join Waitlist"}
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
                  <span className="text-gray-600 font-medium">Stok Tersedia</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {book.stock}
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    style={{ width: `${Math.min((book.stock / 10) * 100, 100)}%` }}
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
                  {book.status === "AVAILABLE" ? "Tersedia" : "Tidak Tersedia"}
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
                    <p className="font-semibold text-gray-900">{book.publisher}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tahun Terbit</p>
                    <p className="font-semibold text-gray-900">{book.publication_year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Halaman</p>
                    <p className="font-semibold text-gray-900">{book.pages} halaman</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bahasa</p>
                    <p className="font-semibold text-gray-900">{book.language}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    <span className="font-bold text-gray-900">{book.totalBorrows}</span> kali dipinjam
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    <span className="font-bold text-gray-900">128</span> favorit
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Deskripsi</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {book.description || "Deskripsi tidak tersedia untuk buku ini."}
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
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-9 h-9 text-purple-600" />
                Buku Sejenis
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link
                  key={relatedBook.isbn}
                  href={`/books/${relatedBook.isbn}`}
                  className="group"
                >
                  <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                    <BookCard book={relatedBook} size="medium" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}