import { BookOpen, Code2, Search } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SpellCard } from '@/components/spell-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import prisma from '@/lib/prisma'

export const metadata = {
  title: 'Public Spells | Spellbook',
  description: 'Browse all public code spells shared by the community'
}

export default async function PublicSpellsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; lang?: string }>
}) {
  const session = await auth()
  const { q, lang } = await searchParams

  // Buscar spells públicos
  const spells = await prisma.spell.findMany({
    where: {
      isPublic: true,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      }),
      ...(lang && { language: lang })
    },
    include: {
      spellbook: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })

  // Buscar linguagens disponíveis (para o filtro)
  const langsRaw = await prisma.spell.findMany({
    where: { isPublic: true },
    select: { language: true },
    orderBy: { language: 'asc' },
    take: 1000
  })

  const languages = Array.from(new Set(langsRaw.map(l => l.language))).filter(
    Boolean
  )

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
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Title and Search */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Public Spells</h1>
            <p className="text-muted-foreground text-lg">
              Discover and explore code snippets shared by the community
            </p>
          </div>

          <form method="get" className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search spells..."
                defaultValue={q}
                className="pl-9"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="lang">
                Language
              </label>
              <select
                id="lang"
                name="lang"
                defaultValue={lang ?? ''}
                className="border input px-3 py-2 rounded-md bg-transparent"
              >
                <option value="">All</option>
                {languages.map(l => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Sign up CTA */}
        {!session && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Want to save and run these spells?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sign in to favorite, fork, and execute code snippets
                  </p>
                </div>
                <Button asChild>
                  <Link href="/auth/signin">
                    <Code2 className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spells Grid */}
        {spells.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-2xl font-semibold mb-2">No spells found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {q
                  ? 'Try adjusting your search criteria'
                  : 'No public spells available yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spells.map(spell => (
              <SpellCard key={spell.id} spell={spell} isLoggedIn={false} />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {!session && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold mb-2">
                Ready to cast your own spells?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join Spellbook to create, share, and execute code snippets
              </p>
              <Button size="lg" asChild>
                <Link href="/auth/signin">Get Started for Free</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
