import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, UserPlus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Member {
  id: string;
  role: string;
  profiles: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

      setTeam(teamData);

      const { data: membersData } = await supabase
        .from("team_members")
        .select("id, role, profiles:user_id(username, full_name, avatar_url)")
        .eq("team_id", id);

      setMembers(membersData || []);
    } catch (error) {
      console.error("Error loading team:", error);
      toast({
        title: "Error",
        description: "Failed to load team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container py-20 text-center">Loading team...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-xl mb-4">Team not found</p>
          <Button onClick={() => navigate("/teams")}>Back to Teams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/teams")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8" />
                <div>
                  <CardTitle className="text-3xl">{team.name}</CardTitle>
                  <p className="text-muted-foreground">{members.length} members</p>
                </div>
              </div>
              <Button className="bg-gradient-primary">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Members
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{team.description}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="board">Kanban Board</TabsTrigger>
            <TabsTrigger value="chat">Team Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback>
                            {member.profiles?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            @{member.profiles?.username}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium capitalize">{member.role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="board" className="mt-6">
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Kanban board coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Team chat coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
