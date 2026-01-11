import Link from 'next/link';

export default function Home() {
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
            <Link href="/find-legislator" className="text-foreground hover:text-primary transition-colors">
              Find Legislator
            </Link>
            <Link href="/member-profile" className="text-foreground hover:text-primary transition-colors">
              Member Profile
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Stay Informed About North Carolina Legislation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Track bills, receive personalized notifications, and engage with your representatives. 
            NC Issues brings transparency to state government with daily updates and AI-powered insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/subscribe"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              Get Notifications
            </Link>
            <Link
              href="/bills"
              className="px-6 py-3 bg-background text-foreground border border-border rounded-lg hover:bg-muted transition-colors text-lg font-semibold"
            >
              Browse Bills
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Track Legislation
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Bill Tracking</h3>
              <p className="text-muted-foreground">
                Follow legislation through every stage from introduction to final vote. Get real-time updates on bill status changes.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Notifications</h3>
              <p className="text-muted-foreground">
                Subscribe to topics and locations that matter to you. Receive daily or weekly digests tailored to your interests.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Contact Representatives</h3>
              <p className="text-muted-foreground">
                Make your voice heard by reaching out to legislators about bills that impact your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Stay Informed?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of North Carolinians tracking legislation that affects their communities.
          </p>
          <Link
            href="/subscribe"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
          >
            Subscribe for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 NC Issues. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
