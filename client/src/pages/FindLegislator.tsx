import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  User,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface LegislatorInfo {
  id: number;
  memberId: string;
  chamber: string;
  district: number;
  name: string;
  party: string;
  counties: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  officeRoom: string | null;
}

interface LookupResult {
  success: boolean;
  address: {
    formatted: string;
    lat: number;
    lng: number;
    county: string | null;
    isInNC: boolean;
  };
  houseDistrict: number | null;
  senateDistrict: number | null;
  houseLegislator: LegislatorInfo | null;
  senateLegislator: LegislatorInfo | null;
  error?: string;
}

function LegislatorCard({ legislator, chamberLabel }: { legislator: LegislatorInfo; chamberLabel: string }) {
  const partyColor =
    legislator.party === "R"
      ? "bg-red-100 text-red-800 border-red-200"
      : legislator.party === "D"
        ? "bg-blue-100 text-blue-800 border-blue-200"
        : "bg-gray-100 text-gray-800 border-gray-200";

  const partyFull =
    legislator.party === "R" ? "Republican" : legislator.party === "D" ? "Democrat" : legislator.party;

  const prefix = legislator.chamber === "H" ? "Rep." : "Sen.";
  const nclegUrl = `https://www.ncleg.gov/Members/Biography/${legislator.chamber}/${legislator.memberId.replace(/^[HS]-/, "")}`;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="sm:w-36 bg-muted flex items-center justify-center p-4">
          {legislator.photoUrl ? (
            <img
              src={legislator.photoUrl}
              alt={`Photo of ${legislator.name}`}
              className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-md shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-24 h-28 sm:w-28 sm:h-32 bg-muted-foreground/10 rounded-md flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {chamberLabel}
              </p>
              <h3 className="text-lg font-bold text-foreground">
                {prefix} {legislator.name}
              </h3>
            </div>
            <Badge variant="outline" className={`${partyColor} shrink-0`}>
              {partyFull}
            </Badge>
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground mt-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>District {legislator.district}</span>
            </div>
            {legislator.counties && (
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{legislator.counties}</span>
              </div>
            )}
            {legislator.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href={`tel:${legislator.phone}`} className="hover:text-primary transition-colors">
                  {legislator.phone}
                </a>
              </div>
            )}
            {legislator.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href={`mailto:${legislator.email}`} className="hover:text-primary transition-colors">
                  {legislator.email}
                </a>
              </div>
            )}
          </div>

          <div className="mt-4">
            <a
              href={nclegUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View Full Profile on NCGA
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FindLegislator() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const lookupMutation = trpc.legislator.lookup.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setHasSearched(true);
      if (!data.success && data.error) {
        toast.error(data.error);
      } else if (data.success && !data.houseLegislator && !data.senateLegislator) {
        toast.warning(
          "We found your districts but couldn't match legislators. The data may still be syncing."
        );
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to look up legislators. Please try again.");
      setHasSearched(true);
    },
  });

  const handleSearch = useCallback(() => {
    if (!address.trim()) {
      toast.error("Please enter a North Carolina address.");
      return;
    }
    setResult(null);
    lookupMutation.mutate({ address: address.trim() });
  }, [address, lookupMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const exampleAddresses = [
    "16 West Jones Street, Raleigh, NC 27601",
    "200 S. Salisbury Street, Raleigh, NC",
    "301 N. Main Street, Charlotte, NC 28202",
  ];

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
              <a href="/" className="hover:opacity-80 transition-opacity">
                Home
              </a>
              <a href="/find-legislator" className="font-semibold border-b-2 border-primary-foreground pb-0.5">
                Find Your Legislator
              </a>
              <a href="/legislators" className="hover:opacity-80 transition-opacity">
                All Legislators
              </a>
              <a href="/committees" className="hover:opacity-80 transition-opacity">
                Committees
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 sm:py-16">
        <div className="container max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Find Your NC Legislator
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Enter your North Carolina address to find your State House and Senate representatives.
          </p>

          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your NC address (e.g., 123 Main St, Raleigh, NC)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-12 text-base bg-card"
                disabled={lookupMutation.isPending}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={lookupMutation.isPending || !address.trim()}
              className="h-12 px-6 text-base font-semibold"
            >
              {lookupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Legislators
                </>
              )}
            </Button>
          </div>

          {/* Example addresses */}
          <div className="mt-4 text-sm text-muted-foreground">
            <span>Try: </span>
            {exampleAddresses.map((addr, i) => (
              <span key={i}>
                <button
                  className="text-primary hover:underline"
                  onClick={() => {
                    setAddress(addr);
                    setResult(null);
                  }}
                >
                  {addr.split(",")[0]}
                </button>
                {i < exampleAddresses.length - 1 && <span className="mx-1">|</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container max-w-3xl mx-auto py-8">
        {/* Loading State */}
        {lookupMutation.isPending && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Looking up your legislators...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Geocoding your address and querying NC district boundaries...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a few seconds as we query official NCGA boundary data.
            </p>
          </div>
        )}

        {/* Error State */}
        {hasSearched && result && !result.success && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Lookup Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.error || "Unable to find legislators for this address."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please make sure you entered a valid North Carolina address. Include the street address, city, and state.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {hasSearched && result && result.success && (
          <div className="space-y-6">
            {/* Address Info */}
            <Card className="bg-card">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{result.address.formatted}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-muted-foreground">
                      {result.address.county && <span>County: {result.address.county}</span>}
                      {result.houseDistrict && <span>NC House District: {result.houseDistrict}</span>}
                      {result.senateDistrict && <span>NC Senate District: {result.senateDistrict}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legislators */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Your Legislators</h2>

              {result.houseLegislator ? (
                <LegislatorCard
                  legislator={result.houseLegislator}
                  chamberLabel="NC House of Representatives"
                />
              ) : result.houseDistrict ? (
                <Card className="bg-muted/30">
                  <CardContent className="p-5 text-center text-sm text-muted-foreground">
                    <p>NC House District {result.houseDistrict} representative data is being loaded.</p>
                    <p className="mt-1">
                      <a
                        href={`https://www.ncleg.gov/Redistricting/DistrictPlanMap/H2023E/${result.houseDistrict}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View district on NCGA website <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {result.senateLegislator ? (
                <LegislatorCard
                  legislator={result.senateLegislator}
                  chamberLabel="NC Senate"
                />
              ) : result.senateDistrict ? (
                <Card className="bg-muted/30">
                  <CardContent className="p-5 text-center text-sm text-muted-foreground">
                    <p>NC Senate District {result.senateDistrict} senator data is being loaded.</p>
                    <p className="mt-1">
                      <a
                        href={`https://www.ncleg.gov/Redistricting/DistrictPlanMap/S2023E/${result.senateDistrict}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View district on NCGA website <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {!result.houseLegislator && !result.senateLegislator && !result.houseDistrict && !result.senateDistrict && (
                <Card className="bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      We couldn't determine your legislative districts. This may happen if the address is not specific enough.
                      Try including a full street address with city and ZIP code.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Resources */}
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Additional Resources</p>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://www.ncleg.gov/FindYourLegislators"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Official NC General Assembly Legislator Finder
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ncleg.gov/Members/MemberTable/H"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    NC House Members Directory
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ncleg.gov/Members/MemberTable/S"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    NC Senate Members Directory
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !lookupMutation.isPending && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enter your address above
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We'll use your address to determine your NC House and Senate districts and show you who represents you in the North Carolina General Assembly.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
