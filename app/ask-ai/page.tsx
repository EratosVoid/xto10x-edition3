"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Message type
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

// Suggested questions by category
const suggestedQuestions = {
  general: [
    "What types of community events can I organize?",
    "How do I start a petition in my neighborhood?",
    "What are the benefits of community engagement?",
  ],
  events: [
    "How can I create a successful community event?",
    "What permits do I need for a block party?",
    "How can I find volunteers for my event?",
  ],
  polls: [
    "How can I encourage more participation in local polls?",
    "What makes a good poll question?",
    "How do I analyze poll results effectively?",
  ],
  petitions: [
    "How many signatures do I need for my petition?",
    "How can I promote my petition effectively?",
    "What makes a petition successful?",
  ],
  discussions: [
    "How do I moderate community discussions?",
    "What topics generate the most engagement?",
    "How can I resolve conflicts in discussions?",
  ],
};

export default function AskAiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I'm your LocalVoice AI assistant. Ask me anything about community initiatives, events, polls, petitions, or discussions in your area. I have access to data from your locality to provide more relevant answers.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/ask-ai");
    }
  }, [status, router]);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (content: string = input) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call our new backend API route
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "Sorry, I encountered an error trying to respond. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ask the AI Assistant</h1>
        <p className="text-default-500">
          Get instant answers about community initiatives, events, polls,
          petitions, and discussions in{" "}
          {(session?.user as any)?.locality || "your area"}.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Chat interface - Takes more space now */}
        <Card className="md:col-span-3 h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar
                isBordered
                color="primary"
                name="AI"
                size="sm"
                showFallback
                fallback="AI"
              />
              <div>
                <h3 className="text-lg font-semibold">LocalVoice AI</h3>
                <p className="text-small text-default-500">
                  {status === "authenticated"
                    ? `Providing insights for ${(session?.user as any)?.locality}`
                    : "Powered by Gemini"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="overflow-y-auto flex-grow p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "ai" && (
                  <Avatar
                    name="AI"
                    size="sm"
                    showFallback
                    fallback="AI"
                    color="primary"
                    className="mr-2 self-end mb-1"
                  />
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-default-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      message.role === "user"
                        ? "text-white/70"
                        : "text-default-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar
                    name={session?.user?.name || "User"}
                    showFallback
                    fallback={(
                      session?.user?.name?.substring(0, 2) || "U"
                    ).toUpperCase()}
                    className="ml-2 self-end mb-1"
                    size="sm"
                  />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <Avatar
                  name="AI"
                  size="sm"
                  showFallback
                  fallback="AI"
                  color="primary"
                  className="mr-2 self-end mb-1"
                />
                <div className="rounded-lg p-3 bg-default-100 rounded-tl-none flex items-center gap-2">
                  <Spinner color="primary" size="sm" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardBody>

          <Divider />

          <CardFooter>
            <div className="flex w-full gap-2">
              <Input
                placeholder="Ask me anything about your community..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
                fullWidth
                size="lg"
              />
              <Button
                color="primary"
                isDisabled={isLoading || !input.trim()}
                size="lg"
              >
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Suggested questions with categories */}
        <Card className="h-fit">
          <CardHeader>
            <h3 className="text-lg font-semibold">Suggested Questions</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <Tabs
              selectedKey={selectedCategory}
              onSelectionChange={(key) => setSelectedCategory(key as string)}
              variant="underlined"
              classNames={{
                tabList: "w-full",
                cursor: "w-full",
                tab: "px-3 py-2 text-xs",
              }}
            >
              <Tab key="general" title="General" />
              <Tab key="events" title="Events" />
              <Tab key="polls" title="Polls" />
              <Tab key="petitions" title="Petitions" />
              <Tab key="discussions" title="Discussions" />
            </Tabs>
            <div className="px-3 py-2">
              <div className="flex flex-col gap-2">
                {suggestedQuestions[
                  selectedCategory as keyof typeof suggestedQuestions
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="flat"
                    color="primary"
                    className="justify-start text-left h-auto py-2 text-sm"
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="text-xs text-default-500">
              <p>The AI assistant has access to:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>Posts and discussions in your community</li>
                <li>
                  Upcoming events in{" "}
                  {(session?.user as any)?.locality || "your area"}
                </li>
                <li>Active petitions and polls</li>
                <li>Local community data</li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
