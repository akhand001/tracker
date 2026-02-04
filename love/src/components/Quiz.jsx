import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ChevronRight, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Trophy, 
  Clock, 
  BrainCircuit,
  BarChart3,
  Timer
} from 'lucide-react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [answersLog, setAnswersLog] = useState([]);

  // --- CONFIGURATION ---
  const RENDER_BASE_URL = 'https://tracker-om85.onrender.com'; 

const fetchQuestions = async () => {
  setLoading(true);
  setQuestions([]);
  setShowResult(false);
  
  try {
    // Only use the valid API route we just created
    const res = await axios.get(`${RENDER_BASE_URL}/api/questions/random`, { timeout: 15000 });
    
    if (res.data && res.data.length > 0) {
      setQuestions(res.data);
      resetState();
    } else {
      throw new Error("No data received");
    }
  } catch (err) {
    console.error("API Error:", err);
    alert("Backend connection failed. Note: Render servers sleep after 15 mins of inactivity and can take 1 minute to wake up.");
  } finally {
    setLoading(false);
  }
};
  // Timer logic
  useEffect(() => {
    if (questions.length > 0 && !isAnswered && !showResult && !loading) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        handleAnswer(-1); // Auto-submit on time out
      }
    }
  }, [timeLeft, isAnswered, showResult, loading, questions]);

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    const correct = optionIndex + 1 === questions[currentIndex].cop;
    if (correct) setScore(prev => prev + 1);
    
    setAnswersLog(prev => [...prev, {
      question: questions[currentIndex].question,
      isCorrect: correct,
      correctAnswer: getOptionText(questions[currentIndex].cop - 1)
    }]);
  };

  const getOptionText = (idx) => {
    const q = questions[currentIndex];
    if (!q) return "";
    const opts = [q.opa, q.opb, q.opc, q.opd];
    return opts[idx] || "N/A";
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setTimeLeft(30);
    } else {
      setShowResult(true);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-900 rounded-3xl border border-blue-500/20 shadow-2xl">
      <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-4" />
      <p className="text-blue-200 font-medium">Medical Database se Connect Ho Raha Hai...</p>
      <p className="text-slate-500 text-xs mt-2 italic">Aapke server ko jaagne mein thoda waqt lag sakta hai...</p>
    </div>
  );

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-8 bg-slate-950 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"></div>
        <div className="text-center mb-10 pt-4">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white italic">SESSION RESULTS</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Score</p>
            <p className="text-4xl font-black text-blue-400">{score}/{questions.length}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-4xl font-black text-emerald-400">{percentage}%</p>
          </div>
        </div>
        <button onClick={fetchQuestions} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5" /> NEW SESSION
        </button>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div className="p-12 bg-slate-900 rounded-[3rem] border border-blue-500/20 text-center relative shadow-2xl">
      <BrainCircuit className="w-20 h-20 text-blue-500/30 mx-auto mb-8" />
      <h2 className="text-3xl font-black text-white mb-4 italic">NEET PG PYQ BANK</h2>
      <p className="text-slate-400 mb-10 max-w-sm mx-auto">Random selection of high-yield MCQs for rapid revision.</p>
      <button onClick={fetchQuestions} className="px-16 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] transition-all">
        LAUNCH PRACTICE
      </button>
    </div>
  );

  const currentQ = questions[currentIndex];
  const options = [currentQ.opa, currentQ.opb, currentQ.opc, currentQ.opd];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">
            {currentIndex + 1}
          </span>
          <span className="text-blue-300 font-bold text-xs uppercase tracking-[0.2em]">{currentQ.subject_name}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${timeLeft < 10 ? 'border-red-500 text-red-500' : 'border-slate-700 text-slate-400'}`}>
          <Timer className="w-4 h-4" />
          <span className="font-mono font-bold">{timeLeft}s</span>
        </div>
      </div>

      <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
        <h3 className="text-xl text-slate-100 font-semibold mb-10 leading-relaxed">{currentQ.question}</h3>
        <div className="grid gap-4 mb-10">
          {options.map((opt, i) => {
            const isCorrect = i + 1 === currentQ.cop;
            const isSelected = i === selectedOption;
            let btnStyle = "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/50";
            if (isAnswered) {
              if (isCorrect) btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
              else if (isSelected) btnStyle = "bg-red-500/10 border-red-500 text-red-400";
              else btnStyle = "bg-slate-900 border-slate-800 text-slate-600 opacity-40";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered} 
                className={`w-full p-6 rounded-2xl text-left transition-all border-2 flex items-center justify-between group ${btnStyle}`}>
                <div className="flex items-center gap-5">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border ${isSelected ? 'bg-current text-slate-950' : 'bg-slate-700/50'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium">{opt}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle className="text-emerald-500 w-6 h-6 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 w-6 h-6 shrink-0" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/20">
              <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                <BarChart3 className="w-3 h-3" /> Faculty Explanation
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed italic">{currentQ.exp || "Explanation processing..."}</p>
            </div>
            <button onClick={nextQuestion} className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-2xl">
              {currentIndex === questions.length - 1 ? "FINISH" : "NEXT QUESTION"} <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;