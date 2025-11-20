// app/admin/books/page.jsx → FULL CRUD + UPLOAD COVER
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout_dashboard';
import { Plus, Search, Trash2, Edit, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

export default function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState('');



  const [form, setForm] = useState({
    isbn: '',
    title: '',
    author: '',
    category_id: '',
    stock: '',
    cover_image: null // file
  });

  // fetch data
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
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // handle submit (tambah/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('isbn', form.isbn);
    formData.append('title', form.title);
    formData.append('author', form.author);
    formData.append('category_id', form.category_id);
    formData.append('stock', form.stock);
    if (form.cover_image) formData.append('cover_image', form.cover_image);

    const url = '/api/books';
    const method = 'POST';

    const res = await fetch(url, { method, body: formData });
    const result = await res.json();

    if (res.ok) {
      toast.success(editingBook ? 'Buku berhasil diupdate' : 'Buku berhasil ditambahkan');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } else {
      toast.error(result.error || 'Terjadi kesalahan');
    }
  };

  // hapus buku
  const handleDelete = async (isbn) => {
    const confirm = await Swal.fire({
      title: 'Yakin hapus buku ini?',
      text: "Data tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/books?isbn=${isbn}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Buku dihapus');
        fetchData();
      } else {
        toast.error('Gagal menghapus');
      }
    }
  };

  // edit buku
  const openEdit = (book) => {
    setEditingBook(book);
    setForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      category_id: book.category_id,
      stock: book.stock,
      cover_image: null
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingBook(null);
    setForm({
      isbn: '',
      title: '',
      author: '',
      category_id: '',
      stock: '',
      cover_image: null
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
    <DashboardLayout>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Buku</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-5 h-5" /> Tambah Buku
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari judul atau ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Cover</th>
                  <th className="text-left p-4 font-medium text-gray-700">ISBN</th>
                  <th className="text-left p-4 font-medium text-gray-700">Judul</th>
                  <th className="text-left p-4 font-medium text-gray-700">Penulis</th>
                  <th className="text-left p-4 font-medium text-gray-700">Kategori</th>
                  <th className="text-left p-4 font-medium text-gray-700">Stok</th>
                  <th className="text-right p-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr><td colSpan="7" className="text-center p-12 text-gray-500">Tidak ada data</td></tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.isbn} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 border-2 border-dashed rounded"></div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-sm">{book.isbn}</td>
                      <td className="p-4 font-medium">{book.title}</td>
                      <td className="p-4 text-gray-600">{book.author}</td>
                      <td className="p-4 text-gray-600">{book.category_name || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          book.stock === 0 ? 'bg-red-100 text-red-700' :
                          book.stock <= 3 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {book.stock} tersedia
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEdit(book)} className="text-gray-600 hover:text-gray-900 mr-3">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(book.isbn)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingBook ? 'Edit' : 'Tambah'} Buku</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  required
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  disabled={!!editingBook}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id_category} value={cat.id_category}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Buku</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                  {form.cover_image ? (
                    <img src={URL.createObjectURL(form.cover_image)} alt="preview" className="h-full rounded-lg object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Klik untuk upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, cover_image: e.target.files[0] })}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  {editingBook ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}