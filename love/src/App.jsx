import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  CheckCircle, AlertCircle, RefreshCw, ChevronDown,
  LogOut, Loader2, Activity, Zap, Book, GraduationCap, Quote, 
  Calendar, Clock, Target, Menu, X, BookOpen, Search, Star, 
  Flame, Sparkles, CheckSquare, Layers, AlertTriangle, RotateCcw, 
  Plus, Compass, CheckCircle2, Play, Pause, Square, Timer, 
  BrainCircuit, ShieldAlert, TrendingUp, ArrowRight, Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDailyQuote } from "./data/quotes";
import { TIMETABLE_DATA } from "./data/timetable";
import Sidebar from "./components/Sidebar";
import Quiz from "./components/Quiz";
import TimetableCard from './components/TimetableCard'; 

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Render API Base URL
const API_BASE = "https://tracker-om85.onrender.com/api";

// --- MAIN APP COMPONENT ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <AuthScreen onLogin={(t, u) => {
      localStorage.setItem("token", t);
      setToken(t);
      setUser(u);
    }} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}

// --- AUTH SCREEN ---
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, formData);
      onLogin(res.data.token, res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-slate-100 p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-200 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="flex justify-center mb-6">
          <div className="bg-sky-600 p-3 rounded-2xl shadow-lg shadow-sky-600/20">
            <Activity className="text-white w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2 tracking-tight">
          {isLogin ? "Welcome Back" : "Join the Elite"}
        </h1>
        <p className="text-center text-slate-500 mb-8 text-sm font-medium">
          {isLogin ? "Your NEET-PG 2028 preparation awaits, Doctor." : "Start your systematic preparation today."}
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm mb-5 flex items-center gap-2 border border-rose-100">
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <input
                  type="text" placeholder="Full Name" required
                  className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <input
            type="email" placeholder="Email Address" required
            className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-sm"
            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password" placeholder="Password" required
            className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-sm"
            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          <button disabled={loading} className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm">
            {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : (isLogin ? "Sign In" : "Get Started")}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sky-600 font-bold hover:text-sky-700 transition-colors">
            {isLogin ? "Create new account" : "I already have an account"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- DASHBOARD (Command Center + Master Engine) ---
function Dashboard({ token, onLogout }) {
  const [syllabus, setSyllabus] = useState([]);
  const [stats, setStats] = useState({ globalProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pre-Clinical");

  // Sidebar Views: 'dashboard' | 'syllabus' | 'quiz' | 'pyq' | 'error_book' | 'spaced_repetition' | 'roadmap' | 'gt_analytics'
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Daily Study System Checkboxes
  const [dailyBlocks, setDailyBlocks] = useState({
    block1: false, // Core Study (3.5 hrs)
    block2: false, // QBank 40-50 MCQs + PYQs (2.5 hrs)
    block3: false, // Volatile Facts & IBQs (1.0 hr)
  });

  const categories = ["Pre-Clinical", "Para-Clinical", "Clinical"];
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  const [selectedDate, setSelectedDate] = useState("2026-02-16");
  const currentSchedule = TIMETABLE_DATA[selectedDate] || [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyllabus(res.data.subjects || []);
      setStats(res.data.stats || { globalProgress: 0 });
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const updateStatus = async (topicId, status) => {
    setSyllabus(prev => prev.map(sub => ({
      ...sub,
      topics: sub.topics.map(t => t._id === topicId ? { ...t, userStatus: { ...t.userStatus, status } } : t)
    })));

    try {
      await axios.post(`${API_BASE}/progress`, { topicId, status }, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get(`${API_BASE}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data.stats);
    } catch (err) { console.error("Sync failed"); }
  };

  const handleSetTarget = async (subjectId, dateStr) => {
    setSyllabus(prev => prev.map(sub =>
      sub._id === subjectId ? { ...sub, targetDate: dateStr } : sub
    ));

    try {
      await axios.post(`${API_BASE}/target`,
        { subjectId, targetDate: dateStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error("Target set failed"); }
  };

  const totalTopics = useMemo(() => syllabus.reduce((acc, sub) => acc + (sub.topics?.length || 0), 0), [syllabus]);
  const totalMastered = useMemo(() => syllabus.reduce((acc, sub) => acc + (sub.topics?.filter(t => t.userStatus?.status === 'mastered')?.length || 0), 0), [syllabus]);
  const currentReadiness = totalTopics > 0 ? Math.round((totalMastered / totalTopics) * 100) : 0;

  const completedDailyBlocks = Object.values(dailyBlocks).filter(Boolean).length;
  const dailyProgressPct = Math.round((completedDailyBlocks / 3) * 100);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-sky-600 gap-4">
      <Loader2 className="animate-spin w-10 h-10" />
      <p className="text-sm font-medium animate-pulse">Syncing NEET-PG Study Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-sky-100 flex">

      {/* --- SIDEBAR --- */}
      <Sidebar
        activeTab={currentView}
        setActiveTab={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col md:ml-[295px] transition-all duration-300 w-full min-w-0">
        
        {/* --- PROFESSIONAL HEADER --- */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 md:px-8 transition-all">
          <div className="max-w-7xl mx-auto flex justify-between items-center">

            {/* Left: Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu size={24} />
              </button>

              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hidden md:block">
                <Book className="text-white w-5 h-5" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-slate-800 leading-tight">NEET PG 2028</h1>
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">AI Study Manager</span>
              </div>
            </div>

            {/* Center: Live Time Widget */}
            <div className="hidden md:flex items-center gap-6 bg-slate-100/50 px-6 py-2 rounded-full border border-slate-200/50">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-300 pr-4 mr-1">
                {formattedDate}
              </div>
              <div className="text-sm font-mono font-bold text-slate-700 w-[70px] text-center">
                {formattedTime}
              </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="flex items-center gap-4">
              <div className="md:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {formattedTime}
              </div>

              {/* Readiness Badge */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 pl-3 pr-1 py-1 rounded-full shadow-sm">
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Readiness</span>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold text-sm border border-emerald-100 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {currentReadiness}%
                </div>
              </div>

              <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

              <button
                onClick={onLogout}
                title="Logout"
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all p-2.5 rounded-xl cursor-pointer active:scale-95"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* --- DYNAMIC VIEW ROUTING --- */}
        <main className="max-w-7xl mx-auto p-4 md:p-8 pb-24 w-full space-y-8">

          {/* 1. QUIZ & KNOWLEDGE BASE */}
          {currentView === 'quiz' && (
            <Quiz />
          )}

          {/* 2. 19-SUBJECT MASTER TRACKER */}
          {currentView === 'syllabus' && (
            <EmbeddedMasterTrackerGrid syllabusData={syllabus} onUpdateStatus={updateStatus} />
          )}

          {/* 3. DIGITAL ERROR BOOK & SPACED REPETITION */}
          {(currentView === 'error_book' || currentView === 'spaced_repetition') && (
            <EmbeddedErrorBookView initialMode={currentView === 'spaced_repetition' ? 'due' : 'all'} />
          )}

          {/* 4. 2026-2028 ROADMAP & GT ANALYTICS */}
          {(currentView === 'roadmap' || currentView === 'gt_analytics') && (
            <EmbeddedRoadmapView />
          )}

          {/* 5. CLASSIC DASHBOARD WITH LIVE TIMER & 3-BLOCK STUDY SYSTEM */}
          {currentView === 'dashboard' && (
            <>
              {/* TOP: LIVE STUDY TIMER & POMODORO HUB */}
              <LiveStudyTimerWidget />

              {/* QUICK AI COMMAND BAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-rose-500" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick Commands:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCurrentView('syllabus')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all">
                    PLAN TODAY
                  </button>
                  <button onClick={() => setCurrentView('quiz')} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all">
                    QUIZ
                  </button>
                  <button onClick={() => setCurrentView('error_book')} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all">
                    ERROR BOOK
                  </button>
                  <button onClick={() => setCurrentView('roadmap')} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all">
                    ROADMAP
                  </button>
                  <button onClick={() => setCurrentView('spaced_repetition')} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all">
                    SPACED REPEAT
                  </button>
                </div>
              </div>

              {/* HERO CARD & TIMETABLE CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* HERO CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[2rem] p-6 md:p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group min-h-[250px] flex flex-col justify-center"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                        {formattedDate}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                      {getGreeting()}, Doctor.
                    </h2>

                    <div className="relative pl-4 border-l-2 border-indigo-400/50 py-1 max-w-xl">
                      <Quote className="absolute -top-3 -left-3 text-indigo-400/20 fill-current w-8 h-8 rotate-180" />
                      <p className="text-slate-200 text-lg font-medium leading-relaxed italic">
                        "{dailyQuote?.text || 'Consistency beats intensity. Complete your 3 blocks today.'}"
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-[1px] w-8 bg-indigo-400/50"></div>
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{dailyQuote?.author || 'NEET-PG 2028'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none"></div>
                </motion.div>

                {/* TIMETABLE CARD */}
                <TimetableCard
                  todaysSchedule={currentSchedule}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />

              </div>

              {/* 3-BLOCK MODULAR DAILY STUDY SYSTEM */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <CheckSquare className="text-indigo-600" size={20} /> Daily 3-Block Study System
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Marrow Core Learning + QBank Practice + Volatile Memory Drill</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase">Today's Progress:</span>
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      {dailyProgressPct}% Done
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Block 1 */}
                  <div 
                    onClick={() => setDailyBlocks(p => ({ ...p, block1: !p.block1 }))}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer",
                      dailyBlocks.block1 ? "bg-emerald-50/50 border-emerald-300 shadow-sm" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">Block 1 • 50%</span>
                      <input type="checkbox" checked={dailyBlocks.block1} readOnly className="w-4 h-4 accent-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Core Marrow Learning</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">Main Videos & Notes reading on target subject (3.5 Hours).</p>
                    <span className="text-[10px] font-bold text-indigo-600">Target: ~3.5h</span>
                  </div>

                  {/* Block 2 */}
                  <div 
                    onClick={() => setDailyBlocks(p => ({ ...p, block2: !p.block2 }))}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer",
                      dailyBlocks.block2 ? "bg-emerald-50/50 border-emerald-300 shadow-sm" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">Block 2 • 35%</span>
                      <input type="checkbox" checked={dailyBlocks.block2} readOnly className="w-4 h-4 accent-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">QBank & PYQ Solving</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">40–50 MCQs in test mode + analyze all explanation screens.</p>
                    <span className="text-[10px] font-bold text-indigo-600">Target: ~2.5h</span>
                  </div>

                  {/* Block 3 */}
                  <div 
                    onClick={() => setDailyBlocks(p => ({ ...p, block3: !p.block3 }))}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer",
                      dailyBlocks.block3 ? "bg-emerald-50/50 border-emerald-300 shadow-sm" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">Block 3 • 15%</span>
                      <input type="checkbox" checked={dailyBlocks.block3} readOnly className="w-4 h-4 accent-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Volatile Facts & IBQs</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">High-yield tables, staging, drugs of choice & image recognition.</p>
                    <span className="text-[10px] font-bold text-indigo-600">Target: ~1.0h</span>
                  </div>
                </div>
              </div>

              {/* INTEGRATED CLINICAL CONNECTIONS HIGHLIGHT */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-zinc-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                    <Link2 size={24} className="text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Integrated Clinical Learning Rule</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Connect Pathology ↔ Medicine • Pharmacology ↔ Medicine • Anatomy ↔ Surgery / Radiology.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentView('syllabus')}
                  className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all whitespace-nowrap"
                >
                  View 19-Subject Matrix ➔
                </button>
              </div>

              {/* CATEGORY TABS */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap",
                        activeTab === cat
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden md:block">
                  {syllabus.filter(s => s.category === activeTab).length} Subjects Found
                </div>
              </div>

              {/* SUBJECT CARDS GRID */}
              <motion.div
                layout
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {syllabus
                    .filter(s => s.category === activeTab)
                    .map((subject) => (
                      <SubjectCard
                        key={subject._id}
                        subject={subject}
                        onUpdate={updateStatus}
                        onSetTarget={handleSetTarget}
                      />
                    ))
                  }
                </AnimatePresence>
              </motion.div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

// =========================================================================
// --- LIVE STUDY TIMER & POMODORO COMPONENT (WITH REAL-TIME CONTROLS) ---
// =========================================================================
function LiveStudyTimerWidget() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('STOPWATCH'); // 'STOPWATCH' | 'POMODORO_50'
  const [activeBlockTag, setActiveBlockTag] = useState('Block 1 (Core)');

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Left: Timer Description */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-600/30 border border-indigo-400/40 rounded-2xl flex items-center justify-center text-indigo-300 shadow-inner">
          <Timer size={28} className={isActive ? "animate-pulse text-rose-400" : "text-indigo-300"} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Focus Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">Tracking: {activeBlockTag}</span>
          </div>
          <h3 className="text-base font-bold text-white">Daily NEET-PG Focus Tracker</h3>
        </div>
      </div>

      {/* Center: Live Digital Clock Display */}
      <div className="flex items-center gap-4">
        <div className="font-mono text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-rose-300 drop-shadow-md">
          {formatTimer(seconds)}
        </div>
      </div>

      {/* Right: Controls & Block Tagging */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={toggleTimer}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg",
            isActive 
              ? "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20" 
              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white shadow-emerald-500/20"
          )}
        >
          {isActive ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start Focus</>}
        </button>

        <button
          onClick={resetTimer}
          className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all border border-white/10"
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>

        <select
          value={activeBlockTag}
          onChange={(e) => setActiveBlockTag(e.target.value)}
          className="bg-black/60 border border-white/10 text-xs font-medium text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none"
        >
          <option value="Block 1 (Core)">Block 1: Core Marrow Study</option>
          <option value="Block 2 (QBank)">Block 2: QBank MCQs & PYQ</option>
          <option value="Block 3 (Volatile)">Block 3: Volatile Recall / IBQs</option>
        </select>
      </div>

    </div>
  );
}

// --- SUBJECT CARD WITH TARGET ---
function SubjectCard({ subject, onUpdate, onSetTarget }) {
  const [isOpen, setIsOpen] = useState(false);

  const total = subject.topics?.length || 0;
  const mastered = subject.topics?.filter(t => t.userStatus?.status === 'mastered')?.length || 0;
  const revising = subject.topics?.filter(t => t.userStatus?.status === 'revision')?.length || 0;
  const pending = total - mastered - revising;

  const targetDateObj = subject.targetDate ? new Date(subject.targetDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysLeft = targetDateObj
    ? Math.ceil((targetDateObj - today) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white rounded-[24px] border border-slate-100 overflow-hidden transition-all duration-300 relative group",
        isOpen ? "shadow-2xl shadow-indigo-100 ring-1 ring-indigo-500/20 z-10" : "shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100"
      )}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 cursor-pointer flex flex-col gap-5 relative z-10"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className={cn(
              "p-3.5 rounded-2xl transition-all duration-300 shadow-sm",
              isOpen ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
            )}>
              <GraduationCap size={26} strokeWidth={1.5} />
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-indigo-900 transition-colors">
                {subject.name}
              </h3>
              <div className="flex items-center gap-3 mt-1.5" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                  {total} Topics
                </span>

                {/* --- TARGET PICKER --- */}
                <div className="flex items-center gap-2">
                  <div className="relative group/target">
                    <div className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors relative z-10",
                      daysLeft === null ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600" :
                        daysLeft < 0 ? "bg-rose-50 text-rose-600 border-rose-200" :
                          daysLeft < 7 ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-emerald-50 text-emerald-600 border-emerald-200"
                    )}>
                      <Target size={12} />
                      {daysLeft === null ? "Set Target" :
                        daysLeft < 0 ? `Overdue (${Math.abs(daysLeft)}d)` :
                          `${daysLeft} Days Left`}
                    </div>

                    <input
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      value={subject.targetDate ? new Date(subject.targetDate).toISOString().split('T')[0] : ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onSetTarget(subject._id, e.target.value)}
                    />
                  </div>
                  {targetDateObj && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {targetDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className={cn(
            "p-2 rounded-full transition-all duration-300 text-slate-300",
            isOpen ? "bg-slate-100 rotate-180 text-indigo-600" : "group-hover:text-slate-500"
          )}>
            <ChevronDown size={20} />
          </div>
        </div>

        {/* STATS GRID */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 gap-2"
            >
              <StatBadge label="Mastered" count={mastered} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
              <StatBadge label="Revising" count={revising} color="bg-amber-50 text-amber-600 border-amber-100" />
              <StatBadge label="Pending" count={pending} color="bg-slate-50 text-slate-500 border-slate-100" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROGRESS BAR */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</span>
            <span className={cn(
              "text-sm font-black transition-colors duration-500",
              subject.completion === 100 ? "text-emerald-500" : "text-indigo-600"
            )}>
              {Math.round(subject.completion || 0)}%
            </span>
          </div>

          <div className="h-3.5 w-full bg-slate-100 rounded-full p-[3px] shadow-inner border border-slate-200/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${subject.completion || 0}%` }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className={cn(
                "h-full rounded-full shadow-sm relative transition-all duration-500",
                subject.completion === 100
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
              )}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30 rounded-full" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ACCORDION TOPICS CONTENT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-slate-100 bg-slate-50/30"
          >
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar space-y-1.5">
              {subject.topics?.map(topic => (
                <div
                  key={topic._id}
                  className={cn(
                    "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200",
                    topic.userStatus?.status === 'mastered'
                      ? "bg-emerald-50/30 border-emerald-100/50"
                      : "bg-white border-transparent hover:border-indigo-100 hover:shadow-sm"
                  )}
                >
                  <div className="flex flex-col gap-1.5 max-w-[65%]">
                    <span className={cn(
                      "font-semibold text-sm transition-all duration-300",
                      topic.userStatus?.status === 'mastered' ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'
                    )}>
                      {topic.name}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {topic.isHighYield && <Badge color="bg-rose-50 text-rose-600 border-rose-100">High Yield</Badge>}
                      {topic.hasPYQ && <Badge color="bg-indigo-50 text-indigo-600 border-indigo-100">PYQ</Badge>}
                      {topic.userStatus?.status === 'revision' && (
                        <Badge color="bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1">
                          Rev {topic.userStatus?.revisionCount || 1}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ActionButton
                      active={topic.userStatus?.status === 'revision'}
                      onClick={() => onUpdate(topic._id, topic.userStatus?.status === 'revision' ? 'pending' : 'revision')}
                      icon={<RefreshCw size={15} strokeWidth={2.5} />}
                      title="Needs Revision"
                      activeClass="bg-amber-100 text-amber-700 border-amber-200 shadow-sm"
                    />
                    <ActionButton
                      active={topic.userStatus?.status === 'mastered'}
                      onClick={() => onUpdate(topic._id, topic.userStatus?.status === 'mastered' ? 'pending' : 'mastered')}
                      icon={<CheckCircle size={15} strokeWidth={2.5} />}
                      title="Mark as Mastered"
                      activeClass="bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- SUB-COMPONENTS ---
function StatBadge({ label, count, color }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-2 rounded-xl border", color)}>
      <span className="text-sm font-bold">{count}</span>
      <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">{label}</span>
    </div>
  );
}

function Badge({ children, color }) {
  return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shadow-sm", color)}>{children}</span>;
}

function ActionButton({ active, onClick, icon, activeClass, title }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className={cn(
        "p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center",
        active ? activeClass : "bg-white text-slate-300 border-slate-100 hover:border-slate-300 hover:text-slate-500"
      )}
    >
      {icon}
    </motion.button>
  );
}

// =========================================================================
// --- EMBEDDED 19-SUBJECT MASTER TRACKER MATRIX ---
// =========================================================================
function EmbeddedMasterTrackerGrid({ syllabusData, onUpdateStatus }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSubject, setActiveSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const trackerCategories = ['All', 'Pre-Clinical', 'Para-Clinical', 'Clinical'];

  useEffect(() => {
    if (syllabusData && syllabusData.length > 0 && !activeSubject) {
      setActiveSubject(syllabusData[0]);
    }
  }, [syllabusData]);

  const filteredSubjects = (syllabusData || []).filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={22} /> 19-Subject Master Syllabus Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">Multi-cycle revision tracking, high-yield topic flags & mastery status.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trackerCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search subjects or chapters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
          {filteredSubjects.map(subj => {
            const completedCount = subj.topics?.filter(t => t.userStatus?.status === 'mastered')?.length || 0;
            const totalCount = subj.topics?.length || 1;
            const progressPct = Math.round((completedCount / totalCount) * 100);
            const isCurrent = activeSubject?._id === subj._id;

            return (
              <button
                key={subj._id}
                onClick={() => setActiveSubject(subj)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl border transition-all",
                  isCurrent ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20" : "bg-white/80 border-slate-100 hover:bg-white"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={cn("text-xs font-bold", isCurrent ? "text-indigo-900" : "text-slate-700")}>{subj.name}</span>
                  <span className="text-[10px] font-bold text-slate-400">{progressPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progressPct}%` }} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-x-auto">
          {activeSubject ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{activeSubject.name}</h2>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{activeSubject.category}</span>
                </div>
                <div className="text-xs text-slate-500">Total Topics: <strong className="text-slate-800">{activeSubject.topics?.length || 0}</strong></div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-3 px-3 font-semibold">Topic Name</th>
                    <th className="pb-3 px-2 text-center font-semibold">High Yield</th>
                    <th className="pb-3 px-2 text-center font-semibold">PYQ</th>
                    <th className="pb-3 px-3 text-center font-semibold">Status</th>
                    <th className="pb-3 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeSubject.topics?.map(topic => {
                    const isMastered = topic.userStatus?.status === 'mastered';
                    const isRevising = topic.userStatus?.status === 'revision';
                    return (
                      <tr key={topic._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-700 max-w-[250px]">{topic.name}</td>
                        <td className="py-3.5 px-2 text-center">{topic.isHighYield ? <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md font-bold border border-rose-100">🔥 HY</span> : <span className="text-slate-300">-</span>}</td>
                        <td className="py-3.5 px-2 text-center">{topic.hasPYQ ? <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-bold border border-indigo-100">⭐ PYQ</span> : <span className="text-slate-300">-</span>}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1",
                            isMastered ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            isRevising ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-slate-50 text-slate-400 border-slate-200"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", isMastered ? "bg-emerald-500" : isRevising ? "bg-amber-500" : "bg-slate-400")} />
                            {isMastered ? 'Mastered' : isRevising ? `Rev ${topic.userStatus?.revisionCount || 1}` : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onUpdateStatus(topic._id, isRevising ? 'pending' : 'revision')}
                              className={cn("p-1.5 rounded-lg border text-xs font-bold transition-all", isRevising ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50")}
                              title="Mark Revision"
                            >
                              <RefreshCw size={13} />
                            </button>
                            <button
                              onClick={() => onUpdateStatus(topic._id, isMastered ? 'pending' : 'mastered')}
                              className={cn("p-1.5 rounded-lg border text-xs font-bold transition-all", isMastered ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50")}
                              title="Mark Mastered"
                            >
                              <CheckCircle size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-sm">Select a subject from the left list.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// --- EMBEDDED DIGITAL ERROR BOOK & SPACED REPETITION ---
// =========================================================================
function EmbeddedErrorBookView({ initialMode = 'all' }) {
  const [errors, setErrors] = useState([
    {
      id: '1',
      subject: 'Pathology',
      topic: 'Neoplasia',
      questionStem: 'Which gene mutation is most commonly associated with Li-Fraumeni syndrome?',
      errorCategory: 'CONCEPTUAL',
      correctOption: 'TP53 mutation (Chromosome 17p)',
      explanation: 'Li-Fraumeni syndrome is inherited in an autosomal dominant pattern caused by germline mutations in TP53.',
      memoryHook: 'TP53 = The Protector (guardian of genome) on 17p',
      stage: 1
    },
    {
      id: '2',
      subject: 'Pharmacology',
      topic: 'ANS',
      questionStem: 'What is the drug of choice for acute organophosphate poisoning with severe muscarinic symptoms?',
      errorCategory: 'SILLY',
      correctOption: 'Atropine IV (titrated till secretions dry)',
      explanation: 'Atropine blocks muscarinic manifestations. Pralidoxime (2-PAM) is added for nicotinic symptoms if given early.',
      memoryHook: 'Atropine dries secretions; Pralidoxime reactivates cholinesterase.',
      stage: 2
    }
  ]);

  const [filter, setFilter] = useState(initialMode === 'due' ? 'DUE' : 'ALL');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-rose-500" size={22} />
            <h1 className="text-xl font-bold text-slate-800">Digital Error Book & Spaced Repetition</h1>
          </div>
          <p className="text-xs text-slate-500">Intervals: Day 1 ➔ Day 3 ➔ Day 7 ➔ Day 14 ➔ Day 30 ➔ Day 60</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === 'ALL' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}
          >
            All Mistakes ({errors.length})
          </button>
          <button
            onClick={() => setFilter('DUE')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1", filter === 'DUE' ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "bg-slate-100 text-slate-600")}
          >
            <Flame size={14} /> Due for Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {errors.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">{item.subject} • {item.topic}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 font-bold text-[10px]">{item.errorCategory}</span>
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed">{item.questionStem}</p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div><span className="text-slate-400 font-bold">Key: </span><span className="text-emerald-600 font-bold">{item.correctOption}</span></div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{item.explanation}</p>
              {item.memoryHook && (
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] text-indigo-700 flex items-center gap-1.5 font-medium">
                  <Sparkles size={13} className="text-indigo-500 shrink-0" />
                  <span><strong>Hook:</strong> {item.memoryHook}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// --- EMBEDDED 2026-2028 ROADMAP & GT ANALYTICS VIEW ---
// =========================================================================
function EmbeddedRoadmapView() {
  const phases = [
    { phase: "Phase 1", title: "First Reading & Core QBank", time: "Aug 2026 – May 2027", gts: "1-2 GTs/month", desc: "Marrow Main Videos, Notes & 40-50 daily MCQs" },
    { phase: "Phase 2", title: "Revision 1 & PYQ Mastery", time: "June 2027 – Oct 2027", gts: "1 GT every 10 days", desc: "Consolidate notes + 3-5 Year PYQs (PYT analysis)" },
    { phase: "Phase 3", title: "Revision 2 & Rapid Revision", time: "Nov 2027 – Jan 2028", gts: "1 GT every week", desc: "Marrow RR notes + High-Yield Image Banks (IBQs)" },
    { phase: "Phase 4", title: "Final Volatile Recall & Mock Tests", time: "Feb 2028 – Exam Date", gts: "2 GTs every week", desc: "Ultra volatile facts, Error Book reviews, final speed drills" }
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
          <Compass className="text-indigo-600" size={22} /> NEET-PG 2028 Master Roadmap
        </h1>
        <p className="text-xs text-slate-500">20-Month Structured Roadmap across 4 Strategic Preparation Phases</p>
      </div>

      <div className="space-y-4">
        {phases.map((p, idx) => (
          <div key={p.phase} className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-bold text-xs border border-indigo-100">{p.phase}</span>
                <h3 className="font-bold text-slate-800 text-sm">{p.title}</h3>
              </div>
              <p className="text-xs text-slate-500">{p.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{p.time}</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{p.gts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}