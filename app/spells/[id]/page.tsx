import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { SpellViewPublic } from '@/components/spell-view-public'
import { SpellStructuredData } from '@/components/structured-data'
import prisma from '@/lib/prisma'

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const spell = await prisma.spell.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          username: true
        }
      }
    }
  })

  if (!spell) {
    return {
      title: 'Spell Not Found'
    }
  }

  const title = `${spell.title} by ${spell.user.name || spell.user.username}`
  const description =
    spell.description ||
    `A ${spell.language} code snippet by ${spell.user.name}`

  return {
    title,
    description,
    keywords: [
      spell.language,
      'code snippet',
      'code example',
      spell.title,
      ...spell.tags
    ],
    authors: [{ name: spell.user.name || spell.user.username || 'Anonymous' }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: spell.createdAt.toISOString(),
      modifiedTime: spell.updatedAt.toISOString(),
      authors: [spell.user.name || spell.user.username || 'Anonymous'],
      tags: spell.tags,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png']
    },
    robots: {
      index: spell.isPublic,
      follow: spell.isPublic
    }
  }
}

export default async function PublicSpellPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  const spell = await prisma.spell.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      },
      spellbook: true
    }
  })

  if (!spell) {
    notFound()
  }

  // Se o spell não é público, verifica permissão
  if (!spell.isPublic) {
    // Se não está logado, mostra mensagem com botão de login
    if (!session) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold">Private Spell</h1>
              <p className="text-muted-foreground text-lg">
                This spell is private and requires authentication to view.
              </p>
            </div>
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In to View
            </a>
            <p className="text-xs text-muted-foreground">
              Don't have an account? Sign up is quick and free!
            </p>
          </div>
        </div>
      )
    }

    // Se está logado mas não é o dono, nega acesso
    if (session && spell.userId !== session.user.id) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground text-lg">
                This spell is private and you don't have permission to view it.
              </p>
            </div>
            <a
              href="/explore"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Explore Public Spells
            </a>
          </div>
        </div>
      )
    }
  }

  // Incrementar views
  await prisma.spell.update({
    where: { id },
    data: { views: { increment: 1 } }
  })

  const isOwner = session?.user?.id === spell.userId
  const isLoggedIn = !!session

  return (
    <>
      {spell.isPublic && <SpellStructuredData spell={spell} />}
      <SpellViewPublic
        spell={spell}
        isOwner={isOwner}
        isLoggedIn={isLoggedIn}
      />
    </>
  )
}
