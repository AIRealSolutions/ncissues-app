'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      // Not logged in
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    {
      name: 'Public',
      price: 'Free',
      description: 'Browse and explore NC legislation',
      features: [
        'Browse all bills and issues',
        'View legislator information',
        'Search legislation',
        'Read community discussions',
        'Access public resources',
      ],
      limitations: [
        'Cannot track bills',
        'No email notifications',
        'Cannot comment on issues',
        'No personalized dashboard',
      ],
      cta: 'Sign Up Free',
      ctaLink: '/register',
      current: user?.type === 'public',
    },
    {
      name: 'Member',
      price: '$9.99/month',
      description: 'Full access to tracking and engagement',
      features: [
        'Everything in Public, plus:',
        '✓ Track unlimited bills',
        '✓ Email notifications on bill updates',
        '✓ Comment on issues and bills',
        '✓ Personalized dashboard',
        '✓ Save favorite legislators',
        '✓ Priority support',
      ],
      limitations: [],
      cta: user?.type === 'member' ? 'Current Plan' : 'Upgrade to Member',
      ctaLink: '/subscribe',
      highlighted: true,
      current: user?.type === 'member',
    },
    {
      name: 'Contributor',
      price: '$19.99/month',
      description: 'For community leaders and advocates',
      features: [
        'Everything in Member, plus:',
        '✓ Submit community issues',
        '✓ Featured contributor badge',
        '✓ Priority issue placement',
        '✓ Analytics on your issues',
        '✓ Direct line to legislators',
      ],
      limitations: [],
      cta: user?.type === 'contributor' ? 'Current Plan' : 'Become Contributor',
      ctaLink: '/subscribe?plan=contributor',
      current: user?.type === 'contributor',
    },
  ];

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
              <Link href="/issues" className="text-gray-700 hover:text-blue-900">
                Issues
              </Link>
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              {user ? (
                <Link href="/member-dashboard" className="text-gray-700 hover:text-blue-900">
                  Dashboard
                </Link>
              ) : (
                <Link href="/member-login" className="text-gray-700 hover:text-blue-900">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Start free and upgrade when you're ready for more features
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  tier.highlighted ? 'ring-4 ring-blue-500 transform scale-105' : ''
                } ${tier.current ? 'ring-2 ring-green-500' : ''}`}
              >
                {tier.highlighted && (
                  <div className="bg-blue-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                {tier.current && (
                  <div className="bg-green-500 text-white text-center py-2 font-semibold">
                    Current Plan
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-blue-900 mb-4">{tier.price}</div>
                  <p className="text-gray-600 mb-6">{tier.description}</p>

                  <Link
                    href={tier.ctaLink}
                    className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors mb-6 ${
                      tier.current
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : tier.highlighted
                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {tier.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Feature Comparison
          </h2>
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center text-gray-900 font-semibold">Public</th>
                  <th className="px-6 py-4 text-center text-gray-900 font-semibold">Member</th>
                  <th className="px-6 py-4 text-center text-gray-900 font-semibold">Contributor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Browse Bills & Issues', public: true, member: true, contributor: true },
                  { feature: 'View Legislators', public: true, member: true, contributor: true },
                  { feature: 'Search Legislation', public: true, member: true, contributor: true },
                  { feature: 'Track Bills', public: false, member: true, contributor: true },
                  { feature: 'Email Notifications', public: false, member: true, contributor: true },
                  { feature: 'Comment on Issues', public: false, member: true, contributor: true },
                  { feature: 'Personalized Dashboard', public: false, member: true, contributor: true },
                  { feature: 'Submit Issues', public: false, member: false, contributor: true },
                  { feature: 'Featured Badge', public: false, member: false, contributor: true },
                  { feature: 'Issue Analytics', public: false, member: false, contributor: true },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.public ? (
                        <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.member ? (
                        <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.contributor ? (
                        <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and PayPal.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. Cancel anytime with no penalties. Your access continues until the end of your billing period.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee for all paid plans.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
