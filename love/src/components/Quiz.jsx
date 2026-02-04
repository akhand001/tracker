import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, RefreshCw, Trophy, Clock, Activity, 
  Brain, Play, Wifi, WifiOff, Pause, RotateCcw, 
  Battery, AlertCircle, Eye, ChevronLeft, Flame, Layers,
  Settings, Zap, List
} from 'lucide-react';

/**
 * 🚀 MEDICAL QUIZ PRO - ULTIMATE EDITION v3.2
 * Features:
 * - Configurable Question Limits (10, 20, 30)
 * - Explicit 1-Minute Timer Setting
 * - Enhanced Question Counter Visibility
 */

// --- CONFIGURATION ---
const RENDER_BASE_URL = 'https://tracker-om85.onrender.com';
const STORAGE_KEY = 'neet_pg_pro_session_v2'; // Bumped version for new config structure

// --- UTILITY HOOKS ---

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
};

const useSession = () => {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  });

  const saveSession = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return { session, saveSession, clearSession };
};

// --- UI COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
);

const GlassCard = ({ children, className = "", noPadding = false }) => (
  <div className={`relative backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-2xl overflow-hidden ${noPadding ? '' : 'p-6'} rounded-[24px] ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    {children}
  </div>
);

const AnimatedNumber = ({ value }) => (
  <motion.span
    key={value}
    initial={{ y: 10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="inline-block"
  >
    {value}
  </motion.span>
);

// Timer component isolated to prevent parent re-renders
const Timer = React.memo(({ duration, onTimeout, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next === 0) onTimeout();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onTimeout]);

  const isCritical = timeLeft <= 10;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors duration-300 font-mono font-bold text-sm tabular-nums
      ${isCritical ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-900/50 border-white/10 text-blue-400'}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
    </div>
  );
});

// --- SUB-SCREENS ---

const StartScreen = ({ session, resumeSession, startNewSession, loading, isOnline, config, setConfig }) => {
  // Config Handlers
  const toggleLimit = () => {
    const limits = [10, 20, 30, 50];
    const currentIndex = limits.indexOf(config.limit);
    const nextLimit = limits[(currentIndex + 1) % limits.length];
    setConfig(prev => ({ ...prev, limit: nextLimit }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden"
    >
      <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[80%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full max-w-sm">
        <GlassCard className="p-8 w-full flex flex-col items-center gap-6 border-t-white/20">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-30 animate-pulse" />
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transform rotate-6">
              <Activity className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter italic">
              NEET PG <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">PRO</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-2">
              Advanced Clinical Simulation
            </p>
          </div>

          {/* Settings Panel */}
          <div className="w-full bg-slate-950/50 rounded-xl p-3 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              <span>Exam Settings</span>
              <Settings className="w-3 h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={toggleLimit}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2.5 flex flex-col items-center gap-1 transition-all active:scale-95"
              >
                <List className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">{config.limit} Questions</span>
              </button>
              
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center gap-1 opacity-80 cursor-default">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">1 Min / Q</span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            {session && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={resumeSession}
                className="w-full h-14 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <RotateCcw className="w-5 h-5 text-emerald-400" /> 
                <span>Resume Session</span>
                <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-500">
                  Q{session.currentIndex + 1}
                </span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startNewSession}
              disabled={loading || !isOnline}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              Start New Exam
            </motion.button>
          </div>
        </GlassCard>

        <div className="flex gap-3">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-slate-400 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <Battery className="w-3 h-3" /> Saver Mode
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuizScreen = ({ 
  questions, currentIndex, answersLog, isPaused, setIsPaused, 
  handleAnswer, nextQuestion, prevQuestion, reviewMode, timePerQ
}) => {
  const currentQ = questions[currentIndex];
  const isAnswered = answersLog[currentIndex] !== undefined;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentSubject = currentQ?.subject_name || "General";

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      <header className="px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPaused(true)} className="p-2 -ml-2 rounded-full hover:bg-white/5 active:scale-95 transition-all text-slate-400">
            <Pause className="w-5 h-5 fill-current" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              Question <span className="text-white text-sm">{currentIndex + 1}</span> <span className="text-slate-700">/ {questions.length}</span>
            </span>
            <div className="h-1 w-24 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <Timer 
          key={currentIndex} 
          duration={timePerQ} 
          isPaused={isPaused || isAnswered || reviewMode} 
          onTimeout={() => handleAnswer(-1)}
        />
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-40 scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                {currentSubject}
              </span>
              {reviewMode && isAnswered && (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                  answersLog[currentIndex] === (currentQ.cop - 1) 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {answersLog[currentIndex] === (currentQ.cop - 1) ? 'Correct' : 'Incorrect'}
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug mb-8">
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {[currentQ.opa, currentQ.opb, currentQ.opc, currentQ.opd].map((opt, i) => {
                const isSelected = answersLog[currentIndex] === i;
                const isCorrect = (currentQ.cop - 1) === i;
                
                let style = "bg-slate-900 border-slate-800 text-slate-400";
                if (isAnswered) {
                  if (isCorrect) style = "bg-emerald-500/10 border-emerald-500/50 text-emerald-100";
                  else if (isSelected) style = "bg-red-500/10 border-red-500/50 text-red-100";
                  else style = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                } else if (isSelected) {
                  style = "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20";
                }

                return (
                  <motion.button
                    key={i}
                    disabled={isAnswered && !reviewMode}
                    onClick={() => !reviewMode && handleAnswer(i)}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    className={`w-full p-4 rounded-2xl border-2 flex items-start gap-4 text-left transition-all ${style}`}
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border mt-0.5 ${
                      isAnswered && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                      isAnswered && isSelected ? 'bg-red-500 border-red-500 text-white' :
                      'border-current opacity-60'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-medium text-sm md:text-base leading-relaxed">{opt}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-6 pb-8 z-40 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]"
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 opacity-50" />
            
            <div className="mb-6 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Brain className="w-3 h-3" /> Clinical Explanation
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {currentQ.exp || "Review standard treatment guidelines. Clinical correlation is recommended."}
              </p>
            </div>

            <div className="flex gap-3">
              {reviewMode && (
                <button 
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="flex-1 h-14 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={nextQuestion}
                className="flex-[3] h-14 bg-white text-slate-950 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all shadow-xl"
              >
                {currentIndex === questions.length - 1 ? (reviewMode ? "Back to Results" : "Finish Exam") : "Next Question"} 
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8"
          >
            <GlassCard className="w-full max-w-sm text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Pause className="w-8 h-8 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Exam Paused</h2>
              <p className="text-slate-400 text-sm mb-8">Timer is stopped. Take a breather.</p>
              <button 
                onClick={() => setIsPaused(false)}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                Resume Exam
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultScreen = ({ 
  score, questions, answersLog, setReviewMode, 
  setCurrentIndex, setView, startNewSession, clearSession 
}) => {
  const percentage = Math.round((score / questions.length) * 100);
  let perf = { label: "Needs Improvement", color: "text-red-400", bg: "bg-red-500", icon: AlertCircle };
  if (percentage >= 80) perf = { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500", icon: Trophy };
  else if (percentage >= 50) perf = { label: "Good Start", color: "text-amber-400", bg: "bg-amber-500", icon: Flame };
  
  const incorrectCount = questions.length - score;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto">
      <div className="p-6 pb-32 space-y-6">
        <div className="text-center mt-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-white/10 mb-6"
          >
            <perf.icon className={`w-4 h-4 ${perf.color}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${perf.color}`}>{perf.label}</span>
          </motion.div>

          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
            <AnimatedNumber value={percentage} />%
          </h1>
          <p className="text-slate-400 font-medium">Accuracy Score</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="flex flex-col items-center gap-1 py-4">
            <span className="text-2xl font-bold text-white">{score}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correct</span>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-emerald-500" />
            </div>
          </GlassCard>
          
          <GlassCard className="flex flex-col items-center gap-1 py-4">
            <span className="text-2xl font-bold text-white">{incorrectCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incorrect</span>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${100 - percentage}%` }} className="h-full bg-red-500" />
            </div>
          </GlassCard>
        </div>

        <GlassCard className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold">Questions Attempted</div>
              <div className="text-xs text-slate-500">{Object.keys(answersLog).length} / {questions.length}</div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-3 pt-4">
          <button 
            onClick={() => { setReviewMode(true); setCurrentIndex(0); setView('quiz'); }}
            className="w-full h-14 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
          >
            <Eye className="w-5 h-5" /> Review Answers
          </button>

          <button 
            onClick={startNewSession}
            className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all"
          >
            <RefreshCw className="w-5 h-5" /> Start New Session
          </button>
          
          <button 
            onClick={() => { setView('start'); clearSession(); }}
            className="w-full h-12 text-slate-500 font-bold text-sm hover:text-slate-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP (CONTAINER ONLY) ---

const App = () => {
  const [view, setView] = useState('start'); 
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersLog, setAnswersLog] = useState({}); 
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [config, setConfig] = useState({ limit: 20, timePerQ: 60 });
  
  const { session, saveSession, clearSession } = useSession();
  const isOnline = useNetworkStatus();

  const score = Object.keys(answersLog).reduce((acc, key) => {
    const q = questions[parseInt(key)];
    return q && answersLog[key] === (q.cop - 1) ? acc + 1 : acc;
  }, 0);

  const startNewSession = async () => {
    setLoading(true);
    try {
      if (!isOnline) throw new Error("Offline");
      const res = await axios.get(`${RENDER_BASE_URL}/api/questions/random`, { timeout: 15000 });
      if (res.data?.length) {
        // Apply Limit
        const newQuestions = res.data.slice(0, config.limit);
        setQuestions(newQuestions);
        setAnswersLog({});
        setCurrentIndex(0);
        setIsPaused(false);
        setReviewMode(false);
        setView('quiz');
        saveSession({ questions: newQuestions, answersLog: {}, currentIndex: 0, ts: Date.now() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resumeSession = () => {
    if (session) {
      setQuestions(session.questions);
      setAnswersLog(session.answersLog);
      setCurrentIndex(session.currentIndex);
      setView('quiz');
    }
  };

  const handleAnswer = (optionIndex) => {
    if (answersLog[currentIndex] !== undefined) return;
    const newLog = { ...answersLog, [currentIndex]: optionIndex };
    setAnswersLog(newLog);
    saveSession({ questions, answersLog: newLog, currentIndex, ts: Date.now() });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      saveSession({ ...session, currentIndex: nextIdx });
    } else {
      finishExam();
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const finishExam = () => {
    clearSession();
    setView('result');
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <NoiseOverlay />
      <div className="mx-auto max-w-md h-full bg-slate-950/50 relative shadow-2xl flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'start' && (
            <motion.div key="start" className="h-full" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <StartScreen 
                session={session} 
                resumeSession={resumeSession} 
                startNewSession={startNewSession} 
                loading={loading} 
                isOnline={isOnline}
                config={config}
                setConfig={setConfig}
              />
            </motion.div>
          )}
          {view === 'quiz' && (
            <motion.div key="quiz" className="h-full" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <QuizScreen 
                questions={questions}
                currentIndex={currentIndex}
                answersLog={answersLog}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                handleAnswer={handleAnswer}
                nextQuestion={nextQuestion}
                prevQuestion={prevQuestion}
                reviewMode={reviewMode}
                timePerQ={config.timePerQ}
              />
            </motion.div>
          )}
          {view === 'result' && (
            <motion.div key="result" className="h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <ResultScreen 
                score={score}
                questions={questions}
                answersLog={answersLog}
                setReviewMode={setReviewMode}
                setCurrentIndex={setCurrentIndex}
                setView={setView}
                startNewSession={startNewSession}
                clearSession={clearSession}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;