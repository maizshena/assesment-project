'use client';

import { useState, useEffect } from 'react';
import { Search, Grid3x3, List, AlertCircle } from 'lucide-react';

export default function LoanManagementContent() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'ALL', label: 'All Loans' },
    { value: 'BORROWED', label: 'Borrowed' },
    { value: 'PENDING_RETURN', label: 'Pending Return' },
    { value: 'RETURNED', label: 'Returned' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = filterStatus === 'ALL' 
        ? '/api/loans' 
        : `/api/loans?status=${filterStatus}`;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch loans`);
      }

      const data = await res.json();
      let loansArray = [];

      if (Array.isArray(data)) loansArray = data;
      else if (data.loans && Array.isArray(data.loans)) loansArray = data.loans;
      else if (data.data && Array.isArray(data.data)) loansArray = data.data;
      else loansArray = [];

      setLoans(loansArray);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [filterStatus]);

  const handleAcceptReturn = async (loanId) => {
    if (!confirm('Yakin approve pengembalian buku ini?')) return;

    try {
      const res = await fetch('/api/loans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ loan_id: loanId, action: 'accept_return' })
      });

      const result = await res.json();
      if (res.ok) {
        alert('Pengembalian berhasil diapprove!');
        fetchLoans();
      } else {
        alert('Gagal approve: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  const handleRejectReturn = async (loanId) => {
    if (!confirm('Yakin reject pengembalian ini?')) return;

    try {
      const res = await fetch('/api/loans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ loan_id: loanId, action: 'reject_return' })
      });

      const result = await res.json();
      if (res.ok) {
        alert('Pengembalian ditolak');
        fetchLoans();
      } else {
        alert('Gagal reject: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (!loan) return false;
    const searchLower = search.toLowerCase();

    const bookInfo = loan.books?.[0] || loan;
    const matchesSearch = 
      (loan.id?.toString() || '').includes(searchLower) ||
      (loan.users_name || '').toLowerCase().includes(searchLower) ||
      (loan.user_id?.toString() || '').includes(searchLower) ||
      (bookInfo.title || '').toLowerCase().includes(searchLower) ||
      (bookInfo.isbn || '').toLowerCase().includes(searchLower) ||
      (bookInfo.author || '').toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const getStatusBadge = (stock) => {
    if (!stock || stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (stock <= 3) return { text: `Low Stock • ${stock}`, color: 'bg-yellow-100 text-yellow-700' };
    return { text: `Available • ${stock}`, color: 'bg-green-100 text-green-700' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const calculateDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage loan history lorem ipsum dolor sit amet hahahaha hhohoihohooh nanana jujeuaksdkejajajajajajjaj.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, ISBN, Title, Author, or Category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === option.value
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Failed to load loans</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button onClick={fetchLoans} className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading & Data */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading loans data...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm">
            <p className="text-lg font-semibold mb-2">
              {loans.length === 0 ? 'No loans data available' : 'No loans found'}
            </p>
            <p className="text-sm">
              {loans.length === 0 ? 'Check your API connection' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLoans.map((loan) => {
              const book = loan.books && loan.books.length > 0
                ? loan.books[0]
                : {
                    isbn: loan.isbn || loan.book_isbn || 'N/A',
                    title: loan.title || loan.book_title || 'Unknown Title',
                    author: loan.author || loan.book_author || 'Unknown Author',
                    cover_image: loan.cover_image || loan.book_cover || null,
                    stock: loan.stock ?? 0,
                    category_name: loan.category_name || 'Uncategorized'
                  };

              const daysUntilDue = calculateDaysUntilDue(loan.due_date);
              const isOverdue = daysUntilDue < 0;

              return (
                <div key={loan.id || loan.loan_id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-32 h-44 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="176"%3E%3Crect fill="%23e5e7eb" width="128" height="176"/%3E%3Ctext x="64" y="88" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-32 h-44 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-md">
                          <span className="text-xs text-gray-400 font-medium text-center">No cover</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="text-gray-500">Borrower</span> • <span className="font-semibold text-gray-900">{loan.users_name || 'Unknown User'}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">User ID: {loan.user_id || 'N/A'}</p>
                        </div>
                        <p className="text-xs text-gray-400 text-right">
                          Loan Permission<br />{formatDate(loan.loan_date)}
                        </p>
                      </div>

                      <p className="text-sm text-blue-600 mb-2 font-medium">
                        ISBN: <span className="underline">{book.isbn}</span>
                      </p>

                      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">by {book.author}</p>

                      <div className="flex gap-2 mb-4 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(book.stock).color}`}>
                          {getStatusBadge(book.stock).text}
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {book.category_name}
                        </span>
                      </div>

                      {loan.status !== 'RETURNED' && loan.status !== 'REJECTED' && (
                        <div className="mb-4">
                          {isOverdue ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-700 font-semibold">
                                Overdue by {Math.abs(daysUntilDue)} days ({formatDate(loan.due_date)})
                              </p>
                            </div>
                          ) : daysUntilDue <= 3 ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <p className="text-sm text-orange-700 font-medium">
                                Due in {daysUntilDue} days ({formatDate(loan.due_date)})
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              Due in {daysUntilDue} days ({formatDate(loan.due_date)})
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        {loan.status === 'PENDING_RETURN' ? (
                          <>
                            <button onClick={() => handleRejectReturn(loan.id || loan.loan_id)} className="px-6 py-2.5 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 text-sm font-semibold transition-all">
                              Deny this loan
                            </button>
                            <button onClick={() => handleAcceptReturn(loan.id || loan.loan_id)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-all shadow-md">
                              Accept this loan
                            </button>
                          </>
                        ) : loan.status === 'BORROWED' ? (
                          <button className="px-6 py-2.5 border-2 border-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium" disabled>
                            Currently Borrowed
                          </button>
                        ) : loan.status === 'RETURNED' ? (
                          <button className="px-6 py-2.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold" disabled>
                            Returned
                          </button>
                        ) : loan.status === 'REJECTED' ? (
                          <button className="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold" disabled>
                            Rejected
                          </button>
                        ) : loan.status === 'OVERDUE' ? (
                          <button className="px-6 py-2.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold" disabled>
                            Overdue
                          </button>
                        ) : (
                          <button className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium" disabled>
                            {loan.status || 'Unknown'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}