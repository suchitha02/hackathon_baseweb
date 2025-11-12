import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, GripVertical } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface User {
  id: string;
}

export default function Kanban() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todo");

  const statuses = [
    { id: "todo", label: "To Do", color: "bg-slate-500" },
    { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
    { id: "review", label: "Review", color: "bg-yellow-500" },
    { id: "done", label: "Done", color: "bg-green-500" },
  ];

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  }, [navigate]);

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    loadTasks();
  }, [checkAuth, loadTasks]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("tasks").insert({
        title: newTaskTitle,
        description: newTaskDescription,
        status: selectedStatus,
        user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Task created!",
        description: "Your task has been added to the board",
      });

      setIsCreateOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      loadTasks();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create task";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Kanban Board</h1>
            <p className="text-muted-foreground">Organize your tasks and track progress</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    placeholder="Enter task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="Task details..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status.id}
                        variant={selectedStatus === status.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus(status.id)}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateTask} className="w-full bg-gradient-primary">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map((status) => (
            <div key={status.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <h3 className="font-semibold">{status.label}</h3>
                <span className="text-sm text-muted-foreground">
                  ({getTasksByStatus(status.id).length})
                </span>
              </div>
              <div className="space-y-3">
                {getTasksByStatus(status.id).map((task) => (
                  <Card key={task.id} className="cursor-move hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-1" />
                        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      </div>
                    </CardHeader>
                    {task.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
