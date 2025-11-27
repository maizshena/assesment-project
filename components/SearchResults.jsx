// app/components/SearchResults.jsx
import { Search, Menu, Bell, User } from "lucide-react";
import pool from "@/lib/db";
import BookCard from "@/components/BookCard";
import SearchResults from "@/components/SearchResults"; // <- kita buat ini nanti

// === DATA FETCHING ===
async function getUserCollections(userId) {
  const [rows] = await pool.execute(`
    SELECT 
      b.isbn AS id,
      b.title,
      b.author,
      b.cover_image AS coverUrl,
      'BORROWED' AS status
    FROM loan_details ld
    JOIN loans l ON ld.loan_id = l.id
    JOIN books b ON ld.isbn = b.isbn
    WHERE l.user_id = ? AND l.status IN ('BORROWED', 'PENDING_RETURN')
    ORDER BY l.loan_date DESC
    LIMIT 20
  `, [userId]);
  return rows;
}

async function getRecommendations() {
  const [rows] = await pool.execute(`
    SELECT 
      isbn AS id,
      title,
      author,
      cover_image AS coverUrl,
      CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status
    FROM books
    WHERE stock > 0
    ORDER BY created_at DESC
    LIMIT 60
  `);
  return rows;
}

// === MAIN PAGE ===
export default async function UserHomePage() {
  const userId = 'ece49c33-dff2-429c-9751-e7de8bdad4d4'; // nanti ganti session

  const [collections, initialRecommendations] = await Promise.all([
    getUserCollections(userId),
    getRecommendations(),
  ]);

  return (
    <>
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-indigo-600">Bookly</h1>
          </div>

          {/* SEARCH BAR + HASIL LANGSUNG DI BAWAHNYA */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchResults initialBooks={initialRecommendations}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari judul, penulis, atau ISBN..."
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
                  autoFocus
                />
              </div>
            </SearchResults>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              HP
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">
        {/* YOUR COLLECTIONS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Koleksi Kamu</h2>
          {collections.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500 text-lg">Kamu belum meminjam buku apapun</p>
              <p className="text-gray-400 mt-2">Yuk cari buku favoritmu di kolom pencarian!</p>
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {collections.map(book => (
                <div key={book.id} className="snap-center">
                  <BookCard book={book} size="small" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Hasil pencarian atau rekomendasi akan muncul otomatis dari komponen SearchResults */}
      </main>
    </>
  );
}

// // components/SearchResults.jsx
// 'use client';

// import { useState, useEffect, useTransition } from "react";
// import BookCard from "./BookCard";

// export default function SearchResults({ children, initialBooks }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [isPending, startTransition] = useTransition();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       startTransition(async () => {
//         if (!query.trim()) {
//           setResults([]);
//           return;
//         }

//         const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
//         if (res.ok) {
//           const data = await res.json();
//           setResults(data);
//         }
//       });
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [query]);

//   return (
//     <>
//       {/* Input search */}
//       {children({ onChange: (e) => setQuery(e.target.value) })}

//       {/* Hasil pencarian */}
//       {(query || isPending) && (
//         <div className="mt-8">
//           {isPending ? (
//             <p className="text-center py-12 text-gray-500">Mencari buku...</p>
//           ) : results.length > 0 ? (
//             <>
//               <p className="text-sm text-gray-600 mb-6">
//                 Ditemukan <strong>{results.length}</strong> buku untuk "<em>{query}</em>"
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
//                 {results.map(book => (
//                   <BookCard key={book.id} book={book} size="large" />
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
//               <p className="text-gray-600 text-lg">Buku "{query}" tidak ditemukan</p>
//               <p className="text-gray-400 mt-2">Coba cari dengan kata kunci lain ya!</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Rekomendasi awal (kalau belum ngetik) */}
//       {!query && !isPending && initialBooks.length > 0 && (
//         <section>
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Rekomendasi Untukmu</h2>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
//             {initialBooks.map(book => (
//               <BookCard key={book.id} book={book} size="large" />
//             ))}
//           </div>
//           <div className="text-center mt-12">
//             <button className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition font-medium">
//               Muat lebih banyak
//             </button>
//           </div>
//         </section>
//       )}
//     </>
//   );
// }