import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageSquare, Users, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "team_invite";
  content: string;
  read: boolean;
  created_at: string;
  actor?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

interface User {
  id: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  }, [navigate]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "like",
          content: "liked your post 'Building a Better Future'",
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          actor: {
            username: "johndoe",
            full_name: "John Doe",
            avatar_url: "",
          },
        },
        {
          id: "2",
          type: "comment",
          content: "commented on your post 'AI Innovation Ideas'",
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          actor: {
            username: "janedoe",
            full_name: "Jane Doe",
            avatar_url: "",
          },
        },
        {
          id: "3",
          type: "follow",
          content: "started following you",
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          actor: {
            username: "alexsmith",
            full_name: "Alex Smith",
            avatar_url: "",
          },
        },
        {
          id: "4",
          type: "team_invite",
          content: "invited you to join 'Innovation Squad'",
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          actor: {
            username: "sarahj",
            full_name: "Sarah Johnson",
            avatar_url: "",
          },
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    loadNotifications();
  }, [checkAuth, loadNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <Users className="h-4 w-4 text-green-500" />;
      case "team_invite":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">No notifications yet</p>
            <p className="text-muted-foreground">
              When someone interacts with your content, you'll see it here
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "bg-gradient-card border-primary/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={notification.actor?.avatar_url} />
                      <AvatarFallback>
                        {notification.actor?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">
                              {notification.actor?.full_name}
                            </span>{" "}
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge variant="default" className="bg-primary">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
