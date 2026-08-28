import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, 
  Stethoscope, Activity, Baby, Users, Brain, 
  Radio, Sparkles, Menu, CalendarDays, CheckCircle2
} from 'lucide-react';

// 👇 ENSURE THIS PATH MATCHES YOUR FILE STRUCTURE
import { TIMETABLE_DATA } from '../data/timetable'; 

// --- 1. PREMIUM THEME ENGINE ---
const getSubjectStyle = (text = "") => {
  const t = text.toUpperCase();
  
  if (t.includes("MEDICINE") || t.includes("IM-")) return { 
    gradient: "from-blue-500/20 to-cyan-500/5", border: "border-blue-200/60", text: "text-blue-700", accent: "bg-blue-500", shadow: "shadow-blue-500/20", icon: Stethoscope 
  };
  if (t.includes("SURGERY") || t.includes("SU-")) return { 
    gradient: "from-rose-500/20 to-orange-500/5", border: "border-rose-200/60", text: "text-rose-700", accent: "bg-rose-500", shadow: "shadow-rose-500/20", icon: Activity 
  };
  if (t.includes("PEDIATRICS") || t.includes("PAED") || t.includes("OG-") || t.includes("OBSTETRICS")) return { 
    gradient: "from-amber-400/20 to-yellow-500/5", border: "border-amber-200/60", text: "text-amber-700", accent: "bg-amber-500", shadow: "shadow-amber-500/20", icon: Baby 
  };
  if (t.includes("CLINICAL") || t.includes("WARD")) return { 
    gradient: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-200/60", text: "text-emerald-700", accent: "bg-emerald-500", shadow: "shadow-emerald-500/20", icon: Users 
  };
  if (t.includes("HOLIDAY") || t.includes("VACATION")) return { 
    gradient: "from-indigo-500/20 to-purple-500/5", border: "border-indigo-200/60", text: "text-indigo-700", accent: "bg-indigo-500", shadow: "shadow-indigo-500/20", icon: Sparkles 
  };
  
  return { 
    gradient: "from-slate-200/50 to-gray-100/50", border: "border-slate-200/80", text: "text-slate-700", accent: "bg-slate-500", shadow: "shadow-slate-500/10", icon: Brain 
  };
};

// --- 2. UTILITIES & PARSERS ---
const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Advanced Time Parser to fix the 'split' crash
const parseTime = (timeStr, baseDate) => {
  if (!timeStr) return new Date(baseDate);
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return new Date(baseDate);
  
  let [, hours, minutes, period] = match;
  hours = parseInt(hours, 10);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  
  const d = new Date(baseDate);
  d.setHours(hours, parseInt(minutes, 10), 0, 0);
  return d;
};

// Generate a 7-day strip centered around the selected date
const generateWeekStrip = (selectedDate) => {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

// --- 3. MAIN COMPONENT ---
const TimetablePremium = () => {
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollRef = useRef(null);
  
  // Real-time Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Data Fetching & Processing
  const dateKey = formatDateKey(selectedDate);
  const todaysSchedule = useMemo(() => TIMETABLE_DATA[dateKey] || [], [dateKey]);
  const weekStrip = useMemo(() => generateWeekStrip(selectedDate), [selectedDate]);

  const { processed, progress, stats, isToday } = useMemo(() => {
    let completed = 0;
    const totalClasses = todaysSchedule.length;
    const isSameDay = formatDateKey(now) === dateKey;
    
    const data = todaysSchedule.map((slot, idx) => {
      const timeString = slot.time || "";
      let start, end, isAllDay = false;

      // Handle Full Day Events Safely
      if (timeString.toLowerCase().includes("all day")) {
        isAllDay = true;
        start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
        end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
      } else {
        const parts = timeString.split(" - ");
        start = parseTime(parts[0], selectedDate);
        end = parts.length > 1 ? parseTime(parts[1], selectedDate) : new Date(start.getTime() + 60 * 60 * 1000);
      }
      
      let status = "upcoming";
      if (isSameDay && now >= end) { 
        status = "completed"; 
        completed++; 
      } else if (isSameDay && now >= start && now < end) { 
        status = "live"; 
      }

      // REGEX Extraction for neat UI
      const codeMatch = slot.topic?.match(/[A-Z]{2,}-\d+(\.\d+)?(,\s\d+(\.\d+)?)*/) || null;
      const cleanCode = codeMatch ? codeMatch[0] : null;
      const cleanTopic = slot.topic?.replace(cleanCode, "").replace(/^[,\s]+|[,\s]+$/g, "") || slot.subject;

      return { ...slot, status, start, end, isAllDay, cleanCode, cleanTopic, id: idx };
    });

    const percentage = totalClasses === 0 ? (isSameDay ? 100 : 0) : (completed / totalClasses) * 100;
    
    return { 
      processed: data, 
      progress: Math.round(percentage),
      stats: { total: totalClasses, left: totalClasses - completed },
      isToday: isSameDay
    };
  }, [todaysSchedule, selectedDate, now, dateKey]);

  // Handlers
  const handleDateChange = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const jumpToToday = () => setSelectedDate(new Date());

  return (
    <div className="min-h-screen bg-[#E2E8F0] flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Dynamic Background Ambience */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-300/40 rounded-full blur-[120px]" 
      />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[100px]" />

      {/* Main Glass Device */}
      <div className="w-full max-w-[420px] h-[850px] bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white relative flex flex-col overflow-hidden">
        
        {/* === HEADER === */}
        <div className="px-6 pt-10 pb-4 z-20 bg-gradient-to-b from-white/90 to-white/0">
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-500 tracking-wider uppercase mb-1">
                {isToday ? "Today's Schedule" : "Viewing Schedule"}
              </span>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h1>
            </div>

            {/* Premium Readiness Circular Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                <motion.circle 
                  cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                  strokeDasharray={125.6} 
                  initial={{ strokeDashoffset: 125.6 }}
                  animate={{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }} 
                  className={`${progress === 100 ? "text-emerald-500" : "text-indigo-500"}`} 
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-slate-700">
                {progress === 100 ? <CheckCircle2 size={16} className="text-emerald-500" /> : `${progress}%`}
              </span>
            </div>
          </div>

          {/* Horizontal Date Strip Picker */}
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => handleDateChange(-7)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex-1 flex justify-between">
              {weekStrip.map((date, i) => {
                const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
                const isCurrentDay = formatDateKey(date) === formatDateKey(new Date());
                
                return (
                  <button 
                    key={i} 
                    onClick={() => setSelectedDate(date)}
                    className="relative flex flex-col items-center p-2 rounded-xl min-w-[40px] transition-all"
                  >
                    {isSelected && (
                      <motion.div layoutId="activeDate" className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/30" />
                    )}
                    <span className={`text-[10px] font-bold uppercase z-10 mb-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                    <span className={`text-sm font-black z-10 ${isSelected ? 'text-white' : isCurrentDay ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {date.getDate()}
                    </span>
                    {isCurrentDay && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />}
                  </button>
                )
              })}
            </div>

            <button onClick={() => handleDateChange(7)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* === TIMELINE CONTENT === */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-6 pb-24">
           {/* Timeline spine */}
           <div className="absolute left-[38px] top-4 bottom-0 w-[2px] bg-slate-200/60 rounded-full" />

           <AnimatePresence mode="popLayout">
             {processed.length > 0 ? (
               processed.map((item, index) => {
                 const style = getSubjectStyle(item.subject + " " + item.topic);
                 const isLive = item.status === "live";
                 const isCompleted = item.status === "completed";

                 return (
                   <motion.div 
                     key={`${dateKey}-${index}`}
                     layout
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: isCompleted ? 0.5 : 1, y: 0, filter: isCompleted ? "grayscale(0.3)" : "none" }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ duration: 0.3, delay: index * 0.05 }}
                     className="relative pl-10 mb-6"
                   >
                     {/* Timeline Node */}
                     <div className="absolute left-[-4px] top-[22px] flex items-center justify-center">
                        <div className={`
                          w-[18px] h-[18px] rounded-full border-4 z-10 transition-all duration-500 flex items-center justify-center
                          ${isLive ? `bg-white border-indigo-500 scale-125` : 
                            isCompleted ? "bg-slate-200 border-white shadow-sm" : "bg-white border-slate-300 shadow-sm"}
                        `}>
                          {isLive && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />}
                        </div>
                     </div>

                     {/* Live Time Tracker Line */}
                     {isLive && (
                        <div className="absolute left-[-2px] top-[40px] w-3.5 h-[2px] bg-indigo-500 rounded-r-full z-0" />
                     )}

                     {/* Premium Card */}
                     <div className={`
                        relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300
                        ${isLive 
                          ? "bg-white border-indigo-100 shadow-[0_8px_30px_rgb(99,102,241,0.12)]" 
                          : "bg-white/60 border-white/80 shadow-sm hover:shadow-md hover:bg-white/80"
                        }
                     `}>
                       {/* Background Gradient */}
                       <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50`} />
                       
                       <div className="relative z-10">
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg bg-white shadow-sm ${style.text}`}>
                               <style.icon size={14} strokeWidth={2.5} />
                             </div>
                             <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                               {item.isAllDay ? "All Day Event" : item.time}
                             </span>
                           </div>
                           
                           {isLive && (
                             <div className="flex items-center gap-1 text-[10px] font-black text-white bg-indigo-500 px-2 py-1 rounded-full shadow-md shadow-indigo-500/20">
                               <Radio size={10} className="animate-pulse" /> LIVE NOW
                             </div>
                           )}
                         </div>

                         <h3 className={`text-lg font-black text-slate-800 leading-tight mb-2 ${isCompleted ? "line-through decoration-slate-300 decoration-2" : ""}`}>
                           {item.subject}
                         </h3>

                         {(item.cleanTopic || item.cleanCode) && (
                           <div className="bg-white/60 rounded-xl p-2.5 border border-white/50 flex flex-col gap-1">
                             {item.cleanCode && (
                               <div className={`text-[10px] font-black tracking-widest ${style.text}`}>
                                 {item.cleanCode}
                               </div>
                             )}
                             {item.cleanTopic && item.cleanTopic !== item.subject && (
                               <div className="text-sm font-semibold text-slate-600">
                                 {item.cleanTopic}
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   </motion.div>
                 );
               })
             ) : (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 className="flex flex-col items-center justify-center py-24 text-center"
               >
                 <div className="w-24 h-24 bg-gradient-to-tr from-indigo-100 to-white rounded-full flex items-center justify-center mb-4 shadow-inner border border-white">
                   <CalendarDays className="text-indigo-400" size={32} />
                 </div>
                 <h3 className="text-xl text-slate-700 font-black mb-1">Free Day!</h3>
                 <p className="text-sm text-slate-500 font-medium">No classes scheduled for this date.</p>
                 
                 {!isToday && (
                   <button 
                     onClick={jumpToToday}
                     className="mt-6 px-6 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all active:scale-95"
                   >
                     Jump to Today
                   </button>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Bottom Fade Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
};

export default TimetablePremium;