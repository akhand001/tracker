import React, { useState } from 'react';

export default function ActiveRecallCard({ item, onReviewComplete }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (optionText) => {
    if (showExplanation) return;
    setSelectedOpt(optionText);
    setShowExplanation(true);
  };

  const isCorrect = selectedOpt === item.correctOption;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto text-slate-100">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/30">
          {item.subject} • {item.topic}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
          item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {item.priority} PRIORITY
        </span>
      </div>

      <p className="text-base font-medium mb-6 leading-relaxed">{item.questionStem}</p>

      <div className="space-y-2 mb-6">
        {item.options.map((opt) => {
          let btnStyle = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750";
          if (showExplanation) {
            if (opt.text === item.correctOption) {
              btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
            } else if (opt.text === selectedOpt) {
              btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300";
            }
          }
          return (
            <button
              key={opt.text}
              disabled={showExplanation}
              onClick={() => handleSelect(opt.text)}
              className={`w-full text-left px-4 py-3 rounded-xl border font-medium text-sm transition-all ${btnStyle}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-sm animate-fadeIn">
          <div>
            <span className="font-semibold text-indigo-400">Why Correct: </span>
            <span className="text-slate-300">{item.explanation}</span>
          </div>
          {item.memoryHook && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
              💡 <strong>Memory Hook:</strong> {item.memoryHook}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onReviewComplete(item._id, isCorrect)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-all"
            >
              Next Concept ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}