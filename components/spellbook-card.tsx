'use client'

import { motion } from 'framer-motion'
import { BookOpen, Code2, Lock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface SpellbookCardProps {
  spellbook: {
    id: string
    name: string
    description: string | null
    isPublic: boolean
    tags: string[]
    updatedAt: Date
    _count: {
      spells: number
    }
  }
}

const MotionCard = motion.create(Card)

export function SpellbookCard({ spellbook }: SpellbookCardProps) {
  return (
    <MotionCard className="group hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/spellbooks/${spellbook.id}`}>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {spellbook.name}
              </h3>
            </Link>
            {spellbook.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {spellbook.description}
              </p>
            )}
          </div>
          {!spellbook.isPublic && (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Code2 className="w-4 h-4" />
            <span>{spellbook._count.spells} spells</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{formatDate(spellbook.updatedAt)}</span>
          </div>
        </div>

        {spellbook.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spellbook.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {spellbook.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{spellbook.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/spellbooks/${spellbook.id}`}>View Spells</Link>
        </Button>
      </CardFooter>
    </MotionCard>
  )
}
