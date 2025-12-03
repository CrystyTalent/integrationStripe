'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  customerEmail?: string;
  paymentIntentId?: string;
  checkoutSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });

  const fetchPayments = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/payments'
        : `/api/payments?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.payments || []);
        calculateStats(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allPayments: Payment[]) => {
    const total = allPayments.length;
    const completed = allPayments.filter(p => p.status === 'completed').length;
    const pending = allPayments.filter(p => p.status === 'pending').length;
    const failed = allPayments.filter(p => p.status === 'failed').length;
    const totalAmount = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      total,
      completed,
      pending,
      failed,
      totalAmount,
    });
  };

  useEffect(() => {
    fetchPayments();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchPayments, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const getStatusBadge = (status: Payment['status']) => {
    const styles = {
      completed: 'bg-green-900/50 text-green-300 border border-green-700',
      pending: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
      failed: 'bg-red-900/50 text-red-300 border border-red-700',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Payment Dashboard</h1>
          <Link
            href="/checkout"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Payment</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6 hover:border-slate-600 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm font-medium text-gray-400 mb-2">Total Payments</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6 hover:border-green-500/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm font-medium text-green-400 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6 hover:border-yellow-500/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm font-medium text-yellow-400 mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6 hover:border-red-500/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm font-medium text-red-400 mb-2">Failed</p>
            <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl shadow-lg p-6 hover:border-indigo-500/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm font-medium text-indigo-300 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(stats.totalAmount, 'usd')}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
              filter === 'all'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
              filter === 'completed'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-slate-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
              filter === 'pending'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-slate-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
              filter === 'failed'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-slate-600'
            }`}
          >
            Failed
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-indigo-500 mb-4"></div>
              <p className="text-gray-400">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">No payments found</p>
              <p className="text-gray-500 text-sm">Payments will appear here once created</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                  {payments.map((payment, index) => (
                    <tr 
                      key={payment.id} 
                      className="hover:bg-slate-700/30 transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-300 font-medium">
                          {payment.id.substring(0, 20)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-semibold text-white">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {payment.customerEmail || <span className="text-gray-500 italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
