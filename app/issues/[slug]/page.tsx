'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Issue {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url?: string;
  view_count: number;
  comment_count: number;
  share_count: number;
  published_at: string;
  members: {
    id: number;
    full_name: string;
    party_cd: string;
    res_city: string;
  };
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Comment {
  id: number;
  comment_text: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  share_count: number;
  members: {
    id: number;
    full_name: string;
    party_cd: string;
    res_city: string;
  };
}

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  
  const [user, setUser] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchIssue();
    fetchComments();
  }, [slug]);

  const checkAuth = async () => {
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

  const fetchIssue = async () => {
    try {
      const response = await fetch(`/api/issues/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setIssue(data.issue);
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/issues/${slug}/comments`);
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.type !== 'member') {
      router.push('/member-login');
      return;
    }

    if (newComment.trim().length === 0) {
      setError('Please enter a comment');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/issues/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        if (issue) {
          setIssue({ ...issue, comment_count: issue.comment_count + 1 });
        }
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

  const handleShareComment = async (commentId: number, commentText: string) => {
    const shareUrl = `${window.location.origin}/issues/${slug}#comment-${commentId}`;
    const shareText = `"${commentText.substring(0, 100)}${commentText.length > 100 ? '...' : ''}" - ${issue?.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: issue?.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      alert('Link copied to clipboard! Share it on your social media.');
    }
  };

  const handleShareIssue = async () => {
    const shareUrl = `${window.location.origin}/issues/${slug}`;
    const shareText = issue?.title || '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: issue?.excerpt,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n\n${issue?.excerpt}\n\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
          <Link href="/issues" className="text-blue-900 hover:underline">
            ← Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  const isMember = user && user.type === 'member';

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
              {isMember ? (
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link href="/issues" className="inline-block text-blue-900 hover:underline mb-6">
            ← Back to Issues
          </Link>

          {/* Issue Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {issue.image_url && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/issues?tag=${tag.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{issue.title}</h1>

              {/* Meta */}
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900 font-bold">
                      {issue.members.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{issue.members.full_name}</p>
                    <p className="text-xs">
                      {issue.members.res_city} • {formatDate(issue.published_at)}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {issue.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {issue.comment_count} comments
                </span>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {issue.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
                ))}
              </div>

              {/* Share Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleShareIssue}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share This Issue
                </button>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Discussion ({issue.comment_count})
            </h2>

            {/* Comment Form */}
            {isMember ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this issue..."
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
                  href="/member-login"
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
                  <div key={comment.id} id={`comment-${comment.id}`} className="border-b border-gray-200 pb-6 last:border-0">
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
                            • {comment.members.res_city}
                          </span>
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
                          <button
                            onClick={() => handleShareComment(comment.id, comment.comment_text)}
                            className="text-gray-500 hover:text-blue-900 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share ({comment.share_count})
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
