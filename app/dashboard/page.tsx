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
            href="/create"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Create Payment
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-400">Total Payments</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-green-400">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-red-400">Failed</p>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">
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
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No payments found.</div>
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
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-700/50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-300">
                          {payment.id.substring(0, 20)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {payment.customerEmail || 'N/A'}
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
