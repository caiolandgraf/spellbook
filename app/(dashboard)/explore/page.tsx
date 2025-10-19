import { Code2, Plus } from 'lucide-react'
import Link from 'next/link'
import { StaggerItem } from '@/components/animations'
import { StaggerContainer } from '@/components/animations/stagger-container'
import { SearchForm } from '@/components/search-form'
import { SpellCard } from '@/components/spell-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import prisma from '@/lib/prisma'

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; language?: string }>
}) {
  const params = await searchParams
  const where: any = { isPublic: true }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } }
    ]
  }

  if (params.language) {
    where.language = params.language
  }

  const spells = await prisma.spell.findMany({
    where,
    include: {
      spellbook: true,
      user: {
        select: {
          name: true,
          username: true,
          image: true
        }
      }
    },
    orderBy: {
      views: 'desc'
    },
    take: 50
  })

  // Get language statistics
  const languages = await prisma.spell.groupBy({
    by: ['language'],
    where: { isPublic: true },
    _count: true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Explore Spells</h1>
            <p className="text-sm text-muted-foreground">
              Discover amazing code snippets from the community
              {(params.search || params.language) && (
                <span className="ml-2">• Showing filtered results</span>
              )}
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/dashboard/spell/new">
            <Plus className="w-4 h-4 mr-2" />
            New Spell
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchForm defaultValue={params.search} />
            <div className="flex gap-2 flex-wrap">
              {languages.slice(0, 5).map(lang => {
                const languageUrl = new URLSearchParams()
                languageUrl.set('language', lang.language)
                if (params.search) {
                  languageUrl.set('search', params.search)
                }

                return (
                  <a
                    key={lang.language}
                    href={`/explore?${languageUrl.toString()}`}
                    className={`px-3 py-1 rounded-lg border transition-all text-sm capitalize flex items-center ${
                      params.language === lang.language
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {lang.language} ({lang._count})
                  </a>
                )
              })}
              {params.language && (
                <a
                  href={
                    params.search
                      ? `/explore?search=${params.search}`
                      : '/explore'
                  }
                  className="px-3 py-1 rounded-lg border border-border hover:border-destructive/50 text-red-500 text-sm flex items-center"
                >
                  Clear filter
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {spells.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No spells found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria
            </p>
            {(params.search || params.language) && (
              <Button asChild variant="outline">
                <Link href="/explore">Clear all filters</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {spells.length} spell{spells.length !== 1 ? 's' : ''}
              {params.search && ` matching "${params.search}"`}
              {params.language && ` in ${params.language}`}
            </p>
            {(params.search || params.language) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/explore">Clear all filters</Link>
              </Button>
            )}
          </div>
          <StaggerContainer staggerDelay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spells.map(spell => (
                <StaggerItem key={spell.id}>
                  <SpellCard spell={spell} isLoggedIn={true} />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </>
      )}
    </div>
  )
}
