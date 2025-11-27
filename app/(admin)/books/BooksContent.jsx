'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, X, Upload, Grid3x3, List, MoreVertical, BookOpen, PackageOpen } from 'lucide-react';

export function BooksContent() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const [form, setForm] = useState({
    isbn: '',
    title: '',
    author: '',
    category_id: '',
    stock: '',
    cover_image: null,
    cover_url: ''
  });
  
  const [imageError, setImageError] = useState(false);

  // Fetch data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, catRes] = await Promise.all([
        fetch('/api/books').then(r => r.json()),
        fetch('/api/categories').then(r => r.json())
      ]);
      setBooks(bookRes);
      setCategories(catRes);
    } catch (err) {
      alert('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle submit (tambah/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('isbn', form.isbn);
    formData.append('title', form.title);
    formData.append('author', form.author);
    formData.append('category_id', form.category_id);
    formData.append('stock', form.stock);
    if (form.cover_image) formData.append('cover_image', form.cover_image);
    if (form.cover_url) formData.append('cover_url', form.cover_url);

    const url = editingBook ? `/api/books?isbn=${editingBook.isbn}` : '/api/books';
    const method = editingBook ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: formData });
      const result = await res.json();

      if (res.ok) {
        alert(editingBook ? 'Buku berhasil diupdate' : 'Buku berhasil ditambahkan');
        setIsModalOpen(false);
        resetForm();
        fetchData();
      } else {
        alert(result.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  };

  // Hapus buku
  const handleDelete = async (isbn) => {
    const confirmDelete = confirm('Yakin hapus buku ini? Data tidak bisa dikembalikan!');

    if (confirmDelete) {
      try {
        const res = await fetch(`/api/books?isbn=${isbn}`, { method: 'DELETE' });
        if (res.ok) {
          alert('Buku dihapus');
          fetchData();
        } else {
          alert('Gagal menghapus');
        }
      } catch (err) {
        alert('Gagal menghapus');
      }
    }
  };

  // Edit buku
  const openEdit = (book) => {
    setEditingBook(book);
    setForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      category_id: book.category_id,
      stock: book.stock,
      cover_image: null,
      cover_url: ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingBook(null);
    setImageError(false);
    setForm({
      isbn: '',
      title: '',
      author: '',
      category_id: '',
      stock: '',
      cover_image: null,
      cover_url: ''
    });
  };

  const filteredBooks = books.filter(book => {
    const searchLower = search.toLowerCase();
    return (
      book.isbn.toLowerCase().includes(searchLower) ||
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      (book.category_name || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Container Tengah + Lebar Maksimal */}
      <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header dengan Gradient Background */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your book collections</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all text-sm font-medium hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Add Book
          </button>
        </div>
      </div>

      {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">        
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Books</p>
              <p className="text-3xl font-bold text-blue-600">{books.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">
                {books.filter(b => b.stock > 0).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <PackageOpen className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-orange-600">
                {books.filter(b => b.stock === 0).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <X className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
          />
        </div>
        
        <div className="flex bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
            title="Grid View"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading books...</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Book
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">No books found</p>
                      <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.isbn} className="hover:bg-blue-50/50 transition group">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {book.isbn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {book.cover_image ? (
                          <img 
                            src={book.cover_image} 
                            alt={book.title} 
                            className="w-10 h-14 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {book.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.author}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        book.stock === 0 ? 'bg-red-100 text-red-700' :
                        book.stock <= 3 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {book.stock} left
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(book)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(book.isbn)}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {filteredBooks.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">1-{filteredBooks.length}</span> of <span className="font-semibold">{filteredBooks.length}</span> entries
              </p>
              <div className="flex gap-1">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-9 h-9 rounded-lg transition ${
                      page === 1
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    } text-sm font-medium`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No books found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
              </div>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.isbn} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button
                      onClick={() => openEdit(book)}
                      className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.isbn)}
                      className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  
                  {/* Stock Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                      book.stock === 0 ? 'bg-red-500/90 text-white' :
                      book.stock <= 3 ? 'bg-yellow-400/90 text-yellow-900' :
                      'bg-green-500/90 text-white'
                    }`}>
                      {book.stock} left
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">{book.author}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-500 font-mono">{book.isbn}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal dengan Improved Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBook ? 'Edit' : 'Add'} Book
                </h2>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
                <input
                  type="text"
                  required
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={!!editingBook}
                  placeholder="978-3-16-148410-0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Book Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter author name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id_category} value={cat.id_category}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Book Cover</label>
                
                {/* Upload File */}
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition group">
                  {form.cover_image ? (
                    <img src={URL.createObjectURL(form.cover_image)} alt="preview" className="h-full rounded-xl object-cover" />
                  ) : editingBook && editingBook.cover_image && !form.cover_url ? (
                    <div className="text-center">
                      <img src={editingBook.cover_image} alt="current" className="h-32 rounded-xl object-cover mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Click to upload cover image</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, cover_image: e.target.files[0], cover_url: '' })}
                    className="hidden"
                  />
                </label>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={form.cover_url}
                    onChange={(e) => {
                      setForm({ ...form, cover_url: e.target.value, cover_image: null });
                      setImageError(false);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {form.cover_url && (
                    <div className="mt-3">
                      <img 
                        src={form.cover_url} 
                        alt="URL preview" 
                        className="h-32 rounded-xl object-cover mx-auto shadow-md"
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
                        style={{ display: imageError ? 'none' : 'block' }}
                      />
                      {imageError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ Invalid image URL - Please check the link
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-semibold transition text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl text-sm font-semibold transition hover:scale-105"
                >
                  {editingBook ? 'Update Book' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}