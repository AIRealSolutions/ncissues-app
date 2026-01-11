'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Committee {
  id: number;
  name: string;
  chamber: string;
  committee_type: string;
  description: string;
  jurisdiction: string;
  meeting_schedule: string;
  meeting_location: string;
}

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchCommittees();
  }, [filter]);

  const fetchCommittees = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/committees'
        : `/api/committees?chamber=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCommittees(data);
      }
    } catch (error) {
      console.error('Error fetching committees:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChamberColor = (chamber: string) => {
    if (chamber === 'House') return 'bg-green-100 text-green-800';
    if (chamber === 'Senate') return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
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
              <Link href="/learn" className="text-gray-700 hover:text-blue-900">
                ← Back to Learn
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Legislative Committees</h1>
            <p className="text-gray-600">
              Explore NC General Assembly committees, their jurisdictions, and meeting schedules
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow p-2 mb-6 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Committees ({committees.length})
            </button>
            <button
              onClick={() => setFilter('House')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'House'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              House
            </button>
            <button
              onClick={() => setFilter('Senate')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Senate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Senate
            </button>
            <button
              onClick={() => setFilter('Joint')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Joint'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Joint
            </button>
          </div>

          {/* Committees List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
              <p className="mt-4 text-gray-600">Loading committees...</p>
            </div>
          ) : committees.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No committees found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {committees.map((committee) => (
                <div key={committee.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{committee.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChamberColor(committee.chamber)}`}>
                          {committee.chamber}
                        </span>
                      </div>
                      {committee.description && (
                        <p className="text-gray-600 mb-3">{committee.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {committee.jurisdiction && (
                      <div>
                        <p className="text-gray-500 font-medium mb-1">Jurisdiction</p>
                        <p className="text-gray-700">{committee.jurisdiction}</p>
                      </div>
                    )}
                    {committee.meeting_schedule && (
                      <div>
                        <p className="text-gray-500 font-medium mb-1">Meeting Schedule</p>
                        <p className="text-gray-700">{committee.meeting_schedule}</p>
                      </div>
                    )}
                    {committee.meeting_location && (
                      <div>
                        <p className="text-gray-500 font-medium mb-1">Location</p>
                        <p className="text-gray-700">{committee.meeting_location}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      View Members
                    </button>
                    <button className="px-4 py-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                      Track Committee
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About Committees</h3>
            <p className="text-gray-700 mb-4">
              Committees are where most of the legislative work happens. They review bills, hold hearings, 
              and make recommendations to the full chamber. Committee chairs have significant power to 
              decide which bills get hearings.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">Standing Committees</p>
                <p className="text-gray-600">Permanent committees that handle specific subject areas</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Select Committees</p>
                <p className="text-gray-600">Temporary committees for specific purposes</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Conference Committees</p>
                <p className="text-gray-600">Resolve differences between House and Senate versions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
