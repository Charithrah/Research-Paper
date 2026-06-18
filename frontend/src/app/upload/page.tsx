'use client';

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Paper {
  id: string;
  title: string;
  pdfUrl: string;
  createdAt: string;
  summary: string | null;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch papers list
  const { data: papers = [], isLoading } = useQuery<Paper[]>({
    queryKey: ['papers'],
    queryFn: async () => {
      const response = await api.get('/papers');
      return response.data;
    },
    refetchInterval: 5000, // Poll every 5s to update processing statuses
  });

  // 2. Upload paper mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage("Paper uploaded! The AI is analyzing it in the background.");
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setUploadError(axiosError.response?.data?.message || "Failed to upload file. Make sure it's a PDF under 10MB.");
      setSuccessMessage(null);
    },
  });

  // 3. Delete paper mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/papers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
    },
  });

  // React Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      
      {/* Ambient background blur */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="border-slate-800 text-slate-400 hover:text-white rounded-xl">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>ResearchEase Dashboard</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Research Library</h1>
          <p className="text-slate-400 text-sm font-light">
            Upload new papers to trigger layout parsing, text extraction, semantic indexation, and summary generation.
          </p>
        </div>

        {/* Upload Zone */}
        <div 
          {...getRootProps()} 
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer backdrop-blur-xl transition-all ${
            isDragActive 
              ? 'border-indigo-500 bg-indigo-500/5' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
          } ${uploadMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800/80 text-slate-400 shadow-inner">
              {uploadMutation.isPending ? (
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              ) : (
                <UploadCloud className="h-8 w-8 text-indigo-400" />
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {uploadMutation.isPending 
                  ? "Uploading & Segmenting Paper..." 
                  : isDragActive 
                    ? "Drop the PDF here" 
                    : "Drag & drop a research paper PDF"
                }
              </h3>
              <p className="text-slate-500 text-xs font-light">PDF files only (max 10MB)</p>
            </div>

            {uploadMutation.isPending && (
              <span className="text-xs text-indigo-400 font-semibold animate-pulse">Running PDF Parsing & pgvector Chunking...</span>
            )}
          </div>
        </div>

        {/* Success/Error Alerts */}
        <AnimatePresence mode="wait">
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-xs font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-green-300 text-xs font-medium"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Papers Library */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" /> Documents Library ({papers.length})
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-500">Loading documents...</span>
            </div>
          ) : papers.length === 0 ? (
            <Card className="border-slate-900 bg-slate-900/10 rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-2">
                <FileText className="h-10 w-10 text-slate-600" />
                <h3 className="font-bold text-slate-400">No papers uploaded</h3>
                <p className="text-slate-500 text-xs font-light max-w-sm">
                  Drag your first academic research paper PDF in the zone above to begin studying with AI support.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {papers.map((paper) => {
                const isProcessing = !paper.summary;

                return (
                  <motion.div
                    key={paper.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 hover:border-slate-800/80 hover:bg-slate-900/40 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-850/80 shrink-0 ${isProcessing ? 'text-slate-500' : 'text-indigo-400'}`}>
                        {isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {isProcessing ? (
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-sm text-slate-400 truncate max-w-md">{paper.title}</span>
                            <span className="text-[10px] text-indigo-400 font-semibold animate-pulse">AI is parsing sections, generating flashcards & embeddings...</span>
                          </div>
                        ) : (
                          <Link 
                            href={`/papers/${paper.id}`}
                            className="font-bold text-sm text-slate-200 hover:text-indigo-400 transition-colors truncate block max-w-md hover:underline"
                          >
                            {paper.title}
                          </Link>
                        )}
                        <span className="text-[10px] text-slate-500 font-light block mt-0.5">
                          Uploaded on {new Date(paper.createdAt).toLocaleDateString()} at {new Date(paper.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isProcessing && (
                        <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold h-8 shadow-md shadow-indigo-600/10">
                          <Link href={`/papers/${paper.id}`}>Open Workspace</Link>
                        </Button>
                      )}

                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this paper?")) {
                            deleteMutation.mutate(paper.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}