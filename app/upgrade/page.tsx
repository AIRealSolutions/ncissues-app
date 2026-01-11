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
}

export default function UpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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

  const isPremium = user.membership_tier === 'premium' || user.membership_tier === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <Link href="/member/dashboard" className="text-gray-700 hover:text-blue-900">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upgrade Your Membership
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get advanced tools, unlimited tracking, and exclusive features to stay informed
            </p>
          </div>

          {isPremium && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
              <p className="text-green-800 font-medium">
                ✓ You already have a premium membership!
              </p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Free Tier */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Forever</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Browse all bills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">View elected officials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Email legislators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Track up to 5 bills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Basic notifications</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-blue-600 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
                <div className="text-4xl font-bold text-blue-900 mb-2">$9.99</div>
                <p className="text-gray-600">per month</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Everything in Free</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Unlimited</strong> bill tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Comment on bills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Advanced notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Bill analysis tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>

              <button
                disabled={isPremium}
                className="w-full py-3 px-6 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPremium ? 'Current Plan' : 'Upgrade to Premium'}
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
                <div className="text-4xl font-bold text-gray-900 mb-2">$19.99</div>
                <p className="text-gray-600">per month</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Everything in Premium</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">AI bill summaries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Voting predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Custom reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">White-label options</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Feature Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Free</th>
                    <th className="text-center py-3 px-4 font-medium text-blue-900">Premium</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Bill tracking limit</td>
                    <td className="py-3 px-4 text-center text-gray-600">5</td>
                    <td className="py-3 px-4 text-center text-blue-900 font-medium">Unlimited</td>
                    <td className="py-3 px-4 text-center text-gray-900 font-medium">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Email legislators</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Comment on bills</td>
                    <td className="py-3 px-4 text-center text-gray-400">✗</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Advanced notifications</td>
                    <td className="py-3 px-4 text-center text-gray-400">✗</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">AI bill summaries</td>
                    <td className="py-3 px-4 text-center text-gray-400">✗</td>
                    <td className="py-3 px-4 text-center text-gray-400">✗</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">API access</td>
                    <td className="py-3 px-4 text-center text-gray-400">✗</td>
                    <td className="py-3 px-4 text-center text-gray-400">✗</td>
                    <td className="py-3 px-4 text-center text-green-600">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-600 mb-6">
              Contact us at <a href="mailto:support@ncissues.com" className="text-blue-900 hover:underline">support@ncissues.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
