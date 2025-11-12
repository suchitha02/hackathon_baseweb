import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, MessageSquare, Target, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lightbulb,
      title: "Share Ideas",
      description: "Post your innovative ideas and get feedback from the community",
    },
    {
      icon: Users,
      title: "Form Teams",
      description: "Create teams, invite members, and collaborate on projects together",
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Get help brainstorming and solving problems with our AI chatbot",
    },
    {
      icon: Target,
      title: "Kanban Boards",
      description: "Organize tasks with drag-and-drop boards and track progress",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Built for Hackathons
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Share Ideas.{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Form Teams.
              </span>{" "}
              Build the Future.
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              The ultimate platform for student innovators to collaborate, create, and bring
              groundbreaking ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-gradient-primary text-lg h-12 px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/feed")}
                className="text-lg h-12 px-8"
              >
                Explore Ideas
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <img
              src={heroImage}
              alt="Students collaborating"
              className="relative rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 bg-background/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Innovate
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to execution, IdeaSpark provides all the tools for successful collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-gradient-card hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="border-0 bg-gradient-primary text-white p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of innovators turning ideas into reality
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/signup")}
            className="text-lg h-12 px-8"
          >
            Create Your Account
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 IdeaSpark. Built for innovators, by innovators.</p>
        </div>
      </footer>
    </div>
  );
}
