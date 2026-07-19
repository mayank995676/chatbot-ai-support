"use client";

import Link from "next/link";
import { Plus, Database, Menu, X, LogOut, MessageSquare } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
}: SidebarProps) {
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="font-semibold text-sm tracking-tight text-white">AI Customer Support</div>
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
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
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
          <div className="flex items-center gap-2.5 font-semibold text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/20">
              WR
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">White Rabbit</span>
              <span className="text-[10px] text-muted-foreground font-medium">AI Support Agent</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Button: Clear/New Chat */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onToggle();
            }}
            className="w-full py-2.5 px-4 bg-slate-900 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 text-violet-400" />
            New Conversation
          </button>
        </div>

        {/* Empty Middle Spacing */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-border flex items-center justify-center mb-3">
            <MessageSquare className="h-5 w-5 text-violet-400" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Your conversation logs are saved securely and locally in your browser.
          </p>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border bg-slate-950/20">
          <Link
            href="/knowledge"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-slate-900 font-medium transition-all group border border-transparent hover:border-border"
          >
            <Database className="h-4.5 w-4.5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
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
                    <span className="text-xs font-semibold text-slate-200 truncate">{session.user.name}</span>
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
