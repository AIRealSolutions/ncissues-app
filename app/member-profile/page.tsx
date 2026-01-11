'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Member {
  id: number;
  voter_reg_num: string;
  ncid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  party_cd: string;
  res_street_address: string;
  res_city: string;
  res_zip_code: string;
  phone: string;
  email: string;
  nc_senate_dist: string;
  nc_house_dist: string;
}

export default function MemberProfilePage() {
  const [step, setStep] = useState<'lookup' | 'profile' | 'update'>('lookup');
  const [lookupMethod, setLookupMethod] = useState<'voter_reg' | 'ncid' | 'name'>('voter_reg');
  const [lookupValue, setLookupValue] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (lookupMethod === 'voter_reg') {
        params.append('voter_reg_num', lookupValue);
      } else if (lookupMethod === 'ncid') {
        params.append('ncid', lookupValue);
      } else if (lookupMethod === 'name') {
        params.append('name', lookupValue);
      }

      const response = await fetch(`/api/members?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setMember(data);
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setStep('profile');
      } else {
        setError(data.error || 'Member not found');
      }
    } catch (err) {
      setError('Error looking up member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password match
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const updates: any = {
        voter_reg_num: member?.voter_reg_num,
      };

      if (email && email !== member?.email) {
        updates.email = email;
      }

      if (phone && phone !== member?.phone) {
        updates.phone = phone;
      }

      if (password) {
        updates.password = password;
      }

      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setMember(data.member);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setStep('profile'), 2000);
      } else {
        setError(data.error || 'Error updating profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <nav className="flex gap-6">
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/find-legislator" className="text-gray-700 hover:text-blue-900">
                Find Legislator
              </Link>
              <Link href="/subscribe" className="text-gray-700 hover:text-blue-900">
                Subscribe
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Member Profile</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Update your contact information and manage your account
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Lookup Step */}
          {step === 'lookup' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Profile</h2>

              <form onSubmit={handleLookup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lookup Method
                  </label>
                  <select
                    value={lookupMethod}
                    onChange={(e) => setLookupMethod(e.target.value as 'voter_reg' | 'ncid' | 'name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="voter_reg">Voter Registration Number</option>
                    <option value="ncid">NC ID</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lookupMethod === 'voter_reg' ? 'Voter Registration Number' : lookupMethod === 'ncid' ? 'NC ID' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={lookupValue}
                    onChange={(e) => setLookupValue(e.target.value)}
                    placeholder={lookupMethod === 'voter_reg' ? 'e.g., 000600138588' : lookupMethod === 'ncid' ? 'e.g., AK185777' : 'e.g., John Smith'}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Looking up...' : 'Find Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Profile View Step */}
          {step === 'profile' && member && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{member.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Party</p>
                      <p className="font-medium text-gray-900">{member.party_cd}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {member.res_street_address}<br />
                      {member.res_city}, NC {member.res_zip_code}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Senate District</p>
                      <p className="font-medium text-gray-900">{member.nc_senate_dist}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">House District</p>
                      <p className="font-medium text-gray-900">{member.nc_house_dist}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{member.email || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{member.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep('update')}
                    className="flex-1 bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                  >
                    Update Information
                  </button>
                  <button
                    onClick={() => {
                      setStep('lookup');
                      setMember(null);
                      setLookupValue('');
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Update Step */}
          {step === 'update' && member && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Contact Information</h2>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {password && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('profile')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
