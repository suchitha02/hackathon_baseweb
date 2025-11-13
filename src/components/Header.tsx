import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, User, LogOut, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { authAPI, usersAPI } from "@/services/api";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
  username?: string;
  avatar_url?: string;
}

interface User {
  id: string;
  email?: string;
}

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data } = await authAPI.getUser();
    setUser(data?.user ?? null);
    if (data?.user) {
      fetchProfile(data.user.id);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await usersAPI.getUserById(userId);
    setProfile(data);
  };

  const handleSignOut = async () => {
    await authAPI.signOut();
    setUser(null);
    setProfile(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            IdeaSpark
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/feed"
            className="transition-colors hover:text-primary text-foreground/80"
          >
            Explore
          </Link>
          {user && (
            <>
              <Link
                to="/teams"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                Teams
              </Link>
              <Link
                to="/kanban"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                Kanban
              </Link>
              <Link
                to="/ai-chat"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                AI Chat
              </Link>
              <Link
                to="/dashboard"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {profile?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/user/${user.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/post/new")}>
                  New Idea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/signup")} className="bg-gradient-primary">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
