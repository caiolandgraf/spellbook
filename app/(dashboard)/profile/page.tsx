'use client'

import {
    BookOpen,
    Check,
    Code2,
    Copy,
    ExternalLink,
    Github,
    Globe,
    Loader2,
    Save,
    Share2,
    Twitter,
    X
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FadeIn } from '@/components/animations/fade-in'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface UserProfile {
  id: string
  name: string | null
  email: string
  username: string | null
  bio: string | null
  image: string | null
  website: string | null
  github: string | null
  twitter: string | null
  isPublic: boolean
  _count: {
    spells: number
    spellbooks: number
    favorites: number
  }
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  )
  const [usernameError, setUsernameError] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    github: '',
    twitter: '',
    isPublic: true,
    image: ''
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        username: data.username || '',
        bio: data.bio || '',
        website: data.website || '',
        github: data.github || '',
        twitter: data.twitter || '',
        isPublic: data.isPublic,
        image: data.image || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Check username availability with debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (!profile?.username || profile?.username === session?.user?.username) {
        setUsernameAvailable(null)
        setUsernameError('')
        return
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
      if (!usernameRegex.test(profile.username)) {
        setUsernameAvailable(false)
        setUsernameError(
          'Username must be 3-20 characters (letters, numbers, _, -)'
        )
        return
      }

      setCheckingUsername(true)
      setUsernameError('')

      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(profile.username)}`
        )
        const data = await res.json()
        setUsernameAvailable(data.available)
        if (!data.available) {
          setUsernameError('Username already taken')
        }
      } catch (error) {
        console.error('Error checking username:', error)
      } finally {
        setCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [profile?.username, session?.user?.username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const updated = await res.json()
      setProfile(updated)

      // Atualizar a sessão com a nova imagem e nome
      await update({
        name: updated.name,
        image: updated.image
      })

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile data.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your public profile and settings
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.[0]?.toUpperCase() ||
                    profile.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile.name || 'Anonymous'}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    <Code2 className="w-3 h-3 mr-1" />
                    {profile._count.spells} spells
                  </Badge>
                  <Badge variant="secondary">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {profile._count.spellbooks} spellbooks
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </FadeIn>

      {/* Public Profile Link */}
      {profile.username && (
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Your Profile
              </CardTitle>
              <CardDescription>
                Your public profile is available at this URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.username}`}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/u/${profile.username}`
                    )
                    toast.success('Profile link copied to clipboard!')
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    window.open(`/u/${profile.username}`, '_blank')
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view your public spells and spellbooks
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details and public visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Input
                        placeholder="username"
                        value={profile.username || ''}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            username: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_-]/g, '')
                          })
                        }
                        className={
                          usernameError
                            ? 'border-red-500 pr-10'
                            : usernameAvailable
                              ? 'border-green-500 pr-10'
                              : ''
                        }
                      />
                      {checkingUsername && (
                        <Loader2 className="w-4 h-4 absolute right-3 top-3 animate-spin text-muted-foreground" />
                      )}
                      {!checkingUsername &&
                        usernameAvailable &&
                        profile.username &&
                        profile.username !== session?.user?.username && (
                          <Check className="w-4 h-4 absolute right-3 top-3 text-green-500" />
                        )}
                      {!checkingUsername && usernameError && (
                        <X className="w-4 h-4 absolute right-3 top-3 text-red-500" />
                      )}
                    </div>
                    {usernameError && (
                      <p className="text-xs text-red-500">{usernameError}</p>
                    )}
                    {usernameAvailable &&
                      profile.username &&
                      profile.username !== session?.user?.username && (
                        <p className="text-xs text-green-600">
                          Username is available!
                        </p>
                      )}
                    <p className="text-xs text-muted-foreground">
                      Your profile will be available at /u/@
                      {profile.username || 'username'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={e =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://example.com/avatar.jpg"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL to your profile picture
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={e =>
                        setFormData({ ...formData, isPublic: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-input"
                    />
                    <Label htmlFor="isPublic" className="cursor-pointer">
                      Make my profile public
                    </Label>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Add your social media and website links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={e =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={e =>
                          setFormData({ ...formData, github: e.target.value })
                        }
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={e =>
                          setFormData({ ...formData, twitter: e.target.value })
                        }
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
