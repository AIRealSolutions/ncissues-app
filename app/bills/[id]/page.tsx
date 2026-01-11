'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Bill {
  id: number;
  bill_number: string;
  title: string;
  primary_sponsor: string;
  chamber: string;
  status: string;
  summary: string;
  introduced_date: string;
  last_action: string;
  last_action_date: string;
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

interface User {
  id: number;
  type: string;
  membership_tier?: string;
}

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBill();
    fetchComments();
    fetchCurrentUser();
  }, [billId]);

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`);
      if (response.ok) {
        const data = await response.json();
        setBill(data);
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
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
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      // User not logged in
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/member/login');
      return;
    }

    if (newComment.trim().length === 0) {
      setError('Please enter a comment');
      return;
    }

    setSubmitting(true);
    setError('');

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
        setError(data.error || 'Failed to post comment');
      }
    } catch (error) {
      setError('An error occurred while posting your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getPartyColor = (party: string) => {
    if (party === 'REP') return 'text-red-600';
    if (party === 'DEM') return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bill Not Found</h1>
          <Link href="/bills" className="text-blue-900 hover:underline">
            ← Back to Bills
          </Link>
        </div>
      </div>
    );
  }

  const isMember = user && user.type === 'member';
  const canComment = isMember;

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
              {isMember ? (
                <>
                  <Link href="/control-panel" className="text-gray-700 hover:text-blue-900">
                    Control Panel
                  </Link>
                  <Link href="/member/dashboard" className="text-gray-700 hover:text-blue-900">
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link href="/member/login" className="text-gray-700 hover:text-blue-900">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link href="/bills" className="inline-block text-blue-900 hover:underline mb-6">
            ← Back to Bills
          </Link>

          {/* Bill Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{bill.bill_number}</h1>
                <p className="text-lg text-gray-700">{bill.title}</p>
              </div>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {bill.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500">Primary Sponsor</p>
                <p className="font-medium text-gray-900">{bill.primary_sponsor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chamber</p>
                <p className="font-medium text-gray-900">{bill.chamber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Introduced</p>
                <p className="font-medium text-gray-900">
                  {bill.introduced_date ? new Date(bill.introduced_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Action</p>
                <p className="font-medium text-gray-900">
                  {bill.last_action_date ? new Date(bill.last_action_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {bill.summary && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Summary</h2>
                <p className="text-gray-700 leading-relaxed">{bill.summary}</p>
              </div>
            )}

            {bill.last_action && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Latest Action</p>
                <p className="text-gray-900">{bill.last_action}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Discussion ({comments.length})
            </h2>

            {/* Comment Form */}
            {canComment ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this bill..."
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/2000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={submitting || newComment.trim().length === 0}
                    className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </form>
            ) : (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-gray-700 mb-3">
                  <strong>Members only:</strong> Login to join the discussion
                </p>
                <Link
                  href="/member/login"
                  className="inline-block px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                >
                  Login to Comment
                </Link>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-900 font-bold">
                          {comment.members.full_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {comment.members.full_name}
                          </span>
                          {comment.members.party_cd && (
                            <span className={`text-sm ${getPartyColor(comment.members.party_cd)}`}>
                              ({comment.members.party_cd})
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            • {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {comment.comment_text}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="text-gray-500 hover:text-blue-900">
                            👍 {comment.upvotes}
                          </button>
                          <button className="text-gray-500 hover:text-blue-900">
                            👎 {comment.downvotes}
                          </button>
                          <button className="text-gray-500 hover:text-blue-900">
                            Reply
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
      </div>
    </div>
  );
}
