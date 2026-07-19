"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Copy, Check, MessageSquare, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: string; // "user" or "assistant"
  content: string;
  createdAt: string;
}

interface ChatAreaProps {
  chatId: string | null;
  chatTitle: string;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  error: string | null;
}

// Inline Markdown Parser Components
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-200 text-xs">
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-b border-slate-700 text-[10px] font-medium text-slate-400">
        <span className="uppercase tracking-wider">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-slate-100 leading-relaxed max-w-full">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="px-1.5 py-0.5 rounded-md bg-secondary text-slate-800 text-xs font-mono border border-slate-200">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, idx) => {
        if (line.trim() === "") {
          return <div key={idx} className="h-2" />;
        }
        
        // Bullet list item
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const itemText = line.trim().substring(2);
          return (
            <ul key={idx} className="list-disc pl-5 my-1.5 space-y-1">
              <li className="text-slate-700 leading-relaxed">{parseInline(itemText)}</li>
            </ul>
          );
        }

        // Numbered list item
        const matchOrdered = line.trim().match(/^(\d+)\.\s(.*)/);
        if (matchOrdered) {
          const itemText = matchOrdered[2];
          return (
            <ol key={idx} className="list-decimal pl-5 my-1.5 space-y-1" start={parseInt(matchOrdered[1])}>
              <li className="text-slate-700 leading-relaxed">{parseInline(itemText)}</li>
            </ol>
          );
        }

        return <p key={idx} className="text-slate-700 leading-relaxed my-1.5">{parseInline(line)}</p>;
      })}
    </>
  );
}

function Markdown({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="prose text-sm max-w-none text-slate-700 space-y-1.5">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const code = match ? match[2] : part.slice(3, -3);
          return <CodeBlock key={index} language={lang} code={code.trim()} />;
        }
        return <RichText key={index} text={part} />;
      })}
    </div>
  );
}

export default function ChatArea({
  chatId,
  chatTitle,
  messages,
  isLoading,
  onSendMessage,
  error,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust input box height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = async (msgId: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const samplePrompts = [
    "What company documents have been uploaded?",
    "How does the customer support process work?",
    "Show me instructions for file deletion.",
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* Scrollable Conversation History */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-primary mb-6">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-2">
                Ask anything from the Company Knowledge Base
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                Upload business guides, FAQs, policy files in the Knowledge Base, and the assistant will answer based on their contents.
              </p>

              <div className="w-full max-w-lg grid grid-cols-1 gap-2.5">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(prompt)}
                    className="w-full text-left p-3.5 border border-border rounded-xl text-xs text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                  msg.role === "user"
                    ? "bg-slate-50 border-slate-100 flex-row-reverse"
                    : "bg-white border-border"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.role === "user" ? "U" : "AI"}
                </div>

                {/* Message Body */}
                <div className="flex-1 space-y-2.5 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 capitalize">
                      {msg.role === "user" ? "You" : "Support Bot"}
                    </span>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer"
                        title="Copy message response"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-sm">
                    <Markdown content={msg.content} />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* AI Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4 p-4 rounded-2xl border bg-white border-border">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-200">
                AI
              </div>
              <div className="flex-1 py-1.5 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 typing-dot"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 typing-dot"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 typing-dot"></span>
              </div>
            </div>
          )}

          {/* Error Message banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Container */}
      <div className="p-4 border-t border-border bg-white sticky bottom-0 z-30">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 rounded-2xl shadow-xs transition-all overflow-hidden bg-slate-50">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask support bot a question... (Enter to send, Shift+Enter for new line)"
              className="w-full pl-4 pr-12 py-3.5 text-sm bg-transparent border-0 ring-0 focus:outline-hidden focus:ring-0 resize-none max-h-48 overflow-y-auto leading-relaxed placeholder:text-muted-foreground text-slate-800"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-3.5 bottom-2.5 p-1.5 bg-primary hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="text-[10px] text-center text-muted-foreground mt-2 tracking-wide font-medium">
            AI Customer Support answers based strictly on uploaded knowledge base files.
          </div>
        </div>
      </div>
    </div>
  );
}
