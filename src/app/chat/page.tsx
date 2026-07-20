"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState("Free");
  const [maxFreeLimit, setMaxFreeLimit] = useState(5);

  // Load chat messages and subscription from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("whiterabbit_chat_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error("Error parsing saved messages:", err);
      }
    }

    const activeSub = localStorage.getItem("user_subscription_tier") || "Free";
    setSubscription(activeSub);

    // Fetch dynamic message limit from admin settings if configured
    fetchAdminConfig();
  }, []);

  const fetchAdminConfig = async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.messageLimit) {
          setMaxFreeLimit(data.settings.messageLimit);
        }
      }
    } catch (err) {
      console.error("Error fetching admin limit config:", err);
    }
  };

  // Save messages to localStorage when updated
  const saveMessagesLocally = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem("whiterabbit_chat_messages", JSON.stringify(newMessages));
  };

  const handleSendMessage = async (text: string) => {
    setError(null);

    // Guard: Check message limits for Free-tier users
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (subscription === "Free" && userMessageCount >= maxFreeLimit) {
      setError(
        `You have reached the Free tier limit of ${maxFreeLimit} messages. Please upgrade to Pro for unlimited access.`
      );
      return;
    }

    setIsLoading(true);

    // Generate optimistic user message ID
    const tempUserMsgId = Math.random().toString(36).substring(7);
    const userMsg: Message = {
      id: tempUserMsgId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    // Add user message to display immediately
    const updatedMessages = [...messages, userMsg];
    saveMessagesLocally(updatedMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate reply.");
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages.filter((m) => m.id !== tempUserMsgId),
        { ...userMsg, id: Math.random().toString(36).substring(7) },
        assistantMsg,
      ];
      saveMessagesLocally(finalMessages);
    } catch (err: any) {
      console.error("Chat sending error:", err);
      setError(err.message || "Failed to send message.");
      
      // Roll back user message from local storage on error
      saveMessagesLocally(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem("whiterabbit_chat_messages");
    setError(null);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Re-read subscription dynamic status when window returns focus
  useEffect(() => {
    const handleFocus = () => {
      const activeSub = localStorage.getItem("user_subscription_tier") || "Free";
      setSubscription(activeSub);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />
      <main className="flex-1 h-full flex flex-col min-w-0 bg-transparent relative">
        {/* Custom Upgrades Limit Indicator banner */}
        {subscription === "Free" && (
          <div className="bg-primary/5 border-b border-border/80 px-4 py-2 flex items-center justify-between text-xs font-semibold select-none shrink-0">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
              Standard Free Plan: Using {messages.filter(m => m.role === 'user').length} of {maxFreeLimit} allowed message credits.
            </span>
            <Link
              href="/pricing"
              className="text-primary hover:underline flex items-center"
            >
              Upgrade to Pro &rarr;
            </Link>
          </div>
        )}

        <ChatArea
          chatId="local-session"
          chatTitle="Support Chat"
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          error={error}
        />
      </main>
    </div>
  );
}
