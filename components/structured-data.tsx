import Script from 'next/script'

export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Spellbook',
    description: 'Store, manage, execute and share your code snippets with the world',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Code snippet storage',
      'Multi-language support',
      'Code execution',
      'Syntax highlighting',
      'Code sharing',
      'Public and private snippets',
    ],
    programmingLanguage: [
      'JavaScript',
      'TypeScript',
      'Python',
      'PHP',
      'HTML',
      'CSS',
      'SQL',
    ],
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function SpellStructuredData({ spell }: {
  spell: {
    id: string
    title: string
    description: string | null
    code: string
    language: string
    createdAt: Date
    updatedAt: Date
    user: {
      name: string | null
      username: string | null
    }
  }
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Code',
    name: spell.title,
    description: spell.description || `A ${spell.language} code snippet`,
    text: spell.code,
    programmingLanguage: spell.language,
    dateCreated: spell.createdAt.toISOString(),
    dateModified: spell.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: spell.user.name || spell.user.username || 'Anonymous',
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL}/spells/${spell.id}`,
  }

  return (
    <Script
      id="spell-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
