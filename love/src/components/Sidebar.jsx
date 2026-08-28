import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, BrainCircuit, Target, 
  RotateCcw, AlertTriangle, TrendingUp, Compass, 
  X, ChevronRight, ExternalLink, Search, FolderOpen, 
  Folder, Gift, Heart, Hash, Plus, Settings, 
  MoreHorizontal, Sparkles, Quote, Infinity, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. DATA ARCHITECTURE ---
const NEET_PG_MENU = [
  { 
    id: 'dashboard', 
    label: 'Command Center', 
    icon: LayoutDashboard, 
    badge: 'Today' 
  },
  { 
    id: 'syllabus', 
    label: '19-Subject Tracker', 
    icon: BookOpen, 
    badge: '19 Subj' 
  },
  { 
    id: 'quiz', 
    label: 'Active Recall & Quiz', 
    icon: BrainCircuit 
  },
  { 
    id: 'pyq', 
    label: 'PYQ Mode & Clones', 
    icon: Target 
  },
  { 
    id: 'spaced_repetition', 
    label: 'Spaced Repetition', 
    icon: RotateCcw, 
    badge: 'Due' 
  },
  { 
    id: 'error_book', 
    label: 'Digital Error Book', 
    icon: AlertTriangle 
  },
  { 
    id: 'gt_analytics', 
    label: 'GT / Mock Analytics', 
    icon: TrendingUp 
  },
  { 
    id: 'roadmap', 
    label: '2026–2028 Roadmap', 
    icon: Compass 
  },
];

const COLLECTIONS = [
  {
    id: 'birthdays',
    label: 'Birthdays',
    icon: Gift,
    color: 'text-fuchsia-400',
    glow: 'group-hover:shadow-[0_0_20px_rgba(232,121,249,0.4)]',
    border: 'group-hover:border-fuchsia-500/50',
    links: [
      { label: "21 Birthday Page 1", url: "https://hbd-jaan.netlify.app/" },
      { label: "21 Birthday Page 2", url: "https://hbd-meri-jaan.netlify.app/" },
      { label: "Countdown", url: "https://lovely-countdownfor.netlify.app/" },
      { label: "Special 3rd", url: "https://21-bdyof-my-love.netlify.app/" }
    ]
  },
  {
    id: 'anniversaries',
    label: 'Anniversaries',
    icon: Heart,
    color: 'text-rose-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    border: 'group-hover:border-rose-500/50',
    links: [
      { label: "29 Month Anniversary", url: "https://29month.netlify.app/" },
      { label: "2nd Anniversary", url: "https://2anniversary27.netlify.app/" },
      { label: "21 Month", url: "https://21anni.netlify.app/" },
      { label: "TimeLine", url: "https://akhandl0v3anshul.netlify.app/" },
      { label: "Meri Jaan", url: "https://akhand27anshul.netlify.app/" }
    ]
  },
  {
    id: 'universe',
    label: 'Our Digital Space',
    icon: Sparkles,
    color: 'text-cyan-400',
    glow: 'group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]',
    border: 'group-hover:border-cyan-500/50',
    links: [
      { label: "Game", url: "https://game0327.netlify.app/" },
      { label: "Notes", url: "https://notesone112.netlify.app/" },
      { label: "Write Notes", url: "https://notesone112.netlify.app/#/admin" }
    ]
  }
];

const LOVE_NOTES = [
  "You make every single day brighter. ✨",
  "Consistency today = Top NEET-PG 2028 rank tomorrow. 🎯",
  "My favorite place is inside your hug. 💖",
  "Learn ➔ Recall ➔ Solve ➔ Retain ➔ Repeat.",
  "You are my today and all of my tomorrows."
];

// --- 2. SUB-COMPONENTS ---

const DailyNoteWidget = () => {
  const [note, setNote] = useState(LOVE_NOTES[0]);

  useEffect(() => {
    setNote(LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)]);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-5 p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 relative overflow-hidden group shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-fuchsia-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -top-4 -right-4 opacity-20 transform rotate-12 transition-transform group-hover:rotate-45 duration-700 blur-[2px]">
        <Infinity size={80} className="text-rose-500" />
      </div>
      <Quote size={14} className="text-rose-400 mb-2 opacity-70 relative z-10" />
      <p className="text-[11px] font-medium text-zinc-300 leading-relaxed relative z-10">
        {note}
      </p>
    </motion.div>
  );
};

const LoveSyncWidget = () => (
  <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-b from-[#111116] to-[#05050A] border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-colors duration-500 shadow-xl">
    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex justify-between items-end mb-3 relative z-10">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Flame size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Bond Sync</span>
        </div>
        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-purple-400 drop-shadow-sm">
          100%
        </div>
      </div>
      
      {/* SVG Circular Progress Ring */}
      <div className="w-11 h-11 rounded-full border border-white/5 bg-black/50 flex items-center justify-center relative shadow-inner">
        <svg className="w-full h-full transform -rotate-90 absolute inset-0">
          <circle cx="22" cy="22" r="18" stroke="currentColor" className="text-zinc-800" strokeWidth="3" fill="transparent" />
          <motion.circle 
            cx="22" cy="22" r="18" 
            stroke="url(#sync-gradient)" 
            strokeWidth="3" 
            fill="transparent" 
            strokeDasharray="113" 
            initial={{ strokeDashoffset: 113 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            strokeLinecap="round" 
          />
          <defs>
            <linearGradient id="sync-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <Heart size={14} className="text-rose-400 fill-rose-400/50 relative z-10" />
      </div>
    </div>
    
    {/* Linear Progress Bar */}
    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative z-10 shadow-inner">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-500 relative"
      >
        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
      </motion.div>
    </div>
  </div>
);

const FolderGroup = ({ group, isExpanded, onToggle }) => {
  return (
    <div className="mb-2 px-4">
      <button 
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden
          ${isExpanded 
            ? 'bg-[#111118] text-white shadow-lg border border-white/10' 
            : 'hover:bg-white/[0.02] text-zinc-400 border border-transparent'}
        `}
      >
        {isExpanded && (
          <motion.div 
            layoutId="folder-highlight" 
            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${group.color.replace('text-', 'from-').replace('400', '500')} to-transparent`} 
          />
        )}
        <div className="flex items-center gap-3">
          <div className={`${group.color} transition-all duration-500 ${group.glow} bg-black/50 border border-white/5 rounded-lg p-1.5`}>
            {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          </div>
          <span className="text-xs font-bold tracking-wide">{group.label}</span>
        </div>
        <ChevronRight 
          size={14} 
          className={`text-zinc-600 transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90 text-zinc-300' : ''}`} 
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative ml-6 pl-4 border-l border-zinc-800/80 mt-2 space-y-1 py-1">
              {group.links.map((link, idx) => (
                <motion.a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="
                    flex items-center justify-between group/link
                    px-3 py-2 rounded-lg text-[11px] font-semibold text-zinc-500 
                    hover:text-zinc-200 hover:bg-white/[0.03]
                    transition-all duration-300 cursor-pointer relative overflow-hidden
                  "
                >
                  <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover/link:opacity-10 transition-opacity duration-300 ${group.color.replace('text-', 'from-')} to-transparent`} />
                  
                  <div className="flex items-center gap-2 z-10">
                    <Hash size={12} className={`opacity-40 transition-colors ${group.color.replace('text-', 'group-hover/link:text-')}`} />
                    <span className="truncate max-w-[130px]">{link.label}</span>
                  </div>
                  <ExternalLink size={12} className="opacity-0 -translate-x-2 group-hover/link:translate-x-0 group-hover/link:opacity-100 transition-all duration-300 text-zinc-500" />
                </motion.a>
              ))}
              
              <button className="w-full text-left px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-zinc-600 hover:text-white transition-colors mt-2 bg-black/20 rounded-lg border border-zinc-800 border-dashed hover:border-zinc-600">
                <Plus size={10} />
                <span>Add new memory...</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const [openFolders, setOpenFolders] = useState(['birthdays', 'anniversaries']);

  const toggleFolder = (id) => {
    setOpenFolders(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed left-0 top-0 h-full w-[295px] 
        bg-[#05050A] text-zinc-300 border-r border-white/5 
        shadow-[30px_0_60px_rgba(0,0,0,0.8)]
        transition-transform duration-500 ease- z-50 
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        
        {/* Background Aura */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-fuchsia-900/10 via-indigo-900/5 to-transparent pointer-events-none" />
        
        {/* HEADER */}
        <div className="p-5 pb-2 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-fuchsia-500 blur-md opacity-30 rounded-xl animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-2xl border border-white/10">
                <Heart className="text-rose-400 drop-shadow-md" size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight leading-none">
                NEET-PG 2028
              </h1>
              <p className="text-[8px] font-black text-fuchsia-400 tracking-[0.2em] uppercase mt-1">
                Anshul's Study Manager
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-zinc-600 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-rose-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-fuchsia-400 transition-colors z-10" />
            <input 
              type="text" 
              placeholder="Search 19 subjects, PYQs..." 
              className="relative w-full bg-[#0a0a0f] border border-white/5 rounded-xl py-2 pl-10 pr-3 text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500/30 focus:ring-1 focus:ring-fuchsia-500/30 transition-all placeholder:text-zinc-600 shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
              <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-zinc-500 border border-white/5 shadow-sm">⌘K</span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-6 relative z-10 mt-3">
          
          <DailyNoteWidget />

          {/* NEET-PG CORE MODULES */}
          <div className="px-4">
            <div className="px-2 mb-3 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <span>Study Engine</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>
            <nav className="space-y-1">
              {NEET_PG_MENU.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 text-xs font-bold relative overflow-hidden group
                      ${isActive 
                        ? 'text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 bg-white/[0.04]' 
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02] border border-transparent'}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav" 
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-fuchsia-400 to-rose-500 rounded-r-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" 
                      />
                    )}
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon size={15} className={`transition-colors ${isActive ? 'text-rose-400' : 'group-hover:text-zinc-300'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider relative z-10 border ${
                        isActive
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800 group-hover:text-zinc-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* THE PERSONAL VAULT */}
          <div>
            <div className="flex items-center justify-between px-6 mb-3">
              <div className="text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-fuchsia-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Sparkles size={10} className="text-rose-400" />
                The Vault
              </div>
              <Settings size={12} className="text-zinc-600 hover:text-white cursor-pointer transition-transform hover:rotate-90 duration-500" />
            </div>

            <div className="space-y-1">
              {COLLECTIONS.map((group) => (
                <FolderGroup 
                  key={group.id} 
                  group={group}
                  isExpanded={openFolders.includes(group.id)}
                  onToggle={() => toggleFolder(group.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 100% SYNC & PROFILE FOOTER */}
        <div className="mt-auto relative z-20 bg-gradient-to-t from-[#05050A] via-[#05050A] to-transparent pt-4">
          
          <LoveSyncWidget />

          {/* Profile Section */}
          <div className="flex items-center gap-3 px-5 pb-5">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-[2px] bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-[spin_3s_linear_infinite]" />
              <div className="relative w-9 h-9 rounded-full bg-black flex items-center justify-center overflow-hidden border border-black">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Anshul&backgroundColor=fce7f3" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
                Anshul Beniwal
              </div>
              <div className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                Crafted by Akhand <Heart size={8} className="text-rose-500 fill-rose-500" />
              </div>
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-600 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;