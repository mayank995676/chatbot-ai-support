"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

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

  // Load chat messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("whiterabbit_chat_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error("Error parsing saved messages:", err);
      }
    }
  }, []);

  // Save messages to localStorage when updated
  const saveMessagesLocally = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem("whiterabbit_chat_messages", JSON.stringify(newMessages));
  };

  const handleSendMessage = async (text: string) => {
    setError(null);
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {/* Background radial gradient mesh for 3D effect */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0px,transparent_60%)]" />
      
      <Sidebar
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />
      <main className="flex-1 h-full flex flex-col min-w-0 bg-transparent">
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
