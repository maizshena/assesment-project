'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Grid3x3, List, Plus, Search, Filter, Edit, Trash2, X, Upload, Link as LinkIcon } from 'lucide-react';

export default function AdminCollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [coverPreviewValid, setCoverPreviewValid] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    published_year: '',
    category: '',
    pages: '',
    language: 'Indonesian',
    description: '',
    cover_image: '',
    quantity: 1,
    available: 1,
    status: 'active',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/home');
      } else {
        fetchBooks();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchBooks();
    }
  }, [search, categoryFilter, statusFilter, status, session]);

  useEffect(() => {
    if (!formData.cover_image) {
      setCoverPreviewValid(null);
      return;
    }
    let mounted = true;
    const img = new Image();
    img.onload = () => { if (mounted) setCoverPreviewValid(true); };
    img.onerror = () => { if (mounted) setCoverPreviewValid(false); };
    img.src = formData.cover_image;
    return () => { mounted = false; img.onload = null; img.onerror = null; };
  }, [formData.cover_image]);

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'book');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({ ...prev, cover_image: data.url }));
        alert('Image uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const toNullIfEmpty = (v) => {
        if (v === undefined) return null;
        if (v === null) return null;
        if (typeof v === 'string' && v.trim() === '') return null;
        return v;
      };

      const parseNum = (v, fallback = null) => {
        if (v === undefined || v === null || v === '') return fallback;
        const n = Number(v);
        return Number.isNaN(n) ? fallback : n;
      };

      const payload = {
        title: (formData.title ?? '').toString().trim(),
        author: (formData.author ?? '').toString().trim(),
        isbn: toNullIfEmpty(formData.isbn),
        publisher: toNullIfEmpty(formData.publisher),
        published_year: parseNum(formData.published_year, null),
        category: toNullIfEmpty(formData.category),
        pages: parseNum(formData.pages, null),
        language: (formData.language ?? 'Indonesian').toString().trim(),
        description: toNullIfEmpty(formData.description),
        cover_image: toNullIfEmpty(formData.cover_image),
        quantity: parseNum(formData.quantity, 1),
        available: parseNum(formData.available, 1),
        status: (formData.status ?? 'active').toString().trim()
      };

      if (editingBook) {
        if (!editingBook.id && editingBook?.bookId) {
          editingBook.id = editingBook.bookId;
        }
        if (!editingBook.id) {
          alert('Cannot update: missing book id.');
          return;
        }
      }

      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
        setShowModal(false);
        resetForm();
        fetchBooks();
      } else {
        alert(data.error || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('An error occurred: ' + error.message);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title ?? '',
      author: book.author ?? '',
      isbn: book.isbn ?? '',
      publisher: book.publisher ?? '',
      published_year: book.published_year ?? '',
      category: book.category ?? '',
      pages: book.pages ?? '',
      language: book.language ?? 'Indonesian',
      description: book.description ?? '',
      cover_image: book.cover_image ?? '',
      quantity: book.quantity ?? 1,
      available: book.available ?? 1,
      status: book.status ?? 'active',
    });
    setShowModal(true);
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Delete this book? This action cannot be undone!')) return;

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Book deleted successfully!');
        fetchBooks();
      } else {
        alert(data.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('An error occurred');
    }
  };

  const resetForm = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      published_year: '',
      category: '',
      pages: '',
      language: 'Indonesian',
      description: '',
      cover_image: '',
      quantity: 1,
      available: 1,
      status: 'active',
    });
    setCoverPreviewValid(null);
  };

  const filteredBooks = books.filter(book => {
    const matchCategory = !categoryFilter || book.category === categoryFilter;
    const matchStatus = !statusFilter || book.status === statusFilter;
    return matchCategory && matchStatus;
  });

  const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-lg text-gray-600">Memuat koleksi buku...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 pr-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Book Collections</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola koleksi buku perpustakaan</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 hover:shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add New Book
        </button>
      </div>

      {/* Search & Filters */}
      <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="damaged">Damaged</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid3x3 className="w-4 h-4" /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>
        </div>
      </section>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
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
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      book.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : book.status === 'archived'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {book.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500">{book.author}</p>
                </div>

                {book.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                    {book.category}
                  </span>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Stock:{' '}
                    <span
                      className={`font-semibold ${
                        book.available > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {book.available}/{book.quantity}
                    </span>
                  </div>
                  {book.published_year && (
                    <span className="text-gray-500">{book.published_year}</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3">Cover</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Publisher</th>
                  <th className="px-6 py-3">Year</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="h-16 w-12 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-12 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{book.title}</td>
                    <td className="px-6 py-4 text-gray-600">{book.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{book.publisher || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{book.published_year || '-'}</td>
                    <td className="px-6 py-4">
                      {book.category && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                          {book.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          book.available > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {book.available}/{book.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          book.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : book.status === 'archived'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBooks.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">No books found</div>
          )}
        </section>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-600" /> Basic Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="978-3-16-148410-0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                      <input
                        type="text"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Gramedia"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Published Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.published_year}
                        onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                        <option value="Science">Science</option>
                        <option value="Technology">Technology</option>
                        <option value="History">History</option>
                        <option value="Biography">Biography</option>
                        <option value="Self-Help">Self-Help</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., 350"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="Indonesian">Indonesian</option>
                        <option value="English">English</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      rows="4"
                      placeholder="Book synopsis or description..."
                    />
                  </div>

                  {/* Cover Image Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Cover Image</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex text-xs text-gray-500 mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Upload from Computer
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        {uploading && (
                          <p className="text-xs text-emerald-600 mt-1">Uploading...</p>
                        )}
                      </div>

                      <div>
                        <label className="flex text-xs text-gray-500 mb-2 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" /> Enter Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.cover_image}
                          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-3 font-medium">Preview:</p>
                      {coverPreviewValid === true && (
                        <img
                          src={formData.cover_image}
                          alt="Cover preview"
                          className="h-48 w-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                      )}
                      {coverPreviewValid === false && (
                        <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">
                          Couldn't load image from URL. The URL will still be saved if you submit.
                        </div>
                      )}
                      {coverPreviewValid === null && (
                        <div className="text-sm text-gray-400 italic">No image selected</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock & Status */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">Stock & Status</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={formData.quantity ?? 0}
                        value={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:bg-gray-400 transition shadow-sm hover:shadow-md"
                  >
                    {editingBook ? (
                      <>
                        <Edit className="w-4 h-4" /> Update Book
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Add Book
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="pt-60 text-sm text-gray-400 py-6">
        © {new Date().getFullYear()} Puskata — Book Collections Management
      </footer>
    </div>
  );
}