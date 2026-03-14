'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Legislator {
  id: number;
  name: string;
  party: string;
  chamber: string;
  district: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  office_address: string | null;
  counties: string | null;
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

  const getPartyBadge = (party: string) =>
    party === 'R' ? 'bg-red-100 text-red-800' :
    party === 'D' ? 'bg-blue-100 text-blue-800' :
    'bg-gray-100 text-gray-800';

  const getPartyLabel = (party: string) =>
    party === 'R' ? 'Republican' : party === 'D' ? 'Democrat' : party;

  const getChamberLabel = (c: string) =>
    c === 'house' ? 'House' : c === 'senate' ? 'Senate' : c;

  const getInitials = (name: string) => {
    const clean = name.replace(/^(Rep\.|Senator|Dr\.)\s+/, '');
    const parts = clean.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0]?.[0] ?? '?';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-900">NC Issues</Link>
          <nav className="flex gap-6">
            <Link href="/bills" className="text-gray-700 hover:text-blue-900">Bills</Link>
            <Link href="/subscribe" className="text-gray-700 hover:text-blue-900">Subscribe</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Legislator</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Connect with your North Carolina representatives. Search by district or name to find contact information.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex gap-4 mb-6">
              {(['district', 'name'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    searchType === type
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'district' ? 'Search by District' : 'Search by Name'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              {searchType === 'district' ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chamber</label>
                    <select
                      value={chamber}
                      onChange={e => setChamber(e.target.value as 'House' | 'Senate' | '')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Both House and Senate</option>
                      <option value="House">House</option>
                      <option value="Senate">Senate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District Number</label>
                    <input
                      type="number"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g., 1, 50, 120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Legislator Name</label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    placeholder="Enter first or last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Legislators'}
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && (
            <div className="mt-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
                  <p className="mt-4 text-gray-600">Searching...</p>
                </div>
              ) : legislators.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Found {legislators.length} {legislators.length === 1 ? 'Legislator' : 'Legislators'}
                  </h2>
                  <div className="grid gap-6">
                    {legislators.map(leg => (
                      <div key={leg.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex gap-6">
                          {/* Photo */}
                          <div className="flex-shrink-0">
                            {leg.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={leg.photo_url}
                                alt={leg.name}
                                className="w-24 h-24 rounded-lg object-cover object-top"
                                onError={e => {
                                  e.currentTarget.style.display = 'none';
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="w-24 h-24 rounded-lg bg-gray-200 items-center justify-center text-3xl text-gray-400 font-semibold"
                              style={{ display: leg.photo_url ? 'none' : 'flex' }}
                            >
                              {getInitials(leg.name)}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{leg.name}</h3>
                                <p className="text-gray-600">
                                  {getChamberLabel(leg.chamber)} · District {leg.district}
                                </p>
                                {leg.counties && (
                                  <p className="text-sm text-gray-500 mt-0.5">{leg.counties}</p>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPartyBadge(leg.party)}`}>
                                {getPartyLabel(leg.party)}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              {leg.email && (
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <a href={`mailto:${leg.email}`} className="text-blue-900 hover:underline text-sm break-all">{leg.email}</a>
                                </div>
                              )}
                              {leg.phone && (
                                <div>
                                  <p className="text-sm text-gray-500">Phone</p>
                                  <a href={`tel:${leg.phone}`} className="text-blue-900 hover:underline">{leg.phone}</a>
                                </div>
                              )}
                            </div>

                            {leg.office_address && (
                              <p className="text-sm text-gray-600 mb-4">
                                <span className="font-medium">Office:</span> {leg.office_address}
                              </p>
                            )}

                            {leg.email && (
                              <a
                                href={`mailto:${leg.email}`}
                                className="inline-block px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
                              >
                                Contact
                              </a>
                            )}
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
                  <p className="text-gray-600">Try adjusting your search or search by name instead.</p>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          {!searched && (
            <div className="mt-12 bg-blue-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About North Carolina Legislature</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <h3 className="font-bold text-lg mb-2">House of Representatives</h3>
                  <p>The NC House has 120 members who serve two-year terms, elected from districts across the state.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Senate</h3>
                  <p>The NC Senate has 50 members who serve two-year terms, representing larger districts than House members.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
