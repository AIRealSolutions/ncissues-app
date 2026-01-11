'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Legislator {
  id: number;
  full_name: string;
  party: string;
  district: string;
  chamber: string;
}

interface Bill {
  id: number;
  bill_number: string;
  title: string;
  short_title?: string;
  description?: string;
  summary?: string;
  status: string;
  chamber: string;
  session: string;
  introduced_date?: string;
  last_action?: string;
  last_action_date?: string;
  url?: string;
  bill_type?: string;
  primary_sponsor?: string;
}

interface BillHistory {
  id: number;
  action_date: string;
  action: string;
  chamber: string;
}

interface Vote {
  id: number;
  vote_date: string;
  chamber: string;
  vote_subject: string;
  ayes: number;
  noes: number;
  not_voting: number;
  result: string;
}

interface BillVersion {
  id: number;
  version_name: string;
  version_date: string;
  url?: string;
  text_content?: string;
}

interface Comment {
  id: number;
  comment_text: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  members: {
    id: number;
    full_name: string;
    party_cd: string;
  };
}

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [primarySponsor, setPrimarySponsor] = useState<Legislator | null>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [history, setHistory] = useState<BillHistory[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [versions, setVersions] = useState<BillVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'votes' | 'text' | 'discussion'>('overview');
  
  const [user, setUser] = useState<any>(null);
  const [isTracked, setIsTracked] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchBillDetails();
    fetchComments();
  }, [billId]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data.type === 'member') {
          checkIfTracked();
        }
      }
    } catch (error) {
      // User not logged in
    }
  };

  const checkIfTracked = async () => {
    try {
      const response = await fetch('/api/tracked-bills');
      if (response.ok) {
        const data = await response.json();
        const tracked = data.tracked_bills.some((tb: any) => tb.bills.id === parseInt(billId));
        setIsTracked(tracked);
      }
    } catch (error) {
      console.error('Error checking tracked status:', error);
    }
  };

  const fetchBillDetails = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`);
      const data = await response.json();

      if (response.ok) {
        setBill(data.bill);
        setPrimarySponsor(data.primary_sponsor);
        setSponsors(data.sponsors);
        setHistory(data.history);
        setVotes(data.votes);
        setVersions(data.versions);
      } else {
        console.error('Error fetching bill:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleTrackBill = async () => {
    if (!user || user.type !== 'member') {
      alert('Please login to track bills');
      router.push('/member-login');
      return;
    }

    setTrackingLoading(true);

    try {
      if (isTracked) {
        const response = await fetch(`/api/tracked-bills?bill_id=${billId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsTracked(false);
        } else {
          alert('Error untracking bill');
        }
      } else {
        const response = await fetch('/api/tracked-bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bill_id: parseInt(billId) }),
        });

        if (response.ok) {
          setIsTracked(true);
        } else {
          alert('Error tracking bill');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating bill tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.type !== 'member') {
      router.push('/member-login');
      return;
    }

    if (newComment.trim().length === 0) {
      setCommentError('Please enter a comment');
      return;
    }

    setSubmitting(true);
    setCommentError('');

    try {
      const response = await fetch(`/api/bills/${billId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      } else {
        const data = await response.json();
        setCommentError(data.error || 'Failed to post comment');
      }
    } catch (error) {
      setCommentError('An error occurred while posting your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPartyColor = (party: string) => {
    if (party === 'REP') return 'text-red-600';
    if (party === 'DEM') return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Bill Not Found</h2>
          <p className="text-muted-foreground mb-4">The bill you're looking for doesn't exist.</p>
          <Link href="/bills" className="text-primary hover:underline">
            ← Back to Bills
          </Link>
        </div>
      </div>
    );
  }

  const isMember = user && user.type === 'member';

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
            <Link href="/bills" className="text-foreground hover:text-primary transition-colors">
              Bills
            </Link>
            <Link href="/find-legislator" className="text-foreground hover:text-primary transition-colors">
              Find Legislator
            </Link>
            {isMember ? (
              <>
                <Link href="/member-dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </>
            ) : (
              <Link href="/member-login" className="text-foreground hover:text-primary transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bill Header */}
      <section className="py-8 bg-gradient-to-b from-accent/20 to-background border-b">
        <div className="container mx-auto px-4">
          <Link href="/bills" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Bills
          </Link>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex gap-3 mb-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-medium">
                  {bill.bill_number}
                </span>
                <span className="px-3 py-1 bg-muted rounded-lg">
                  {bill.chamber === 'house' ? 'House' : 'Senate'}
                </span>
                <span className="px-3 py-1 bg-muted rounded-lg">
                  {bill.status}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-3">{bill.title}</h1>
              
              {bill.short_title && bill.short_title !== bill.title && (
                <p className="text-lg text-muted-foreground mb-3">{bill.short_title}</p>
              )}

              {(primarySponsor || bill.primary_sponsor) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Primary Sponsor:</span>
                  {primarySponsor ? (
                    <>
                      <Link 
                        href={`/legislators/${primarySponsor.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {primarySponsor.full_name}
                      </Link>
                      <span>({primarySponsor.party})</span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground">{bill.primary_sponsor}</span>
                  )}
                </div>
              )}
            </div>

            {/* Track Button */}
            {isMember && (
              <button
                onClick={handleTrackBill}
                disabled={trackingLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isTracked
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                } disabled:opacity-50`}
              >
                {trackingLoading ? (
                  'Loading...'
                ) : isTracked ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Tracking
                  </span>
                ) : (
                  'Track This Bill'
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'history', label: `History (${history.length})` },
              { id: 'votes', label: `Votes (${votes.length})` },
              { id: 'text', label: 'Bill Text' },
              { id: 'discussion', label: `Discussion (${comments.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl space-y-8">
              {/* Summary */}
              {(bill.description || bill.summary) && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Summary</h2>
                  <p className="text-foreground leading-relaxed">
                    {bill.description || bill.summary}
                  </p>
                </div>
              )}

              {/* Bill Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Bill Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bill Number</p>
                    <p className="font-medium">{bill.bill_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{bill.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chamber</p>
                    <p className="font-medium">{bill.chamber === 'house' ? 'House' : 'Senate'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Session</p>
                    <p className="font-medium">{bill.session}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Introduced</p>
                    <p className="font-medium">{formatDate(bill.introduced_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Action</p>
                    <p className="font-medium">{formatDate(bill.last_action_date)}</p>
                  </div>
                </div>
                {bill.last_action && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Latest Action</p>
                    <p className="font-medium">{bill.last_action}</p>
                  </div>
                )}
                {bill.url && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <a
                      href={bill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      View on NCLEG.gov
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Sponsors */}
              {(primarySponsor || sponsors.length > 0) && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Sponsors</h2>
                  
                  {primarySponsor && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Primary Sponsor</p>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <Link
                            href={`/legislators/${primarySponsor.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {primarySponsor.full_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {primarySponsor.party} - {primarySponsor.chamber === 'house' ? 'House' : 'Senate'} District {primarySponsor.district}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {sponsors.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Co-Sponsors ({sponsors.length})</p>
                      <div className="space-y-2">
                        {sponsors.map((sponsor, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <Link
                                href={`/legislators/${sponsor.legislators.id}`}
                                className="font-medium hover:text-primary"
                              >
                                {sponsor.legislators.full_name}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {sponsor.legislators.party} - {sponsor.legislators.chamber === 'house' ? 'House' : 'Senate'} District {sponsor.legislators.district}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="max-w-4xl">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Bill History</h2>
                
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <p className="font-medium">{formatDate(item.action_date)}</p>
                            <span className="px-2 py-1 bg-muted rounded text-sm">
                              {item.chamber === 'house' ? 'House' : 'Senate'}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No history available for this bill yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Votes Tab */}
          {activeTab === 'votes' && (
            <div className="max-w-4xl space-y-6">
              {votes.length > 0 ? (
                votes.map((vote) => (
                  <div key={vote.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{vote.vote_subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(vote.vote_date)} - {vote.chamber === 'house' ? 'House' : 'Senate'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg font-medium ${
                        vote.result === 'Passed' || vote.result === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vote.result}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-700">{vote.ayes}</p>
                        <p className="text-sm text-green-600">Ayes</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-700">{vote.noes}</p>
                        <p className="text-sm text-red-600">Noes</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-700">{vote.not_voting}</p>
                        <p className="text-sm text-gray-600">Not Voting</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <p className="text-muted-foreground">No votes recorded for this bill yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Bill Text Tab */}
          {activeTab === 'text' && (
            <div className="max-w-4xl">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Bill Text</h2>
                
                {versions.length > 0 ? (
                  <div className="space-y-4">
                    {versions.map((version) => (
                      <div key={version.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-medium">{version.version_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(version.version_date)}
                            </p>
                          </div>
                          {version.url && (
                            <a
                              href={version.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                            >
                              View PDF
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                        {version.text_content && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm font-mono">
                              {version.text_content}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : bill.url ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Bill text is available on the official NC Legislature website.
                    </p>
                    <a
                      href={bill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      View on NCLEG.gov
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Bill text not available yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Discussion Tab */}
          {activeTab === 'discussion' && (
            <div className="max-w-4xl">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Discussion ({comments.length})</h2>

                {/* Comment Form */}
                {isMember ? (
                  <form onSubmit={handleSubmitComment} className="mb-8">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts on this bill..."
                      rows={4}
                      maxLength={2000}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-muted-foreground">
                        {newComment.length}/2000 characters
                      </span>
                      <button
                        type="submit"
                        disabled={submitting || newComment.trim().length === 0}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                    {commentError && (
                      <p className="mt-2 text-sm text-red-600">{commentError}</p>
                    )}
                  </form>
                ) : (
                  <div className="mb-8 p-6 bg-accent/20 border border-border rounded-lg text-center">
                    <p className="text-foreground mb-3">
                      <strong>Members only:</strong> Login to join the discussion
                    </p>
                    <Link
                      href="/member-login"
                      className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Login to Comment
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">
                              {comment.members.full_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">
                                {comment.members.full_name}
                              </span>
                              {comment.members.party_cd && (
                                <span className={`text-sm ${getPartyColor(comment.members.party_cd)}`}>
                                  ({comment.members.party_cd})
                                </span>
                              )}
                              <span className="text-sm text-muted-foreground">
                                • {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed mb-3">
                              {comment.comment_text}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <button className="text-muted-foreground hover:text-primary">
                                👍 {comment.upvotes}
                              </button>
                              <button className="text-muted-foreground hover:text-primary">
                                👎 {comment.downvotes}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
