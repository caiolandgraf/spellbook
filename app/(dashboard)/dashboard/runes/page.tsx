import { Plus, Sparkles, Code2, Search } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { RuneCard } from '@/components/rune-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import prisma from '@/lib/prisma'

export default async function RunesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const { q } = await searchParams

  const runes = await prisma.rune.findMany({
    where: {
      userId: user.id,
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
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Runes</h1>
            <p className="text-muted-foreground text-sm">
              Your HTML, CSS, and JavaScript creations
            </p>
          </div>
        </div>
        <Link href="/dashboard/runes/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Rune
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form action="/dashboard/runes" method="GET">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                placeholder="Search your runes..."
                defaultValue={q}
                className="pl-10"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results Info */}
      {q && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="w-4 h-4" />
          <span>
            Found {runes.length} rune{runes.length !== 1 ? 's' : ''} matching "{q}"
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/runes">Clear search</Link>
          </Button>
        </div>
      )}

      {/* Runes Grid */}
      {runes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-2xl font-semibold">
                {q ? 'No runes found' : 'No runes yet'}
              </h3>
              <p className="text-muted-foreground">
                {q
                  ? 'Try a different search term or create a new rune'
                  : 'Create your first rune with HTML, CSS, and JavaScript. Build interactive components and share them with the world!'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/dashboard/runes/new">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Rune
                </Button>
              </Link>
              <Link href="/runes">
                <Button size="lg" variant="outline">
                  <Code2 className="w-4 h-4 mr-2" />
                  Browse Public Runes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {runes.map(rune => (
            <RuneCard key={rune.id} rune={rune} isDashboard={true} />
          ))}
        </div>
      )}
    </div>
  )
}

