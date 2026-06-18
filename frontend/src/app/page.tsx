'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  FileText, 
  MessageSquare, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  HelpCircle, 
  CheckCircle,
  Database,
  Search
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [activeExplainMode, setActiveExplainMode] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [isFlipped, setIsFlipped] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mockExplanations = {
    beginner: "Imagine the model is cleaning a highway: it sweeps away empty lanes so cars move faster. In computers, this makes the AI run 3 times faster on your phone without making mistakes!",
    intermediate: "This paper introduces a neural network pruning technique. By evaluating filter sensitivity, it cuts out non-essential nodes. This reduces FLOPs by 3.4x, keeping accuracy within 0.15% of the original model.",
    expert: "The authors propose a gradient-weighted channel activation pruning framework. Saliency maps are computed to selectively eliminate low-impact filters, yielding a compact sub-network with negligible ImageNet accuracy degradation."
  };

  const faqs = [
    {
      q: "How does ResearchEase simplify research papers?",
      a: "ResearchEase parses PDFs, segments them into standard academic sections (Abstract, Intro, Methodology, etc.), and uses a powerful LLM to synthesize summaries and explain concepts across three customizable reader modes."
    },
    {
      q: "Is my uploaded data secure?",
      a: "Yes. Files are stored securely on the local server workspace, parsed locally, and indexed privately using a dedicated pgvector instance. We do not use your documents to train general public models."
    },
    {
      q: "What is pgvector and how is it used?",
      a: "pgvector is a vector database extension for PostgreSQL. ResearchEase chunks your PDF text, generates vector embeddings, and stores them in PostgreSQL to perform semantic context retrieval (RAG) during chat."
    },
    {
      q: "Can I use this without a Groq API key?",
      a: "Absolutely! The system includes a graceful Demo/Mock mode. If no API key is set, you will still experience the full interactive workflow with realistic simulated results."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span>Research<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Ease</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/10 rounded-xl">
            <Link href="/upload" className="flex items-center gap-1">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
            <Cpu className="h-3 w-3" /> Powered by LangChain + Groq + pgvector
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight text-white">
            Democratizing Academic Research with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Explainable AI
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 font-light leading-relaxed">
            Upload dense PDFs, instantly split them into standard sections, toggling explanation modes from kid-friendly to expert. Chat and study with auto-generated flashcards.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-xl shadow-indigo-500/10 text-base font-semibold">
              <Link href="/upload">Upload Research Paper</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 border-slate-800 text-slate-300 hover:bg-slate-900 rounded-xl text-base font-semibold">
              <a href="#demo">View Live Demo</a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Interactive AI Demo Preview */}
      <section id="demo" className="mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-1 md:p-2 backdrop-blur-xl shadow-2xl"
        >
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-900 px-4 py-3 bg-slate-900/60 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-semibold text-slate-500">Workspace / MobileNetV3_Pruning.pdf</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-indigo-400 font-mono">
              <Cpu className="h-3 w-3" /> Groq: Llama-3.3-70b
            </div>
          </div>

          {/* Workspace Grid */}
          <div className="grid md:grid-cols-2 gap-4 p-4 md:p-6 min-h-[400px]">
            {/* Left Side: Summary & Section toggling */}
            <div className="flex flex-col space-y-4 border-r border-slate-800/50 pr-0 md:pr-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-indigo-400" /> Section Explorer
                </h3>
                {/* Explain Modes Toggler */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {(['beginner', 'intermediate', 'expert'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveExplainMode(m)}
                      className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
                        activeExplainMode === m
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>Active Section: Methodology</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  </div>
                  <motion.p
                    key={activeExplainMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm leading-relaxed text-slate-300 font-light"
                  >
                    {mockExplanations[activeExplainMode]}
                  </motion.p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-3">
                  <span className="text-xs text-slate-500 font-light">Pruning Algorithm Visualization</span>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-10 rounded bg-indigo-500/20 border border-indigo-500/30" />
                    <span className="h-2 w-6 rounded bg-purple-500/20 border border-purple-500/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Showcase Tabs (Chat & Flashcard) */}
            <div className="flex flex-col space-y-4 pl-0 md:pl-6 pt-4 md:pt-0">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-400" /> Study Copilot
              </h3>
              
              <div className="grid grid-rows-2 gap-4 flex-1">
                {/* Micro Chat Showcase */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">U</div>
                      <div className="bg-slate-900 text-xs px-3 py-2 rounded-xl text-slate-300 max-w-[85%] font-light">
                        How does channel pruning maintain accuracy?
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow"><Sparkles className="h-3.5 w-3.5 text-white" /></div>
                      <div className="bg-slate-900/40 border border-indigo-500/20 text-xs px-3 py-2 rounded-xl text-slate-300 max-w-[85%] font-light">
                        By calculating activation sensitivity maps. Filters with low saliency scores are discarded, preserving key weights. <span className="text-[10px] text-indigo-400 font-mono">[Source Chunk #4]</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flippable Flashcard Demo */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="group relative cursor-pointer h-full perspective"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full duration-500 transform-style-3d relative"
                  >
                    {/* Front of Card */}
                    <div className="absolute inset-0 w-full h-full p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between backface-hidden">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Flashcard #1 (Concept)</span>
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <p className="text-center text-sm text-slate-200 py-4 font-light">
                        What does FLOPs measure in deep learning networks?
                      </p>
                      <span className="text-center text-[10px] text-indigo-400 font-semibold group-hover:underline">Click Card to Flip / Reveal Answer</span>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 w-full h-full p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col justify-between backface-hidden rotateY-180">
                      <div className="flex justify-between items-center text-xs text-indigo-400">
                        <span>Answer</span>
                        <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
                      </div>
                      <p className="text-center text-xs text-slate-300 py-4 leading-relaxed font-light">
                        Floating Point Operations. It indicates computational complexity: fewer FLOPs means the model is more lightweight and runs faster.
                      </p>
                      <span className="text-center text-[10px] text-indigo-400 font-semibold">Click to Flip Back</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-900 mt-12">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
            Engineered for Cognitive Efficiency
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400 font-light">
            We bypass reading fatigue by coupling layout parsing heuristics with local vector indexes and AI simplifications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "PDF Layout Parsing",
              desc: "Segments research papers into Title, Abstract, Introduction, Methodology, Results, and Conclusion automatically.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/5 border-indigo-500/10"
            },
            {
              icon: Layers,
              title: "Multi-Tier Explanation Modes",
              desc: "Toggle between Beginner (analogies), Intermediate (intuition), and Expert (fine technical details) views instantly.",
              color: "text-purple-400",
              bg: "bg-purple-500/5 border-purple-500/10"
            },
            {
              icon: Cpu,
              title: "Dynamic Equation Explainer",
              desc: "Hover or input formulas/LaTeX notation to get variables breakdown, meaning, and concrete real-world examples.",
              color: "text-pink-400",
              bg: "bg-pink-500/5 border-pink-500/10"
            },
            {
              icon: Database,
              title: "Local pgvector Storage",
              desc: "Encodes paper chunks using all-MiniLM-L6-v2 embeddings and saves them in PostgreSQL for instant local search.",
              color: "text-blue-400",
              bg: "bg-blue-500/5 border-blue-500/10"
            },
            {
              icon: MessageSquare,
              title: "AI Chat with Citations",
              desc: "Interact with a chatbot grounded entirely in your uploaded document, listing direct source chunk links for every response.",
              color: "text-teal-400",
              bg: "bg-teal-500/5 border-teal-500/10"
            },
            {
              icon: Sparkles,
              title: "Conceptual Flashcards",
              desc: "Studies key insights using automatically generated study flashcards saved to your database library.",
              color: "text-yellow-400",
              bg: "bg-yellow-500/5 border-yellow-500/10"
            }
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl border p-6 hover:-translate-y-1 transition-all ${f.bg} flex flex-col justify-between`}
            >
              <div>
                <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 w-fit mb-4`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400 font-light">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Research Workflow Visualization (Mermaid alternative) */}
      <section id="workflow" className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-900 bg-slate-900/10 rounded-3xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Under the Hood: RAG Architecture
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400 font-light">
            Upload to insight in five secure, automated pipeline stages.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-5 text-center">
          {[
            { step: "01", icon: FileText, name: "PDF Upload", desc: "PDF file parsed to raw text segments." },
            { step: "02", icon: Search, name: "Chunking", desc: "Text split into overlapping semantic blocks." },
            { step: "03", icon: Cpu, name: "Embedding", desc: "all-MiniLM-L6-v2 encodes vector strings." },
            { step: "04", icon: Database, name: "pgvector Index", desc: "Stored in Postgres with HNSW fast indexing." },
            { step: "05", icon: MessageSquare, name: "Grounded Chat", desc: "Retrieve top chunks and prompt Groq API." }
          ].map((item, index) => (
            <div key={item.name} className="relative flex flex-col items-center group">
              {/* Connector line (desktop only) */}
              {index < 4 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 border-t border-dashed border-slate-800 -z-10 group-hover:border-indigo-500/50 transition-colors" />
              )}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 shadow-md group-hover:border-indigo-500/40 group-hover:bg-slate-950 transition-all">
                <item.icon className="h-7 w-7 text-indigo-400" />
              </div>
              <span className="text-xs font-mono text-indigo-500 mt-3 uppercase tracking-widest">{item.step}</span>
              <h4 className="font-bold text-white text-base mt-2">{item.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light mt-1.5 px-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-20 border-t border-slate-900">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-xl text-slate-400 font-light">
            Answers to technical questions about layout parsing, pgvector, and offline support.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-900/10 p-4 transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between font-bold text-left text-white text-base"
              >
                <span>{faq.q}</span>
                <HelpCircle className={`h-5 w-5 text-indigo-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="mt-3 text-sm leading-relaxed text-slate-400 font-light border-t border-slate-900 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="relative mx-auto max-w-6xl px-6 py-16 text-center bg-gradient-to-tr from-indigo-950/20 via-slate-950 to-purple-950/20 rounded-3xl border border-slate-800/80 my-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simplify Your First Paper Today
          </h2>
          <p className="text-slate-400 font-light leading-relaxed">
            Drag and drop a PDF file to test. See how artificial intelligence turns dense formulas and paragraphs into simple study workflows.
          </p>
          <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-xl shadow-indigo-500/20">
            <Link href="/upload" className="flex items-center gap-1.5 font-semibold text-base">
              Get Started for Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-600 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>ResearchEase</span>
          </div>
          <p className="font-light">© 2026 ResearchEase AI. Built for Edge-scale Hackathons.</p>
          <div className="flex gap-6 font-light">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}