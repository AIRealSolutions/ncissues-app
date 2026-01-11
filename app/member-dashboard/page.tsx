'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  voter_reg_num: string;
  ncid: string;
  full_name: string;
  email: string;
  phone?: string;
  party_cd: string;
  res_city: string;
  res_zip_code: string;
  nc_senate_dist: string;
  nc_house_dist: string;
  role?: string;
}

interface TrackedBill {
  id: number;
  tracked_at: string;
  notes?: string;
  bills: {
    id: number;
    bill_number: string;
    title: string;
    short_title?: string;
    status: string;
    chamber: string;
    last_action?: string;
    last_action_date?: string;
  };
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [trackedBills, setTrackedBills] = useState<TrackedBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.type === 'member') {
        setMember(data);
        fetchTrackedBills();
      } else {
        // Not authenticated or not a member, redirect to login
        router.push('/member-login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/member-login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackedBills = async () => {
    try {
      const response = await fetch('/api/tracked-bills');
      if (response.ok) {
        const data = await response.json();
        setTrackedBills(data.tracked_bills || []);
      }
    } catch (error) {
      console.error('Error fetching tracked bills:', error);
    }
  };

  const handleUntrackBill = async (billId: number) => {
    try {
      const response = await fetch(`/api/tracked-bills?bill_id=${billId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrackedBills(trackedBills.filter(tb => tb.bills.id !== billId));
      } else {
        alert('Error untracking bill');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error untracking bill');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null; // Will redirect
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
            <nav className="flex gap-6 items-center">
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/find-legislator" className="text-gray-700 hover:text-blue-900">
                Find Legislator
              </Link>
              <Link href="/subscribe" className="text-gray-700 hover:text-blue-900">
                Subscribe
              </Link>
              <Link href="/member-settings" className="text-gray-700 hover:text-blue-900">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-900"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome, {member.full_name.split(' ')[0]}!
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Your personalized legislative tracking dashboard
          </p>
          {member.role === 'admin' && (
            <div className="mt-4 inline-block px-4 py-2 bg-yellow-500 text-yellow-900 rounded-lg font-medium">
              Admin Access
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Districts</h3>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Senate District: <span className="font-medium text-gray-900">{member.nc_senate_dist}</span></p>
              <p className="text-sm text-gray-600">House District: <span className="font-medium text-gray-900">{member.nc_house_dist}</span></p>
              <p className="text-sm text-gray-600">Party: <span className="font-medium text-gray-900">{member.party_cd}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tracked Bills</h3>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{trackedBills.length}</p>
            <p className="text-sm text-gray-600 mt-2">
              {trackedBills.length === 0 ? 'No bills tracked yet' : 'Bills you\'re following'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">No new updates</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{member.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{member.email}</p>
                </div>
                {member.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{member.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{member.res_city}, NC {member.res_zip_code}</p>
                </div>
              </div>
              <Link
                href="/member-settings"
                className="mt-6 block w-full text-center bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Edit Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/bills"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Browse Bills</div>
                  <div className="text-sm text-gray-600">View all NC legislation</div>
                </Link>
                <Link
                  href="/find-legislator"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Find Your Legislators</div>
                  <div className="text-sm text-gray-600">Contact your representatives</div>
                </Link>
                <Link
                  href="/subscribe"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Manage Subscriptions</div>
                  <div className="text-sm text-gray-600">Set notification preferences</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Tracked Bills */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Your Tracked Bills</h3>
                <Link
                  href="/bills"
                  className="text-sm text-blue-900 hover:underline"
                >
                  Browse All Bills →
                </Link>
              </div>
              
              {trackedBills.length > 0 ? (
                <div className="space-y-4">
                  {trackedBills.map((tracked) => (
                    <div key={tracked.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/bills/${tracked.bills.id}`}
                            className="font-medium text-gray-900 hover:text-blue-900"
                          >
                            {tracked.bills.bill_number}: {tracked.bills.title}
                          </Link>
                          <div className="flex gap-2 mt-2 text-sm">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {tracked.bills.chamber === 'house' ? 'House' : 'Senate'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {tracked.bills.status}
                            </span>
                          </div>
                          {tracked.bills.last_action && (
                            <p className="mt-2 text-sm text-gray-600">
                              Last Action: {tracked.bills.last_action}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleUntrackBill(tracked.bills.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Untrack
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Tracked Bills Yet</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start tracking bills to see updates and activity here. Browse bills and click "Track" to follow legislation that matters to you.
                  </p>
                  <Link
                    href="/bills"
                    className="inline-block bg-blue-900 text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Browse Bills
                  </Link>
                </div>
              )}
            </div>

            {/* Getting Started */}
            {trackedBills.length === 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-3">Getting Started</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Browse the bills page to find legislation that interests you</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Click "Track" on bills you want to follow for updates</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Set up email notifications to get updates on bill activity</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Use "Find Your Legislator" to contact your representatives</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
