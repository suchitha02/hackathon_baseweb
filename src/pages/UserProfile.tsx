import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Heart, MessageSquare, MapPin, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Tag {
  id: string;
  name: string;
}

interface PostTag {
  tags: Tag;
}

interface Post {
  id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  post_tags?: PostTag[];
}

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  college?: string;
  role?: string;
}

interface User {
  id: string;
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [interests, setInterests] = useState<Tag[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });

  const checkIfFollowing = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", userId)
      .eq("following_id", id)
      .single();
    setIsFollowing(!!data);
  }, [id]);

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
    if (user) checkIfFollowing(user.id);
  }, [checkIfFollowing]);

  const loadProfile = useCallback(async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    setProfile(profileData);

    // Load interests
    const { data: interestsData } = await supabase
      .from("user_interests")
      .select("tags(*)")
      .eq("user_id", id);
    setInterests(interestsData?.map((i: { tags: Tag }) => i.tags) || []);

    // Load posts
    const { data: postsData } = await supabase
      .from("posts")
      .select("*, post_tags(tags(*))")
      .eq("author_id", id)
      .order("created_at", { ascending: false });
    setPosts(postsData || []);

    // Load stats
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", id);

    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", id);

    setStats({
      followers: followersCount || 0,
      following: followingCount || 0,
      posts: postsData?.length || 0,
    });
  }, [id]);

  useEffect(() => {
    checkAuth();
    loadProfile();
  }, [checkAuth, loadProfile]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", id);
        setIsFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUser.id, following_id: id });
        setIsFollowing(true);
      }
      loadProfile();
    } catch (error) {
      console.error("Error toggling follow:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update follow status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container py-20 text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-4xl">
                  {profile.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                  {currentUser?.id !== id && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={!isFollowing ? "bg-gradient-primary" : ""}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>

                {profile.bio && <p className="text-lg mb-4">{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {profile.college && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {profile.college}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.role || "Student"}
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-bold">{stats.posts}</span> Posts
                  </div>
                  <div>
                    <span className="font-bold">{stats.followers}</span> Followers
                  </div>
                  <div>
                    <span className="font-bold">{stats.following}</span> Following
                  </div>
                </div>

                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {interests.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-xl transition-shadow cursor-pointer bg-gradient-card"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {post.cover_image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="pt-4">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
