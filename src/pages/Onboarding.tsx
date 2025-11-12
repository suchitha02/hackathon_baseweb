import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface User {
  id: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const checkUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);

    // Generate a DiceBear avatar URL
    const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
    setAvatarUrl(dicebearUrl);
  }, [navigate]);

  const loadTags = useCallback(async () => {
    const { data } = await supabase.from("tags").select("*").order("name");
    if (data) setAllTags(data);
  }, []);

  useEffect(() => {
    checkUser();
    loadTags();
  }, [checkUser, loadTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleComplete = async () => {
    if (selectedTags.length === 0) {
      toast({
        title: "Select interests",
        description: "Please select at least one interest",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          bio,
          college,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Insert user interests
      const { error: interestsError } = await supabase.from("user_interests").insert(
        selectedTags.map((tagId) => ({
          user_id: user.id,
          tag_id: tagId,
        }))
      );

      if (interestsError) throw interestsError;

      toast({
        title: "Profile completed!",
        description: "Let's explore ideas together",
      });
      navigate("/feed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete profile";
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Let's personalize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`;
                setAvatarUrl(newUrl);
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Generate New Avatar
            </Button>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          {/* College */}
          <div className="space-y-2">
            <Label htmlFor="college">College/University</Label>
            <Input
              id="college"
              placeholder="MIT, Stanford, etc."
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Select Your Interests (at least 1)</Label>
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

          <Button
            onClick={handleComplete}
            className="w-full bg-gradient-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Complete Setup"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
