'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  full_name: string;
  email: string;
  type: string;
  membership_tier?: string;
  nc_senate_dist?: string;
  nc_house_dist?: string;
  county?: string;
}

interface Official {
  id: number;
  office_type: string;
  office_title: string;
  full_name: string;
  party: string;
  district?: string;
  county?: string;
  email?: string;
  phone?: string;
  website_url?: string;
}

export default function ControlPanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [officialsLoading, setOfficialsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyOfficials();
    }
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
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

  const fetchMyOfficials = async () => {
    setOfficialsLoading(true);
    try {
      // Fetch officials for user's county and districts
      const response = await fetch(`/api/officials?county=${user?.county || 'Brunswick'}`);
      if (response.ok) {
        const data = await response.json();
        setOfficials(data);
      }
    } catch (error) {
      console.error('Error fetching officials:', error);
    } finally {
      setOfficialsLoading(false);
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

  const getOfficeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'governor': 'Governor',
      'lt_governor': 'Lt. Governor',
      'attorney_general': 'Attorney General',
      'state_senate': 'State Senator',
      'state_house': 'State Representative',
      'county_commissioner': 'County Commissioner',
      'mayor': 'Mayor',
      'school_board': 'School Board',
    };
    return labels[type] || type;
  };

  const getPartyColor = (party: string) => {
    if (party === 'Republican') return 'text-red-600';
    if (party === 'Democratic') return 'text-blue-600';
    return 'text-gray-600';
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

  if (!user) {
    return null;
  }

  const isFree = !user.membership_tier || user.membership_tier === 'free';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/member/dashboard" className="text-gray-700 hover:text-blue-900">
                Dashboard
              </Link>
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/control-panel" className="text-blue-900 font-medium">
                Control Panel
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Legislation Control Panel</h1>
            <p className="text-gray-600">
              Track bills, monitor your elected officials, and stay informed about legislation
            </p>
          </div>

          {/* Membership Tier Banner */}
          {isFree && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
                  <p className="text-blue-100">
                    Get advanced tracking tools, bill comment notifications, and more!
                  </p>
                </div>
                <Link
                  href="/upgrade"
                  className="px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Tracked Bills</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{officials.length}</div>
              <div className="text-gray-600">Your Officials</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">New Updates</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {user.membership_tier === 'premium' ? '∞' : '5'}
              </div>
              <div className="text-gray-600">Track Limit</div>
            </div>
          </div>

          {/* Your Elected Officials */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Your Elected Officials</h2>
              <p className="text-sm text-gray-600 mt-1">
                Based on your location: {user.county || 'Brunswick'} County
              </p>
            </div>

            {officialsLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading officials...
              </div>
            ) : officials.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No officials found for your area
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {officials.map((official) => (
                  <div key={official.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">{official.full_name}</h3>
                          {official.party && (
                            <span className={`text-sm font-medium ${getPartyColor(official.party)}`}>
                              ({official.party})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{official.office_title}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {official.email && (
                            <a
                              href={`mailto:${official.email}`}
                              className="flex items-center gap-1 hover:text-blue-900"
                            >
                              <span>✉️</span>
                              <span>{official.email}</span>
                            </a>
                          )}
                          {official.phone && (
                            <a
                              href={`tel:${official.phone}`}
                              className="flex items-center gap-1 hover:text-blue-900"
                            >
                              <span>📞</span>
                              <span>{official.phone}</span>
                            </a>
                          )}
                          {official.website_url && (
                            <a
                              href={official.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-blue-900"
                            >
                              <span>🌐</span>
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          Track
                        </button>
                        <a
                          href={`mailto:${official.email}`}
                          className="px-4 py-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tracked Bills (Placeholder) */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Tracked Bills</h2>
            </div>
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">You haven't tracked any bills yet</p>
              <Link
                href="/bills"
                className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                Browse Bills
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
