'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  id: number;
  voter_reg_num: string;
  ncid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  party_cd: string;
  nc_senate_dist: string;
  nc_house_dist: string;
  role: string;
  type: string;
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setMember(data);
      } else {
        router.push('/member/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/member/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {member.first_name}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-blue-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Member Dashboard</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{member.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Party</p>
                  <p className="font-medium text-gray-900">{member.party_cd}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{member.email || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{member.phone || 'Not set'}</p>
                </div>
              </div>
              <Link
                href="/member-profile"
                className="mt-4 inline-block text-blue-900 hover:underline font-medium"
              >
                Edit Profile →
              </Link>
            </div>

            {/* Districts Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Districts</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">NC Senate District</p>
                  <p className="font-medium text-gray-900">District {member.nc_senate_dist}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NC House District</p>
                  <p className="font-medium text-gray-900">District {member.nc_house_dist}</p>
                </div>
              </div>
              <Link
                href="/find-legislator"
                className="mt-4 inline-block text-blue-900 hover:underline font-medium"
              >
                Find Your Legislators →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/bills"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-3xl mb-2">📜</div>
                <h3 className="font-bold text-gray-900 mb-1">Browse Bills</h3>
                <p className="text-sm text-gray-600">View current legislation</p>
              </Link>

              <Link
                href="/subscribe"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-3xl mb-2">🔔</div>
                <h3 className="font-bold text-gray-900 mb-1">Manage Subscriptions</h3>
                <p className="text-sm text-gray-600">Get bill notifications</p>
              </Link>

              <Link
                href="/contact"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-3xl mb-2">✉️</div>
                <h3 className="font-bold text-gray-900 mb-1">Contact Representatives</h3>
                <p className="text-sm text-gray-600">Make your voice heard</p>
              </Link>
            </div>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
