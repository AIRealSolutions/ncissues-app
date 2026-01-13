'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Issue {
  id: number;
  title: string;
  slug: string;
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
  };
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [featuredIssues, setFeaturedIssues] = useState<Issue[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchTags();
    fetchIssues();
  }, [selectedTag]);

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

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTag) params.append('tag', selectedTag);

      const response = await fetch(`/api/issues?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIssues(data);

        // Fetch featured separately
        if (!selectedTag) {
          const featuredResponse = await fetch('/api/issues?featured=true');
          if (featuredResponse.ok) {
            const featuredData = await featuredResponse.json();
            setFeaturedIssues(featuredData.slice(0, 3));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <nav className="flex gap-6 items-center">
              <Link href="/issues" className="text-blue-900 font-semibold">
                Issues
              </Link>
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/find-legislator" className="text-gray-700 hover:text-blue-900">
                Find Legislator
              </Link>
              {user && user.type === 'member' ? (
                <>
                  <Link href="/member-dashboard" className="text-gray-700 hover:text-blue-900">
                    Dashboard
                  </Link>
                  {user.is_contributor && (
                    <Link
                      href="/issues/submit"
                      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Submit Issue
                    </Link>
                  )}
                </>
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
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">North Carolina Issues</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Community discussions on topics that matter to North Carolinians. Share your voice and engage with others.
          </p>
        </div>
      </div>

      {/* Tags Filter */}
      <section className="py-6 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTag === ''
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Issues
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.slug)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedTag === tag.slug
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Issues */}
      {!selectedTag && featuredIssues.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Issues</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.slug}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {issue.image_url && (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img
                        src={issue.image_url}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                      {issue.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{issue.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{issue.members.full_name}</span>
                      <span>{formatDate(issue.published_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Issues */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {selectedTag ? `${tags.find(t => t.slug === selectedTag)?.name} Issues` : 'All Issues'}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
              <p className="mt-4 text-gray-600">Loading issues...</p>
            </div>
          ) : issues.length > 0 ? (
            <div className="space-y-6">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex gap-6">
                    {issue.image_url && (
                      <div className="w-48 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={issue.image_url}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/issues/${issue.slug}`}
                        className="text-2xl font-bold text-gray-900 hover:text-blue-900 transition-colors"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-gray-600 mt-2 line-clamp-2">{issue.excerpt}</p>
                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">
                          By {issue.members.full_name}
                        </span>
                        <span>{formatDate(issue.published_at)}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {issue.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {issue.comment_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          {issue.share_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No issues found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
