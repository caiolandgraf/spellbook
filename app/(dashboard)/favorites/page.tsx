import { Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaggerItem } from "@/components/animations";
import { StaggerContainer } from "@/components/animations/stagger-container";
import { SpellCard } from "@/components/spell-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; language?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const params = await searchParams;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      spell: {
        include: {
          spellbook: true,
          user: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter spells based on search params
  let filteredFavorites = favorites;

  if (params.search) {
    filteredFavorites = filteredFavorites.filter(
      (fav) =>
        fav.spell.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        fav.spell.description
          ?.toLowerCase()
          .includes(params.search!.toLowerCase())
    );
  }

  if (params.language) {
    filteredFavorites = filteredFavorites.filter(
      (fav) => fav.spell.language === params.language
    );
  }

  // Get language statistics
  const languages = Array.from(
    new Set(favorites.map((fav) => fav.spell.language))
  ).map((lang) => ({
    language: lang,
    _count: favorites.filter((fav) => fav.spell.language === lang).length,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-muted-foreground">Your saved spells</p>
        </div>
      </div>

      {/* Search and Filters */}
      {favorites.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchForm
                defaultValue={params.search}
                placeholder="Search favorites..."
              />
              <div className="flex gap-2 flex-wrap items-center">
                {languages.slice(0, 5).map((lang) => {
                  const languageUrl = new URLSearchParams();
                  languageUrl.set("language", lang.language);
                  if (params.search) {
                    languageUrl.set("search", params.search);
                  }

                  return (
                    <Link
                      key={lang.language}
                      href={`/favorites?${languageUrl.toString()}`}
                      className={`px-3 py-1 rounded-lg border transition-all text-sm capitalize ${
                        params.language === lang.language
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {lang.language} ({lang._count})
                    </Link>
                  );
                })}
                {params.language && (
                  <Link
                    href={
                      params.search
                        ? `/favorites?search=${params.search}`
                        : "/favorites"
                    }
                    className="px-3 py-1 rounded-lg border border-border hover:border-destructive/50 text-destructive text-sm"
                  >
                    Clear filter
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">
              {favorites.length === 0
                ? "No favorites yet"
                : "No favorites found"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {favorites.length === 0 ? (
                <>
                  Start favoriting spells to build your collection. Visit the{" "}
                  <a href="/explore" className="text-primary hover:underline">
                    explore page
                  </a>{" "}
                  to discover amazing spells.
                </>
              ) : (
                "Try adjusting your search criteria"
              )}
            </p>
            {(params.search || params.language) && favorites.length > 0 && (
              <Button asChild variant="outline">
                <Link href="/favorites">Clear all filters</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {(params.search || params.language) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredFavorites.length} favorite
                {filteredFavorites.length !== 1 ? "s" : ""}
                {params.search && ` matching "${params.search}"`}
                {params.language && ` in ${params.language}`}
              </p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/favorites">Clear all filters</Link>
              </Button>
            </div>
          )}
          <StaggerContainer staggerDelay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((fav) => (
                <StaggerItem key={fav.id}>
                  <SpellCard spell={fav.spell} isLoggedIn={true} />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </>
      )}
    </div>
  );
}
