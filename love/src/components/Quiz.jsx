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

  const API_URL = import.meta.env.VITE_API_URL || 'https://tracker-om85.onrender.com';

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // API endpoint check karein (aapke server.js ke route ke hisab se)
      const res = await axios.get(`${API_URL}/questions/random`);
      setQuestions(res.data);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (err) {
      console.error("Error fetching questions:", err);
      alert("Questions load nahi ho paye. Check karein ki backend chal raha hai.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    // Aapke JSON mein 'cop' 1-indexed hai (1, 2, 3, 4)
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
        <p className="text-blue-300 animate-pulse">Questions Load Ho Rahe Hain...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="p-8 bg-gray-900 rounded-xl border border-yellow-500/50 text-center shadow-2xl">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
        <p className="text-gray-400 mb-6 text-lg">Aapka Score: <span className="text-blue-400 font-bold">{score} / {questions.length}</span></p>
        <button onClick={fetchQuestions} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto">
          <RefreshCw className="w-5 h-5" /> Retake Quiz
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-10 bg-gray-900 rounded-xl border border-blue-500/30 text-center">
        <HelpCircle className="w-16 h-16 text-blue-500/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">NEET PG Practice</h2>
        <button onClick={fetchQuestions} className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Start Quiz
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  // UPDATE: Yahan opa, opb, opc, opd use kiya hai aapke JSON structure ke hisab se
  const options = [currentQ.opa, currentQ.opb, currentQ.opc, currentQ.opd];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-2xl border border-blue-500/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-blue-400 text-sm font-mono uppercase">Question {currentIndex + 1} of {questions.length}</span>
        <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/30">{currentQ.subject_name}</span>
      </div>

      <h3 className="text-xl text-white font-medium mb-8 leading-relaxed">
        {currentQ.question}
      </h3>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {options.map((opt, i) => {
          let buttonClass = "w-full p-4 rounded-xl text-left transition-all border flex items-center justify-between ";
          if (!isAnswered) {
            buttonClass += "bg-gray-800 border-gray-700 hover:border-blue-500 text-gray-300";
          } else {
            const isCorrect = i + 1 === currentQ.cop;
            const isSelected = i === selectedOption;
            if (isCorrect) buttonClass += "bg-green-900/40 border-green-500 text-green-200";
            else if (isSelected) buttonClass += "bg-red-900/40 border-red-500 text-red-200";
            else buttonClass += "bg-gray-800 border-gray-700 text-gray-500";
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
        <div className="mt-6">
          <div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl mb-6">
            <h4 className="text-blue-400 font-bold text-sm uppercase mb-2">Explanation:</h4>
            <p className="text-gray-300 text-sm">{currentQ.exp || "No explanation available."}</p>
          </div>
          <button onClick={nextQuestion} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
            {currentIndex === questions.length - 1 ? "Show Result" : "Next Question"} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;