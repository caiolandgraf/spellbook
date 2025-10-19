'use client'

import { Loader2, Plus, Sparkles, X, Copy, ExternalLink, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { RuneEditor } from '@/components/rune-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Rune {
  id: string
  title: string
  description: string | null
  html: string
  css: string
  javascript: string
  isPublic: boolean
  tags: string[]
}

interface RuneEditFormProps {
  rune: Rune
}

export function RuneEditForm({ rune }: RuneEditFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: rune.title,
    description: rune.description || '',
    html: rune.html,
    css: rune.css,
    javascript: rune.javascript,
    isPublic: rune.isPublic,
    tags: rune.tags
  })
  const [tagInput, setTagInput] = useState('')

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/runes/${rune.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/runes/${rune.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          html: formData.html,
          css: formData.css,
          javascript: formData.javascript,
          isPublic: formData.isPublic,
          tags: formData.tags
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update rune')
      }

      toast.success('Rune saved successfully! ✨')
      router.push(`/runes/${rune.id}`)
    } catch (error) {
      console.error('Error updating rune:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update rune')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this rune? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/runes/${rune.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete rune')
      }

      toast.success('Rune deleted successfully')
      router.push('/dashboard/runes')
    } catch (error) {
      console.error('Error deleting rune:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete rune')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact Header with Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Rune</h1>
            <p className="text-sm text-muted-foreground">
              Update your HTML, CSS, and JavaScript
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`/runes/${rune.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/runes')}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Input
              required
              placeholder="Title *"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="font-medium"
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
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
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={e =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm">Make this rune public</span>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Full Width Editor + Preview */}
      <RuneEditor
        html={formData.html}
        css={formData.css}
        javascript={formData.javascript}
        onHtmlChange={(html) => setFormData({ ...formData, html })}
        onCssChange={(css) => setFormData({ ...formData, css })}
        onJavascriptChange={(javascript) => setFormData({ ...formData, javascript })}
        sideBySide={true}
      />
    </div>
  )
}
