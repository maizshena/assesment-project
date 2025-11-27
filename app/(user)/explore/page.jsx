"use client";

import { Search, Bell, Filter, Grid, List, BookOpen, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import BookCard from "@/components/BookCard";

const CATEGORIES = [
  { id: "ALL", label: "Semua Buku", icon: "📚" },
  { id: "FIK", label: "Fiksi", icon: "📖" },
  { id: "NON", label: "Non-Fiksi", icon: "📝" },
  { id: "SAI", label: "Sains", icon: "🔬" },
  { id: "SEJ", label: "Sejarah", icon: "📜" },
  { id: "TKN", label: "Teknologi", icon: "💻" },
  { id: "SEN", label: "Seni", icon: "🎨" },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const tabsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [activeTab, sortBy]);

  useEffect(() => {
    checkArrows();
    window.addEventListener("resize", checkArrows);
    return () => window.removeEventListener("resize", checkArrows);
  }, []);

  const checkArrows = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? tabsRef.current.scrollLeft - scrollAmount
          : tabsRef.current.scrollLeft + scrollAmount;

      tabsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(checkArrows, 300);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeTab,
        sort: sortBy,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/books/explore?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const getCategoryCount = (categoryId) => {
    if (categoryId === "ALL") {
      return categories.reduce((sum, cat) => sum + cat.count, 0);
    }
    const cat = categories.find((c) => c.category_id === categoryId);
    return cat ? cat.count : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, penulis, atau ISBN..."
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium"
                />
              </form>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-indigo-600" />
                Jelajahi Koleksi
              </h1>
              <p className="text-gray-600 text-lg">
                Temukan buku favoritmu dari {getCategoryCount("ALL")} koleksi kami
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="author">Author (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8 relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg rounded-full border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <div
            ref={tabsRef}
            onScroll={checkArrows}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === category.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300"
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === category.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getCategoryCount(category.id)}
                </span>
              </button>
            ))}
          </div>

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg rounded-full border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Memuat koleksi buku...</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-lg border border-gray-100">
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-14 h-14 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Tidak ada buku ditemukan
            </h3>
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Kategori ini belum memiliki buku"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchBooks();
                }}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {books.map((book) => (
                <button
                  key={book.isbn}
                  onClick={() => {
                    console.log("Book clicked:", book.isbn);
                  }}
                  className="group text-left"
                >
                  <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                    <BookCard book={book} size="medium" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 font-medium">
                Menampilkan <span className="font-bold text-gray-900">{books.length}</span> buku
                {searchQuery && (
                  <span>
                    {" "}
                    untuk pencarian "<span className="font-bold text-indigo-600">{searchQuery}</span>"
                  </span>
                )}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}