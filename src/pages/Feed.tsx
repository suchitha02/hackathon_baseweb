import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, MessageSquare, Users, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostTag {
  tags: {
    id: string;
    name: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  looking_for_teammates: boolean;
  profiles?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
  post_tags?: PostTag[];
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "trending" | "teammates">("all");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (username, avatar_url, full_name),
          post_tags (
            tags (id, name)
          )
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (filter === "trending") {
        query = query.order("likes_count", { ascending: false });
      } else if (filter === "teammates") {
        query = query.eq("looking_for_teammates", true);
      }

      const { data } = await query.limit(20);
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Ideas</h1>
          <p className="text-muted-foreground">
            Discover innovative projects and find your next collaboration
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-gradient-primary" : ""}
          >
            All Ideas
          </Button>
          <Button
            variant={filter === "trending" ? "default" : "outline"}
            onClick={() => setFilter("trending")}
            className={filter === "trending" ? "bg-gradient-primary" : ""}
          >
            Trending
          </Button>
          <Button
            variant={filter === "teammates" ? "default" : "outline"}
            onClick={() => setFilter("teammates")}
            className={filter === "teammates" ? "bg-gradient-primary" : ""}
          >
            <Users className="mr-2 h-4 w-4" />
            Looking for Teammates
          </Button>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-20">Loading amazing ideas...</div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
            <Button onClick={() => navigate("/post/new")} className="bg-gradient-primary">
              Create Post
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-xl transition-shadow cursor-pointer group bg-gradient-card"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {post.cover_image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {post.profiles?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {post.profiles?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.post_tags?.slice(0, 3).map((pt) => (
                      <Badge key={pt.tags.id} variant="secondary" className="text-xs">
                        {pt.tags.name}
                      </Badge>
                    ))}
                    {post.looking_for_teammates && (
                      <Badge className="bg-accent text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        Looking for Team
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {post.likes_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments_count}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
