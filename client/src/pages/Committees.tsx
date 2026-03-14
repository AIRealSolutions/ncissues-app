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
  Users,
  ExternalLink,
} from "lucide-react";

export default function Committees() {
  const [search, setSearch] = useState("");
  const [chamber, setChamber] = useState<string>("all");

  const { data: committees, isLoading } = trpc.committee.list.useQuery(
    chamber === "all" ? {} : { chamber },
    { staleTime: 5 * 60 * 1000 }
  );

  const filtered = useMemo(() => {
    if (!committees) return [];
    if (!search.trim()) return committees;
    const q = search.toLowerCase();
    return committees.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameWithChamber.toLowerCase().includes(q)
    );
  }, [committees, search]);

  const chamberLabel = (code: string) => {
    switch (code) {
      case "H": return "House";
      case "S": return "Senate";
      case "J": return "Joint";
      default: return code;
    }
  };

  const chamberColor = (code: string) => {
    switch (code) {
      case "H": return "bg-blue-100 text-blue-800 border-blue-200";
      case "S": return "bg-red-100 text-red-800 border-red-200";
      case "J": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
              <a href="/legislators" className="hover:opacity-80 transition-opacity">All Legislators</a>
              <a href="/committees" className="font-semibold border-b-2 border-primary-foreground pb-0.5">Committees</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">NC Legislative Committees</h1>
        <p className="text-muted-foreground mb-6">
          Browse all active committees of the North Carolina General Assembly.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search committees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={chamber} onValueChange={setChamber}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="H">House</TabsTrigger>
              <TabsTrigger value="S">Senate</TabsTrigger>
              <TabsTrigger value="J">Joint</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filtered.length} committee{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Committees Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((comm) => (
              <Card key={comm.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={`${chamberColor(comm.chamberCode)} text-xs`}>
                      {chamberLabel(comm.chamberCode)}
                    </Badge>
                    <div className="flex gap-1">
                      {comm.isSelectCommittee && (
                        <Badge variant="secondary" className="text-xs">Select</Badge>
                      )}
                      {comm.isNonStanding && (
                        <Badge variant="secondary" className="text-xs">Non-Standing</Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-snug">
                    {comm.name}
                  </h3>
                  {comm.docSiteId && (
                    <a
                      href={`https://www.ncleg.gov/Committees/CommitteeInfo/${comm.chamberCode}/${comm.committeeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      View on NCGA <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No committees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
