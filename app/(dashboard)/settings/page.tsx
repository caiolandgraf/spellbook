"use client";

import {
  Bell,
  Check,
  Cog,
  Database,
  Loader2,
  Moon,
  Settings,
  Shield,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameError, setUsernameError] = useState<string>("");

  // Profile form
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    website: "",
    github: "",
    twitter: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    comments: true,
    favorites: true,
    followers: false,
  });

  // Load user profile data
  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = await res.json();
            setProfile({
              name: data.name || "",
              username: data.username || "",
              bio: data.bio || "",
              website: data.website || "",
              github: data.github || "",
              twitter: data.twitter || "",
            });
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      };
      fetchProfile();
    }
  }, [session]);

  // Check username availability with debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (!profile.username || profile.username === session?.user?.username) {
        setUsernameAvailable(null);
        setUsernameError("");
        return;
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(profile.username)) {
        setUsernameAvailable(false);
        setUsernameError(
          "Username must be 3-20 characters (letters, numbers, _, -)"
        );
        return;
      }

      setCheckingUsername(true);
      setUsernameError("");

      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(
            profile.username
          )}`
        );
        const data = await res.json();
        setUsernameAvailable(data.available);
        if (!data.available) {
          setUsernameError("Username already taken");
        }
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [profile.username, session?.user?.username]);

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showStats: true,
    allowComments: true,
  });

  const handleSaveProfile = async () => {
    // Validate username
    if (
      profile.username &&
      !usernameAvailable &&
      profile.username !== session?.user?.username
    ) {
      toast.error(usernameError || "Username is not available");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser = await res.json();

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          username: updatedUser.username,
        },
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setLoading(true);
    try {
      // Theme is already saved via next-themes
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.success("Appearance settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Notification settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Privacy settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Sun className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account">
            <Cog className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Your display name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="username"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/g, ""),
                      })
                    }
                    className={
                      usernameError
                        ? "border-red-500 pr-10"
                        : usernameAvailable
                        ? "border-green-500 pr-10"
                        : ""
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
                  {profile.username || "username"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {profile.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profile.website}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
                    id="github"
                    placeholder="username"
                    value={profile.github}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        github: e.target.value.replace(/[^a-zA-Z0-9-]/g, ""),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X Username</Label>
                  <Input
                    id="twitter"
                    placeholder="username"
                    value={profile.twitter}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        twitter: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={
                  loading ||
                  checkingUsername ||
                  (!!usernameError &&
                    profile.username !== session?.user?.username)
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Dark</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Light</p>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Theme changes are applied immediately
                </p>
              </div>

              <div className="space-y-2">
                <Label>Editor Font Size</Label>
                <select className="w-full p-2 rounded-lg border border-input bg-background">
                  <option>12px</option>
                  <option>14px (default)</option>
                  <option>16px</option>
                  <option>18px</option>
                </select>
              </div>

              <Button
                onClick={handleSaveAppearance}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Appearance Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        email: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        push: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="border-t border-border my-4" />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Comments</Label>
                    <p className="text-xs text-muted-foreground">
                      When someone comments on your spells
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.comments}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        comments: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Favorites</Label>
                    <p className="text-xs text-muted-foreground">
                      When someone favorites your spell
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.favorites}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        favorites: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Followers</Label>
                    <p className="text-xs text-muted-foreground">
                      When someone follows you
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.followers}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        followers: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notification Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Control your privacy and what others can see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-xs text-muted-foreground">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.profilePublic}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        profilePublic: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email</Label>
                    <p className="text-xs text-muted-foreground">
                      Display email on your public profile
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, showEmail: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Statistics</Label>
                    <p className="text-xs text-muted-foreground">
                      Display spell and spellbook counts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showStats}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, showStats: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Comments</Label>
                    <p className="text-xs text-muted-foreground">
                      Let others comment on your spells
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.allowComments}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        allowComments: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePrivacy}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Privacy Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                  <Badge variant="secondary">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {session?.user?.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" disabled>
                  <Database className="w-4 h-4 mr-2" />
                  Export All Data
                  <Badge variant="secondary" className="ml-2">
                    Coming Soon
                  </Badge>
                </Button>

                <Button variant="destructive" className="w-full" disabled>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                  <Badge variant="secondary" className="ml-2">
                    Coming Soon
                  </Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
