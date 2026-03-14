import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  Building2,
  Search,
  Users,
  FileText,
  ChevronRight,
  MapPin,
  Scale,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              <span className="font-bold text-lg">NCissues.com</span>
            </a>
            <nav className="hidden sm:flex items-center gap-6 text-sm">
              <a href="/" className="font-semibold border-b-2 border-primary-foreground pb-0.5">Home</a>
              <a href="/find-legislator" className="hover:opacity-80 transition-opacity">Find Your Legislator</a>
              <a href="/legislators" className="hover:opacity-80 transition-opacity">All Legislators</a>
              <a href="/committees" className="hover:opacity-80 transition-opacity">Committees</a>
            </nav>
            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded hover:bg-primary-foreground/10"
              onClick={() => {
                const menu = document.getElementById("mobile-menu");
                if (menu) menu.classList.toggle("hidden");
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Mobile nav */}
          <nav id="mobile-menu" className="hidden sm:hidden mt-3 pb-2 space-y-2 text-sm">
            <a href="/" className="block py-1 font-semibold">Home</a>
            <a href="/find-legislator" className="block py-1 hover:opacity-80">Find Your Legislator</a>
            <a href="/legislators" className="block py-1 hover:opacity-80">All Legislators</a>
            <a href="/committees" className="block py-1 hover:opacity-80">Committees</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-primary/4 py-16 sm:py-24">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Scale className="w-4 h-4" />
            North Carolina General Assembly Tracker
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4">
            Stay Informed About
            <span className="text-primary block sm:inline"> NC Legislation</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track bills, find your legislators, explore committees, and stay connected to the North Carolina General Assembly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="text-base px-8"
              onClick={() => navigate("/find-legislator")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Your Legislator
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-card"
              onClick={() => navigate("/legislators")}
            >
              Browse All Legislators
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Your Gateway to NC Government
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Access the tools and information you need to engage with the North Carolina legislative process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30"
              onClick={() => navigate("/find-legislator")}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Find Your Legislator</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your NC address to discover your State House and Senate representatives, their contact information, and district details.
                </p>
              </CardContent>
            </Card>

            <Card
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30"
              onClick={() => navigate("/legislators")}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Legislator Directory</h3>
                <p className="text-sm text-muted-foreground">
                  Browse all 170 NC House members and 50 Senators. Search by name, county, district, or party affiliation.
                </p>
              </CardContent>
            </Card>

            <Card
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30"
              onClick={() => navigate("/committees")}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Committees</h3>
                <p className="text-sm text-muted-foreground">
                  Explore House, Senate, and Joint committees. See which committees handle the issues you care about.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            <div>
              <p className="text-3xl font-extrabold text-primary">120</p>
              <p className="text-sm text-muted-foreground mt-1">House Members</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary">50</p>
              <p className="text-sm text-muted-foreground mt-1">Senators</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary">100</p>
              <p className="text-sm text-muted-foreground mt-1">Counties</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary">95+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Committees</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Know Who Represents You
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Democracy works best when citizens are informed. Start by finding your NC legislators and learning about the issues that matter to you.
          </p>
          <Button
            size="lg"
            className="text-base px-8"
            onClick={() => navigate("/find-legislator")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Find Your Legislator Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>NCissues.com — NC General Assembly Tracker</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://www.ncleg.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                NC General Assembly <ExternalLink className="w-3 h-3" />
              </a>
              <span>|</span>
              <span>Data sourced from ncleg.gov</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
