import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Users, Plus, UserPlus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
  member_count?: number;
}

interface User {
  id: string;
}

export default function Teams() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  }, [navigate]);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });
      
      setTeams(data || []);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    loadTeams();
  }, [checkAuth, loadTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: team, error } = await supabase
        .from("teams")
        .insert({
          name: newTeamName,
          description: newTeamDescription,
          creator_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as team member
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user?.id,
        role: "owner",
      });

      toast({
        title: "Team created!",
        description: "Your team has been created successfully",
      });

      setIsCreateOpen(false);
      setNewTeamName("");
      setNewTeamDescription("");
      loadTeams();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create team";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Teams</h1>
            <p className="text-muted-foreground">Collaborate with others on your ideas</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamDescription">Description</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="What's your team about?"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateTeam} className="w-full bg-gradient-primary">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading teams...</div>
        ) : teams.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">No teams yet</p>
            <p className="text-muted-foreground mb-4">Create your first team to start collaborating</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="hover:shadow-xl transition-shadow cursor-pointer bg-gradient-card"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {team.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {team.member_count || 0} members
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="h-4 w-4" />
                    </Button>
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
