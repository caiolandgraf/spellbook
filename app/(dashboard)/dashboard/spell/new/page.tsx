'use client'

import { Loader2, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { CodeEditor } from '@/components/code-editor'
import { CodeRunner } from '@/components/code-runner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql'
]

export default function NewSpellPage({
  searchParams
}: {
  searchParams: Promise<{ spellbookId?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spellbookId, setSpellbookId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    isPublic: true,
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState('')

  // Carregar spellbookId dos searchParams
  useState(() => {
    searchParams.then(params => {
      if (params.spellbookId) {
        setSpellbookId(params.spellbookId)
      }
    })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/spells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          spellbookId: spellbookId || undefined
        })
      })

      if (!response.ok) throw new Error('Failed to create spell')

      const spell = await response.json()
      toast.success('Spell created successfully! ✨')

      // Se foi criado dentro de um spellbook, redireciona para lá
      if (spellbookId) {
        router.push(`/spellbooks/${spellbookId}`)
      } else {
        router.push(`/spells/${spell.id}`)
      }
    } catch (error) {
      console.error('Error creating spell:', error)
      toast.error('Failed to create spell. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Create New Spell
          {spellbookId && (
            <Badge variant="secondary" className="ml-3">
              Adding to Spellbook
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground">
          Save your code snippet and share it with the world
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g., Quick Sort Algorithm"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    placeholder="What does this code do?"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Language *
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={e =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <CodeEditor
              value={formData.code}
              onChange={code => setFormData({ ...formData, code })}
              language={formData.language}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview/Run */}
            {formData.code &&
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
              ].includes(formData.language.toLowerCase()) && (
                <CodeRunner code={formData.code} language={formData.language} />
              )}

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addTag}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={e =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-sm">Make this spell public</span>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.isPublic
                    ? 'Everyone can see this spell'
                    : 'Only you can see this spell'}
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Spell'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  window.location.href = spellbookId
                    ? `/spellbooks/${spellbookId}`
                    : '/spells'
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
