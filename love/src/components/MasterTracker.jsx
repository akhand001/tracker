import React, { useState, useEffect } from 'react';

const STATUS_ICONS = {
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: '🟢' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: '🟡' },
  NOT_STARTED: { label: 'Not Started', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: '🔴' },
  WEAK: { label: 'Weak Area', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: '⚠️' }
};

export default function MasterTracker({ subjectData, onUpdateProgress }) {
  const [selectedSubject, setSelectedSubject] = useState(subjectData[0]?.subjectName || '');

  const currentSubject = subjectData.find(s => s.subjectName === selectedSubject);

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800">
      <div className="flex flex-wrap gap-2 mb-6">
        {subjectData.map((subj) => (
          <button
            key={subj.subjectName}
            onClick={() => setSelectedSubject(subj.subjectName)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSubject === subj.subjectName
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {subj.subjectName}
          </button>
        ))}
      </div>

      {currentSubject && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 px-4">Topic</th>
                <th className="pb-3 px-2 text-center">Videos</th>
                <th className="pb-3 px-2 text-center">Notes</th>
                <th className="pb-3 px-2 text-center">PYQs</th>
                <th className="pb-3 px-2 text-center">QBank</th>
                <th className="pb-3 px-2 text-center">Rev 1</th>
                <th className="pb-3 px-2 text-center">Rev 2</th>
                <th className="pb-3 px-2 text-center">Rev 3</th>
                <th className="pb-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentSubject.topics.map((topic) => (
                <tr key={topic.topicId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium">{topic.topicName}</td>
                  {['videosCompleted', 'notesCompleted', 'pyqCompleted', 'mcqsCompleted', 'revision1', 'revision2', 'revision3'].map((field) => (
                    <td key={field} className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={topic[field]}
                        onChange={(e) => onUpdateProgress(currentSubject.subjectName, topic.topicId, field, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_ICONS[topic.status].color}`}>
                      {STATUS_ICONS[topic.status].icon} {STATUS_ICONS[topic.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}