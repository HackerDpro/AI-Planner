import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Add School icon to imports
import { 
  Calendar as CalendarIcon, Clock, BookOpen, CheckCircle, ChevronRight, 
  ChevronLeft, Save, Download, Trash2, Plus, Brain, AlertCircle, X, 
  Zap, Coffee, Moon, Sun, Activity, BarChart3, Play, Pause, RotateCcw,
  Sliders, Sparkles, Flame, Timer, School // Add School icon here
} from 'lucide-react';

/**
 * ==============================================================================
 * AI STUDY ARCHITECT - ZENITH EDITION (IMPROVED)
 * ------------------------------------------------------------------------------
 * Improvements:
 * 1. Dynamic Real-Time Status & Timer (Connected to Plan)
 * 2. Multi-Subject Day Scheduling (Anti-Boredom Rotation enhanced)
 * 3. Expanded Motivation Quotes (Changes every 5 minutes in status)
 * 4. Color Scheme Overhaul (No Black, brighter palette)
 * 5. Performance Focus (useMemo/useCallback optimization)
 * ==============================================================================
 */

// --- 1. UTILITY & HELPER FUNCTIONS & CONSTANTS ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedH = h % 12 || 12;
  return `${formattedH}:${minutes} ${ampm}`;
};

const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const MOTIVATIONAL_QUOTES = [
    (name, subject) => `Crush this ${subject} session, ${name}!`,
    (name, subject) => `Future you will thank you for studying ${subject} now.`,
    (name, subject) => `One step closer to mastering ${subject}.`,
    (name, subject) => `Focus mode: ON. Let's destroy ${subject}.`,
    (name, subject) => `You are smarter than this ${subject} exam.`,
    (name, subject) => `${subject} is tough, but you are tougher.`,
    (name, subject) => `Small progress is still progress.`,
    (name, subject) => `The expert in anything was once a beginner. Start ${subject}.`,
    (name, subject) => `Discipline is choosing between what you want now and what you want most. Focus on ${subject}.`,
    (name, subject) => `Don't wish it were easier, wish you were better. Dive into ${subject}, ${name}.`,
    (name, subject) => `Your dedication is the key to unlocking ${subject}.`,
    (name, subject) => `Believe in your potential for ${subject}. You've got this!`,
    (name, subject) => `Every minute counts. Make this ${subject} session count, ${name}.`,
    (name, subject) => `A little progress each day adds up to big results. Go for ${subject}.`,
    (name, subject) => `Success is the sum of small efforts repeated daily. Focus on ${subject} now.`,
];

const getRandomMotivation = (name, subject) => {
  const quoteFn = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  return quoteFn(name, subject || 'subject');
};

// --- 2. SUB-COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children, theme = 'cyan' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-blue-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 border border-white/20">
        <div className={`${theme === 'rose' ? 'bg-rose-600' : 'bg-cyan-600'} p-5 flex justify-between items-center text-white shadow-md`}>
          <h3 className="font-bold text-xl tracking-wide flex items-center gap-2">
            {theme === 'rose' ? <Flame size={20}/> : <Sparkles size={20}/>} 
            {title}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};

// IMPROVED: Real-Time Status & Timer
const RealTimeStatus = ({ generatedPlan, userName, onStartStudy }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [motivation, setMotivation] = useState(getRandomMotivation(userName, null));

  // Update date/time and motivation every 5 minutes
  useEffect(() => {
    const updateTime = () => {
      setCurrentDate(new Date());
      setMotivation(getRandomMotivation(userName, null));
    };
    // Update every 5 minutes (300000ms)
    const intervalId = setInterval(updateTime, 300000); 
    // Update every second for the timer (1000ms)
    const secondIntervalId = setInterval(() => setCurrentDate(new Date()), 1000); 

    return () => {
      clearInterval(intervalId);
      clearInterval(secondIntervalId);
    };
  }, [userName]);

  const currentTimeStr = currentDate.toTimeString().substring(0, 5);
  const currentDateStr = currentDate.toISOString().split('T')[0];

  const currentSession = useMemo(() => {
    if (!generatedPlan) return null;
    return generatedPlan
      .filter(s => s.date === currentDateStr)
      .map(s => ({...s, startObj: new Date(`${s.date}T${s.startTime}`), endObj: new Date(`${s.date}T${s.endTime}`) }))
      .sort((a, b) => a.startObj - b.startObj)
      .find(s => currentDate >= s.startObj && currentDate < s.endObj);
  }, [generatedPlan, currentDateStr, currentDate]);

  const nextSession = useMemo(() => {
    if (!generatedPlan) return null;
    return generatedPlan
      .filter(s => s.type !== 'exam') // Exclude exam markers
      .map(s => ({...s, startObj: new Date(`${s.date}T${s.startTime}`), endObj: new Date(`${s.date}T${s.endTime}`) }))
      .sort((a, b) => a.startObj - b.startObj)
      .find(s => currentDate < s.startObj); // First one that hasn't started
  }, [generatedPlan, currentDate]);

  let statusIcon, statusText, timerValue = null;

  if (currentSession) {
    if (currentSession.type === 'study') {
      statusIcon = <BookOpen size={20} className="text-cyan-600" />;
      statusText = `Study ${currentSession.subject} until ${formatTime(currentSession.endTime)}`;
      timerValue = Math.max(0, Math.floor((currentSession.endObj.getTime() - currentDate.getTime()) / 1000));
    } else if (currentSession.type === 'exam') {
      statusIcon = <Flame size={20} className="text-rose-600" />;
      statusText = `EXAM DAY for ${currentSession.subject}! Good luck.`;
    }
  } else if (nextSession) {
    statusIcon = <Timer size={20} className="text-indigo-600" />;
    statusText = `Rest until ${formatTime(nextSession.startTime)}. Next: ${nextSession.subject}`;
    timerValue = Math.max(0, Math.floor((nextSession.startObj.getTime() - currentDate.getTime()) / 1000));
  } else {
    statusIcon = <Zap size={20} className="text-green-600" />;
    statusText = `You're free! No sessions scheduled for now.`;
  }
  
  const motivationToDisplay = currentSession && currentSession.subject 
    ? getRandomMotivation(userName, currentSession.subject) 
    : motivation;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center animate-fade-in">
      <div className="flex items-start md:items-center gap-4 flex-grow mb-4 md:mb-0">
        <div className="bg-slate-100 p-3 rounded-full"><Clock size={28} className="text-blue-500" /></div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {statusIcon} {statusText}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1 italic max-w-md">
            "{motivationToDisplay}"
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 ml-auto">
        <div className="text-center bg-cyan-50 border border-cyan-200 p-3 rounded-xl font-mono">
            <div className="text-2xl font-bold text-cyan-800 leading-none">{currentTimeStr}</div>
            <div className="text-xs font-medium text-cyan-600 mt-1">{formatDate(currentDateStr)}</div>
        </div>
        {timerValue !== null && timerValue > 0 && (
          <div className="text-center bg-indigo-50 border border-indigo-200 p-3 rounded-xl font-mono">
             <div className="text-2xl font-bold text-indigo-800 leading-none">{formatTimer(timerValue)}</div>
             <div className="text-xs font-medium text-indigo-600 mt-1">TIME LEFT</div>
          </div>
        )}
        <button 
            onClick={onStartStudy} 
            className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 transition flex items-center gap-2"
        >
          <Play fill="currentColor" size={18} /> Focus Now
        </button>
      </div>
    </div>
  );
};


// Focus Mode Component
const StudyNowMode = ({ plan, onClose, userName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Use current time to find session
  const currentSession = useMemo(() => {
    if (!plan) return null;
    const now = currentDate;
    const todayStr = now.toISOString().split('T')[0];
    return plan
      .filter(s => s.date === todayStr && s.type === 'study')
      .map(s => ({...s, startObj: new Date(`${s.date}T${s.startTime}`), endObj: new Date(`${s.date}T${s.endTime}`) }))
      .sort((a,b) => a.startObj - b.startObj)
      .find(s => now >= s.startObj && now < s.endObj); // Find one currently active
  }, [plan, currentDate]);


  const [sessionData, setSessionData] = useState({
    timeLeft: 0,
    isActive: false,
  });

  // Re-calculate state when currentSession changes
  useEffect(() => {
    if (currentSession) {
      setSessionData({
        timeLeft: Math.max(0, Math.floor((currentSession.endObj.getTime() - currentDate.getTime()) / 1000)),
        isActive: true, // Start active if a session is currently running
      });
    } else {
       setSessionData({ timeLeft: 0, isActive: false });
    }
  }, [currentSession, currentDate]);
  
  // Live Timer
  useEffect(() => {
    let interval = null;
    if (sessionData.isActive && sessionData.timeLeft > 0) {
      interval = setInterval(() => {
        setSessionData(p => ({...p, timeLeft: p.timeLeft - 1}));
        setCurrentDate(new Date()); // Keep current date updated
      }, 1000);
    } else if (sessionData.timeLeft === 0 && sessionData.isActive) {
      setSessionData(p => ({...p, isActive: false}));
    }
    return () => clearInterval(interval);
  }, [sessionData.isActive, sessionData.timeLeft]);


  const toggleActive = () => setSessionData(p => ({...p, isActive: !p.isActive}));

  const resetTimer = useCallback(() => {
    if(currentSession) {
        setSessionData({
            timeLeft: currentSession.duration * 60,
            isActive: false,
        });
    }
  }, [currentSession]);


  return (
    <div className="fixed inset-0 bg-blue-900/95 z-[200] flex flex-col items-center justify-center text-white animate-fade-in overflow-hidden">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition"><X size={32} /></button>
      
      {/* Background Ambient Animation - Colors changed from black to dark blue/indigo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[100px] transition-all duration-[4000ms] ${sessionData.isActive ? 'scale-125' : 'scale-100'}`}></div>
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[80px] transition-all duration-[4000ms] delay-75 ${sessionData.isActive ? 'scale-150' : 'scale-90'}`}></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl px-4">
        {currentSession ? (
          <>
            <div className="mb-8 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-cyan-300 font-bold tracking-wider text-sm border border-white/10">
              <Brain size={16}/> FOCUS MODE
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">
              {currentSession.subject}
            </h2>
            <p className="text-xl text-cyan-100/80 mb-12 max-w-lg mx-auto leading-relaxed">
              {getRandomMotivation(userName, currentSession.subject)}
            </p>
            
            {/* Breathing Timer - Focus Ring */}
            <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center group">
               <div className={`absolute inset-0 border-4 border-cyan-500/30 rounded-full transition-all duration-[4000ms] ${sessionData.isActive ? 'scale-110 opacity-50' : 'scale-100 opacity-20'}`}></div>
               <div className={`absolute inset-0 border-4 border-cyan-400/50 rounded-full transition-all duration-[4000ms] delay-100 ${sessionData.isActive ? 'scale-125 opacity-30' : 'scale-95 opacity-20'}`}></div>
               <div className="text-6xl font-mono font-bold tracking-widest relative z-10">
                 {formatTimer(sessionData.timeLeft)}
               </div>
            </div>

            <div className="flex gap-6 justify-center">
              <button onClick={toggleActive} className="flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:scale-105 transition shadow-lg shadow-cyan-500/20">
                {sessionData.isActive ? <><Pause fill="currentColor"/> Pause</> : <><Play fill="currentColor"/> Start Focus</>}
              </button>
              <button onClick={resetTimer} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
                <RotateCcw size={24}/>
              </button>
            </div>

            <div className="mt-12 text-sm text-slate-400">
               Next up: {currentSession.description}
            </div>
          </>
        ) : (
          <div className="text-center">
            <Coffee size={64} className="mx-auto mb-6 text-cyan-400" />
            <h2 className="text-4xl font-bold mb-4">You're Free!</h2>
            <p className="text-xl text-slate-300">No study sessions scheduled for right now.</p>
            <p className="mt-4 text-slate-400">Enjoy your time off, {userName}.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const QuestionCard = ({ children, title, description, onNext, onBack, isLast, nextLabel = "Next" }) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 max-w-4xl w-full mx-auto transition-all duration-500 animate-fade-in border border-slate-100 flex flex-col min-h-[450px]">
    <div className="mb-6 border-b border-slate-100 pb-6">
       <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight flex items-center gap-3">
         {title}
       </h2>
       <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">{description}</p>
    </div>
    <div className="flex-grow mb-6 overflow-y-auto custom-scrollbar pr-2">{children}</div>
    <div className="flex justify-between pt-6 border-t border-slate-100 mt-auto">
      {onBack ? (
        <button onClick={onBack} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition flex items-center gap-2 font-bold border border-transparent hover:border-slate-200">
          <ChevronLeft size={20} /> Back
        </button>
      ) : <div />}
      <button onClick={onNext} className={`px-10 py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center gap-2 transform hover:-translate-y-1 transition-all ${isLast ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/30'}`}>
        {isLast ? 'Generate Plan' : nextLabel} <ChevronRight size={22} />
      </button>
    </div>
  </div>
);

const SelectionCard = ({ selected, onClick, icon: Icon, title, desc, colorClass = "text-cyan-600" }) => (
  <button onClick={onClick} className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 w-full h-full flex flex-col hover:-translate-y-1 ${selected ? 'border-cyan-500 bg-cyan-50 ring-4 ring-cyan-100 shadow-lg' : 'border-slate-100 bg-white hover:border-cyan-300 hover:shadow-md'}`}>
    {selected && <div className="absolute top-4 right-4 text-cyan-600"><CheckCircle size={24} fill="currentColor" className="text-white" /></div>}
    <div className={`p-3 rounded-full w-fit mb-4 ${selected ? 'bg-white' : 'bg-slate-50'}`}><Icon className={colorClass} size={32} /></div>
    <h3 className={`font-bold text-xl mb-2 ${selected ? 'text-cyan-900' : 'text-slate-800'}`}>{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
  </button>
);

// --- 3. WIZARD STEPS (LAYOUT COLORS UPDATED) ---

const IntroStep = ({ onStart }) => (
  <div className="text-center max-w-5xl mx-auto pt-16 md:pt-24 animate-fade-in px-4">
    <div className="relative mx-auto w-32 h-32 mb-10">
       <div className="absolute inset-0 bg-cyan-200 rounded-full animate-ping opacity-20"></div>
       <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10">
          <Brain className="text-white w-16 h-16" />
       </div>
    </div>
    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
      Study<span className="text-cyan-600">AI</span> <span className="text-rose-500">Ultimate</span>
    </h1>
    <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
      The algorithm that understands you're human. 
      <span className="block mt-2 text-lg text-slate-400">Smart Breaks • Subject Rotation • Stress-Free Planning</span>
    </p>
    <button onClick={onStart} className="px-16 py-6 bg-blue-800 text-white text-xl font-bold rounded-full shadow-2xl hover:bg-cyan-600 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto ring-4 ring-blue-100">
      Start Intelligent Planning <ChevronRight/>
    </button>
  </div>
);

const StepBasics = ({ data, onChange, onNext, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  return (
    <QuestionCard title="1. The Foundation" description="Set your limits. The AI will never overwork you." onNext={onNext} onBack={onBack}>
      <div className="space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Your Name</label>
             <input type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-2xl focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all font-bold text-lg" value={data.name} onChange={(e) => onChange('name', e.target.value)} placeholder="e.g. Alex" />
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2"><CalendarIcon size={16}/> Plan Start Date</label>
             <input type="date" min={today} className="w-full p-5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-2xl focus:border-cyan-500 focus:bg-white outline-none transition-all font-bold text-lg" value={data.startDate} onChange={(e) => onChange('startDate', e.target.value)} />
           </div>
         </div>
         
         <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3 text-indigo-800">
               <div className="bg-white p-2 rounded-lg shadow-sm"><Sliders size={24} className="text-indigo-600"/></div>
               <h3 className="font-bold text-lg">Max Daily Study</h3>
             </div>
             <span className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-lg shadow-md">{data.maxStudyHours}h</span>
           </div>
           <input type="range" min="1" max="10" step="0.5" className="w-full h-4 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={data.maxStudyHours} onChange={(e) => onChange('maxStudyHours', e.target.value)} />
           <p className="text-indigo-600/70 text-sm mt-3 font-medium">
             AI Strategy: We only hit this limit if exams are urgent. Most days will be lighter.
           </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-cyan-200 transition">
               <div className="flex items-center gap-3 mb-3 text-cyan-700"><Sun size={24}/> <h3 className="font-bold">Start Day</h3></div>
               <input type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={data.dailyStart} onChange={(e) => onChange('dailyStart', e.target.value)} />
            </div>
            <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition">
               <div className="flex items-center gap-3 mb-3 text-indigo-700"><Moon size={24}/> <h3 className="font-bold">End Day</h3></div>
               <input type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={data.dailyEnd} onChange={(e) => onChange('dailyEnd', e.target.value)} />
            </div>
         </div>
      </div>
    </QuestionCard>
  );
};

const StepChronotype = ({ data, onChange, onNext, onBack }) => (
  <QuestionCard title="2. Energy Profile" description="We schedule hard topics when you are most awake." onNext={onNext} onBack={onBack}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {[{ id: 'morning', title: 'Early Bird', desc: 'Peak focus: 8AM - 12PM', icon: Sun, color: 'text-amber-500' }, { id: 'afternoon', title: 'Daytime', desc: 'Peak focus: 11AM - 5PM', icon: Activity, color: 'text-orange-500' }, { id: 'night', title: 'Night Owl', desc: 'Peak focus: 6PM - 12AM', icon: Moon, color: 'text-indigo-600' }].map(opt => (
        <SelectionCard key={opt.id} {...opt} selected={data.chronotype === opt.id} onClick={() => onChange('chronotype', opt.id)} colorClass={opt.color} />
      ))}
    </div>
  </QuestionCard>
);

const StepExams = ({ data, updateExams, onNext, onBack }) => {
  const addExam = () => updateExams([...data.exams, { id: generateId(), subject: '', date: '', difficulty: 5, priority: 1 }]);
  const removeExam = (id) => updateExams(data.exams.filter(e => e.id !== id));
  const updateExamField = (index, field, value) => {
    const newExams = [...data.exams];
    newExams[index][field] = value;
    updateExams(newExams);
  };

  return (
    <QuestionCard title="3. The Mission" description="Add your exams. We prioritize them based on date and difficulty." onNext={onNext} onBack={onBack}>
      <div className="space-y-4">
        {data.exams.map((exam, index) => (
          <div key={exam.id} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 relative shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group">
             <button onClick={() => removeExam(exam.id)} className="absolute top-4 right-4 bg-white text-slate-300 hover:text-rose-500 p-2 rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
                <div className="md:col-span-5">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">Subject</label>
                  <input type="text" placeholder="e.g. Economy" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-cyan-500 outline-none" value={exam.subject} onChange={(e) => updateExamField(index, 'subject', e.target.value)} />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">Exam Date</label>
                  <input type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-cyan-500 outline-none" value={exam.date} onChange={(e) => updateExamField(index, 'date', e.target.value)} />
                </div>
                <div className="md:col-span-3">
                   <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">Priority</label>
                   <select className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" value={exam.priority} onChange={(e) => updateExamField(index, 'priority', e.target.value)}>
                    <option value="1">Normal</option><option value="2">High</option><option value="3">Critical</option>
                   </select>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Difficulty</span>
                <input type="range" min="1" max="10" className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500" value={exam.difficulty} onChange={(e) => updateExamField(index, 'difficulty', e.target.value)} />
                <span className="font-bold text-rose-500 w-8 text-right">{exam.difficulty}</span>
             </div>
          </div>
        ))}
        <button onClick={addExam} className="w-full py-6 border-2 border-dashed border-slate-300 text-slate-500 rounded-3xl hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-600 font-bold flex items-center justify-center gap-2 transition-all group">
          <div className="bg-slate-200 group-hover:bg-cyan-200 p-2 rounded-full text-blue-700 group-hover:text-cyan-700 transition-colors"><Plus size={24}/></div> Add Exam
        </button>
      </div>
    </QuestionCard>
  );
};

const StepBlocked = ({ data, updateBlocked, onNext, onBack }) => {
  const [newBlock, setNewBlock] = useState({ day: 'Everyday', start: '', end: '', name: '' });
  const addBlock = () => {
    if (newBlock.start && newBlock.end && newBlock.name) {
      updateBlocked([...data.blockedTimes, { ...newBlock, type: 'recurring' }]);
      setNewBlock({ ...newBlock, name: '', start: '', end: '' }); 
    }
  };
  return (
    <QuestionCard title="4. Life Constraints" description="When are you busy? We will never schedule study during these times." onNext={onNext} onBack={onBack}>
       <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
               <select className="p-4 bg-white border border-indigo-100 rounded-xl font-bold text-slate-700 outline-none" value={newBlock.day} onChange={e => setNewBlock({...newBlock, day: e.target.value})}>
                 {['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
               </select>
               <div className="md:col-span-2">
                 <input type="text" placeholder="Activity (e.g. Soccer Training)" className="w-full p-4 bg-white border border-indigo-100 rounded-xl font-bold text-slate-700 outline-none" value={newBlock.name} onChange={e => setNewBlock({...newBlock, name: e.target.value})} />
               </div>
          </div>
          <div className="flex items-center gap-4 mb-4 bg-white p-2 rounded-xl border border-indigo-100">
             <Clock className="text-indigo-400 ml-2" size={20}/>
             <input type="time" className="bg-transparent font-bold text-slate-700 outline-none" value={newBlock.start} onChange={e => setNewBlock({...newBlock, start: e.target.value})} />
             <span className="text-slate-300">to</span>
             <input type="time" className="bg-transparent font-bold text-slate-700 outline-none" value={newBlock.end} onChange={e => setNewBlock({...newBlock, end: e.target.value})} />
          </div>
          <button onClick={addBlock} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"><Plus size={18} /> Add Constraint</button>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {data.blockedTimes.map((block, index) => (
            <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-1.5 h-12 rounded-full bg-indigo-400"></div>
              <div className="flex-1">
                 <div className="flex justify-between"><span className="font-bold text-slate-800">{block.day}</span><span className="text-xs font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Recurring</span></div>
                 <div className="flex justify-between text-sm text-slate-500 mt-1"><span>{block.name}</span><span className="font-mono">{formatTime(block.start)} - {formatTime(block.end)}</span></div>
              </div>
              <button onClick={() => updateBlocked(data.blockedTimes.filter((_, i) => i !== index))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
    </QuestionCard>
  );
};

// NEW: School Schedule Component
const StepSchoolSchedule = ({ data, onChange, onNext, onBack }) => {
  const updateSchoolSchedule = (day, field, value) => {
    const newSchedule = { ...data.schoolSchedule.weeklySchedule };
    if (field === 'hasSchool') {
      newSchedule[day].hasSchool = value;
      // Reset times if school is disabled
      if (!value) {
        newSchedule[day].start = '';
        newSchedule[day].end = '';
      } else {
        // Set default times if enabling
        newSchedule[day].start = '08:00';
        newSchedule[day].end = '15:00';
      }
    } else {
      newSchedule[day][field] = value;
    }
    
    onChange('schoolSchedule', {
      ...data.schoolSchedule,
      weeklySchedule: newSchedule
    });
  };

  const updateDate = (field, value) => {
    onChange('schoolSchedule', {
      ...data.schoolSchedule,
      [field]: value
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <QuestionCard 
      title="5. School Schedule" 
      description="When do you have school? We'll schedule study sessions around your classes."
      onNext={onNext} 
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* School Dates Range */}
        <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
          <h3 className="font-bold text-lg text-indigo-800 mb-4 flex items-center gap-2">
            <CalendarIcon size={20} /> School Term Dates (Optional)
          </h3>
          <p className="text-sm text-indigo-600/70 mb-4">
            If your school has specific start/end dates (like semester breaks), add them here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-2">School Starts</label>
              <input 
                type="date" 
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-medium"
                value={data.schoolSchedule.startDate || ''}
                onChange={(e) => updateDate('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-2">School Ends</label>
              <input 
                type="date" 
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-medium"
                value={data.schoolSchedule.endDate || ''}
                onChange={(e) => updateDate('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div>
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <School size={20} /> Weekly School Hours
          </h3>
          <div className="space-y-3">
            {daysOfWeek.map(day => {
              const daySchedule = data.schoolSchedule.weeklySchedule[day];
              return (
                <div key={day} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
                  <div className="w-8">
                    <input
                      type="checkbox"
                      id={`school-${day}`}
                      checked={daySchedule.hasSchool}
                      onChange={(e) => updateSchoolSchedule(day, 'hasSchool', e.target.checked)}
                      className="h-5 w-5 text-indigo-600 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`school-${day}`} className="font-bold text-slate-800">
                      {day}
                    </label>
                  </div>
                  {daySchedule.hasSchool ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={daySchedule.start}
                        onChange={(e) => updateSchoolSchedule(day, 'start', e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={daySchedule.end}
                        onChange={(e) => updateSchoolSchedule(day, 'end', e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm font-medium">No school</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-500 mt-4">
            💡 The AI will avoid scheduling study sessions during school hours. On days without school, more study time will be available.
          </p>
        </div>
      </div>
    </QuestionCard>
  );
};

const CalendarView = ({ viewDate, setViewDate, selectedDay, setSelectedDay, generatedPlan, userData }) => {
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const today = new Date().toISOString().split('T')[0];

  const planMarkers = useMemo(() => {
    if (!generatedPlan) return {};
    const markers = {};
    generatedPlan.forEach(s => {
      if (!markers[s.date]) markers[s.date] = { study: 0, exam: 0 };
      markers[s.date][s.type] = markers[s.date][s.type] + 1;
    });
    return markers;
  }, [generatedPlan]);
  
  const calendarDays = useMemo(() => {
    const days = [];
    // Previous Month padding
    for (let i = 0; i < firstDay; i++) { days.push({ date: null, isCurrentMonth: false }); }
    // Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i).toISOString().split('T')[0];
      const isToday = date === today;
      const isSelected = date === selectedDay;
      const markers = planMarkers[date] || { study: 0, exam: 0 };
      days.push({ date, dayNum: i, isCurrentMonth: true, isToday, isSelected, markers });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDay, today, selectedDay, planMarkers]);

  const DayCell = ({ day }) => {
    if (!day.date) return <div className="h-16"></div>;

    const isActive = day.isCurrentMonth;
    const isToday = day.isToday;
    const isSelected = day.isSelected;
    const markers = day.markers;
    
    // Day style
    const dayClass = `w-full aspect-square flex flex-col items-center justify-center p-1 rounded-xl transition-all border-2
      ${!isActive ? 'text-slate-300 border-transparent' : 'cursor-pointer hover:bg-cyan-50'}
      ${isSelected ? 'bg-cyan-100 border-cyan-500 ring-2 ring-cyan-200' : isToday ? 'border-indigo-400 bg-indigo-50' : 'border-white bg-white'}`;

    const handleClick = () => {
      if (isActive) setSelectedDay(day.date);
    };

    return (
      <div className={dayClass} onClick={handleClick}>
        <span className={`text-lg font-bold ${isActive ? 'text-slate-800' : 'text-slate-300'}`}>{day.dayNum}</span>
        <div className="flex gap-1 mt-1">
          {markers.exam > 0 && <div className="h-2 w-2 rounded-full bg-rose-500" title="Exam Day"></div>}
          {markers.study > 0 && <div className="h-2 w-2 rounded-full bg-cyan-500" title={`${markers.study} Study Session(s)`}></div>}
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-2xl font-bold text-slate-800">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-sm font-bold text-slate-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2 text-indigo-500">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => <DayCell key={index} day={day} />)}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-cyan-500"></div> <span>Study Sessions</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-rose-500"></div> <span>Exam Day</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-indigo-400 bg-indigo-50"></div> <span>Today</span></div>
      </div>
    </div>
  );
};

const DailyPlanView = ({ day, sessions }) => {
  if (!day) return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 min-h-[300px] flex items-center justify-center">
      <div className="text-center text-slate-500">
        <CalendarIcon size={40} className="mx-auto mb-3 text-slate-300"/>
        <p className="font-medium">Select a date on the calendar to view its plan.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 min-h-[300px]">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
        Plan for {formatDate(day)}
      </h3>
      {sessions.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-500"/>
          <p className="font-medium">No scheduled activities on this day. Free time!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => (
            <div key={s.id} className={`p-4 rounded-2xl border-l-4 ${s.type === 'exam' ? 'bg-rose-50 border-rose-500' : 'bg-cyan-50 border-cyan-500'} shadow-sm`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {s.type === 'exam' ? <Flame size={20} className="text-rose-600"/> : <BookOpen size={20} className="text-cyan-600"/>}
                  <h4 className="font-bold text-lg text-slate-800">{s.subject}</h4>
                </div>
                <span className="text-sm font-mono text-slate-600">{formatTime(s.startTime)} - {formatTime(s.endTime)}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1 pl-7">{s.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- 4. MAIN APP ---

export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [studyModeOpen, setStudyModeOpen] = useState(false);

  const [userData, setUserData] = useState({
    name: '', startDate: new Date().toISOString().split('T')[0],
    dailyStart: '09:00', dailyEnd: '21:00', maxStudyHours: 4,
    chronotype: 'afternoon', exams: [], blockedTimes: [],
    // Add school schedule with default values
    schoolSchedule: {
      startDate: '', // When school starts (optional)
      endDate: '',   // When school ends (optional)
      weeklySchedule: {
        Monday: { start: '08:00', end: '15:00', hasSchool: true },
        Tuesday: { start: '08:00', end: '15:00', hasSchool: true },
        Wednesday: { start: '08:00', end: '15:00', hasSchool: true },
        Thursday: { start: '08:00', end: '15:00', hasSchool: true },
        Friday: { start: '08:00', end: '15:00', hasSchool: true },
        Saturday: { start: '09:00', end: '13:00', hasSchool: false },
        Sunday: { start: '09:00', end: '13:00', hasSchool: false }
      }
    }
  });

  useEffect(() => {
    const savedData = localStorage.getItem('zenithPlannerData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setUserData(data);
        if (data.plan) { // Load existing plan if available
          setGeneratedPlan(data.plan);
          setStep(6);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const dataToSave = {...userData, plan: generatedPlan};
    const timer = setTimeout(() => { localStorage.setItem('zenithPlannerData', JSON.stringify(dataToSave)); }, 1000);
    return () => clearTimeout(timer);
  }, [userData, generatedPlan]);

  // --- INTELLIGENT SCHEDULING ALGORITHM ---
  const generateSchedule = useCallback(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const { exams, dailyStart, dailyEnd, maxStudyHours, blockedTimes, startDate, schoolSchedule } = userData;
      
      const sessions = [];
      const userMaxMinutes = parseFloat(maxStudyHours) * 60;
      
      // Determine Range
      const start = new Date(startDate);
      const lastExamDate = exams.length > 0 ? new Date(Math.max(...exams.map(e => new Date(e.date).getTime()))) : new Date();
      const end = new Date(lastExamDate);
      end.setDate(end.getDate() + 1); // 1 day buffer

      let currentDate = new Date(start);
      let failSafe = 0;

      // ALGO STATE
      let consecutiveSessions = {}; // Track how many times a subject was picked in a row TODAY
      
      while (currentDate <= end && failSafe < 365) {
        failSafe++;
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Exam Markers - Sort to top later
        exams.filter(e => e.date === dateStr).forEach(e => {
          sessions.push({ id: generateId(), subject: e.subject, date: dateStr, startTime: "00:00", endTime: "23:59", description: `🎯 EXAM DAY: ${e.subject}. You got this!`, type: 'exam', duration: 1440 });
        });

        // Check if it's a school day
        const daySchedule = schoolSchedule.weeklySchedule[dayName];
        let dayStart = dailyStart;
        let dayEnd = dailyEnd;
        
        // If it's a school day, adjust available time
        if (daySchedule && daySchedule.hasSchool && daySchedule.start && daySchedule.end) {
          // School time becomes blocked time, so we can only study outside school hours
          // Usually study before school or after school
          // For simplicity, we'll schedule after school
          dayStart = daySchedule.end; // Start studying after school ends
          // Make sure we don't exceed daily end
          if (dayStart > dailyEnd) {
            // No time left for studying today
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }
        }
        
        let currentTime = new Date(`${dateStr}T${dayStart}`);
        const endTime = new Date(`${dateStr}T${dayEnd}`);
        
        let dailyStudyMinutes = 0;
        let sessionsSinceLongBreak = 0;
        
        // Reset consecutive counters for new day
        consecutiveSessions = {};

        while (currentTime < endTime) {
          if (dailyStudyMinutes >= userMaxMinutes) break;

          const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
          
          // Check Blocked Time & Advance
          let isBlocked = false;
          let nextAvailableTime = new Date(currentTime);
          
          // Check if current time is during school hours (even if we started after school)
          if (daySchedule && daySchedule.hasSchool && daySchedule.start && daySchedule.end) {
            const [sH, sM] = daySchedule.start.split(':').map(Number);
            const [eH, eM] = daySchedule.end.split(':').map(Number);
            const schoolStart = sH * 60 + sM;
            const schoolEnd = eH * 60 + eM;
            
            if (currentMinutes >= schoolStart && currentMinutes < schoolEnd) {
              isBlocked = true;
              nextAvailableTime = new Date(currentTime);
              nextAvailableTime.setHours(eH, eM);
            }
          }
          
          for (const block of blockedTimes) {
            const [sH, sM] = block.start.split(':').map(Number);
            const [eH, eM] = block.end.split(':').map(Number);
            const startBlock = sH * 60 + sM;
            const endBlock = eH * 60 + eM;
            
            if (block.day === 'Everyday' || block.day === dayName) {
                // If current time is within a block
                if (currentMinutes >= startBlock && currentMinutes < endBlock) {
                    isBlocked = true;
                    // Move current time past the block
                    nextAvailableTime = new Date(currentTime);
                    nextAvailableTime.setHours(eH, eM);
                    break; 
                }
            }
          }

          if (isBlocked) { 
              currentTime = nextAvailableTime;
              continue; 
          }
          
          // --- INSERT LONG BREAK (1H) ---
          if (sessionsSinceLongBreak >= 3) {
             const breakEnd = new Date(currentTime);
             breakEnd.setMinutes(breakEnd.getMinutes() + 60);
             
             // Check if break extends past dailyEnd
             if (breakEnd >= endTime) break; 
             
             sessions.push({ id: generateId(), subject: 'REST', date: dateStr, 
                             startTime: currentTime.toTimeString().substring(0, 5),
                             endTime: breakEnd.toTimeString().substring(0, 5),
                             description: 'Smart Long Break (60 min). Recharge your focus.',
                             type: 'rest', duration: 60 });

             currentTime = breakEnd;
             sessionsSinceLongBreak = 0;
             continue;
          }

          // Find active exams
          const activeExams = exams.filter(e => new Date(e.date) > currentDate);
          if (activeExams.length === 0) break;

          let bestExam = null;
          let highestScore = -1;

          activeExams.forEach(exam => {
            const daysUntil = Math.max(1, Math.ceil((new Date(exam.date) - currentDate) / (1000 * 3600 * 24)));
            let score = (Math.pow(Number(exam.difficulty), 1.5) * Number(exam.priority)) / (daysUntil + 0.1);
            
            // --- ANTI-BOREDOM LOGIC (CRITICAL FOR MULTI-SUBJECT DAYS) ---
            // If we picked this subject 2 times in a row today, CRUSH its score to force diversity
            if ((consecutiveSessions[exam.subject] || 0) >= 2) {
               score *= 0.05; // Force pick something else
            } else if ((consecutiveSessions[exam.subject] || 0) === 1) {
               score *= 0.5; // Mildly discourage picking same subject again immediately
            }

            if (score > highestScore) { highestScore = score; bestExam = exam; }
          });

          if (bestExam) {
            // Standard session: 50 mins
            const sessionDuration = 50;
            const shortBreakDuration = 10;
            const totalSlotDuration = sessionDuration + shortBreakDuration;

            const sessionEnd = new Date(currentTime);
            sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionDuration);
            
            // Check if session fits before end of day or next block
            if (sessionEnd >= endTime || dailyStudyMinutes + sessionDuration > userMaxMinutes) {
                // Not enough time for a full session, break the loop for the day
                break; 
            }

            sessions.push({
              id: generateId(), subject: bestExam.subject, date: dateStr,
              startTime: currentTime.toTimeString().substring(0, 5),
              endTime: sessionEnd.toTimeString().substring(0, 5),
              description: `Study session for ${bestExam.subject}`,
              type: 'study', duration: sessionDuration
            });

            dailyStudyMinutes += sessionDuration;
            sessionsSinceLongBreak++;
            
            // Update consecutive counter
            Object.keys(consecutiveSessions).forEach(key => {
                if (key !== bestExam.subject) consecutiveSessions[key] = 0; // Reset other subjects
            });
            consecutiveSessions[bestExam.subject] = (consecutiveSessions[bestExam.subject] || 0) + 1;

            // Add Short Break (10 min)
            currentTime.setMinutes(currentTime.getMinutes() + totalSlotDuration);
          } else {
            // No high-priority exam left for the day, or all are discouraged by anti-boredom logic.
            // Advance time by 30 mins to avoid infinite loop.
            currentTime.setMinutes(currentTime.getMinutes() + 30);
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setGeneratedPlan(sessions);
      setLoading(false);
      setStep(6);
      setSelectedDay(new Date().toISOString().split('T')[0]); // Default to today's date in calendar view
    }, 1500); // Reduced delay for better perceived performance
  }, [userData]);

  // Use useCallback for performance
  const getTodaysPlan = useCallback(() => {
    if (!generatedPlan || !selectedDay) return [];
    let daysSessions = generatedPlan.filter(s => s.date === selectedDay);
    
    // Sort: Exams first, then by time
    daysSessions.sort((a, b) => {
      if (a.type === 'exam' && b.type !== 'exam') return -1;
      if (a.type !== 'exam' && b.type === 'exam') return 1;
      return a.startTime.localeCompare(b.startTime);
    });
    return daysSessions;
  }, [generatedPlan, selectedDay]);

  const todaysSessions = useMemo(() => getTodaysPlan(), [getTodaysPlan]);

  // --- ICS EXPORT FUNCTION ---
  const generateICalendar = () => {
    if (!generatedPlan || generatedPlan.length === 0) {
      alert("No plan to export!");
      return;
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyAI Ultimate Planner//NONSGML v1.0//EN',
    ];

    generatedPlan.forEach(session => {
      // Only export study and rest sessions as events
      if (session.type !== 'exam') {
        const startDateTime = session.date.replace(/-/g, '') + 'T' + session.startTime.replace(/:/g, '') + '00';
        const endDateTime = session.date.replace(/-/g, '') + 'T' + session.endTime.replace(/:/g, '') + '00';
        
        const summary = session.type === 'study' ? `Study: ${session.subject}` : `BREAK: ${session.subject}`;
        const description = session.description;

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:${session.id}@studyai-ultimate.netlify.app`);
        icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').substring(0, 15)}Z`);
        icsContent.push(`DTSTART:${startDateTime}`);
        icsContent.push(`DTEND:${endDateTime}`);
        icsContent.push(`SUMMARY:${summary}`);
        icsContent.push(`DESCRIPTION:${description}`);
        icsContent.push('END:VEVENT');
      }
    });

    icsContent.push('END:VCALENDAR');
    const finalContent = icsContent.join('\n');

    const blob = new Blob([finalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyAI_Plan_${userData.name}_${new Date().toISOString().split('T')[0]}.ics`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 pb-20">
      <style>{`:root{width:100%}body{display:block!important;margin:0!important;background-color:#f8fafc!important}.animate-fade-in{animation:fade-in 0.6s cubic-bezier(0.16,1,0.3,1)forwards}@keyframes fade-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-thumb{background-color:#cbd5e1;border-radius:20px}`}</style>
      
      {studyModeOpen && <StudyNowMode plan={generatedPlan} userName={userData.name} onClose={() => setStudyModeOpen(false)} />}

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900">
             <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg"><Brain size={20} /></div> StudyAI <span className="text-cyan-600 hidden sm:inline">Ultimate</span>
           </div>
           {step > 0 && step < 6 && <div className="flex gap-1">{[1,2,3,4,5].map(n => <div key={n} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step >= n ? 'bg-cyan-500' : 'bg-slate-200'}`}></div>)}</div>}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {step === 0 && <IntroStep onStart={() => setStep(1)} />}
        {step === 1 && <StepBasics data={userData} onChange={(f, v) => setUserData(p => ({...p, [f]: v}))} onNext={() => setStep(2)} onBack={null} />}
        {step === 2 && <StepChronotype data={userData} onChange={(f, v) => setUserData(p => ({...p, [f]: v}))} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepExams data={userData} updateExams={v => setUserData(p => ({...p, exams: v}))} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <StepBlocked data={userData} updateBlocked={v => setUserData(p => ({...p, blockedTimes: v}))} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
        {step === 5 && <StepSchoolSchedule data={userData} onChange={(f, v) => setUserData(p => ({...p, [f]: v}))} onNext={generateSchedule} onBack={() => setStep(4)} isLast={true} nextLabel={loading ? 'Generating...' : 'Generate Plan'} />}
        
        {step === 6 && (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
              Plan <span className="text-cyan-600">Generated</span> Successfully!
            </h1>
            <p className="text-xl text-slate-500 mb-8">
              Here is your intelligent study schedule, {userData.name}.
            </p>
            
            <RealTimeStatus generatedPlan={generatedPlan} userName={userData.name} onStartStudy={() => setStudyModeOpen(true)} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <CalendarView viewDate={viewDate} setViewDate={setViewDate} selectedDay={selectedDay} setSelectedDay={setSelectedDay} generatedPlan={generatedPlan} userData={userData} />
               <DailyPlanView day={selectedDay} sessions={todaysSessions} />
            </div>
            
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-3 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition flex items-center gap-2">
                   <RotateCcw size={20} /> Restart Planning
                </button>
                <button onClick={generateICalendar} className="px-6 py-3 bg-blue-50 border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition flex items-center gap-2">
                   <Download size={20} /> Export Plan
                </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}