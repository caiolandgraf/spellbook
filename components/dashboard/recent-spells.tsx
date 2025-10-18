import { Code2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime, getLanguageColor } from '@/lib/utils'

interface Spell {
  id: string
  title: string
  language: string
  updatedAt: Date
  spellbook: {
    name: string
  } | null
}

interface RecentSpellsProps {
  spells: Spell[]
}

export function RecentSpells({ spells }: RecentSpellsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Spells</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {spells.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No spells yet</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/spells/new">Create your first spell</Link>
            </Button>
          </div>
        ) : (
          spells.map(spell => (
            <Link
              key={spell.id}
              href={`/dashboard/spell/${spell.id}`}
              className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{spell.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(spell.language)
                      }}
                    />
                    <span>{spell.language}</span>
                    {spell.spellbook && (
                      <>
                        <span>•</span>
                        <span>{spell.spellbook.name}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(spell.updatedAt)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
