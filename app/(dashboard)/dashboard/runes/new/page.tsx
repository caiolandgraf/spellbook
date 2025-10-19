'use client'

import { Loader2, Plus, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { RuneEditor } from '@/components/rune-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function NewRunePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    html: '<!-- Write your HTML here -->\n<div>\n  <h1>Hello Runes!</h1>\n</div>',
    css: '/* Write your CSS here */\nh1 {\n  color: #3b82f6;\n  font-size: 2rem;\n}',
    javascript: "// Write your JavaScript here\nconsole.log('Rune loaded!');",
    isPublic: true,
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/runes', {
        method: 'POST',
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
        throw new Error(error.error || 'Failed to create rune')
      }

      const data = await response.json()
      toast.success('Rune created successfully! ✨')
      router.push(`/runes/${data.id}`)
    } catch (error) {
      console.error('Error creating rune:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create rune')
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
    <div className="space-y-6">
      {/* Compact Header with Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Rune</h1>
            <p className="text-sm text-muted-foreground">
              Build with HTML, CSS, and JavaScript
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/runes')}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Rune'
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
