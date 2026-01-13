'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function SubmitIssuePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    checkAuth();
    fetchTags();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.type === 'member') {
        // Check if contributor
        if (!data.is_contributor) {
          setError('You need contributor access to submit issues. Please contact an administrator.');
          setLoading(false);
          return;
        }
        setUser(data);
      } else {
        router.push('/member-login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/member-login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/issues/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          image_url: imageUrl,
          tags: selectedTags,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Issue ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
        setTimeout(() => {
          router.push(`/issues/${data.issue.slug}`);
        }, 2000);
      } else {
        setError(data.error || 'Error submitting issue');
      }
    } catch (err) {
      setError('Error submitting issue');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <nav className="flex gap-6 items-center">
              <Link href="/issues" className="text-gray-700 hover:text-blue-900">
                Issues
              </Link>
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/member-dashboard" className="text-gray-700 hover:text-blue-900">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Submit an Issue</h1>
          <p className="text-xl text-blue-100">
            Share important topics affecting North Carolina
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {error && !user?.is_contributor && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-900 mb-2">Access Denied</h3>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {user?.is_contributor && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title..."
                    required
                    maxLength={255}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {title.length}/255 characters
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt (Optional)
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary for preview..."
                    rows={2}
                    maxLength={300}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {excerpt.length}/300 characters (auto-generated if left blank)
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your issue content here... Be detailed and provide context."
                    rows={15}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {content.length} characters - Supports plain text
                  </p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={(e) => setStatus(e.target.value as 'draft')}
                        className="mr-2"
                      />
                      <span>Save as Draft</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="published"
                        checked={status === 'published'}
                        onChange={(e) => setStatus(e.target.value as 'published')}
                        className="mr-2"
                      />
                      <span>Publish Immediately</span>
                    </label>
                  </div>
                </div>

                {/* Messages */}
                {error && user?.is_contributor && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    {success}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : status === 'published' ? 'Publish Issue' : 'Save Draft'}
                  </button>
                  <Link
                    href="/issues"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
