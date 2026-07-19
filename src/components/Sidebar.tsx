"use client";

import Link from "next/link";
import { MessageSquare, Plus, Trash2, Database, Menu, X, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { data: session } = useSession();
  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-white sticky top-0 z-40">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="font-semibold text-sm tracking-tight">AI Customer Support</div>
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
          aria-label="New Chat"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 md:sticky md:z-30 w-72 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              CS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">Support Bot</span>
              <span className="text-[10px] text-muted-foreground font-medium">v1.0 Pro</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onToggle();
            }}
            className="w-full py-2.5 px-4 bg-white border border-border rounded-lg text-sm font-medium text-foreground shadow-xs hover:bg-secondary hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            New Chat
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Conversations
          </div>
          {chats.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No chat history yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between rounded-lg text-sm transition-all ${
                  activeChatId === chat.id
                    ? "bg-white border border-border shadow-xs font-medium text-foreground"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground border border-transparent"
                }`}
              >
                <button
                  onClick={() => {
                    onSelectChat(chat.id);
                    if (window.innerWidth < 768) onToggle();
                  }}
                  className="flex-1 text-left px-3 py-2.5 flex items-start gap-2.5 truncate cursor-pointer"
                >
                  <MessageSquare className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
                    activeChatId === chat.id ? "text-primary" : "text-slate-400"
                  }`} />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 mr-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all cursor-pointer"
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border bg-slate-50/50">
          <Link
            href="/knowledge"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-slate-100 font-medium transition-all group border border-transparent hover:border-border"
          >
            <Database className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Knowledge Base</span>
          </Link>

          {session?.user && (
            <>
              <div className="my-2 border-t border-sidebar-border" />
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2.5 px-3 py-1">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 truncate">{session.user.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{session.user.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/5 font-medium transition-all cursor-pointer border border-transparent hover:border-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
