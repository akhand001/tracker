import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  CheckCircle, AlertCircle, RefreshCw, ChevronDown, 
  LogOut, Loader2, Activity, Zap, Book, GraduationCap, Quote, Calendar, Clock, Target 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDailyQuote } from "./data/quotes";
import { TIMETABLE_DATA } from "./data/timetable";

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-slate-100 p-6">
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
          {isLogin ? "Your progress awaits, Doctor." : "Start your systematic preparation today."}
        </p>
        
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm mb-5 flex items-center gap-2 border border-rose-100">
            <AlertCircle size={16}/> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <input 
                  type="text" placeholder="Full Name" required 
                  className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <input 
            type="email" placeholder="Email Address" required 
            className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <button disabled={loading} className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
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

// --- DASHBOARD (Professional Edition) ---
function Dashboard({ token, onLogout }) {
  const [syllabus, setSyllabus] = useState([]);
  const [stats, setStats] = useState({ globalProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pre-Clinical");
  
  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  const categories = ["Pre-Clinical", "Para-Clinical", "Clinical"];
  
  // Quote Logic
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  // Timetable Logic
  const todayKey = currentTime.toISOString().split('T')[0];
  const todaysSchedule = TIMETABLE_DATA[todayKey] || [];

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
      setSyllabus(res.data.subjects);
      setStats(res.data.stats);
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

  // --- NEW: Function to set Target ---
  const handleSetTarget = async (subjectId, dateStr) => {
    // 1. Optimistic Update
    setSyllabus(prev => prev.map(sub => 
      sub._id === subjectId ? { ...sub, targetDate: dateStr } : sub
    ));

    // 2. API Call
    try {
      await axios.post(`${API_BASE}/target`, 
        { subjectId, targetDate: dateStr }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error("Target set failed"); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-sky-600 gap-4">
      <Loader2 className="animate-spin w-10 h-10" />
      <p className="text-sm font-medium animate-pulse">Syncing Syllabus...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-sky-100">
      
      {/* --- PROFESSIONAL HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 md:px-8 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Book className="text-white w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">NEET PG</h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Tracker Pro</span>
            </div>
          </div>

          {/* Center: Live Time Widget (Visible on Desktop) */}
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
                {stats.globalProgress}%
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

      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* --- HERO CARD --- */}
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
                   "{dailyQuote.text}"
                 </p>
                 <div className="mt-2 flex items-center gap-2">
                   <div className="h-[1px] w-8 bg-indigo-400/50"></div>
                   <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{dailyQuote.author}</span>
                 </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none"></div>
          </motion.div>

          {/* --- TIMETABLE CARD --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200 p-6 flex flex-col relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-rose-100 text-rose-600 p-2 rounded-lg">
                  <Calendar size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Today's Schedule</h3>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{todayKey}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
              {todaysSchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaysSchedule.map((slot, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="min-w-[60px] text-xs font-bold text-slate-400 pt-1 group-hover:text-indigo-500 transition-colors">
                        {slot.time.split(' ')[0]} <br/> <span className="opacity-50 text-[10px]">{slot.time.split(' ')[1]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{slot.subject}</div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{slot.topic}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-8">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <Clock size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No schedule found for today.</p>
                  <p className="text-xs mt-1 opacity-70">Enjoy your revision time!</p>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          </motion.div>

        </div>

        {/* --- TABS --- */}
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
                  onSetTarget={handleSetTarget} // Pass the handler
                />
              ))
            }
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

// --- SUBJECT CARD WITH TARGET ---
function SubjectCard({ subject, onUpdate, onSetTarget }) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Progress Stats
  const total = subject.topics.length;
  const mastered = subject.topics.filter(t => t.userStatus.status === 'mastered').length;
  const revising = subject.topics.filter(t => t.userStatus.status === 'revision').length;
  const pending = total - mastered - revising;

  // 2. Calculate Days Remaining
  const targetDateObj = subject.targetDate ? new Date(subject.targetDate) : null;
  const today = new Date();
  // Reset time to start of day for accurate day diff
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
                      
                      {/* Properly Layered Date Input */}
                      <input 
                        type="date" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                        value={subject.targetDate ? new Date(subject.targetDate).toISOString().split('T')[0] : ""}
                        onClick={(e) => {
                          e.stopPropagation();
                          // In some browsers, clicking an input inside a clickable div requires extra handling or z-index
                        }}
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
               {Math.round(subject.completion)}%
             </span>
          </div>
          
          <div className="h-3.5 w-full bg-slate-100 rounded-full p-[3px] shadow-inner border border-slate-200/60">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${subject.completion}%` }}
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

      {/* ACCORDION CONTENT */}
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
              {subject.topics.map(topic => (
                <div 
                  key={topic._id} 
                  className={cn(
                    "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200",
                    topic.userStatus.status === 'mastered' 
                      ? "bg-emerald-50/30 border-emerald-100/50" 
                      : "bg-white border-transparent hover:border-indigo-100 hover:shadow-sm"
                  )}
                >
                  <div className="flex flex-col gap-1.5 max-w-[65%]">
                    <span className={cn(
                      "font-semibold text-sm transition-all duration-300",
                      topic.userStatus.status === 'mastered' ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'
                    )}>
                      {topic.name}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {topic.isHighYield && <Badge color="bg-rose-50 text-rose-600 border-rose-100">High Yield</Badge>}
                      {topic.hasPYQ && <Badge color="bg-indigo-50 text-indigo-600 border-indigo-100">PYQ</Badge>}
                      {topic.userStatus.status === 'revision' && (
                        <Badge color="bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1">
                           Rev {topic.userStatus.revisionCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ActionButton 
                      active={topic.userStatus.status === 'revision'} 
                      onClick={() => onUpdate(topic._id, topic.userStatus.status === 'revision' ? 'pending' : 'revision')}
                      icon={<RefreshCw size={15} strokeWidth={2.5} />}
                      title="Needs Revision"
                      activeClass="bg-amber-100 text-amber-700 border-amber-200 shadow-sm"
                    />
                    <ActionButton 
                      active={topic.userStatus.status === 'mastered'} 
                      onClick={() => onUpdate(topic._id, topic.userStatus.status === 'mastered' ? 'pending' : 'mastered')}
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