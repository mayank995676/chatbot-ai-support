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

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat sessions on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Load messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
    setError(null);
  }, [activeChatId]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/history?chatId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        setError("Failed to load conversation history.");
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Network error: Could not retrieve conversation.");
    }
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
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatId: activeChatId || undefined,
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

      // Append assistant reply and fix potential temporary IDs
      setMessages((prev) => {
        // Filter out any optimistic duplicates and append the assistant message
        return [...prev.filter((m) => m.id !== tempUserMsgId), { ...userMsg, id: Math.random().toString(36).substring(7) }, assistantMsg];
      });

      // Update active chat selection if it was a new chat
      if (!activeChatId) {
        setActiveChatId(data.chatId);
      }

      // Reload chat list to show new/renamed chats
      await fetchChats();
    } catch (err: any) {
      console.error("Chat sending error:", err);
      setError(err.message || "Failed to send message. Please verify OpenAI credentials.");
      
      // Roll back user message from conversation display on strict error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError(null);
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`/api/history?chatId=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (activeChatId === id) {
          handleNewChat();
        }
        fetchChats();
      } else {
        console.error("Failed to delete chat session");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get selected chat title
  const activeChatTitle = chats.find((c) => c.id === activeChatId)?.title || "New Chat";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />
      <main className="flex-1 h-full flex flex-col min-w-0">
        <ChatArea
          chatId={activeChatId}
          chatTitle={activeChatTitle}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          error={error}
        />
      </main>
    </div>
  );
}
