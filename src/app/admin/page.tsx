"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sliders, Database, Activity, Settings, MessageSquare, FileText, BarChart } from "lucide-react";

export default function AdminPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.1);
  const [modelName, setModelName] = useState("llama-3.3-70b-versatile");
  const [messageLimit, setMessageLimit] = useState(5);
  
  const [stats, setStats] = useState({
    chunkCount: 0,
    docCount: 0,
    chatCount: 0,
    messageCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSystemPrompt(data.settings.systemPrompt);
          setTemperature(data.settings.temperature);
          setModelName(data.settings.modelName);
          setMessageLimit(data.settings.messageLimit);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        throw new Error("Failed to load settings.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching dashboard settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          temperature,
          modelName,
          messageLimit,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Failed to save settings.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-muted-foreground mt-2 font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 font-semibold">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="text-base tracking-tight">Agent Control Center</h1>
          </div>
        </div>
        <Link
          href="/knowledge"
          className="text-xs font-semibold px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-secondary transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Database className="h-4 w-4 text-primary" />
          Manage Corpus Data
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Banner */}
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Admin settings</h2>
          <p className="text-xs text-muted-foreground">
            Customize system-wide behavior, manage limits, adjust Groq temperature, and check server metrics.
          </p>
        </div>

        {/* Analytics Card metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card/50 border border-border rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Documents</p>
              <h4 className="text-lg font-bold mt-0.5">{stats.docCount}</h4>
            </div>
          </div>
          <div className="p-4 bg-card/50 border border-border rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Chunks</p>
              <h4 className="text-lg font-bold mt-0.5">{stats.chunkCount}</h4>
            </div>
          </div>
          <div className="p-4 bg-card/50 border border-border rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Conversations</p>
              <h4 className="text-lg font-bold mt-0.5">{stats.chatCount}</h4>
            </div>
          </div>
          <div className="p-4 bg-card/50 border border-border rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Messages</p>
              <h4 className="text-lg font-bold mt-0.5">{stats.messageCount}</h4>
            </div>
          </div>
        </div>

        {/* Configuration settings form */}
        <form onSubmit={handleSave} className="bg-card/50 border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          {error && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Model selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                Active Groq Completion Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7b (MoE)</option>
              </select>
            </div>

            {/* Temperature controller */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">
                  Temperature ({temperature})
                </label>
                <span className="text-[10px] text-muted-foreground italic">Lower = more precise</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free plan message guard limit */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                Free Plan Message Limit
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={messageLimit}
                onChange={(e) => setMessageLimit(parseInt(e.target.value, 10))}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary outline-none"
              />
              <p className="text-[10px] text-muted-foreground">
                Sets the max messages allowed in a single chat session for Free users.
              </p>
            </div>
          </div>

          {/* System Prompt block */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-muted-foreground block">
              Base System Instruction Prompt (System Role)
            </label>
            <textarea
              rows={8}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3.5 border border-border rounded-xl bg-background text-xs font-mono leading-relaxed outline-none focus:ring-1 focus:ring-primary"
              placeholder="Configure system prompts..."
            />
            <p className="text-[10px] text-muted-foreground">
              Define formatting rules and fallback behavior parameters context constraints for Groq replies.
            </p>
          </div>

          {/* Action trigger button */}
          <div className="pt-4 flex items-center justify-between border-t border-border/80">
            <div>
              {success && (
                <span className="text-xs text-emerald-500 font-bold">
                  ✓ Config successfully synchronized!
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primary text-white hover:bg-primary/95 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Config"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
