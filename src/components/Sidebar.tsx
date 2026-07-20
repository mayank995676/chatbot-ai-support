"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Database, Menu, X, LogOut, MessageSquare, Sun, Moon, CreditCard, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeContext";

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
  const { theme, toggleTheme } = useTheme();
  const [subscription, setSubscription] = useState("Free");

  useEffect(() => {
    const activeSub = localStorage.getItem("user_subscription_tier") || "Free";
    setSubscription(activeSub);
  }, []);

  // Sync state if subscription changes
  useEffect(() => {
    const handleFocus = () => {
      const activeSub = localStorage.getItem("user_subscription_tier") || "Free";
      setSubscription(activeSub);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="font-semibold text-sm tracking-tight text-foreground">AI Customer Support</div>
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
          <div className="flex items-center gap-2.5 font-semibold text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
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
            className="w-full py-2.5 px-4 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 text-primary" />
            New Conversation
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Workspace
          </div>

          <Link
            href="/knowledge"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary font-medium transition-all group"
          >
            <Database className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Corpus Corpus</span>
          </Link>

          <Link
            href="/pricing"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary font-medium transition-all group"
          >
            <CreditCard className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Subscription pricing</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary font-medium transition-all group"
          >
            <Settings className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Agent Control Center</span>
          </Link>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border bg-secondary/35 space-y-3">
          {/* Light / Dark Mode Toggle button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-secondary border border-border bg-card transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === "light" ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-violet-400" /> Dark Mode
                </>
              )}
            </span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border uppercase">
              Toggle
            </span>
          </button>

          {session?.user && (
            <>
              <div className="border-t border-sidebar-border pt-3">
                <div className="flex items-center justify-between gap-2.5 px-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate">{session.user.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{session.user.email}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    subscription === "Pro"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}>
                    {subscription}
                  </span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2.5 mt-3 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/5 font-medium transition-all cursor-pointer border border-transparent hover:border-destructive/10"
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
