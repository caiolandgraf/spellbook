"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Check, Heart, MessageCircle, Star, Trash2, UserPlus } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerContainer } from "@/components/animations/stagger-container";

interface Notification {
  id: string;
  type: "comment" | "favorite" | "follow" | "mention";
  title: string;
  message: string;
  user: {
    name: string;
    image: string | null;
  };
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Mock data - replace with real API calls
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "favorite",
    title: "New Favorite",
    message: "favorited your spell 'React Custom Hook'",
    user: {
      name: "Alice Johnson",
      image: null,
    },
    timestamp: "2 hours ago",
    read: false,
    actionUrl: "/spells/1",
  },
  {
    id: "2",
    type: "comment",
    title: "New Comment",
    message: "commented on your spell 'Python Data Parser'",
    user: {
      name: "Bob Smith",
      image: null,
    },
    timestamp: "5 hours ago",
    read: false,
    actionUrl: "/spells/2",
  },
  {
    id: "3",
    type: "follow",
    title: "New Follower",
    message: "started following you",
    user: {
      name: "Carol Williams",
      image: null,
    },
    timestamp: "1 day ago",
    read: true,
    actionUrl: "/u/carolw",
  },
  {
    id: "4",
    type: "favorite",
    title: "New Favorite",
    message: "favorited your spellbook 'Frontend Utils'",
    user: {
      name: "David Brown",
      image: null,
    },
    timestamp: "2 days ago",
    read: true,
    actionUrl: "/spellbooks/1",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="w-4 h-4" />;
      case "favorite":
        return <Heart className="w-4 h-4" />;
      case "follow":
        return <UserPlus className="w-4 h-4" />;
      case "mention":
        return <Star className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "comment":
        return "text-blue-500";
      case "favorite":
        return "text-red-500";
      case "follow":
        return "text-green-500";
      case "mention":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="default" className="rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                Stay updated with your latest activity
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
            size="sm"
          >
            Unread ({unreadCount})
          </Button>
        </div>
      </FadeIn>

      <StaggerContainer className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {filter === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          filteredNotifications.map((notification, index) => (
            <FadeIn key={notification.id} delay={index * 0.05}>
              <Card
                className={`transition-all hover:shadow-md cursor-pointer ${
                  !notification.read ? "border-primary/50 bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.user.image || undefined} />
                      <AvatarFallback>
                        {notification.user.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`p-1.5 rounded-lg bg-muted ${getColor(
                            notification.type
                          )}`}
                        >
                          {getIcon(notification.type)}
                        </div>
                        <span className="text-sm font-medium">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {notification.user.name}
                        </span>{" "}
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))
        )}
      </StaggerContainer>

      {filteredNotifications.length > 0 && (
        <FadeIn delay={0.3}>
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">About Notifications</CardTitle>
              <CardDescription className="text-xs">
                Get notified when someone interacts with your content. You can manage your
                notification preferences in{" "}
                <a href="/settings" className="text-primary hover:underline">
                  Settings
                </a>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
