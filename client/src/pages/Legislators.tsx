import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Search,
  User,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function Legislators() {
  const [search, setSearch] = useState("");
  const [chamber, setChamber] = useState<"all" | "H" | "S">("all");

  const { data: legislators, isLoading } = trpc.legislator.list.useQuery(
    { chamber },
    { staleTime: 5 * 60 * 1000 }
  );

  const filtered = useMemo(() => {
    if (!legislators) return [];
    if (!search.trim()) return legislators;
    const q = search.toLowerCase();
    return legislators.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.counties?.toLowerCase().includes(q) ||
        String(l.district).includes(q) ||
        l.party.toLowerCase().includes(q)
    );
  }, [legislators, search]);

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
              <a href="/" className="hover:opacity-80 transition-opacity">Home</a>
              <a href="/find-legislator" className="hover:opacity-80 transition-opacity">Find Your Legislator</a>
              <a href="/legislators" className="font-semibold border-b-2 border-primary-foreground pb-0.5">All Legislators</a>
              <a href="/committees" className="hover:opacity-80 transition-opacity">Committees</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">NC Legislators</h1>
        <p className="text-muted-foreground mb-6">
          Browse all current members of the North Carolina General Assembly.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, county, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={chamber} onValueChange={(v) => setChamber(v as "all" | "H" | "S")}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="H">House</TabsTrigger>
              <TabsTrigger value="S">Senate</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filtered.length} legislator{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-16 h-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Legislators Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((leg) => {
              const prefix = leg.chamber === "H" ? "Rep." : "Sen.";
              const partyColor =
                leg.party === "R"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : leg.party === "D"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-gray-100 text-gray-800 border-gray-200";
              const nclegUrl = `https://www.ncleg.gov/Members/Biography/${leg.chamber}/${leg.memberId.replace(/^[HS]-/, "")}`;

              return (
                <Card key={leg.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* Photo */}
                      <div className="shrink-0">
                        {leg.photoUrl ? (
                          <img
                            src={leg.photoUrl}
                            alt={leg.name}
                            className="w-16 h-20 object-cover rounded shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {leg.chamber === "H" ? "House" : "Senate"} District {leg.district}
                            </p>
                            <h3 className="font-semibold text-foreground truncate">
                              {prefix} {leg.name}
                            </h3>
                          </div>
                          <Badge variant="outline" className={`${partyColor} shrink-0 text-xs`}>
                            {leg.party}
                          </Badge>
                        </div>
                        {leg.counties && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                            <span className="truncate">{leg.counties}</span>
                          </p>
                        )}
                        <a
                          href={nclegUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        >
                          Profile <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <User className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No legislators found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
