import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Get all public spells
  const spells = await prisma.spell.findMany({
    where: {
      isPublic: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 1000, // Limit to 1000 most recent public spells
  })

  // Get all public spellbooks
  const spellbooks = await prisma.spellbook.findMany({
    where: {
      isPublic: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 500,
  })

  const spellUrls = spells.map((spell) => ({
    url: `${baseUrl}/spells/${spell.id}`,
    lastModified: spell.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const spellbookUrls = spellbooks.map((spellbook) => ({
    url: `${baseUrl}/spellbooks/${spellbook.id}`,
    lastModified: spellbook.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...spellUrls,
    ...spellbookUrls,
  ]
}
