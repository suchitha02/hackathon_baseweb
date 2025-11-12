import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Users, Heart, MessageSquare, PlusCircle } from "lucide-react";

interface Post {
  id: string;
  title: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface User {
  id: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    myPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
    loadDashboardData(user.id);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadDashboardData = async (userId: string) => {
    // Load posts count
    const { count: postsCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", userId);

    // Load total likes and comments
    const { data: posts } = await supabase
      .from("posts")
      .select("likes_count, comments_count")
      .eq("author_id", userId);

    const totalLikes = posts?.reduce((sum, post) => sum + post.likes_count, 0) || 0;
    const totalComments = posts?.reduce((sum, post) => sum + post.comments_count, 0) || 0;

    // Load followers count
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    setStats({
      myPosts: postsCount || 0,
      totalLikes,
      totalComments,
      followers: followersCount || 0,
    });

    // Load recent posts
    const { data: recentData } = await supabase
      .from("posts")
      .select("id, title, created_at, likes_count, comments_count")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentPosts(recentData || []);
  };

  const statCards = [
    {
      title: "My Ideas",
      value: stats.myPosts,
      icon: Lightbulb,
      color: "text-primary",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Comments",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      title: "Followers",
      value: stats.followers,
      icon: Users,
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your innovation journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-gradient-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-12 w-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/post/new")} className="bg-gradient-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Idea
            </Button>
            <Button variant="outline" onClick={() => navigate("/feed")}>
              Explore Ideas
            </Button>
            <Button variant="outline" onClick={() => navigate(`/user/${user?.id}`)}>
              View Profile
            </Button>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                <Button onClick={() => navigate("/post/new")} className="bg-gradient-primary">
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments_count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
