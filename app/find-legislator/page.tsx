'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Legislator {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
  district: number;
  email: string;
  phone: string;
  photo_url: string | null;
  office_address: string | null;
  occupation: string | null;
}

export default function FindLegislatorPage() {
  const [searchType, setSearchType] = useState<'district' | 'name'>('district');
  const [chamber, setChamber] = useState<'House' | 'Senate' | ''>('');
  const [district, setDistrict] = useState('');
  const [searchName, setSearchName] = useState('');
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      
      if (searchType === 'district') {
        if (chamber) params.append('chamber', chamber);
        if (district) params.append('district', district);
      } else {
        if (searchName) params.append('search', searchName);
      }

      const response = await fetch(`/api/legislators?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setLegislators(data);
      } else {
        console.error('Error fetching legislators:', data.error);
        setLegislators([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setLegislators([]);
    } finally {
      setLoading(false);
    }
  };

  const getPartyColor = (party: string) => {
    if (party === 'Republican') return 'text-red-600';
    if (party === 'Democratic') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getPartyBadge = (party: string) => {
    if (party === 'Republican') return 'bg-red-100 text-red-800';
    if (party === 'Democratic') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
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
              <Link href="/subscribe" className="text-gray-700 hover:text-blue-900">
                Subscribe
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-blue-900">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Legislator
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Connect with your North Carolina representatives. Search by district or name to find contact information and track their legislative activity.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Search Type Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSearchType('district')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  searchType === 'district'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search by District
              </button>
              <button
                onClick={() => setSearchType('name')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  searchType === 'name'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search by Name
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6">
              {searchType === 'district' ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chamber
                    </label>
                    <select
                      value={chamber}
                      onChange={(e) => setChamber(e.target.value as 'House' | 'Senate' | '')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Both House and Senate</option>
                      <option value="House">House</option>
                      <option value="Senate">Senate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District Number
                    </label>
                    <input
                      type="number"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g., 1, 50, 120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legislator Name
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Enter first or last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Legislators'}
              </button>
            </form>
          </div>

          {/* Results Section */}
          {searched && (
            <div className="mt-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                  <p className="mt-4 text-gray-600">Searching...</p>
                </div>
              ) : legislators.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Found {legislators.length} {legislators.length === 1 ? 'Legislator' : 'Legislators'}
                  </h2>
                  <div className="grid gap-6">
                    {legislators.map((legislator) => (
                      <div
                        key={legislator.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex gap-6">
                          {/* Photo */}
                          <div className="flex-shrink-0">
                            {legislator.photo_url ? (
                              <img
                                src={legislator.photo_url}
                                alt={legislator.full_name}
                                className="w-24 h-24 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-3xl text-gray-400">
                                  {legislator.first_name[0]}{legislator.last_name[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {legislator.full_name}
                                </h3>
                                <p className="text-gray-600">
                                  {legislator.chamber} District {legislator.district}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getPartyBadge(
                                  legislator.party
                                )}`}
                              >
                                {legislator.party}
                              </span>
                            </div>

                            {legislator.occupation && (
                              <p className="text-gray-600 mb-3">
                                <span className="font-medium">Occupation:</span> {legislator.occupation}
                              </p>
                            )}

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              {legislator.email && (
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <a
                                    href={`mailto:${legislator.email}`}
                                    className="text-blue-900 hover:underline"
                                  >
                                    {legislator.email}
                                  </a>
                                </div>
                              )}
                              {legislator.phone && (
                                <div>
                                  <p className="text-sm text-gray-500">Phone</p>
                                  <a
                                    href={`tel:${legislator.phone}`}
                                    className="text-blue-900 hover:underline"
                                  >
                                    {legislator.phone}
                                  </a>
                                </div>
                              )}
                            </div>

                            {legislator.office_address && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-500">Office Address</p>
                                <p className="text-gray-700">{legislator.office_address}</p>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <a
                                href={`mailto:${legislator.email}`}
                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                              >
                                Contact
                              </a>
                              <Link
                                href={`/bills?sponsor=${legislator.full_name}`}
                                className="px-4 py-2 border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Bills
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Legislators Found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or search by name instead.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          {!searched && (
            <div className="mt-12 bg-blue-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About North Carolina Legislature
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <h3 className="font-bold text-lg mb-2">House of Representatives</h3>
                  <p>
                    The NC House has 120 members who serve two-year terms. Representatives are
                    elected from districts across the state.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Senate</h3>
                  <p>
                    The NC Senate has 50 members who serve two-year terms. Senators represent
                    larger districts than House members.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
