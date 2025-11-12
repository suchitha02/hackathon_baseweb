import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageSquare, Users, ArrowLeft } from "lucide-react";
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
    id: string;
    username?: string;
    avatar_url?: string;
    full_name?: string;
    bio?: string;
  };
  post_tags?: PostTag[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

interface User {
  id: string;
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkIfLiked = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", userId)
      .single();
    setHasLiked(!!data);
  }, [id]);

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) checkIfLiked(user.id);
  }, [checkIfLiked]);

  const loadPost = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:author_id (id, username, avatar_url, full_name, bio),
          post_tags (
            tags (id, name)
          )
        `
        )
        .eq("id", id)
        .single();

      setPost(data);
    } catch (error) {
      console.error("Error loading post:", error);
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles:author_id (username, avatar_url, full_name)
      `
      )
      .eq("post_id", id)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    setComments(data || []);
  }, [id]);

  useEffect(() => {
    loadPost();
    loadComments();
    checkAuth();
  }, [loadPost, loadComments, checkAuth]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (hasLiked) {
        await supabase.from("likes").delete().eq("post_id", id).eq("user_id", user.id);
        setHasLiked(false);
      } else {
        await supabase.from("likes").insert({ post_id: id, user_id: user.id });
        setHasLiked(true);
      }
      loadPost();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: id,
        author_id: user.id,
        content: newComment,
      });

      if (error) throw error;

      setNewComment("");
      loadComments();
      loadPost();
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container py-20 text-center">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-xl mb-4">Post not found</p>
          <Button onClick={() => navigate("/feed")}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/feed")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full aspect-video object-cover rounded-lg mb-6"
                  />
                )}

                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

                <div className="flex items-center gap-3 mb-6">
                  <Avatar
                    className="h-12 w-12 cursor-pointer"
                    onClick={() => navigate(`/user/${post.profiles?.id}`)}
                  >
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {post.post_tags?.map((pt) => (
                    <Badge key={pt.tags.id} variant="secondary">
                      {pt.tags.name}
                    </Badge>
                  ))}
                  {post.looking_for_teammates && (
                    <Badge className="bg-accent">
                      <Users className="mr-1 h-3 w-3" />
                      Looking for Teammates
                    </Badge>
                  )}
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    variant={hasLiked ? "default" : "outline"}
                    onClick={handleLike}
                    className={hasLiked ? "bg-gradient-primary" : ""}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                    {post.likes_count}
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {post.comments_count}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Comments</h2>

                {user && (
                  <div className="mb-6">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleComment}
                      className="mt-2 bg-gradient-primary"
                      disabled={!newComment.trim()}
                    >
                      Post Comment
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.profiles?.avatar_url} />
                        <AvatarFallback>
                          {comment.profiles?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.profiles?.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">About the Author</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    className="h-16 w-16 cursor-pointer"
                    onClick={() => navigate(`/user/${post.profiles?.id}`)}
                  >
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{post.profiles?.username}</p>
                  </div>
                </div>
                {post.profiles?.bio && (
                  <p className="text-sm text-muted-foreground mb-4">{post.profiles.bio}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/user/${post.profiles?.id}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
