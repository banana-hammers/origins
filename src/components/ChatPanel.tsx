import React, { useState, useEffect, useRef } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { streamTextGenerationWithState } from "@/lib/streamClient";
import { ScrollText } from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { AI_MODELS } from "@/config/aiModels";

type Message = {
  role: "user" | "system" | "assistant";
  content: string;
};

type ChatPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChatPanel({ open, onOpenChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS.default);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set up welcome message when the panel first opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I&aposm your planning assistant. How can I help you today?"
        }
      ]);
    }
  }, [open, messages.length]);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    
    // Create a placeholder for the AI response
    setLoading(true);
    
    try {
      // Add a placeholder message that will be updated with streaming content
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      // Create the prompt with conversation history for context
      const conversationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");

      const prompt = `You are a planning assistant that helps users organize and plan their tasks and projects. Offer clear suggestions, ask clarifying questions, and provide step-by-step guidance to achieve their goals.\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}\nAssistant:`;
      
      // Stream the response and update the UI with each chunk
      await streamTextGenerationWithState(
        prompt,
        (chunk) => {
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              content: updatedMessages[lastIndex].content + chunk
            };
            return updatedMessages;
          });
        },
        {
          model: selectedModel,
          maxTokens: 1000,
          onComplete: () => setLoading(false)
        }
      );
    } catch (error) {
      console.error("Error streaming response:", error);
      
      // Add an error message
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        
        // If we have a placeholder message, update it with the error
        if (lastIndex >= 0 && updatedMessages[lastIndex].role === "assistant" && updatedMessages[lastIndex].content === "") {
          updatedMessages[lastIndex] = {
            role: "assistant",
            content: "I&apos;m sorry, I encountered an error trying to respond. Please try again."
          };
        } else {
          // Otherwise add a new error message
          updatedMessages.push({
            role: "assistant",
            content: "I&apos;m sorry, I encountered an error trying to respond. Please try again."
          });
        }
        
        return updatedMessages;
      });
      
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center">
            <ScrollText className="h-5 w-5 mr-2 text-primary" />
            <SheetTitle>Planner Assistant</SheetTitle>
          </div>
          <SheetDescription>
            I&apos;ll help you organize your tasks and projects
          </SheetDescription>
          <div className="mt-2">
            <div className="text-sm text-muted-foreground mb-1">AI Model:</div>
            <ModelSelector 
              value={selectedModel} 
              onChange={setSelectedModel} 
            />
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              isLoading={loading && index === messages.length - 1 && message.content === ""}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} isLoading={loading} />
      </SheetContent>
    </Sheet>
  );
}