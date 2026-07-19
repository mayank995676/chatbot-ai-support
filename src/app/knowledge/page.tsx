"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Upload, FileText, Trash2, ArrowLeft, Loader2, Database, AlertCircle, CheckCircle2 } from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  _count?: {
    chunks: number;
  };
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "indexing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/document");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setErrorState(null);

    // 1. Validation
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "txt") {
      setErrorState("Unsupported format. Please upload PDF or TXT files only.");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setErrorState("File exceeds the 5MB size limit.");
      return;
    }

    // 2. Upload Lifecycle
    setUploadStatus("uploading");
    setProgress(15);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progression
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 80) {
            clearInterval(interval);
            return 80;
          }
          return prev + 10;
        });
      }, 300);

      setProgress(40);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed.");
      }

      setProgress(95);
      setUploadStatus("indexing");

      // Small delay to simulate vector DB parsing complete
      setTimeout(() => {
        setProgress(100);
        setUploadStatus("success");
        fetchDocuments();
        setTimeout(() => setUploadStatus("idle"), 3000);
      }, 1000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorState(err.message || "Failed to parse and index document.");
    }
  };

  const setErrorState = (msg: string | null) => {
    setErrorMessage(msg);
    if (msg) {
      setUploadStatus("error");
    } else {
      setUploadStatus("idle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/document?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col antialiased">
      {/* Background radial gradient mesh for 3D effect */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03)_0px,transparent_60%)]" />

      {/* Header */}
      <header className="px-6 py-4 md:px-12 border-b border-border bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 border border-border rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2.5 font-semibold text-slate-100">
            <Database className="h-5 w-5 text-violet-400" />
            <h1 className="text-base tracking-tight">Knowledge Base</h1>
          </div>
        </div>
        <Link
          href="/chat"
          className="text-xs font-semibold px-4 py-2 border border-border rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
        >
          Return to Chat
        </Link>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 md:py-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Upload Company Documents
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The AI customer support chatbot searches vectors and uses these documents strictly to construct responses. Only PDF and TXT documents up to 5MB are accepted.
          </p>
        </div>

        {/* Upload Drop Zone card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-violet-500 bg-violet-950/20 shadow-lg shadow-violet-500/10"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.txt"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 mb-4 border border-slate-800 shadow-inner">
            <Upload className="h-5 w-5 text-violet-400" />
          </div>

          <h3 className="font-semibold text-sm text-slate-200 mb-1">
            Drag & drop files or click to upload
          </h3>
          <p className="text-xs text-muted-foreground">PDF or TXT up to 5MB</p>
        </div>

        {/* Stateful Progress Area */}
        {uploadStatus !== "idle" && (
          <div className="p-5 bg-slate-900/60 border border-border rounded-2xl shadow-xl backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium">
                {uploadStatus === "uploading" && (
                  <>
                    <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                    <span>Uploading and reading document...</span>
                  </>
                )}
                {uploadStatus === "indexing" && (
                  <>
                    <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                    <span>Chunking & generating vector segments...</span>
                  </>
                )}
                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Document indexed successfully!</span>
                  </>
                )}
                {uploadStatus === "error" && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive font-semibold">Failed to process file</span>
                  </>
                )}
              </div>
              <span className="text-muted-foreground font-semibold">{Math.round(progress)}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  uploadStatus === "error"
                    ? "bg-destructive"
                    : uploadStatus === "success"
                    ? "bg-emerald-500"
                    : "bg-violet-500 animate-pulse"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {uploadStatus === "error" && errorMessage && (
              <p className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {/* Uploaded Files Table */}
        <div className="bg-slate-900/40 border border-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="px-5 py-4 border-b border-border bg-slate-950/40 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-200">
              Uploaded Documents ({documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
              <FileText className="h-8 w-8 text-slate-800 mb-3" />
              <p className="text-xs">No documents uploaded yet</p>
              <p className="text-[10px] mt-1 text-slate-500">
                Upload files to populate the chatbot's knowledge base.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-400">
                      <FileText className="h-4.5 w-4.5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="uppercase">{doc.type}</span>
                        <span>&bull;</span>
                        <span>{formatSize(doc.size)}</span>
                        <span>&bull;</span>
                        <span>{doc._count?.chunks || 0} chunks</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-500 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
