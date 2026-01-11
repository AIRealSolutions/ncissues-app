'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Bill } from '@/types/database';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [chamber, setChamber] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    fetchBills();
  }, [chamber, topic]);

  const fetchBills = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (chamber) params.append('chamber', chamber);
    if (topic) params.append('topic', topic);
    
    const response = await fetch(`/api/bills?${params}`);
    const data = await response.json();
    setBills(data);
    setLoading(false);
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
            <Link href="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Link
              href="/subscribe"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </Link>
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
              {bills.map((bill) => (
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No bills found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
