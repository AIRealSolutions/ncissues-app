'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SubscribePage() {
  const [topics, setTopics] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'immediate'>('daily');
  const [loading, setLoading] = useState(false);

  const topicOptions = [
    'education',
    'healthcare',
    'environment',
    'transportation',
    'budget',
    'criminal_justice',
    'agriculture',
    'economic_development',
  ];

  const toggleTopic = (topic: string) => {
    setTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please sign in to subscribe');
      // Redirect to auth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/subscribe`,
        },
      });
      if (error) toast.error(error.message);
      setLoading(false);
      return;
    }

    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics,
        municipalities: municipalities.split(',').map(m => m.trim()).filter(Boolean),
        notification_frequency: frequency,
        email_enabled: true,
      }),
    });

    if (response.ok) {
      toast.success('Subscription created successfully!');
      setTopics([]);
      setMunicipalities('');
    } else {
      const error = await response.json();
      toast.error(error.error || 'Failed to create subscription');
    }

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
            <Link href="/bills" className="text-foreground hover:text-primary transition-colors">
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-accent/20 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-4">Subscribe to NC Issues</h1>
          <p className="text-lg text-muted-foreground">
            Get personalized notifications about bills that matter to you
          </p>
        </div>
      </section>

      {/* Subscription Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Topics */}
            <div className="p-6 bg-card border border-border rounded-lg">
              <h2 className="text-xl font-bold mb-4">Select Topics</h2>
              <p className="text-muted-foreground mb-4">
                Choose the legislative topics you want to follow
              </p>
              <div className="grid grid-cols-2 gap-3">
                {topicOptions.map((topic) => (
                  <label
                    key={topic}
                    className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={topics.includes(topic)}
                      onChange={() => toggleTopic(topic)}
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{topic.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Municipalities */}
            <div className="p-6 bg-card border border-border rounded-lg">
              <h2 className="text-xl font-bold mb-4">Municipalities (Optional)</h2>
              <p className="text-muted-foreground mb-4">
                Enter cities or counties you're interested in, separated by commas
              </p>
              <input
                type="text"
                value={municipalities}
                onChange={(e) => setMunicipalities(e.target.value)}
                placeholder="e.g., Raleigh, Durham, Wake County"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>

            {/* Frequency */}
            <div className="p-6 bg-card border border-border rounded-lg">
              <h2 className="text-xl font-bold mb-4">Notification Frequency</h2>
              <div className="space-y-2">
                {(['daily', 'weekly', 'immediate'] as const).map((freq) => (
                  <label
                    key={freq}
                    className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={freq}
                      checked={frequency === freq}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || topics.length === 0}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {loading ? 'Creating Subscription...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
