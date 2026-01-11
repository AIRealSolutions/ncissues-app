'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  voter_reg_num: string;
  full_name: string;
  email: string;
  phone?: string;
  res_street_address: string;
  res_city: string;
  res_zip_code: string;
  party_cd: string;
  nc_senate_dist: string;
  nc_house_dist: string;
}

export default function MemberSettingsPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.type === 'member') {
        setMember(data);
        setEmail(data.email || '');
        setPhone(data.phone || '');
      } else {
        router.push('/member-login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/member-login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate password change
    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password');
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setSaving(false);
        return;
      }
    }

    try {
      const updates: any = {
        voter_reg_num: member?.voter_reg_num,
      };

      if (email !== member?.email) {
        updates.email = email;
      }

      if (phone !== member?.phone) {
        updates.phone = phone;
      }

      if (newPassword) {
        updates.current_password = currentPassword;
        updates.password = newPassword;
      }

      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Settings saved successfully!');
        setMember(data.member);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Refresh auth state
        setTimeout(() => checkAuth(), 1000);
      } else {
        setError(data.error || 'Error saving settings');
      }
    } catch (err) {
      setError('Error saving settings');
    } finally {
      setSaving(false);
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
            <nav className="flex gap-6 items-center">
              <Link href="/member-dashboard" className="text-gray-700 hover:text-blue-900">
                Dashboard
              </Link>
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/find-legislator" className="text-gray-700 hover:text-blue-900">
                Find Legislator
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Account Settings</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Manage your profile and notification preferences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Settings</h3>
                <nav className="space-y-2">
                  <a href="#profile" className="block px-3 py-2 bg-blue-50 text-blue-900 rounded-lg font-medium">
                    Profile
                  </a>
                  <a href="#security" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    Security
                  </a>
                  <a href="#notifications" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
                    Notifications (Coming Soon)
                  </a>
                </nav>
              </div>

              {/* Voter Info Card */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-3">Voter Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Registration:</span>{' '}
                    <span className="font-medium text-gray-900">{member.voter_reg_num}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Party:</span>{' '}
                    <span className="font-medium text-gray-900">{member.party_cd}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Senate District:</span>{' '}
                    <span className="font-medium text-gray-900">{member.nc_senate_dist}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">House District:</span>{' '}
                    <span className="font-medium text-gray-900">{member.nc_house_dist}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600">
                  This information is from your voter registration and cannot be changed here.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Section */}
                <div id="profile" className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={member.full_name}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name is from voter registration and cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={`${member.res_street_address}, ${member.res_city}, NC ${member.res_zip_code}`}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Address is from voter registration and cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Used for login and notifications
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Optional - for SMS notifications (coming soon)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div id="security" className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to keep current password
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    {success}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <Link
                    href="/member-dashboard"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
