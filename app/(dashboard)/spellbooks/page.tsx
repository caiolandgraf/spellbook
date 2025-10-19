import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { StaggerItem } from "@/components/animations";
import { StaggerContainer } from "@/components/animations/stagger-container";
import { SpellbookCard } from "@/components/spellbook-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchForm } from "@/components/search-form";
import prisma from "@/lib/prisma";

export default async function SpellbooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; visibility?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const params = await searchParams;

  const spellbooks = await prisma.spellbook.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { spells: true },
      },
      spells: {
        take: 3,
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Filter spellbooks based on search params
  let filteredSpellbooks = spellbooks;

  if (params.search) {
    filteredSpellbooks = filteredSpellbooks.filter(
      (spellbook) =>
        spellbook.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        spellbook.description
          ?.toLowerCase()
          .includes(params.search!.toLowerCase()) ||
        spellbook.tags.some((tag) =>
          tag.toLowerCase().includes(params.search!.toLowerCase())
        )
    );
  }

  if (params.visibility) {
    const isPublic = params.visibility === "public";
    filteredSpellbooks = filteredSpellbooks.filter(
      (spellbook) => spellbook.isPublic === isPublic
    );
  }

  // Get statistics
  const publicCount = spellbooks.filter((s) => s.isPublic).length;
  const privateCount = spellbooks.filter((s) => !s.isPublic).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Spellbooks</h1>
            <p className="text-muted-foreground text-sm">
              Organize your spells into collections
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/spellbooks/new">
            <Plus className="w-4 h-4 mr-2" />
            New Spellbook
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      {spellbooks.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchForm
                defaultValue={params.search}
                placeholder="Search spellbooks..."
              />
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={
                    params.search
                      ? `/spellbooks?search=${params.search}&visibility=public`
                      : "/spellbooks?visibility=public"
                  }
                  className={`px-3 py-1 rounded-lg border transition-all text-sm ${
                    params.visibility === "public"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  Public ({publicCount})
                </Link>
                <Link
                  href={
                    params.search
                      ? `/spellbooks?search=${params.search}&visibility=private`
                      : "/spellbooks?visibility=private"
                  }
                  className={`px-3 py-1 rounded-lg border transition-all text-sm ${
                    params.visibility === "private"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  Private ({privateCount})
                </Link>
                {(params.visibility || params.search) && (
                  <Link
                    href="/spellbooks"
                    className="px-3 py-1 rounded-lg border border-border hover:border-destructive/50 text-destructive text-sm"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spellbooks Grid */}
      {filteredSpellbooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2">
              {spellbooks.length === 0
                ? "No spellbooks yet"
                : "No spellbooks found"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {spellbooks.length === 0
                ? "Create your first spellbook to start organizing your code snippets"
                : "Try adjusting your search criteria"}
            </p>
            {spellbooks.length === 0 ? (
              <Button asChild>
                <Link href="/spellbooks/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Spellbook
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/spellbooks">Clear all filters</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {(params.search || params.visibility) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredSpellbooks.length} spellbook
                {filteredSpellbooks.length !== 1 ? "s" : ""}
                {params.search && ` matching "${params.search}"`}
                {params.visibility && ` (${params.visibility})`}
              </p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/spellbooks">Clear all filters</Link>
              </Button>
            </div>
          )}
          <StaggerContainer staggerDelay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpellbooks.map((spellbook) => (
                <StaggerItem key={spellbook.id}>
                  <SpellbookCard spellbook={spellbook} />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </>
      )}
    </div>
  );
}
