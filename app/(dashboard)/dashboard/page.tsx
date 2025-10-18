import { auth } from '@/auth'
import { DashboardAnimations } from '@/components/dashboard/dashboard-animations'
import prisma from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  // Buscar estatísticas do usuário
  const [spellsCount, spellbooksCount, recentSpells, user] = await Promise.all([
    prisma.spell.count({
      where: { userId: session.user.id }
    }),
    prisma.spellbook.count({
      where: { userId: session.user.id }
    }),
    prisma.spell.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        spellbook: true
      }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id }
    })
  ])

  // Agrupar spells por linguagem
  const allSpells = await prisma.spell.findMany({
    where: { userId: session.user.id },
    select: { language: true }
  })

  const languageStats = allSpells.reduce(
    (acc, spell) => {
      acc[spell.language] = (acc[spell.language] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <DashboardAnimations
      userName={user?.name || 'Wizard'}
      spellsCount={spellsCount}
      spellbooksCount={spellbooksCount}
      recentSpells={recentSpells}
      languageStats={languageStats}
    />
  )
}
