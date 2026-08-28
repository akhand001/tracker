import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle2, AlertCircle, Clock, Search, 
  Filter, Flame, Star, Sparkles, CheckSquare, Layers 
} from 'lucide-react';

const STATUS_CONFIG = {
  COMPLETED: { 
    text: 'Completed', 
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', 
    dot: 'bg-emerald-400' 
  },
  IN_PROGRESS: { 
    text: 'In Progress', 
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', 
    dot: 'bg-amber-400' 
  },
  NOT_STARTED: { 
    text: 'Not Started', 
    badge: 'bg-zinc-800/80 text-zinc-500 border-zinc-700/40', 
    dot: 'bg-zinc-600' 
  },
  WEAK: { 
    text: 'Weak Area', 
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', 
    dot: 'bg-rose-400' 
  },
};

const CATEGORIES = ['All', 'Pre-Clinical', 'Para-Clinical', 'Clinical'];

export default function MasterTrackerGrid() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSubject, setActiveSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tracker/subjects');
      const data = await res.json();
      setSubjects(data);
      if (data && data.length > 0) {
        setActiveSubject(data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setLoading(false);
    }
  };

  const handleToggle = async (subjectName, topicName, field, currentValue) => {
    const updatedValue = !currentValue;

    // 1. Optimistic UI update
    setSubjects(prevSubjects => prevSubjects.map(subj => {
      if (subj.subjectName !== subjectName) return subj;
      return {
        ...subj,
        topics: subj.topics.map(t => {
          if (t.topicName !== topicName) return t;
          const updatedTopic = { ...t, [field]: updatedValue };

          if (updatedTopic.isWeak) {
            updatedTopic.status = 'WEAK';
          } else if (updatedTopic.revision1 || (updatedTopic.videosCompleted && updatedTopic.notesCompleted && updatedTopic.mcqsCompleted)) {
            updatedTopic.status = 'COMPLETED';
          } else if (updatedTopic.videosCompleted || updatedTopic.notesCompleted || updatedTopic.mcqsCompleted || updatedTopic.pyqCompleted) {
            updatedTopic.status = 'IN_PROGRESS';
          } else {
            updatedTopic.status = 'NOT_STARTED';
          }
          return updatedTopic;
        })
      };
    }));

    if (activeSubject && activeSubject.subjectName === subjectName) {
      setActiveSubject(prev => ({
        ...prev,
        topics: prev.topics.map(t => {
          if (t.topicName !== topicName) return t;
          const updatedTopic = { ...t, [field]: updatedValue };
          if (updatedTopic.isWeak) updatedTopic.status = 'WEAK';
          else if (updatedTopic.revision1 || (updatedTopic.videosCompleted && updatedTopic.notesCompleted && updatedTopic.mcqsCompleted)) updatedTopic.status = 'COMPLETED';
          else if (updatedTopic.videosCompleted || updatedTopic.notesCompleted || updatedTopic.mcqsCompleted || updatedTopic.pyqCompleted) updatedTopic.status = 'IN_PROGRESS';
          else updatedTopic.status = 'NOT_STARTED';
          return updatedTopic;
        })
      }));
    }

    // 2. Database me save karein
    try {
      await fetch('http://localhost:5000/api/tracker/update-topic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, topicName, field, value: updatedValue })
      });
    } catch (err) {
      console.error('Failed to update database:', err);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500 font-bold text-sm">
        Loading NEET-PG 19-Subject Tracker...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-zinc-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-950 via-[#0a0a10] to-zinc-950 p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-rose-400" size={22} />
            <h1 className="text-xl font-black text-white tracking-tight">19-Subject Master Tracker</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete Marrow syllabus tracking with 3 revision cycles & weak topic flagging.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search subjects (e.g. Pathology, Pharmacology, Surgery)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/40"
        />
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Subjects */}
        <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
          {filteredSubjects.map(subj => {
            const completedCount = subj.topics.filter(t => t.status === 'COMPLETED').length;
            const totalCount = subj.topics.length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isCurrent = activeSubject?.subjectName === subj.subjectName;

            return (
              <button
                key={subj.subjectName}
                onClick={() => setActiveSubject(subj)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-zinc-900 border-rose-500/40 shadow-xl' 
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                    {subj.subjectName}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{progressPct}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500 transition-all duration-500" 
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Topics Table */}
        <div className="lg:col-span-3 bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-2xl overflow-x-auto">
          {activeSubject ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">{activeSubject.subjectName}</h2>
                  <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold">{activeSubject.category}</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Total Topics: <strong className="text-white">{activeSubject.topics.length}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="pb-3 px-3 font-semibold">Chapter / Topic</th>
                    <th className="pb-3 px-2 text-center font-semibold">Videos</th>
                    <th className="pb-3 px-2 text-center font-semibold">Notes</th>
                    <th className="pb-3 px-2 text-center font-semibold">PYQs</th>
                    <th className="pb-3 px-2 text-center font-semibold">QBank</th>
                    <th className="pb-3 px-2 text-center font-semibold">Rev 1</th>
                    <th className="pb-3 px-2 text-center font-semibold">Rev 2</th>
                    <th className="pb-3 px-2 text-center font-semibold">Rev 3</th>
                    <th className="pb-3 px-2 text-center font-semibold text-rose-400">Weak?</th>
                    <th className="pb-3 px-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {activeSubject.topics.map(topic => {
                    const statusStyle = STATUS_CONFIG[topic.status] || STATUS_CONFIG.NOT_STARTED;
                    return (
                      <tr key={topic.topicName} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Topic Name & Badges */}
                        <td className="py-3 px-3 font-medium text-zinc-300 max-w-[220px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{topic.topicName}</span>
                            {topic.isHighYield && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/15 text-amber-300 rounded border border-amber-500/30 font-bold">
                                🔥 HY
                              </span>
                            )}
                            {topic.hasPYQ && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/15 text-indigo-300 rounded border border-indigo-500/30 font-bold">
                                ⭐ PYQ
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Checkboxes */}
                        {[
                          { field: 'videosCompleted', val: topic.videosCompleted },
                          { field: 'notesCompleted', val: topic.notesCompleted },
                          { field: 'pyqCompleted', val: topic.pyqCompleted },
                          { field: 'mcqsCompleted', val: topic.mcqsCompleted },
                          { field: 'revision1', val: topic.revision1 },
                          { field: 'revision2', val: topic.revision2 },
                          { field: 'revision3', val: topic.revision3 },
                          { field: 'isWeak', val: topic.isWeak },
                        ].map(col => (
                          <td key={col.field} className="py-3 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={col.val || false}
                              onChange={() => handleToggle(activeSubject.subjectName, topic.topicName, col.field, col.val)}
                              className={`w-4 h-4 rounded bg-zinc-900 focus:ring-0 cursor-pointer ${
                                col.field === 'isWeak' 
                                  ? 'accent-rose-500 border-rose-500/50' 
                                  : 'accent-emerald-500 border-zinc-700'
                              }`}
                            />
                          </td>
                        ))}

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-600 text-sm">Select a subject from the left panel.</div>
          )}
        </div>

      </div>

    </div>
  );
}