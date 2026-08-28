import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, RefreshCw, Trophy, Clock, Activity, 
  Brain, Play, Wifi, WifiOff, Pause, RotateCcw, 
  Battery, AlertCircle, Eye, ChevronLeft, Flame, Layers,
  Settings, Zap, List, BookOpen, Filter
} from 'lucide-react';

/**
 * 🚀 MEDICAL QUIZ PRO - ULTIMATE EDITION v4.0 (Fixed & Enhanced)
 * Updates:
 * - Added Subject-Wise Filtering
 * - Fixed Result Logic Calculation
 * - Improved Session Management
 * - Enhanced UI for Selection
 */

// --- CONFIGURATION ---
const RENDER_BASE_URL = 'https://tracker-om85.onrender.com';
const STORAGE_KEY = 'neet_pg_pro_session_v4'; 

// --- SUBJECT LIST (NEET PG Standard) ---
const SUBJECTS = [
  "All Subjects",
  "Anatomy", "Physiology", "Biochemistry",
  "Pathology", "Pharmacology", "Microbiology",
  "Forensic Medicine", "PSM", "ENT",
  "Ophthalmology", "Medicine", "Surgery",
  "OBGYN", "Pediatrics", "Orthopedics",
  "Psychiatry", "Dermatology", "Radiology",
  "Anesthesia"
];

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

// Timer component
const Timer = React.memo(({ duration, onTimeout, isPaused, questionId }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, questionId]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next === 0) {
          onTimeout();
        }
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

const StartScreen = ({ 
  session, resumeSession, startNewSession, loading, isOnline, config, setConfig,
  selectedSubject, setSelectedSubject 
}) => {
  
  const toggleLimit = () => {
    const limits = [10, 20, 30, 50];
    const currentIndex = limits.indexOf(config.limit);
    const nextLimit = limits[(currentIndex + 1) % limits.length];
    setConfig(prev => ({ ...prev, limit: nextLimit }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="h-full flex flex-col p-4 md:p-8 relative overflow-y-auto"
    >
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto space-y-6 my-auto">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl mx-auto transform rotate-3">
             <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            NEET PG <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-slate-400 text-sm">Advanced Clinical Simulation</p>
        </div>

        <GlassCard className="w-full space-y-6 border-t-white/20">
          
          {/* Settings Row */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={toggleLimit} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1 transition-all">
              <List className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">{config.limit} Questions</span>
            </button>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1 opacity-70">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">1 Min / Q</span>
            </div>
          </div>

          {/* Subject Selection Grid */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              <BookOpen className="w-3 h-3" /> Select Subject
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold text-left truncate transition-all border ${
                    selectedSubject === sub 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {session && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={resumeSession}
                className="w-full h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" /> 
                Resume: {session.selectedSubject || "Exam"}
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={startNewSession}
              disabled={loading || !isOnline}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              Start {selectedSubject === "All Subjects" ? "Full Mock" : selectedSubject}
            </motion.button>
          </div>
        </GlassCard>

        {/* Status Footer */}
        <div className="flex gap-4">
          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'System Online' : 'Offline Mode'}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const QuizScreen = ({ 
  questions, currentIndex, answersLog, isPaused, setIsPaused, 
  handleAnswer, nextQuestion, prevQuestion, reviewMode, timePerQ,
  onFinish
}) => {
  const currentQ = questions[currentIndex];
  // Ensure we check if the ANSWER LOG has an entry for this index
  const isAnswered = answersLog.hasOwnProperty(currentIndex);
  
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentSubject = currentQ?.subject_name || "General";
  const isLastQuestion = currentIndex === questions.length - 1;

  // Handler to auto-move if needed, but for now we keep manual next
  const handleTimeout = () => {
    // If time runs out, mark as skipped (-1) or just do nothing? 
    // Let's mark as -1 (Unanswered) to stop timer
    if (!isAnswered && !reviewMode) {
       handleAnswer(-1); // -1 indicates timeout/skip
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPaused(true)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400">
            <Pause className="w-5 h-5 fill-current" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Question <span className="text-white text-sm">{currentIndex + 1}</span> / {questions.length}
            </span>
            <div className="h-1 w-24 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-500" />
            </div>
          </div>
        </div>
        
        <Timer 
          questionId={currentQ._id || currentIndex} // Reset timer when ID changes
          duration={timePerQ} 
          isPaused={isPaused || isAnswered || reviewMode} 
          onTimeout={handleTimeout}
        />
      </header>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-40 scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tags */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                {currentSubject}
              </span>
              {reviewMode && isAnswered && (
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                  answersLog[currentIndex] === (currentQ.cop - 1) 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500 text-red-400'
                }`}>
                  {answersLog[currentIndex] === (currentQ.cop - 1) ? 'Correct' : 'Incorrect'}
                </span>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed mb-8">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {[currentQ.opa, currentQ.opb, currentQ.opc, currentQ.opd].map((opt, i) => {
                const isSelected = answersLog[currentIndex] === i;
                const isCorrect = (currentQ.cop - 1) === i;
                
                let style = "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800";
                
                // Logic for coloring options
                if (isAnswered) {
                  // If answered, show Right/Wrong immediately (Practice Mode)
                  if (isCorrect) style = "bg-emerald-900/20 border-emerald-500/50 text-emerald-100";
                  else if (isSelected) style = "bg-red-900/20 border-red-500/50 text-red-100";
                  else style = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                } 

                return (
                  <motion.button
                    key={i}
                    disabled={isAnswered} // Lock after answering
                    onClick={() => handleAnswer(i)}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    className={`w-full p-4 rounded-xl border flex items-start gap-4 text-left transition-all ${style}`}
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border mt-0.5 ${
                      isAnswered && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                      isAnswered && isSelected ? 'bg-red-500 border-red-500 text-white' :
                      'border-slate-600 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-medium text-sm">{opt}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Explanation & Navigation Footer */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full bg-slate-900 border-t border-white/10 rounded-t-[32px] p-6 pb-8 z-40 shadow-2xl"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4 opacity-50" />
            
            <div className="mb-4 max-h-[140px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Brain className="w-3 h-3" /> Clinical Explanation
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {currentQ.exp || "Explanation not available for this question."}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="w-14 h-14 bg-slate-800 text-white rounded-xl flex items-center justify-center disabled:opacity-30 border border-slate-700"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {isLastQuestion ? (
                 <button 
                  onClick={onFinish}
                  className="flex-1 h-14 bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                >
                  Finish Exam <Trophy className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className="flex-1 h-14 bg-white text-slate-950 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-200 shadow-xl"
                >
                  Next Question <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Modal */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <GlassCard className="w-full max-w-sm text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Pause className="w-8 h-8 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Exam Paused</h2>
              <button 
                onClick={() => setIsPaused(false)}
                className="w-full py-3 mt-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                Resume
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
  const attempted = Object.keys(answersLog).length;
  const incorrect = attempted - score;
  const skipped = questions.length - attempted;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto">
      <div className="p-6 pb-20 space-y-6">
        <div className="text-center mt-8">
          <div className="w-24 h-24 mx-auto bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center mb-4 relative">
             <div className="absolute inset-0 border-4 border-blue-500 rounded-full opacity-20"></div>
             <span className="text-3xl font-black text-white">{percentage}%</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Quiz Completed</h1>
          <p className="text-slate-400">Here is your performance report</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-400">{score}</div>
              <div className="text-[10px] uppercase text-emerald-600 font-bold">Correct</div>
           </div>
           <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-red-400">{incorrect}</div>
              <div className="text-[10px] uppercase text-red-600 font-bold">Wrong</div>
           </div>
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-slate-300">{skipped}</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Skipped</div>
           </div>
        </div>

        <div className="space-y-3 pt-6">
          <button 
            onClick={() => { setReviewMode(true); setCurrentIndex(0); setView('quiz'); }}
            className="w-full h-14 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" /> Review Answers
          </button>

          <button 
            onClick={() => {
               clearSession();
               setView('start');
            }}
            className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <RefreshCw className="w-5 h-5" /> Take New Exam
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [view, setView] = useState('start'); 
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersLog, setAnswersLog] = useState({}); 
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  
  // New State for Subject & Config
  const [config, setConfig] = useState({ limit: 20, timePerQ: 60 });
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  
  const { session, saveSession, clearSession } = useSession();
  const isOnline = useNetworkStatus();

  // Correct Score Calculation
  const score = Object.keys(answersLog).reduce((acc, key) => {
    const qIndex = parseInt(key);
    const q = questions[qIndex];
    // Check if the answer matches the Correct Option (cop). 
    // Note: cop is usually 1-based in databases (1=A, 2=B), logic needs to match
    if (q && answersLog[key] === (q.cop - 1)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const startNewSession = async () => {
    setLoading(true);
    try {
      if (!isOnline) throw new Error("Offline");
      
      // LOGIC FIX: Construct URL based on Subject
      let url = `${RENDER_BASE_URL}/api/questions/random`;
      
      // Note: Assuming your backend accepts ?subject=Anatomy or similar.
      // If your backend handles filtering differently, adjust this query param.
      if (selectedSubject !== "All Subjects") {
         // Using a query param that typical APIs expect. 
         // If your API ignores this, it will just return random questions (fallback).
         url += `?subject=${encodeURIComponent(selectedSubject)}`;
      }

      const res = await axios.get(url, { timeout: 15000 });
      
      if (res.data?.length) {
        // Apply Limit
        let newQuestions = res.data;
        
        // Client-side filtering as backup if API returns everything
        if (selectedSubject !== "All Subjects") {
             const filtered = newQuestions.filter(q => q.subject_name === selectedSubject);
             if (filtered.length > 0) newQuestions = filtered;
        }

        newQuestions = newQuestions.slice(0, config.limit);
        
        setQuestions(newQuestions);
        setAnswersLog({});
        setCurrentIndex(0);
        setIsPaused(false);
        setReviewMode(false);
        setView('quiz');
        
        saveSession({ 
           questions: newQuestions, 
           answersLog: {}, 
           currentIndex: 0, 
           selectedSubject,
           ts: Date.now() 
        });
      } else {
        alert("No questions found for this subject. Try another.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch questions. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const resumeSession = () => {
    if (session && session.questions) {
      setQuestions(session.questions);
      setAnswersLog(session.answersLog || {});
      setCurrentIndex(session.currentIndex || 0);
      setSelectedSubject(session.selectedSubject || "All Subjects");
      setView('quiz');
    }
  };

  const handleAnswer = (optionIndex) => {
    // Prevent re-answering
    if (answersLog.hasOwnProperty(currentIndex)) return;

    const newLog = { ...answersLog, [currentIndex]: optionIndex };
    setAnswersLog(newLog);
    
    // Auto-save logic
    saveSession({ 
       questions, 
       answersLog: newLog, 
       currentIndex, 
       selectedSubject,
       ts: Date.now() 
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      saveSession({ ...session, currentIndex: nextIdx });
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
      <div className="mx-auto max-w-md h-full bg-slate-950 relative shadow-2xl flex flex-col border-x border-white/5">
        <AnimatePresence mode="wait">
          {view === 'start' && (
            <motion.div key="start" className="h-full" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <StartScreen 
                session={session} 
                resumeSession={resumeSession} 
                startNewSession={startNewSession} 
                loading={loading} 
                isOnline={isOnline}
                config={config}
                setConfig={setConfig}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            </motion.div>
          )}
          {view === 'quiz' && (
            <motion.div key="quiz" className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
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
                onFinish={finishExam}
              />
            </motion.div>
          )}
          {view === 'result' && (
            <motion.div key="result" className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <ResultScreen 
                score={score}
                questions={questions}
                answersLog={answersLog}
                setReviewMode={setReviewMode}
                setCurrentIndex={setCurrentIndex}
                setView={setView}
                startNewSession={() => { setView('start'); }}
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