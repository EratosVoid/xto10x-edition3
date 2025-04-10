"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { answerFAQ } from "@/lib/ai";

// Message type
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

// Suggested questions
const suggestedQuestions = [
  "What types of community events can I organize?",
  "How do I start a petition in my neighborhood?",
  "What are the benefits of community engagement?",
  "How can I apply for a community improvement grant?",
  "What makes a successful neighborhood initiative?",
  "How can I encourage more participation in local polls?",
];

export default function AskAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I'm your LocalVoice AI assistant. How can I help you today with community initiatives and local engagement?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Get response from AI
      const aiResponse = await answerFAQ(content);

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponse,
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ask the AI Assistant</h1>
        <p className="text-default-500">
          Get instant answers about community initiatives, engagement
          strategies, and local governance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat interface */}
        <Card className="md:col-span-2 h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar
                name="AI"
                size="sm"
                src="/ai-assistant.png"
                color="primary"
                isBordered
              />
              <div>
                <h3 className="text-lg font-semibold">LocalVoice AI</h3>
                <p className="text-small text-default-500">Powered by Gemini</p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="overflow-y-auto flex-grow p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-default-100 rounded-tl-none"
                  }`}
                >
                  <p>{message.content}</p>
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
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="rounded-lg p-3 bg-default-100 rounded-tl-none flex items-center gap-2">
                  <Spinner size="sm" color="primary" />
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
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
                fullWidth
              />
              <Button
                color="primary"
                onClick={() => handleSendMessage()}
                isDisabled={isLoading || !input.trim()}
              >
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Suggested questions */}
        <Card className="h-fit">
          <CardHeader>
            <h3 className="text-lg font-semibold">Suggested Questions</h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="flat"
                  color="primary"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <p className="text-small text-default-500">
              Ask any question about community initiatives, local governance, or
              engagement strategies.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
