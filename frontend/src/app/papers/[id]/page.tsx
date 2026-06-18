'use client';

import Link from "next/link";
import { use, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  Cpu, 
  BookOpen, 
  Layers, 
  Download,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Paper {
  id: string;
  title: string;
  pdfUrl: string;
  abstract: string | null;
  introduction: string | null;
  methodology: string | null;
  results: string | null;
  conclusion: string | null;
  summary: string | null;
  keyContributions: string | null;
  findings: string | null;
  limitations: string | null;
  futureWork: string | null;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  citations: { chunkIndex: number; distance: number }[] | null;
}

export default function PaperWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  // Active navigation states
  const [activeLeftTab, setActiveLeftTab] = useState<'reader' | 'insights'>('reader');
  const [activeSection, setActiveSection] = useState<'abstract' | 'introduction' | 'methodology' | 'results' | 'conclusion'>('abstract');
  const [explainMode, setExplainMode] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'flashcards' | 'equations'>('chat');

  // Input states
  const [chatMessage, setChatMessage] = useState("");
  const [equationInput, setEquationInput] = useState("");
  const [equationExplanation, setEquationExplanation] = useState<string | null>(null);
  
  // Flashcard states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Chat scroll anchor
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch paper details
  const { data: paper, isLoading: paperLoading, error: paperError } = useQuery<Paper>({
    queryKey: ['paper', id],
    queryFn: async () => {
      const response = await api.get(`/papers/${id}`);
      return response.data;
    },
  });

  // 2. Fetch explanation for active section and mode
  const { data: explanationData, isLoading: explanationLoading, error: explanationError } = useQuery({
    queryKey: ['explanation', id, activeSection, explainMode],
    queryFn: async () => {
      const response = await api.get(`/papers/${id}/explain`, {
        params: { section: activeSection, mode: explainMode },
      });
      return response.data.explanation;
    },
    enabled: !!paper && activeLeftTab === 'reader',
  });

  // 3. Fetch flashcards
  const { data: flashcards = [], isLoading: flashcardsLoading } = useQuery<Flashcard[]>({
    queryKey: ['flashcards', id],
    queryFn: async () => {
      const response = await api.get(`/papers/${id}/flashcards`);
      return response.data.flashcards;
    },
    enabled: activeRightTab === 'flashcards',
  });

  // 4. Fetch chat history
  const { data: chatHistory = [], isLoading: chatLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chat', id],
    queryFn: async () => {
      const response = await api.get(`/papers/${id}/chat`);
      return response.data.chatHistory;
    },
    enabled: activeRightTab === 'chat',
  });

  // 5. Send message mutation
  const chatMutation = useMutation({
    mutationFn: async (msg: string) => {
      const response = await api.post(`/papers/${id}/chat`, { message: msg });
      return response.data.chat;
    },
    onSuccess: () => {
      setChatMessage("");
      queryClient.invalidateQueries({ queryKey: ['chat', id] });
    },
  });

  // 6. Simplify equation mutation
  const equationMutation = useMutation({
    mutationFn: async (eq: string) => {
      const response = await api.post(`/papers/${id}/simplify-equation`, { equation: eq });
      return response.data.explanation;
    },
    onSuccess: (data) => {
      setEquationExplanation(data);
    },
  });

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatMutation.isPending]);

  // Flip flashcard toggler
  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim().length > 0) {
      chatMutation.mutate(chatMessage.trim());
    }
  };

  const handleSimplifyEquation = (e: React.FormEvent) => {
    e.preventDefault();
    if (equationInput.trim().length > 0) {
      equationMutation.mutate(equationInput.trim());
    }
  };

  if (paperLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading paper workspace...</span>
      </div>
    );
  }

  if (paperError || !paper) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-white">Workspace failed to load</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          Make sure the paper has completed processing in the dashboard.
        </p>
        <Button asChild variant="outline" className="border-slate-800 text-slate-300">
          <Link href="/upload">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Workspace Header */}
      <header className="border-b border-slate-900 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Button asChild variant="outline" size="sm" className="border-slate-800 text-slate-400 hover:text-white rounded-lg h-9">
            <Link href="/upload" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm text-white truncate max-w-xl">{paper.title}</h1>
            <span className="text-[10px] text-slate-500 font-light block">ResearchEase Workspace</span>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 rounded-lg h-9 shadow shadow-indigo-500/5">
          <a href={`http://localhost:5000${paper.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
            <Download className="h-4 w-4" /> Download PDF
          </a>
        </Button>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 grid lg:grid-cols-2 overflow-hidden h-[calc(100vh-69px)]">
        
        {/* Left Column: Explorer Pane */}
        <div className="border-r border-slate-900 flex flex-col h-full bg-slate-950/20">
          
          {/* Tabs header */}
          <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950/60 px-6 py-3 shrink-0">
            <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800/80">
              <button
                onClick={() => setActiveLeftTab('reader')}
                className={`text-xs font-bold px-4 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeLeftTab === 'reader'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" /> AI Section Reader
              </button>
              <button
                onClick={() => setActiveLeftTab('insights')}
                className={`text-xs font-bold px-4 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeLeftTab === 'insights'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Smart Insights
              </button>
            </div>

            {/* Explain modes (only visible on section reader) */}
            {activeLeftTab === 'reader' && (
              <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                {(['beginner', 'intermediate', 'expert'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setExplainMode(m)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all ${
                      explainMode === m
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pane Scrollable Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode="wait">
              {activeLeftTab === 'reader' ? (
                <motion.div
                  key="reader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Section tabs grid */}
                  <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-900/50 border border-slate-800/50 text-center text-xs">
                    {(['abstract', 'introduction', 'methodology', 'results', 'conclusion'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSection(s)}
                        className={`py-2 rounded-lg font-bold transition-all capitalize border ${
                          activeSection === s
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                        }`}
                      >
                        {s === 'introduction' ? 'Intro' : s === 'methodology' ? 'Method' : s}
                      </button>
                    ))}
                  </div>

                  {/* Section text display */}
                  <div className="grid gap-6">
                    <Card className="border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
                      <CardHeader className="border-b border-slate-900/60 bg-slate-900/20 py-3 px-5">
                        <CardTitle className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-indigo-400" /> Extracted Original Text
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 max-h-56 overflow-y-auto">
                        <p className="text-xs leading-relaxed text-slate-400 font-light whitespace-pre-wrap">
                          {paper[activeSection] || 'No original section text was extracted.'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-indigo-950 bg-indigo-950/5 rounded-xl overflow-hidden shadow-lg shadow-indigo-950/20">
                      <CardHeader className="border-b border-indigo-900/30 bg-indigo-950/15 py-3 px-5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                          <Cpu className="h-4 w-4 text-indigo-400" /> AI {explainMode.charAt(0).toUpperCase() + explainMode.slice(1)} Explanation
                        </CardTitle>
                        {explanationLoading && (
                          <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                        )}
                      </CardHeader>
                      <CardContent className="p-5 min-h-36">
                        {explanationLoading ? (
                          <div className="flex flex-col items-center justify-center p-8 space-y-2">
                            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                            <span className="text-[10px] text-slate-500 font-light">Analyzing technical terminology...</span>
                          </div>
                        ) : explanationError ? (
                          <div className="text-red-400 text-xs font-light p-4 text-center">
                            Failed to generate explanation. Check your internet connection or API settings.
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed text-slate-200 font-light whitespace-pre-wrap">
                            {explanationData}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6"
                >
                  {[
                    { title: "Smart Summary", val: paper.summary },
                    { title: "Key Contributions", val: paper.keyContributions },
                    { title: "Findings & Outputs", val: paper.findings },
                    { title: "Limitations & Boundaries", val: paper.limitations },
                    { title: "Future Work Suggestions", val: paper.futureWork },
                  ].map((insight) => (
                    <Card key={insight.title} className="border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
                      <CardHeader className="border-b border-slate-900/60 bg-slate-900/20 py-2.5 px-4">
                        <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> {insight.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-xs sm:text-sm leading-relaxed text-slate-300 font-light whitespace-pre-wrap">
                          {insight.val || 'Insight not yet processed.'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Study Copilot */}
        <div className="flex flex-col h-full bg-slate-950/40">
          
          {/* Tab headers */}
          <div className="flex border-b border-slate-900 bg-slate-950/60 px-6 py-3 shrink-0">
            <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800/80 w-full">
              {[
                { tab: 'chat', label: 'AI RAG Chat', icon: MessageSquare },
                { tab: 'flashcards', label: 'Flashcards', icon: Sparkles },
                { tab: 'equations', label: 'Equations', icon: Cpu },
              ].map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  onClick={() => setActiveRightTab(tab as 'chat' | 'flashcards' | 'equations')}
                  className={`text-xs font-bold py-1.5 rounded-md transition-all flex-1 flex items-center justify-center gap-1.5 ${
                    activeRightTab === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pane Scrollable Contents */}
          <div className="flex-1 overflow-y-auto p-6 h-full flex flex-col min-h-0">
            <AnimatePresence mode="wait">
              
              {/* 1. AI RAG Chat Tab */}
              {activeRightTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col justify-between h-full min-h-0"
                >
                  {/* Message History list */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-0">
                    {chatLoading ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-2">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        <span className="text-[10px] text-slate-500 font-light">Loading conversations...</span>
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                        <MessageSquare className="h-10 w-10 text-slate-700" />
                        <h4 className="font-bold text-sm text-slate-400">Grounded Paper Chatbot</h4>
                        <p className="text-xs text-slate-500 font-light max-w-xs">
                          Ask questions about methodology, architectural specifications, or limits. Responses are grounded strictly inside the paper.
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 items-start ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"><Sparkles className="h-4 w-4 text-white" /></div>
                          )}

                          <div
                            className={`p-3 rounded-xl max-w-[85%] text-xs sm:text-sm leading-relaxed font-light ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            
                            {/* Citations metadata indicator */}
                            {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[9px] text-slate-500 font-medium">
                                <span className="uppercase text-[8px] font-bold text-indigo-400 tracking-wider">Citations:</span>
                                {msg.citations.map((c, i) => (
                                  <span key={i} className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded font-mono text-indigo-400">
                                    Source Chunk #{c.chunkIndex + 1}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {msg.role === 'user' && (
                            <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase shrink-0">U</div>
                          )}
                        </div>
                      ))
                    )}
                    
                    {chatMutation.isPending && (
                      <div className="flex gap-3 justify-start items-start">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0"><Sparkles className="h-4 w-4 text-white" /></div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                          <span className="text-xs font-light">Searching chunks and compiling answer...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Send chat textbox form */}
                  <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-900 pt-3 bg-slate-950/40 shrink-0">
                    <input
                      type="text"
                      placeholder="Ask the paper chatbot a question..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={chatMutation.isPending}
                      className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-900 rounded-xl focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                    />
                    <Button 
                      type="submit" 
                      disabled={chatMutation.isPending || chatMessage.trim().length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-4"
                    >
                      Send
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* 2. Study Flashcards Tab */}
              {activeRightTab === 'flashcards' && (
                <motion.div
                  key="flashcards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 space-y-4"
                >
                  {flashcardsLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-2">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      <span className="text-xs text-slate-500">Generating study cards...</span>
                    </div>
                  ) : flashcards.length === 0 ? (
                    <div className="text-center p-8 text-slate-500 text-xs font-light">
                      No flashcards generated for this paper.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {flashcards.map((card, idx) => {
                        const cardFlipped = !!flippedCards[card.id];

                        return (
                          <div 
                            key={card.id}
                            onClick={() => toggleFlip(card.id)}
                            className="h-44 cursor-pointer perspective relative"
                          >
                            <motion.div
                              animate={{ rotateY: cardFlipped ? 180 : 0 }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="w-full h-full transform-style-3d relative"
                            >
                              {/* Front */}
                              <div className="absolute inset-0 w-full h-full p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between backface-hidden">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                                  <span>Flashcard #{idx + 1}</span>
                                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                </div>
                                <p className="text-center text-xs sm:text-sm text-slate-200 py-2 leading-relaxed font-light">
                                  {card.question}
                                </p>
                                <span className="text-center text-[9px] text-indigo-400 font-medium">Click to Reveal Answer</span>
                              </div>

                              {/* Back */}
                              <div className="absolute inset-0 w-full h-full p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-between backface-hidden rotateY-180">
                                <div className="flex justify-between items-center text-[10px] text-indigo-400 font-semibold uppercase">
                                  <span>Answer</span>
                                  <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
                                </div>
                                <p className="text-center text-[11px] sm:text-xs text-slate-300 py-2 leading-relaxed font-light">
                                  {card.answer}
                                </p>
                                <span className="text-center text-[9px] text-indigo-400 font-medium">Click to Flip Back</span>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* 3. Equations Simplifier Tab */}
              {activeRightTab === 'equations' && (
                <motion.div
                  key="equations"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 space-y-6"
                >
                  <Card className="border-slate-900 bg-slate-900/10 rounded-xl">
                    <CardHeader className="py-4 px-5">
                      <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-indigo-400" /> Equation Simplifier
                      </CardTitle>
                      <CardDescription className="text-xs font-light text-slate-400">
                        Input any mathematical formula, LaTeX, or equation below to get an automated explanation of symbols and relationships.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <form onSubmit={handleSimplifyEquation} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. f(x) = E_c * (1 - e^(-x)) or E = mc^2"
                          value={equationInput}
                          onChange={(e) => setEquationInput(e.target.value)}
                          disabled={equationMutation.isPending}
                          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-900 rounded-xl focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                        />
                        <Button 
                          type="submit" 
                          disabled={equationMutation.isPending || equationInput.trim().length === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-4"
                        >
                          {equationMutation.isPending ? 'Solving...' : 'Simplify'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Explanation output display */}
                  <AnimatePresence mode="wait">
                    {equationMutation.isPending && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col items-center justify-center p-8 space-y-2 rounded-xl border border-slate-900 bg-slate-900/10"
                      >
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        <span className="text-[10px] text-slate-500 font-light">Breaking down equations, variables & examples...</span>
                      </motion.div>
                    )}

                    {!equationMutation.isPending && equationExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <Card className="border-indigo-950 bg-indigo-950/5 rounded-xl overflow-hidden shadow-lg shadow-indigo-950/20">
                          <CardHeader className="border-b border-indigo-900/30 bg-indigo-950/15 py-3 px-5">
                            <CardTitle className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4 text-indigo-400" /> Explanation breakdown
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5">
                            <div className="text-xs sm:text-sm leading-relaxed text-slate-200 font-light whitespace-pre-wrap font-sans">
                              {equationExplanation}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
