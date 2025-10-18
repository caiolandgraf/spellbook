'use client'

import { motion } from 'framer-motion'
import { Code2, Eye, Lock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatRelativeTime, getLanguageColor } from '@/lib/utils'

interface SpellCardProps {
  spell: {
    id: string
    title: string
    description: string | null
    language: string
    isPublic: boolean
    tags: string[]
    views: number
    updatedAt: Date
    spellbook: {
      name: string
    } | null
  }
  isLoggedIn?: boolean
}

const MotionCard = motion.create(Card)

export function SpellCard({ spell, isLoggedIn = false }: SpellCardProps) {
  const spellUrl = isLoggedIn
    ? `/dashboard/spell/${spell.id}`
    : `/spells/${spell.id}`

  return (
    <MotionCard className="group hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Link href={spellUrl} className="flex-1">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {spell.title}
            </h3>
          </Link>
          {!spell.isPublic && (
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
          )}
        </div>

        {spell.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {spell.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLanguageColor(spell.language) }}
            />
            <span className="capitalize text-muted-foreground">
              {spell.language}
            </span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>{spell.views}</span>
          </div>

          <span className="text-muted-foreground text-xs ml-auto">
            {formatRelativeTime(spell.updatedAt)}
          </span>
        </div>

        {spell.spellbook && (
          <div className="text-xs text-muted-foreground">
            📚 {spell.spellbook.name}
          </div>
        )}

        {spell.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {spell.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {spell.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{spell.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={spellUrl}>
            <Code2 className="w-4 h-4 mr-2" />
            View Code
          </Link>
        </Button>
      </CardContent>
    </MotionCard>
  )
}
