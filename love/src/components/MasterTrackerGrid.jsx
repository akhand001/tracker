import React, { useState, useEffect, useMemo } from 'react';
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

// Helper function to keep logic clean and centralized
const calculateTopicStatus = (topic) => {
  if (topic.isWeak) return 'WEAK';
  if (topic.revision1 || (topic.videosCompleted && topic.notesCompleted && topic.mcqsCompleted)) return 'COMPLETED';
  if (topic.videosCompleted || topic.notesCompleted || topic.mcqsCompleted || topic.pyqCompleted) return 'IN_PROGRESS';
  return 'NOT_STARTED';
};

export default function MasterTrackerGrid() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // FIX: Store only the NAME, not the whole object, to prevent state desync.
  const [activeSubjectName, setActiveSubjectName] = useState(null);

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
        setActiveSubjectName(data[0].subjectName);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (subjectName, topicName, field, currentValue) => {
    const updatedValue = !currentValue;

    // 1. Optimistic UI update (Much cleaner now)
    setSubjects(prevSubjects => prevSubjects.map(subj => {
      if (subj.subjectName !== subjectName) return subj;
      
      return {
        ...subj,
        topics: subj.topics.map(t => {
          if (t.topicName !== topicName) return t;
          
          const updatedTopic = { ...t, [field]: updatedValue };
          updatedTopic.status = calculateTopicStatus(updatedTopic);
          return updatedTopic;
        })
      };
    }));

    // 2. Database Sync
    try {
      await fetch('http://localhost:5000/api/tracker/update-topic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, topicName, field, value: updatedValue })
      });
    } catch (err) {
      console.error('Failed to update database. Reverting might be needed:', err);
      // In a production app, you would revert the optimistic update here if it failed.
    }
  };

  // Derive active subject directly from the subjects array
  const activeSubject = useMemo(() => {
    return subjects.find(s => s.subjectName === activeSubjectName);
  }, [subjects, activeSubjectName]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
      const matchesSearch = s.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [subjects, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500 font-bold text-sm">
        Loading NEET-PG Master Tracker...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-zinc-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-950 via-[#0a0a10] to-zinc-950 p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-rose-400" size={24} />
            <h1 className="text-2xl font-black text-white tracking-tight">19-Subject Master Tracker</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete syllabus tracking with 3 revision cycles & weak topic flagging.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  : 'bg-zinc-900/60 text-zinc-400 border border-transparent hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative group">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-rose-400 transition-colors" />
        <input
          type="text"
          placeholder="Search subjects (e.g. Pathology, Surgery)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950/80 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 transition-all shadow-inner"
        />
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Subjects List */}
        <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto no-scrollbar pr-2 sticky top-6">
          {filteredSubjects.map(subj => {
            const completedCount = subj.topics.filter(t => t.status === 'COMPLETED').length;
            const totalCount = subj.topics.length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isCurrent = activeSubjectName === subj.subjectName;

            return (
              <button
                key={subj.subjectName}
                onClick={() => setActiveSubjectName(subj.subjectName)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-zinc-900 border-rose-500/50 shadow-[0_4px_20px_rgba(244,63,94,0.1)] scale-[1.02] z-10 relative' 
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold tracking-wide ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>
                    {subj.subjectName}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isCurrent ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'}`}>
                    {progressPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500 transition-all duration-700 ease-out" 
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </button>
            );
          })}
          
          {filteredSubjects.length === 0 && (
            <div className="text-center p-6 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              No subjects found.
            </div>
          )}
        </div>

        {/* Right Column: Topics Table */}
        <div className="lg:col-span-3 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[700px]">
          {activeSubject ? (
            <>
              {/* Sticky Table Header Section */}
              <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{activeSubject.subjectName}</h2>
                    <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mt-1 block">
                      {activeSubject.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex flex-col items-end">
                      <span className="text-zinc-500 font-medium">Total Topics</span>
                      <strong className="text-lg text-white font-mono">{activeSubject.topics.length}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Table Body */}
              <div className="overflow-y-auto no-scrollbar flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-20 border-b border-zinc-800 shadow-sm">
                    <tr className="text-zinc-400">
                      <th className="py-4 px-4 font-semibold w-[25%]">Chapter / Topic</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">Videos</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">Notes</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">PYQs</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">QBank</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">Rev 1</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">Rev 2</th>
                      <th className="py-4 px-2 text-center font-semibold hover:text-white transition-colors cursor-default">Rev 3</th>
                      <th className="py-4 px-2 text-center font-semibold text-rose-400">Weak?</th>
                      <th className="py-4 px-4 text-center font-semibold w-[15%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {activeSubject.topics.map(topic => {
                      const statusStyle = STATUS_CONFIG[topic.status] || STATUS_CONFIG.NOT_STARTED;
                      return (
                        <tr key={topic.topicName} className="hover:bg-zinc-900/40 transition-colors group">
                          
                          {/* Topic Name & Badges */}
                          <td className="py-3 px-4 font-medium text-zinc-300">
                            <div className="flex flex-col gap-1.5">
                              <span className="group-hover:text-white transition-colors">{topic.topicName}</span>
                              <div className="flex gap-1.5">
                                {topic.isHighYield && (
                                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 font-bold">
                                    <Flame size={10} /> HY
                                  </span>
                                )}
                                {topic.hasPYQ && (
                                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-bold">
                                    <Star size={10} /> PYQ
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Action Checkboxes */}
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
                            <td key={col.field} className="py-3 px-2 text-center align-middle">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={col.val || false}
                                  onChange={() => handleToggle(activeSubject.subjectName, topic.topicName, col.field, col.val)}
                                  className={`w-4 h-4 rounded bg-zinc-900 border-zinc-700 cursor-pointer transition-all duration-200 focus:ring-0 focus:ring-offset-0
                                    ${col.field === 'isWeak' 
                                      ? 'accent-rose-500 hover:border-rose-400' 
                                      : 'accent-emerald-500 hover:border-emerald-400'
                                    }`}
                                />
                              </div>
                            </td>
                          ))}

                          {/* Status Badge */}
                          <td className="py-3 px-4 text-center align-middle">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} animate-pulse`} />
                                {statusStyle.text}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-32 text-zinc-500 space-y-4">
              <Layers size={48} className="text-zinc-800" />
              <div className="text-sm font-medium">Select a subject from the left panel to begin.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}