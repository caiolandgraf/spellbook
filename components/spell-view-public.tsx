'use client'

import {
  Copy,
  Edit,
  Eye,
  Heart,
  LogIn,
  MoreVertical,
  Share2,
  Trash
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CodeEditor } from '@/components/code-editor'
import { CodeRunner } from '@/components/code-runner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime, getLanguageColor } from '@/lib/utils'

interface SpellViewPublicProps {
  spell: {
    id: string
    title: string
    description: string | null
    code: string
    language: string
    isPublic: boolean
    tags: string[]
    views: number
    executions: number
    createdAt: Date
    updatedAt: Date
    user: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
    spellbook: {
      id: string
      name: string
    } | null
  }
  isOwner: boolean
  isLoggedIn: boolean
}

export function SpellViewPublic({
  spell,
  isOwner,
  isLoggedIn
}: SpellViewPublicProps) {
  const [copied, setCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if spell is favorited (only if logged in)
  useEffect(() => {
    if (!isLoggedIn) return

    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/spells/${spell.id}/favorite`)
        const data = await response.json()
        setIsFavorited(data.favorited)
      } catch (error) {
        console.error('Error checking favorite:', error)
      }
    }

    checkFavorite()
  }, [spell.id, isLoggedIn])

  const copyCode = async () => {
    await navigator.clipboard.writeText(spell.code)
    setCopied(true)
    toast.success('Code copied to clipboard! 📋')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareSpell = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard! 🔗')
  }

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to favorite spells')
      return
    }

    setIsLoadingFavorite(true)
    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const response = await fetch(`/api/spells/${spell.id}/favorite`, {
        method
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        if (!isFavorited) {
          toast.success('Added to favorites! ❤️')
        } else {
          toast.success('Removed from favorites')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite')
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  const handleEdit = () => {
    window.location.href = `/dashboard/spell/${spell.id}/edit`
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this spell? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/spells/${spell.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Spell deleted successfully! 🗑️')
        setTimeout(() => {
          window.location.href = '/spells'
        }, 1000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete spell')
      }
    } catch (error) {
      console.error('Error deleting spell:', error)
      toast.error('Failed to delete spell')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Login Banner - Only show if not logged in */}
      {!isLoggedIn && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <LogIn className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Want to save and run this spell?
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign in to favorite, fork, and execute code
                </p>
              </div>
            </div>
            <a
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </a>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{spell.title}</h1>
              {!spell.isPublic && <Badge variant="secondary">Private</Badge>}
            </div>

            {spell.description && (
              <p className="text-muted-foreground text-lg mb-4">
                {spell.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {spell.user.image ? (
                  <Image
                    src={spell.user.image}
                    alt={spell.user.name || 'User'}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {spell.user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <Link
                  href={spell.user.username ? `/u/${spell.user.username}` : '#'}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {spell.user.name}
                </Link>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(spell.language) }}
                />
                <span className="capitalize">{spell.language}</span>
              </div>

              {spell.spellbook && (
                <>
                  <span>•</span>
                  <span>in {spell.spellbook.name}</span>
                </>
              )}

              <span>•</span>

              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{spell.views} views</span>
              </div>

              <span>•</span>
              <span>{formatRelativeTime(spell.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              disabled={copied}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>

            <Button variant="outline" size="sm" onClick={shareSpell}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            {isLoggedIn && (
              <Button
                variant={isFavorited ? 'default' : 'outline'}
                size="sm"
                onClick={toggleFavorite}
                disabled={isLoadingFavorite}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`}
                />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
            )}

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Tags */}
        {spell.tags && spell.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spell.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Code Editor */}
        <div className="space-y-4">
          <CodeEditor
            value={spell.code}
            onChange={() => {}}
            language={spell.language}
            readOnly={true}
          />
        </div>

        {/* Code Runner */}
        {isLoggedIn &&
          [
            'javascript',
            'js',
            'typescript',
            'ts',
            'python',
            'py',
            'php',
            'html',
            'css',
            'sql'
          ].includes(spell.language.toLowerCase()) && (
            <CodeRunner code={spell.code} language={spell.language} />
          )}

        {/* Not logged in message for code runner */}
        {!isLoggedIn &&
          [
            'javascript',
            'js',
            'typescript',
            'ts',
            'python',
            'py',
            'php',
            'html',
            'css',
            'sql'
          ].includes(spell.language.toLowerCase()) && (
            <div className="border border-dashed border-primary/20 rounded-lg p-8 text-center space-y-3 bg-primary/5">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                Sign in to run this code
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a free account to execute code directly in your browser
              </p>
              <a
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Run Code
              </a>
            </div>
          )}
      </div>
    </div>
  )
}
