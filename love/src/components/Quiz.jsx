import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, RefreshCw, CheckCircle, XCircle, HelpCircle, Trophy } from 'lucide-react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Backend URL (Aapke project ke hisab se)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/questions/random`);
      setQuestions(res.data);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (err) {
      console.error("Error fetching questions:", err);
      alert("Questions load nahi ho paye backend se.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    // Dataset mein cop (Correct Option) 1-4 hota hai, hum use 0-3 index se match karenge
    if (optionIndex + 1 === questions[currentIndex].cop) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-gray-900 rounded-xl border border-blue-500/30">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-blue-300 animate-pulse">MedMCQA Questions Load Ho Rahe Hain...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="p-8 bg-gray-900 rounded-xl border border-yellow-500/50 text-center shadow-2xl">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
        <p className="text-gray-400 mb-6 text-lg">Aapka Score: <span className="text-blue-400 font-bold">{score} / {questions.length}</span></p>
        <button 
          onClick={fetchQuestions}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" /> Retake Quiz
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-10 bg-gray-900 rounded-xl border border-blue-500/30 text-center">
        <HelpCircle className="w-16 h-16 text-blue-500/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4 text-glow">NEET PG PYQ Practice</h2>
        <p className="text-gray-400 mb-8">MedMCQA dataset se random practice questions start karein.</p>
        <button 
          onClick={fetchQuestions}
          className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
        >
          Start New Practice
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const options = [currentQ.op_a, currentQ.op_b, currentQ.op_c, currentQ.op_d];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-2xl border border-blue-500/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-blue-400 text-sm font-mono tracking-widest uppercase">Question {currentIndex + 1} of {questions.length}</span>
        <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/30">{currentQ.subject_name}</span>
      </div>

      <h3 className="text-xl text-white font-medium mb-8 leading-relaxed">
        {currentQ.question}
      </h3>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {options.map((opt, i) => {
          let buttonClass = "w-full p-4 rounded-xl text-left transition-all border flex items-center justify-between ";
          
          if (!isAnswered) {
            buttonClass += "bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-700 text-gray-300";
          } else {
            const isCorrect = i + 1 === currentQ.cop;
            const isSelected = i === selectedOption;
            
            if (isCorrect) {
              buttonClass += "bg-green-900/40 border-green-500 text-green-200";
            } else if (isSelected) {
              buttonClass += "bg-red-900/40 border-red-500 text-red-200";
            } else {
              buttonClass += "bg-gray-800 border-gray-700 text-gray-500";
            }
          }

          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered} className={buttonClass}>
              <span>{opt}</span>
              {isAnswered && i + 1 === currentQ.cop && <CheckCircle className="w-5 h-5 text-green-500" />}
              {isAnswered && i === selectedOption && i + 1 !== currentQ.cop && <XCircle className="w-5 h-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl mb-6">
            <h4 className="text-blue-400 font-bold text-sm uppercase mb-2">Explanation:</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{currentQ.exp || "No explanation provided for this question."}</p>
          </div>
          
          <button 
            onClick={nextQuestion}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {currentIndex === questions.length - 1 ? "Show Result" : "Next Question"} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;