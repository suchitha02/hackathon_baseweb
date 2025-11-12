import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Lightbulb, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface User {
  id: string;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI brainstorming assistant. I can help you develop ideas, solve problems, and think creatively. What would you like to work on today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("idea") || lowerMessage.includes("brainstorm")) {
      return "Great! Let's brainstorm together. Here are some techniques we can use:\n\n1. **Mind Mapping**: Start with your core concept and branch out\n2. **SCAMPER**: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse\n3. **What if...?**: Ask hypothetical questions to explore possibilities\n\nWhat specific area would you like to explore?";
    }
    
    if (lowerMessage.includes("problem") || lowerMessage.includes("solve")) {
      return "Let's tackle this problem systematically:\n\n1. **Define**: What exactly is the problem?\n2. **Analyze**: What are the root causes?\n3. **Generate**: What are possible solutions?\n4. **Evaluate**: Which solution is most feasible?\n5. **Implement**: How can we put it into action?\n\nTell me more about the problem you're facing.";
    }
    
    if (lowerMessage.includes("team") || lowerMessage.includes("collaborate")) {
      return "Building a great team is crucial! Here are some tips:\n\n• Look for complementary skills\n• Ensure shared vision and values\n• Establish clear roles and responsibilities\n• Foster open communication\n• Celebrate small wins together\n\nWhat kind of team members are you looking for?";
    }
    
    if (lowerMessage.includes("startup") || lowerMessage.includes("business")) {
      return "Starting a business is exciting! Key considerations:\n\n1. **Validate your idea**: Talk to potential customers\n2. **Build an MVP**: Start small and iterate\n3. **Find your market**: Who needs this most?\n4. **Plan finances**: Bootstrap or seek funding?\n5. **Build your team**: Find co-founders and early employees\n\nWhat stage are you at with your startup?";
    }
    
    return "That's interesting! I can help you explore this further. Could you tell me more about:\n\n• What you're trying to achieve?\n• What challenges you're facing?\n• What resources you have available?\n\nThe more details you share, the better I can assist you!";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Help me brainstorm a new app idea",
    "How do I validate my startup idea?",
    "Tips for building a great team",
    "Solve a technical problem",
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AI Assistant</h1>
              <p className="text-muted-foreground">Your brainstorming companion</p>
            </div>
          </div>
        </div>

        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Quick prompts to get started:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3"
                  onClick={() => setInput(prompt)}
                >
                  <Sparkles className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.role === "assistant" ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <AvatarFallback className="bg-gradient-primary text-white">
                        U
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={`flex-1 rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-gradient-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </Avatar>
                  <div className="flex-1 rounded-lg p-4 bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your ideas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSend} className="bg-gradient-primary" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
