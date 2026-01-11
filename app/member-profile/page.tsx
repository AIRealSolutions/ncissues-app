'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Member {
  id: number;
  voter_reg_num: string;
  ncid: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  party_cd?: string;
  res_street_address?: string;
  res_city: string;
  res_zip_code: string;
  phone?: string;
  email?: string;
  nc_senate_dist: string;
  nc_house_dist: string;
  account_claimed?: boolean;
}

export default function MemberProfilePage() {
  const [step, setStep] = useState<'lookup' | 'select' | 'claimed' | 'profile' | 'update'>('lookup');
  const [lookupMethod, setLookupMethod] = useState<'voter_reg' | 'ncid' | 'name'>('voter_reg');
  const [lookupValue, setLookupValue] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
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
        // Check if multiple results were returned
        if (data.multiple && data.members) {
          setMembers(data.members);
          setStep('select');
        } else if (data.account_claimed) {
          // Account is already claimed
          setMember(data);
          setStep('claimed');
        } else {
          // Single result, unclaimed account
          setMember(data);
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setStep('profile');
        }
      } else {
        setError(data.error || 'Member not found');
      }
    } catch (err) {
      setError('Error looking up member');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (selectedMember: Member) => {
    if (selectedMember.account_claimed) {
      setMember(selectedMember);
      setStep('claimed');
    } else {
      setMember(selectedMember);
      setEmail(selectedMember.email || '');
      setPhone(selectedMember.phone || '');
      setStep('profile');
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

    // Require email and password for first-time setup
    if (!member?.email && (!email || !password)) {
      setError('Email and password are required to set up your account');
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
        setSuccess('Profile updated successfully! Your account is now secured.');
        setMember(data.member);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          // Redirect to login page after account setup
          window.location.href = '/member-login';
        }, 2000);
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
              <Link href="/member-login" className="text-gray-700 hover:text-blue-900">
                Member Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Member Profile Setup</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Set up your account to receive legislative updates and manage your preferences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Lookup Step */}
          {step === 'lookup' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Voter Record</h2>

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

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/member-login" className="text-blue-900 hover:underline">
                    Login here
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Select Member Step (when multiple results) */}
          {step === 'select' && members.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Multiple Members Found ({members.length})
              </h2>
              <p className="text-gray-600 mb-6">
                Please select your profile from the list below:
              </p>

              <div className="space-y-4">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMember(m)}
                    className="w-full text-left p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{m.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {m.res_city}, NC {m.res_zip_code}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Senate District: {m.nc_senate_dist} | House District: {m.nc_house_dist}
                        </div>
                      </div>
                      {m.account_claimed && (
                        <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Account Claimed
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep('lookup');
                  setMembers([]);
                  setLookupValue('');
                }}
                className="mt-6 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Search
              </button>
            </div>
          )}

          {/* Account Claimed Step */}
          {step === 'claimed' && member && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Already Claimed</h2>
                <p className="text-gray-600">
                  This voter record has already been registered and secured.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>{' '}
                    <span className="font-medium text-gray-900">{member.full_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>{' '}
                    <span className="font-medium text-gray-900">{member.res_city}, NC {member.res_zip_code}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Districts:</span>{' '}
                    <span className="font-medium text-gray-900">
                      Senate {member.nc_senate_dist}, House {member.nc_house_dist}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/member-login"
                  className="block w-full bg-blue-900 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  Login to Your Account
                </Link>
                <Link
                  href="/password-reset"
                  className="block w-full border border-gray-300 text-gray-700 text-center py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Password
                </Link>
                <button
                  onClick={() => {
                    setStep('lookup');
                    setMember(null);
                    setLookupValue('');
                  }}
                  className="w-full text-gray-600 text-sm hover:text-gray-900"
                >
                  ← Back to Search
                </button>
              </div>
            </div>
          )}

          {/* Profile View Step */}
          {step === 'profile' && member && !member.account_claimed && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Voter Record</h2>

                <div className="space-y-4 mb-6">
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
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Secure your account:</strong> Add your email and password below to claim this voter record and access member features.
                  </p>
                </div>

                <button
                  onClick={() => setStep('update')}
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  Set Up Account
                </button>
              </div>
            </div>
          )}

          {/* Update Step */}
          {step === 'update' && member && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Up Your Account</h2>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll use this email to send you legislative updates
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (optional)
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
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                    {loading ? 'Setting up...' : 'Create Account'}
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
