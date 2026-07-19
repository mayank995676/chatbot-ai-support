import Link from "next/link";
import { MessageSquare, ArrowRight, ShieldCheck, FileText, Database } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-bold tracking-tight text-slate-800 text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm">
            CS
          </div>
          <span>SupportAgent</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/knowledge" className="text-slate-600 hover:text-slate-900 transition-colors">
            Knowledge Base
          </Link>
          <Link
            href="/chat"
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            Start Chat
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 py-12 md:py-20 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold tracking-wide mb-6">
          <ShieldCheck className="h-4.5 w-4.5" />
          Factual RAG AI Customer Support
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
          The AI Chatbot Trained On <br />
          <span className="text-primary">Your Own Knowledge Base</span>
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Upload PDFs, guides, or text files, and get instant ChatGPT-like customer answers verified strictly against your documents. No hallucinations, no generic replies.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-7 py-3.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Chatting
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/knowledge"
            className="w-full sm:w-auto px-7 py-3.5 bg-white border border-border text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Database className="h-4.5 w-4.5 text-slate-500" />
            Manage Knowledge Base
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-slate-100 mt-6">
          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">100% Fact Checked</h3>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              If an answer is not found in the uploaded documents, the AI replies strictly with a disclaimer. No database hallucinations.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">PDF & TXT Parsing</h3>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Support for uploading PDF guides, pamphlets, manuals, and text files. Automated text chunking and vector storage.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">ChatGPT UI</h3>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              A premium, responsive chat interface featuring Markdown formatting, syntax highlighted code blocks, copy actions, and historical sessions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SupportAgent. Built for production-quality assessments.
      </footer>
    </div>
  );
}
