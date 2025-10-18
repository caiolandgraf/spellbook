import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpellCard } from "@/components/spell-card"
import { SpellbookCard } from "@/components/spellbook-card"
import { BookOpen, Code2, Github, Globe, Star, Twitter, Users } from "lucide-react"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username

  const user = await prisma.user.findFirst({
    where: { username: cleanUsername }
  })

  if (!user) {
    return {
      title: 'User Not Found'
    }
  }

  return {
    title: `${user.name || user.username} - Spellbook`,
    description: user.bio || `Check out ${user.name || user.username}'s spells and spellbooks`
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username

  const user = await prisma.user.findFirst({
    where: { username: cleanUsername },
    include: {
      _count: {
        select: {
          spells: true,
          spellbooks: true,
          favorites: true,
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const spells = await prisma.spell.findMany({
    where: {
      userId: user.id,
      isPublic: true
    },
    include: {
      spellbook: {
        select: {
          name: true,
          id: true
        }
      },
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
    take: 12
  })

  const spellbooks = await prisma.spellbook.findMany({
    where: {
      userId: user.id,
      isPublic: true
    },
    include: {
      _count: {
        select: {
          spells: true
        }
      },
      spells: {
        take: 3,
        orderBy: { updatedAt: 'desc' }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 12
  })

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Static Background Glows - No Animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/2 w-[450px] h-[450px] bg-purple-500/15 rounded-full blur-[110px]" />
      </div>

      {/* Hero Section */}
      <div className="relative border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background -z-10" />
        
        <div className="container max-w-6xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Avatar with Glow */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <Avatar className="relative w-40 h-40 border-2 border-primary/30 shadow-2xl shadow-primary/20">
                <AvatarImage src={user.image || ""} alt={user.name || ""} className="object-cover" />
                <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-primary/20 via-primary/10 to-background">
                  {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {user.isPublic && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full p-2 shadow-lg shadow-primary/30 border-4 border-background">
                  <Users className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-3">
                    {user.name || user.username}
                  </h1>
                  {user.username && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-base font-mono px-4 py-1.5 border-2">
                        @{user.username}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-md">
                        /u/{user.username}
                      </span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stats Grid with Glows */}
              <div className="grid grid-cols-3 gap-4 max-w-xl pt-2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="relative border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 shadow-lg shadow-primary/5">
                    <CardContent className="p-5 text-center">
                      <div className="inline-flex p-2.5 rounded-xl bg-primary/10 mb-3">
                        <Code2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {user._count.spells}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Spells</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="relative border-2 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 shadow-lg shadow-blue-500/5">
                    <CardContent className="p-5 text-center">
                      <div className="inline-flex p-2.5 rounded-xl bg-blue-500/10 mb-3">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {user._count.spellbooks}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Spellbooks</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="relative border-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 shadow-lg shadow-purple-500/5">
                    <CardContent className="p-5 text-center">
                      <div className="inline-flex p-2.5 rounded-xl bg-purple-500/10 mb-3">
                        <Star className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold mb-1">
                        {user._count.favorites}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Favorites</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Social Links with Glow Effect */}
              {(user.website || user.github || user.twitter) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {user.website && (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/30 hover:border-primary/60 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">Website</span>
                      </a>
                    </div>
                  )}
                  {user.github && (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <a
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/30 hover:border-primary/60 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300"
                      >
                        <Github className="w-4 h-4" />
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    </div>
                  )}
                  {user.twitter && (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <a
                        href={`https://twitter.com/${user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/30 hover:border-primary/60 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm font-medium">Twitter</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-6xl mx-auto px-4 py-16 relative">
        <Tabs defaultValue="spells" className="space-y-10">
          {/* Tabs with Glow */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-lg" />
              <TabsList className="relative inline-flex h-12 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm p-1 border-2 border-primary/20 shadow-lg shadow-primary/5">
                <TabsTrigger 
                  value="spells" 
                  className="px-6 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-md transition-all"
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  Spells
                  <span className="ml-2 text-xs font-bold text-muted-foreground">
                    {spells.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="spellbooks" 
                  className="px-6 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-md transition-all"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Spellbooks
                  <span className="ml-2 text-xs font-bold text-muted-foreground">
                    {spellbooks.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Spells Tab */}
          <TabsContent value="spells" className="mt-8">
            {spells.length === 0 ? (
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-xl blur-2xl" />
                <Card className="relative border-2 border-dashed border-primary/30 bg-background/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <Code2 className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">No public spells yet</h3>
                    <p className="text-muted-foreground max-w-md text-base">
                      {user.name || user.username} hasn't shared any spells publicly.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spells.map(spell => (
                  <SpellCard key={spell.id} spell={spell} isLoggedIn={false} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Spellbooks Tab */}
          <TabsContent value="spellbooks" className="mt-8">
            {spellbooks.length === 0 ? (
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-2xl" />
                <Card className="relative border-2 border-dashed border-blue-500/30 bg-background/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl" />
                      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                        <BookOpen className="w-12 h-12 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">No public spellbooks yet</h3>
                    <p className="text-muted-foreground max-w-md text-base">
                      {user.name || user.username} hasn't shared any spellbooks publicly.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spellbooks.map(spellbook => (
                  <SpellbookCard key={spellbook.id} spellbook={spellbook} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
