import { BookOpen, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/auth'
import { RuneCard } from '@/components/rune-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import prisma from '@/lib/prisma'

export const metadata = {
  title: 'Public Runes | Spellbook',
  description: 'Browse all public HTML, CSS, and JavaScript runes shared by the community'
}

export default async function PublicRunesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth()
  const { q } = await searchParams

  // Fetch public runes
  const runes = await prisma.rune.findMany({
    where: {
      isPublic: true,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Spellbook</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/runes/new">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Rune
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Discover Amazing Runes
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore HTML, CSS, and JavaScript creations shared by the community
            </p>

            {/* Search */}
            <form action="/runes" method="GET" className="max-w-xl mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Search runes..."
                  defaultValue={q}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Runes Grid */}
      <section className="container mx-auto px-4 py-12">
        {q && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>
              Found {runes.length} rune{runes.length !== 1 ? 's' : ''} matching
              "{q}"
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/runes">Clear search</Link>
            </Button>
          </div>
        )}

        {runes.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {q ? 'No runes found' : 'No public runes yet'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {q
                    ? 'Try a different search term'
                    : 'Be the first to create and share a rune!'}
                </p>
              </div>
              {session && (
                <Button asChild>
                  <Link href="/dashboard/runes/new">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Your First Rune
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {runes.map((rune) => (
              <RuneCard key={rune.id} rune={rune} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Spellbook - Share your code magic</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/spells"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse Spells
              </Link>
              <Link
                href="/runes"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse Runes
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
