/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  History, 
  Trash2, 
  Loader2, 
  ChevronRight,
  Plus,
  X,
  RefreshCw,
  Layers,
  Shuffle,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { cn } from './lib/utils';
import { MeteorsCanvas } from './components/MeteorsCanvas';

// Types
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'studio'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const landingContainerRef = useRef<HTMLDivElement>(null);

  // Load history & theme from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('visions_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedTheme = localStorage.getItem('visions_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('visions_history', JSON.stringify(history));
  }, [history]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('visions_theme', theme);
  }, [theme]);

  // GSAP Entrance Animations for Landing Page
  useEffect(() => {
    if (view === 'landing') {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from(".gsap-badge", { opacity: 0, y: -20, duration: 0.8, ease: "power3.out" })
          .from(".gsap-title", { opacity: 0, y: 30, duration: 1, ease: "power3.out" }, "-=0.6")
          .from(".gsap-subtitle", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.6")
          .from(".gsap-cta", { opacity: 0, scale: 0.9, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4")
          .from(".gsap-feature", { opacity: 0, y: 20, stagger: 0.15, duration: 0.8, ease: "power2.out" }, "-=0.4");
      }, landingContainerRef);

      return () => ctx.revert();
    }
  }, [view]);

  const stylePresets = [
    { name: 'Cyberpunk', value: 'Cyberpunk style, neon lights', emoji: '🌌' },
    { name: 'Oil Painting', value: 'textured oil painting style', emoji: '🎨' },
    { name: 'Sketch', value: 'detailed pencil sketch', emoji: '✏️' },
    { name: 'Surrealism', value: 'surrealist art style, dream-like', emoji: '🔮' },
    { name: 'Anime', value: 'vibrant anime aesthetic', emoji: '🌸' },
    { name: 'Cinematic', value: 'cinematic lighting, dramatic mood', emoji: '🎬' },
    { name: 'Glassmorphism', value: 'glassmorphic design, translucent textured frosted glass refraction, chromatic dispersion caustics', emoji: '💎' },
    { name: 'Water Effect', value: 'dynamic liquid splashes, pristine flowing transparent water ripples, realistic caustics reflections', emoji: '💧' },
    { name: 'Gemini AI', value: 'advanced futuristic cyber-intelligence neural pathways, glowing cyan and violet data nodes', emoji: '🧠' },
  ];

  const featuredTemplates = [
    {
      title: "Glassmorphic Oasis",
      prompt: "A minimalist frosted glass vase holding pristine liquid water on a raw matte stone shelf, cinematic warm morning sunlight casting complex caustics, soft shadow, detailed glassmorphism refraction, modern aesthetic",
      emoji: "💎"
    },
    {
      title: "Liquid Cyber Wave",
      prompt: "A dynamic liquid wave splash, transparent realistic water droplets, vibrant violet and cyan neon lights reflecting off the glossy wet surfaces, high contrast, surreal cybernetic water effect",
      emoji: "💧"
    },
    {
      title: "Gemini Neural Core",
      prompt: "The intricate glowing crystal core of a super-intelligent AI, frosted translucent pathways, suspended shimmering droplets of liquid light, complex high-tech neural network",
      emoji: "🧠"
    },
    {
      title: "Gemini Synthesis (All-in-One)",
      prompt: "A stunning glassmorphic structure emerging from pristine swirling water ripples and liquid caustics, filled with intricate glowing violet and cyan neural pathways, frosted glass refraction, chromatic dispersion, dynamic splashes, cinematic soft lighting, award-winning 3D render",
      emoji: "✨"
    }
  ];

  const applyStylePreset = (value: string) => {
    setPrompt(prev => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return value;
      }
      
      const styleName = value.split(',')[0];
      const styleRegex = new RegExp(`\\b${styleName}\\b`, 'i');
      if (styleRegex.test(trimmed)) {
        return prev;
      }
      
      if (trimmed.endsWith(',')) {
        return `${trimmed} ${value}`;
      }
      return `${trimmed}, ${value}`;
    });
  };

  const handleEnterStudio = () => {
    gsap.to(".gsap-fade-out", {
      opacity: 0,
      y: -30,
      duration: 0.6,
      stagger: 0.05,
      ease: "power3.inOut",
      onComplete: () => {
        setView('studio');
      }
    });
  };

  const generateVariation = async () => {
    if (!currentImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = currentImage.split(',')[1];
      
      const activePrompt = history.find(h => h.url === currentImage)?.prompt || prompt || "A creative visual piece";
      const variationPrompt = `Generate a variation of this image. Maintain the exact same style, composition, characters, color palette, and mood, but introduce subtle differences in details or posing. Original description: ${activePrompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: variationPrompt,
            },
          ],
        },
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setCurrentImage(imageUrl);
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: `${activePrompt} (Variation)`,
          timestamp: Date.now()
        };
        setHistory(prev => [newImage, ...prev]);
      } else {
        throw new Error("No image data received from API");
      }
    } catch (err: any) {
      console.error("Variation generation error:", err);
      setError(err.message || "Failed to generate variation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (isEdit: boolean = false) => {
    if (!prompt && !isEdit) return;
    if (isEdit && !editPrompt) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let response;
      if (isEdit && currentImage) {
        // Image editing
        const base64Data = currentImage.split(',')[1];
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/png',
                },
              },
              {
                text: editPrompt,
              },
            ],
          },
        });
      } else {
        // Text to image
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });
      }

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setCurrentImage(imageUrl);
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: isEdit ? `${prompt} + ${editPrompt}` : prompt,
          timestamp: Date.now()
        };
        setHistory(prev => [newImage, ...prev]);
        if (isEdit) {
          setEditMode(false);
          setEditPrompt('');
        }
      } else {
        throw new Error("No image data received from API");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(img => img.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={cn(
      "min-h-screen relative overflow-x-hidden transition-colors duration-500 selection:bg-orange-500/30",
      theme === 'dark' ? "dark bg-[#0a0502] text-white" : "bg-[#faf9f6] text-stone-900"
    )}>
      {/* Meteor Canvas background */}
      <MeteorsCanvas theme={theme} />

      {/* Decorative Atmosphere Gradient blur (Only active in dark theme) */}
      {theme === 'dark' && <div className="atmosphere" />}

      {/* Landing View */}
      {view === 'landing' && (
        <div ref={landingContainerRef} className="relative z-10 min-h-screen flex flex-col justify-between px-6 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center w-full gsap-fade-out">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="font-bold tracking-tighter text-xl">VISIONS AI</span>
            </div>
            
            <button 
              onClick={toggleTheme}
              className={cn(
                "p-2.5 rounded-full border transition-all cursor-pointer",
                theme === 'light' ? "bg-stone-100 border-stone-200 text-stone-800" : "bg-white/5 border-white/10 text-white"
              )}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </header>

          {/* Hero Content */}
          <div className="flex flex-col items-center text-center my-auto max-w-4xl mx-auto py-12">
            <span className="gsap-badge gsap-fade-out px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-orange-500/20 bg-orange-500/10 text-orange-500 mb-6 inline-block">
              Visions AI Creative Engine
            </span>

            <h1 className="gsap-title gsap-fade-out text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] mb-6">
              Create and Refine <br />
              <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600">
                Atmospheric
              </span> Visuals
            </h1>

            <p className={cn(
              "gsap-subtitle gsap-fade-out text-base md:text-lg max-w-2xl leading-relaxed mb-10 px-8 py-5 rounded-2xl border transition-all duration-300 shadow-sm font-sans",
              theme === 'light' 
                ? "bg-white/80 border-stone-200/60 text-stone-600 shadow-stone-200/10" 
                : "bg-white/[0.02] border-white/5 text-stone-300 shadow-black/20"
            )}>
              A minimalist, high-performance studio utilizing Gemini 2.5 generative technology. Design custom layouts, apply premium presets, and refine images seamlessly.
            </p>

            <button
              onClick={handleEnterStudio}
              className={cn(
                "gsap-cta gsap-fade-out px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 group active:scale-[0.98] cursor-pointer",
                theme === 'light' 
                  ? "bg-stone-900 text-[#faf9f6] hover:bg-stone-800 shadow-xl shadow-stone-900/10"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20"
              )}
            >
              Enter Creative Studio
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Core App Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto gsap-fade-out">
            <div className="gsap-feature p-6 rounded-2xl border transition-all bg-stone-100/40 border-stone-200 dark:bg-white/[0.03] dark:border-white/10">
              <span className="text-2xl mb-3 block">💎</span>
              <h3 className="font-semibold text-lg mb-1">Glassmorphism</h3>
              <p className="text-xs text-stone-500 dark:text-white/50 leading-relaxed">
                Render translucent frosted textures, chromatic dispersion, and high-fidelity refractive caustics.
              </p>
            </div>

            <div className="gsap-feature p-6 rounded-2xl border transition-all bg-stone-100/40 border-stone-200 dark:bg-white/[0.03] dark:border-white/10">
              <span className="text-2xl mb-3 block">💧</span>
              <h3 className="font-semibold text-lg mb-1">Water Effect</h3>
              <p className="text-xs text-stone-500 dark:text-white/50 leading-relaxed">
                Generate realistic ripples, dynamic splashes, transparent droplets, and glossy wet reflections.
              </p>
            </div>

            <div className="gsap-feature p-6 rounded-2xl border transition-all bg-stone-100/40 border-stone-200 dark:bg-white/[0.03] dark:border-white/10">
              <span className="text-2xl mb-3 block">🧠</span>
              <h3 className="font-semibold text-lg mb-1">Gemini AI Features</h3>
              <p className="text-xs text-stone-500 dark:text-white/50 leading-relaxed">
                Instantly apply style variants, neural network paths, and intelligent custom edits on-the-fly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio View */}
      {view === 'studio' && (
        <>
          {/* Navigation */}
          <nav className="relative z-10 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
            <button 
              onClick={() => setView('landing')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">VISIONS AI</h1>
            </button>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className={cn(
                  "p-2.5 rounded-full border transition-all cursor-pointer",
                  theme === 'light' ? "bg-stone-100 border-stone-200 text-stone-800" : "bg-white/5 border-white/10 text-white"
                )}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setHistory([])}
                className={cn(
                  "text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer",
                  theme === 'light'
                    ? "text-stone-600 hover:text-orange-600"
                    : "text-white/40 hover:text-white"
                )}
              >
                Clear History
              </button>
            </div>
          </nav>

          <main className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
            
            {/* Left Column: Generator Controls */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-2">
                <h2 className={cn(
                  "text-4xl font-light tracking-tight leading-none",
                  theme === 'light' ? "text-stone-950" : "text-white"
                )}>
                  Visions <span className="italic font-serif">Studio</span>
                </h2>
                <p className={cn(
                  "text-sm max-w-md",
                  theme === 'light' ? "text-stone-700" : "text-white/60"
                )}>
                  Choose preset filters, templates, or craft custom prompt styles dynamically.
                </p>
              </div>

              <div className={cn(
                "p-6 rounded-3xl border transition-all space-y-6",
                theme === 'light' ? "bg-[#eae8e1]/40 border-stone-200 shadow-sm" : "bg-white/[0.03] border-white/10"
              )}>
                <div className="space-y-4">
                  {/* Presets Grid */}
                  <div className="space-y-2">
                    <label className={cn(
                      "text-[10px] uppercase tracking-[0.2em] font-bold block",
                      theme === 'light' ? "text-stone-700" : "text-white/40"
                    )}>
                      Style Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {stylePresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => applyStylePreset(preset.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer active:scale-95",
                            theme === 'light' 
                              ? "bg-stone-100 border-stone-200 text-stone-700 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-600" 
                              : "bg-white/5 border-white/10 text-white/80 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-white"
                          )}
                        >
                          {preset.emoji} {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-bold block pt-2",
                    theme === 'light' ? "text-stone-700" : "text-white/40"
                  )}>
                    Prompt Description
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A futuristic neon city in the clouds, cyberpunk style, cinematic lighting..."
                    className={cn(
                      "w-full rounded-xl p-4 transition-all min-h-[120px] resize-none focus:outline-none border",
                      theme === 'light' 
                        ? "bg-white border-stone-200 text-stone-900 placeholder:text-stone-500 focus:border-orange-500/50" 
                        : "bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50"
                    )}
                  />

                  {/* Featured Templates */}
                  <div className="space-y-2 pt-2">
                    <label className={cn(
                      "text-[10px] uppercase tracking-[0.2em] font-bold block",
                      theme === 'light' ? "text-stone-700" : "text-white/40"
                    )}>
                      Featured Prompt Templates
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {featuredTemplates.map((template) => (
                        <button
                          key={template.title}
                          type="button"
                          onClick={() => setPrompt(template.prompt)}
                          className={cn(
                            "text-left p-2.5 rounded-lg border transition-all flex items-start gap-2 cursor-pointer active:scale-[0.99]",
                            theme === 'light'
                              ? "bg-stone-100 border-stone-200 text-stone-800 hover:bg-orange-500/5 hover:border-orange-500/20"
                              : "bg-white/5 border-white/10 text-white/80 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-white"
                          )}
                        >
                          <span className="text-sm shrink-0">{template.emoji}</span>
                          <div>
                            <span className="font-semibold block text-[11px] text-orange-500">{template.title}</span>
                            <span className="text-[10px] text-stone-600 dark:text-white/50 line-clamp-1">{template.prompt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => generateImage(false)}
                  disabled={isGenerating || !prompt}
                  className={cn(
                    "w-full py-4 rounded-xl font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer",
                    isGenerating || !prompt 
                      ? (theme === 'light' ? "bg-stone-200 text-stone-400" : "bg-white/5 text-white/20") + " cursor-not-allowed" 
                      : theme === 'light'
                        ? "bg-stone-900 text-[#faf9f6] hover:bg-stone-800 shadow-lg shadow-stone-900/10 active:scale-[0.98]"
                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/10 active:scale-[0.98]"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Vision
                    </>
                  )}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              {/* History Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-xs uppercase tracking-widest font-bold flex items-center gap-2",
                    theme === 'light' ? "text-stone-700" : "text-white/40"
                  )}>
                    <History className="w-3 h-3" />
                    Recent Visions
                  </h3>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {history.slice(0, 8).map((img) => (
                    <motion.button
                      key={img.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentImage(img.url)}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        currentImage === img.url ? "border-orange-500 shadow-lg shadow-orange-500/20" : "border-transparent"
                      )}
                    >
                      <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </motion.button>
                  ))}
                  {history.length === 0 && (
                    <div className={cn(
                      "col-span-4 h-20 rounded-lg border border-dashed flex items-center justify-center text-[10px] uppercase tracking-widest",
                      theme === 'light' ? "border-stone-200 text-stone-400" : "border-white/10 text-white/20"
                    )}>
                      No history yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Display & Edit */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {currentImage ? (
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="relative group"
                  >
                    <div className={cn(
                      "rounded-3xl overflow-hidden aspect-square relative border",
                      theme === 'light' ? "border-stone-200" : "border-white/10"
                    )}>
                      <img 
                        src={currentImage} 
                        alt="Generated Vision" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => downloadImage(currentImage, `vision-${Date.now()}.png`)}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all transform translate-y-4 group-hover:translate-y-0 cursor-pointer",
                            theme === 'light' 
                              ? "bg-stone-900 text-[#faf9f6] hover:bg-orange-500 hover:text-white"
                              : "bg-white text-black hover:bg-orange-500 hover:text-white"
                          )}
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setEditMode(true)}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 cursor-pointer",
                            theme === 'light' 
                              ? "bg-stone-900 text-[#faf9f6] hover:bg-orange-500 hover:text-white"
                              : "bg-white text-black hover:bg-orange-500 hover:text-white"
                          )}
                          title="Refine Vision"
                        >
                          <Layers className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={generateVariation}
                          disabled={isGenerating}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all transform translate-y-4 group-hover:translate-y-0 delay-100 cursor-pointer",
                            theme === 'light' 
                              ? "bg-stone-900 text-[#faf9f6] hover:bg-orange-500 hover:text-white"
                              : "bg-white text-black hover:bg-orange-500 hover:text-white",
                            isGenerating && "cursor-not-allowed opacity-50"
                          )}
                          title="Generate Variation"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Shuffle className="w-5 h-5" />
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            const current = history.find(h => h.url === currentImage);
                            if (current) deleteFromHistory(current.id);
                            setCurrentImage(null);
                          }}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all transform translate-y-4 group-hover:translate-y-0 delay-150 cursor-pointer",
                            theme === 'light' 
                              ? "bg-stone-900 text-[#faf9f6] hover:bg-red-500 hover:text-white"
                              : "bg-white text-black hover:bg-red-500 hover:text-white"
                          )}
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Edit Modal Overlay */}
                    <AnimatePresence>
                      {editMode && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "absolute inset-0 z-20 flex flex-col p-8 rounded-3xl border",
                            theme === 'light' ? "bg-[#faf9f6]/95 border-stone-200" : "bg-[#0a0502]/95 border-white/10"
                          )}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">Refine Vision</h3>
                            <button onClick={() => setEditMode(false)} className="text-stone-400 hover:text-orange-500 dark:text-white/40 dark:hover:text-white cursor-pointer">
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <div className="flex-1 space-y-6">
                            <p className="text-sm text-stone-600 dark:text-white/60 italic">
                              "Add a giant moon in the background", "Make it raining", "Change the color palette to purple"
                            </p>
                            <textarea
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              placeholder="What would you like to add or change?"
                              className={cn(
                                "w-full rounded-xl p-4 transition-all min-h-[150px] resize-none focus:outline-none border",
                                theme === 'light' 
                                  ? "bg-white border-stone-200 text-stone-900 placeholder:text-stone-500 focus:border-orange-500/50" 
                                  : "bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50"
                              )}
                            />
                            
                            <button
                              onClick={() => generateImage(true)}
                              disabled={isGenerating || !editPrompt}
                              className={cn(
                                "w-full py-4 rounded-xl font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer",
                                isGenerating || !editPrompt 
                                  ? (theme === 'light' ? "bg-stone-200 text-stone-400" : "bg-white/5 text-white/20") + " cursor-not-allowed" 
                                  : theme === 'light'
                                    ? "bg-stone-900 text-[#faf9f6] hover:bg-stone-800 shadow-lg shadow-stone-900/10 active:scale-[0.98]"
                                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/10 active:scale-[0.98]"
                              )}
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Refining...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-5 h-5" />
                                  Apply Refinement
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className={cn(
                    "aspect-square flex flex-col items-center justify-center space-y-4 border border-dashed rounded-3xl",
                    theme === 'light' ? "border-stone-300 bg-stone-100/30 text-stone-700" : "border-white/15 bg-white/[0.01] text-white/40"
                  )}>
                    <div className="w-20 h-20 rounded-full border border-current flex items-center justify-center animate-float">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] font-bold">Waiting for your vision</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Details below image */}
              {currentImage && !editMode && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-6 flex justify-between items-start"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-stone-600 dark:text-white/40 font-bold">Active Prompt</p>
                    <p className="text-sm text-stone-800 dark:text-white/80 max-w-lg">
                      {history.find(h => h.url === currentImage)?.prompt || prompt}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-stone-600 dark:text-white/40 font-bold">Dimensions</p>
                    <p className="text-sm text-stone-800 dark:text-white/80">1024 x 1024</p>
                  </div>
                </motion.div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className={cn(
            "relative z-10 max-w-7xl mx-auto px-6 py-12 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold",
            theme === 'light' ? "border-stone-200 text-stone-600" : "border-white/5 text-white/20"
          )}>
            <p>© 2026 VISIONS AI STUDIO</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-orange-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
