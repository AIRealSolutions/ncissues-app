'use client';

import { useState, useEffect } from 'react';

export default function AdminBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/admin/bills');
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4">Bill Management</h1>
          <p className="text-gray-600 mb-6">Add official NC legislative bills from ncleg.gov</p>
          
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Bills: {bills.length}
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Use the API at /api/admin/bills to add official bills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
