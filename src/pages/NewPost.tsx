import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface User {
  id: string;
}

export default function NewPost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [lookingForTeammates, setLookingForTeammates] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  }, [navigate]);

  const loadTags = useCallback(async () => {
    const { data } = await supabase.from("tags").select("*").order("name");
    if (data) setAllTags(data);
  }, []);

  useEffect(() => {
    checkAuth();
    loadTags();
  }, [checkAuth, loadTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    if (selectedTags.length === 0) {
      toast({
        title: "Select tags",
        description: "Please select at least one tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          title,
          content,
          cover_image_url: coverImageUrl || null,
          looking_for_teammates: lookingForTeammates,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Insert post tags
      const { error: tagsError } = await supabase.from("post_tags").insert(
        selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }))
      );

      if (tagsError) throw tagsError;

      toast({
        title: "Post created!",
        description: "Your idea has been shared with the community",
      });
      navigate(`/post/${post.id}`);
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create post";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/feed")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Share Your Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="What's your big idea?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description</Label>
                <Textarea
                  id="content"
                  placeholder="Describe your idea in detail..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
                <Input
                  id="coverImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (Select at least one)</Label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedTags.includes(tag.id)
                          ? "bg-gradient-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="teammates"
                  checked={lookingForTeammates}
                  onCheckedChange={setLookingForTeammates}
                />
                <Label htmlFor="teammates" className="cursor-pointer">
                  Looking for teammates
                </Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish Idea"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/feed")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
