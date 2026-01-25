'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Bill } from '@/types/database';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [chamber, setChamber] = useState('');
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;
  const [user, setUser] = useState<any>(null);
  const [trackedBillIds, setTrackedBillIds] = useState<Set<number>>(new Set());
  const [trackingLoading, setTrackingLoading] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
    setPage(1);
    setBills([]);
    fetchBills(1, true);
  }, [chamber, topic]);

  useEffect(() => {
    if (page > 1) {
      fetchBills(page, false);
    }
  }, [page]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data.type === 'member') {
          fetchTrackedBills();
        }
      }
    } catch (error) {
      // User not logged in, that's okay
    }
  };

  const fetchTrackedBills = async () => {
    try {
      const response = await fetch('/api/tracked-bills');
      if (response.ok) {
        const data = await response.json();
        const ids = new Set<number>(data.tracked_bills.map((tb: any) => tb.bills.id));
        setTrackedBillIds(ids);
      }
    } catch (error) {
      console.error('Error fetching tracked bills:', error);
    }
  };

  const fetchBills = async (pageNum: number, isNewSearch: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (chamber) params.append('chamber', chamber);
    if (topic) params.append('topic', topic);
    params.append('limit', ITEMS_PER_PAGE.toString());
    params.append('offset', ((pageNum - 1) * ITEMS_PER_PAGE).toString());
    
    try {
      const response = await fetch(`/api/bills?${params}`);
      const data = await response.json();
      
      if (isNewSearch) {
        setBills(data);
      } else {
        setBills(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackBill = async (billId: number) => {
    if (!user || user.type !== 'member') {
      alert('Please login to track bills');
      window.location.href = '/member-login';
      return;
    }

    setTrackingLoading(billId);

    try {
      const isTracked = trackedBillIds.has(billId);
      
      if (isTracked) {
        // Untrack
        const response = await fetch(`/api/tracked-bills?bill_id=${billId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const newTracked = new Set(trackedBillIds);
          newTracked.delete(billId);
          setTrackedBillIds(newTracked);
        } else {
          const data = await response.json();
          alert(data.error || 'Error untracking bill');
        }
      } else {
        // Track
        const response = await fetch('/api/tracked-bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bill_id: billId }),
        });

        if (response.ok) {
          const newTracked = new Set(trackedBillIds);
          newTracked.add(billId);
          setTrackedBillIds(newTracked);
        } else {
          const data = await response.json();
          alert(data.error || 'Error tracking bill');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating bill tracking');
    } finally {
      setTrackingLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">NC</span>
            </div>
            <span className="font-bold text-xl">NC Issues</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/bills" className="text-primary font-semibold">
              Bills
            </Link>
            <Link href="/find-legislator" className="text-foreground hover:text-primary transition-colors">
              Find Legislator
            </Link>
            {user && user.type === 'member' ? (
              <>
                <Link href="/member-dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/member-settings" className="text-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/member-login" className="text-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <Link
                  href="/subscribe"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-accent/20 to-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">North Carolina Bills</h1>
          <p className="text-lg text-muted-foreground">
            Browse and track legislation in the NC General Assembly
          </p>
          {user && user.type === 'member' && (
            <p className="mt-2 text-sm text-primary">
              ✓ Logged in - Click "Track" to follow bills
            </p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <select
              value={chamber}
              onChange={(e) => setChamber(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Chambers</option>
              <option value="house">House</option>
              <option value="senate">Senate</option>
            </select>

            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Topics</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="environment">Environment</option>
              <option value="transportation">Transportation</option>
              <option value="budget">Budget</option>
            </select>
          </div>
        </div>
      </section>

      {/* Bills List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading bills...</p>
            </div>
          ) : bills.length > 0 ? (
            <div className="space-y-4">
              {bills.map((bill) => {
                const isTracked = trackedBillIds.has(bill.id);
                const isLoading = trackingLoading === bill.id;

                return (
                  <div key={bill.id} className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link href={`/bills/${bill.id}`} className="text-xl font-bold hover:text-primary transition-colors">
                          {bill.bill_number}: {bill.title}
                        </Link>
                        <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded">
                            {bill.chamber === 'house' ? 'House' : 'Senate'}
                          </span>
                          <span className="px-2 py-1 bg-muted rounded">{bill.status}</span>
                          {bill.topic && <span className="px-2 py-1 bg-muted rounded">{bill.topic}</span>}
                        </div>
                        {bill.summary && (
                          <p className="mt-3 text-muted-foreground line-clamp-2">{bill.summary}</p>
                        )}
                        {bill.primary_sponsor && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Sponsor: {bill.primary_sponsor}
                          </p>
                        )}
                      </div>
                      
                      {/* Track Button */}
                      {user && user.type === 'member' && (
                        <button
                          onClick={() => handleTrackBill(bill.id)}
                          disabled={isLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            isTracked
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          } disabled:opacity-50`}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              ...
                            </span>
                          ) : isTracked ? (
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Tracking
                            </span>
                          ) : (
                            'Track'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No bills found matching your criteria.</p>
            </div>
          )}

          {hasMore && !loading && bills.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Load More Bills
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
