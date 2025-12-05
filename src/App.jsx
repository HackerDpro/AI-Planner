import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Download,
  Trash2,
  Plus,
  Brain,
  AlertCircle,
  X,
  Zap,
  Coffee,
  Moon,
  Sun,
  Activity,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Flame,
  Timer,
  School,
  Target,
  TrendingUp,
  Award,
  Users,
  Shield,
  Bell,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minus,
  Edit2,
  Filter,
  Search,
  Copy,
  Share2,
  Printer,
  HelpCircle,
  CheckSquare,
  Square,
} from "lucide-react";

// ==============================================================================
// AI STUDY ARCHITECT - ULTIMATE PRO EDITION - FIXED VERSION
// ==============================================================================

// --- 1. UTILITY FUNCTIONS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedH = h % 12 || 12;
  return `${formattedH}:${minutes} ${ampm}`;
};

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// Fixed: Motivational quotes now change every 30 seconds instead of every second
const MOTIVATIONAL_QUOTES = [
  "Stay focused and achieve your goals!",
  "Consistency is key to success.",
  "Every study session brings you closer to mastery.",
  "You're capable of amazing things.",
  "Small progress is still progress.",
  "Your future self will thank you for this.",
  "Stay disciplined when motivation fades.",
  "Quality over quantity in every session.",
  "You're building a brighter future.",
  "Challenges are opportunities for growth.",
];

let currentMotivationIndex = 0;

const getCurrentMotivation = () => {
  return MOTIVATIONAL_QUOTES[currentMotivationIndex];
};

// --- 2. SUB-COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children, theme = "cyan" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-blue-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-all scale-100 border border-white/20">
        <div
          className={`${
            theme === "rose"
              ? "bg-rose-600"
              : theme === "blue"
              ? "bg-blue-600"
              : "bg-cyan-600"
          } p-5 flex justify-between items-center text-white shadow-md`}
        >
          <h3 className="font-bold text-xl tracking-wide flex items-center gap-2">
            {theme === "rose" ? (
              <Flame size={20} />
            ) : theme === "blue" ? (
              <Target size={20} />
            ) : (
              <Sparkles size={20} />
            )}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};

// FIXED: Real-Time Status with stable motivation
const RealTimeStatus = ({ generatedPlan, userName, onStartStudy, stats }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [motivation, setMotivation] = useState(getCurrentMotivation());

  useEffect(() => {
    const updateTime = () => {
      setCurrentDate(new Date());
    };

    const timeInterval = setInterval(updateTime, 1000);

    // Change motivation every 30 seconds instead of every second
    const motivationInterval = setInterval(() => {
      currentMotivationIndex =
        (currentMotivationIndex + 1) % MOTIVATIONAL_QUOTES.length;
      setMotivation(getCurrentMotivation());
    }, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(motivationInterval);
    };
  }, []);

  // Get correct date string (fixes the "off by one day" bug)
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDateStr = getLocalDateString(currentDate);
  const currentTimeStr = currentDate.toTimeString().substring(0, 5);

  const currentSession = useMemo(() => {
    if (!generatedPlan) return null;
    return generatedPlan
      .filter((s) => s.date === currentDateStr)
      .map((s) => ({
        ...s,
        startObj: new Date(`${s.date}T${s.startTime}`),
        endObj: new Date(`${s.date}T${s.endTime}`),
      }))
      .sort((a, b) => a.startObj - b.startObj)
      .find((s) => currentDate >= s.startObj && currentDate < s.endObj);
  }, [generatedPlan, currentDateStr, currentDate]);

  const nextSession = useMemo(() => {
    if (!generatedPlan) return null;
    return generatedPlan
      .filter((s) => s.type !== "exam")
      .map((s) => ({
        ...s,
        startObj: new Date(`${s.date}T${s.startTime}`),
        endObj: new Date(`${s.date}T${s.endTime}`),
      }))
      .sort((a, b) => a.startObj - b.startObj)
      .find((s) => currentDate < s.startObj);
  }, [generatedPlan, currentDate]);

  let statusIcon,
    statusText,
    timerValue = null;

  if (currentSession) {
    if (currentSession.type === "study") {
      statusIcon = <BookOpen size={20} className="text-cyan-600" />;
      statusText = `Study ${currentSession.subject} until ${formatTime(
        currentSession.endTime
      )}`;
      timerValue = Math.max(
        0,
        Math.floor(
          (currentSession.endObj.getTime() - currentDate.getTime()) / 1000
        )
      );
    } else if (currentSession.type === "exam") {
      statusIcon = <Flame size={20} className="text-rose-600" />;
      statusText = `EXAM DAY for ${currentSession.subject}! Good luck.`;
    }
  } else if (nextSession) {
    statusIcon = <Timer size={20} className="text-indigo-600" />;
    statusText = `Rest until ${formatTime(nextSession.startTime)}. Next: ${
      nextSession.subject
    }`;
    timerValue = Math.max(
      0,
      Math.floor(
        (nextSession.startObj.getTime() - currentDate.getTime()) / 1000
      )
    );
  } else {
    statusIcon = <Zap size={20} className="text-green-600" />;
    statusText = `You're free! No sessions scheduled for now.`;
  }

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-xl p-6 mb-8 border border-blue-100 flex flex-col lg:flex-row justify-between items-start gap-6 animate-fade-in">
      <div className="flex items-start gap-4 flex-grow">
        <div className="bg-white p-3 rounded-full shadow-md flex-shrink-0">
          <Clock size={24} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
            {statusIcon} <span className="truncate">{statusText}</span>
          </h3>
          <div className="min-h-[3.5rem] flex items-center">
            <p className="text-sm text-slate-500 font-medium italic">
              "{motivation}"
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
        {stats && (
          <div className="flex gap-4 justify-between sm:justify-start">
            <div className="text-center bg-white border border-blue-200 p-3 rounded-xl min-w-[80px]">
              <div className="text-lg font-bold text-blue-800 leading-none">
                {stats.totalHours}h
              </div>
              <div className="text-xs font-medium text-blue-600 mt-1">
                TOTAL
              </div>
            </div>
            <div className="text-center bg-white border border-green-200 p-3 rounded-xl min-w-[80px]">
              <div className="text-lg font-bold text-green-800 leading-none">
                {stats.daysWithStudy}
              </div>
              <div className="text-xs font-medium text-green-600 mt-1">
                ACTIVE DAYS
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="text-center bg-blue-50 border border-blue-200 p-3 rounded-xl font-mono min-w-[100px]">
            <div className="text-2xl font-bold text-blue-800 leading-none">
              {currentTimeStr}
            </div>
            <div className="text-xs font-medium text-blue-600 mt-1">
              {formatDate(currentDateStr)}
            </div>
          </div>
          {timerValue !== null && timerValue > 0 && (
            <div className="text-center bg-indigo-50 border border-indigo-200 p-3 rounded-xl font-mono min-w-[100px]">
              <div className="text-2xl font-bold text-indigo-800 leading-none">
                {formatTimer(timerValue)}
              </div>
              <div className="text-xs font-medium text-indigo-600 mt-1">
                TIME LEFT
              </div>
            </div>
          )}
          <button
            onClick={onStartStudy}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition flex items-center justify-center gap-2"
          >
            <Play fill="currentColor" size={18} /> Focus Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Focus Mode Component
const StudyNowMode = ({ plan, onClose, userName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentSession = useMemo(() => {
    if (!plan) return null;
    const now = currentDate;
    const todayStr = getLocalDateString(now);
    return plan
      .filter((s) => s.date === todayStr && s.type === "study")
      .map((s) => ({
        ...s,
        startObj: new Date(`${s.date}T${s.startTime}`),
        endObj: new Date(`${s.date}T${s.endTime}`),
      }))
      .sort((a, b) => a.startObj - b.startObj)
      .find((s) => now >= s.startObj && now < s.endObj);
  }, [plan, currentDate]);

  const [sessionData, setSessionData] = useState({
    timeLeft: 0,
    isActive: false,
    focusStreak: 0,
  });

  useEffect(() => {
    if (currentSession) {
      setSessionData({
        timeLeft: Math.max(
          0,
          Math.floor(
            (currentSession.endObj.getTime() - currentDate.getTime()) / 1000
          )
        ),
        isActive: true,
        focusStreak: parseInt(localStorage.getItem("focusStreak") || "0"),
      });
    } else {
      setSessionData({ timeLeft: 0, isActive: false, focusStreak: 0 });
    }
  }, [currentSession, currentDate]);

  useEffect(() => {
    let interval = null;
    if (sessionData.isActive && sessionData.timeLeft > 0) {
      interval = setInterval(() => {
        setSessionData((p) => ({ ...p, timeLeft: p.timeLeft - 1 }));
        setCurrentDate(new Date());
      }, 1000);
    } else if (sessionData.timeLeft === 0 && sessionData.isActive) {
      setSessionData((p) => ({ ...p, isActive: false }));
      const newStreak = sessionData.focusStreak + 1;
      setSessionData((p) => ({ ...p, focusStreak: newStreak }));
      localStorage.setItem("focusStreak", newStreak.toString());
    }
    return () => clearInterval(interval);
  }, [sessionData.isActive, sessionData.timeLeft]);

  const toggleActive = () =>
    setSessionData((p) => ({ ...p, isActive: !p.isActive }));

  const resetTimer = useCallback(() => {
    if (currentSession) {
      setSessionData({
        timeLeft: currentSession.duration * 60,
        isActive: false,
        focusStreak: sessionData.focusStreak,
      });
    }
  }, [currentSession]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 z-[200] flex flex-col items-center justify-center text-white animate-fade-in overflow-hidden p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition"
      >
        <X size={24} />
      </button>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[100px] transition-all duration-[4000ms] ${
            sessionData.isActive ? "scale-125" : "scale-100"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[80px] transition-all duration-[4000ms] delay-75 ${
            sessionData.isActive ? "scale-150" : "scale-90"
          }`}
        ></div>
      </div>

      <div className="relative z-10 text-center w-full max-w-2xl px-4">
        {currentSession ? (
          <>
            <div className="mb-8 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-cyan-300 font-bold tracking-wider text-sm border border-white/10">
              <Brain size={14} /> FOCUS MODE • Streak: {sessionData.focusStreak}{" "}
              days
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 break-words">
              {currentSession.subject}
            </h2>
            <p className="text-xl text-cyan-100/80 mb-12 max-w-lg mx-auto leading-relaxed px-2">
              {
                MOTIVATIONAL_QUOTES[
                  Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
                ]
              }
            </p>

            <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center group">
              <div
                className={`absolute inset-0 border-4 border-cyan-500/30 rounded-full transition-all duration-[4000ms] ${
                  sessionData.isActive
                    ? "scale-110 opacity-50"
                    : "scale-100 opacity-20"
                }`}
              ></div>
              <div
                className={`absolute inset-0 border-4 border-cyan-400/50 rounded-full transition-all duration-[4000ms] delay-100 ${
                  sessionData.isActive
                    ? "scale-125 opacity-30"
                    : "scale-95 opacity-20"
                }`}
              ></div>
              <div className="text-6xl font-mono font-bold tracking-widest relative z-10">
                {formatTimer(sessionData.timeLeft)}
              </div>
            </div>

            <div className="flex gap-6 justify-center items-center">
              <button
                onClick={toggleActive}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:scale-105 transition shadow-lg shadow-cyan-500/20"
              >
                {sessionData.isActive ? (
                  <>
                    <Pause fill="currentColor" /> Pause
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" /> Start Focus
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            <div className="mt-12 text-sm text-slate-300 px-2">
              Next up: {currentSession.description}
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <Coffee size={48} className="mx-auto mb-6 text-cyan-400" />
            <h2 className="text-4xl font-bold mb-4">You're Free!</h2>
            <p className="text-xl text-slate-300">
              No study sessions scheduled for right now.
            </p>
            <p className="mt-4 text-slate-400">
              Enjoy your time off, {userName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// FIXED: Question Card with consistent layout
const QuestionCard = ({
  children,
  title,
  description,
  onNext,
  onBack,
  isLast,
  nextLabel = "Next",
}) => (
  <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-4xl mx-auto transition-all duration-500 animate-fade-in border border-slate-100 flex flex-col min-h-[450px]">
    <div className="mb-6 border-b border-slate-100 pb-6">
      <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight flex items-center gap-3">
        {title}
      </h2>
      <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
    <div className="flex-grow mb-6 overflow-y-auto custom-scrollbar pr-2">
      {children}
    </div>
    <div className="flex justify-between pt-6 border-t border-slate-100 mt-auto">
      {onBack ? (
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition flex items-center gap-2 font-bold border border-transparent hover:border-slate-200"
        >
          <ChevronLeft size={18} /> Back
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        className={`px-10 py-4 text-white font-bold text-lg shadow-lg flex items-center gap-2 transform hover:-translate-y-1 transition-all rounded-xl ${
          isLast
            ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-rose-500/30"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/30"
        }`}
      >
        {isLast ? "Generate Plan" : nextLabel} <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

const SelectionCard = ({
  selected,
  onClick,
  icon: Icon,
  title,
  desc,
  colorClass = "text-cyan-600",
}) => (
  <button
    onClick={onClick}
    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 w-full h-full flex flex-col hover:-translate-y-1 ${
      selected
        ? "border-cyan-500 bg-gradient-to-br from-cyan-50 to-white ring-4 ring-cyan-100 shadow-lg"
        : "border-slate-100 bg-white hover:border-cyan-300 hover:shadow-md"
    }`}
  >
    {selected && (
      <div className="absolute top-4 right-4 text-cyan-600">
        <CheckCircle size={20} fill="currentColor" className="text-white" />
      </div>
    )}
    <div
      className={`p-3 rounded-full w-fit mb-4 ${
        selected
          ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
          : "bg-slate-50"
      }`}
    >
      <Icon className={selected ? "text-white" : colorClass} size={28} />
    </div>
    <h3
      className={`font-bold text-xl mb-2 ${
        selected ? "text-cyan-900" : "text-slate-800"
      }`}
    >
      {title}
    </h3>
    <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
  </button>
);

// --- 3. WIZARD STEPS ---
const IntroStep = ({ onStart }) => (
  <div className="text-center w-full max-w-5xl mx-auto pt-24 animate-fade-in px-4">
    <div className="relative mx-auto w-32 h-32 mb-10">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full animate-pulse opacity-20"></div>
      <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10">
        <Brain className="text-white w-16 h-16" />
      </div>
    </div>
    <h1 className="text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
      Study
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
        AI
      </span>{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
        Ultimate
      </span>
    </h1>
    <p className="text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
      The intelligent study planner that adapts to your life.
      <span className="block mt-2 text-lg text-slate-400">
        Smart Scheduling • School Integration • Focus Analytics
      </span>
    </p>
    <button
      onClick={onStart}
      className="px-16 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto ring-4 ring-blue-100"
    >
      Start Intelligent Planning <ChevronRight />
    </button>
  </div>
);

const StepBasics = ({ data, onChange, onNext, onBack }) => {
  const today = new Date().toISOString().split("T")[0];
  return (
    <QuestionCard
      title="1. The Foundation"
      description="Set your limits. The AI will never overwork you."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Your Name
            </label>
            <input
              type="text"
              className="w-full p-5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-2xl focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all font-bold text-lg"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <CalendarIcon size={14} /> Plan Start Date
            </label>
            <input
              type="date"
              min={today}
              className="w-full p-5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-2xl focus:border-cyan-500 focus:bg-white outline-none transition-all font-bold text-lg"
              value={data.startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border-2 border-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div className="flex items-center gap-3 text-blue-800">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Sliders size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-lg">Max Daily Study</h3>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full font-bold text-lg shadow-md">
              {data.maxStudyHours}h
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            className="w-full h-4 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={data.maxStudyHours}
            onChange={(e) => onChange("maxStudyHours", e.target.value)}
          />
          <p className="text-blue-600/70 text-sm mt-3 font-medium">
            AI Strategy: We only hit this limit if exams are urgent. Most days
            will be lighter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-cyan-200 transition">
            <div className="flex items-center gap-3 mb-3 text-cyan-700">
              <Sun size={20} /> <h3 className="font-bold text-lg">Start Day</h3>
            </div>
            <input
              type="time"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base"
              value={data.dailyStart}
              onChange={(e) => onChange("dailyStart", e.target.value)}
            />
          </div>
          <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition">
            <div className="flex items-center gap-3 mb-3 text-indigo-700">
              <Moon size={20} /> <h3 className="font-bold text-lg">End Day</h3>
            </div>
            <input
              type="time"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base"
              value={data.dailyEnd}
              onChange={(e) => onChange("dailyEnd", e.target.value)}
            />
          </div>
        </div>
      </div>
    </QuestionCard>
  );
};

// FIXED: Calendar View with Monday as first day
const CalendarView = ({
  viewDate,
  setViewDate,
  selectedDay,
  setSelectedDay,
  generatedPlan,
  userData,
}) => {
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  // Fix: Get first day of month with Monday as 0, Sunday as 6
  const getFirstDayOfMonthFixed = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday=0, Monday=1, ... to Monday=0, Tuesday=1, ..., Sunday=6
    return day === 0 ? 6 : day - 1;
  };

  const firstDay = getFirstDayOfMonthFixed(currentYear, currentMonth);

  const monthName = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const prevMonth = () =>
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const today = getLocalDateString(new Date());

  const planMarkers = useMemo(() => {
    if (!generatedPlan) return {};
    const markers = {};
    generatedPlan.forEach((s) => {
      if (!markers[s.date]) markers[s.date] = { study: 0, exam: 0, rest: 0 };
      markers[s.date][s.type] = (markers[s.date][s.type] || 0) + 1;
    });
    return markers;
  }, [generatedPlan]);

  const calendarDays = useMemo(() => {
    const days = [];
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = getLocalDateString(new Date(currentYear, currentMonth, i));
      const isToday = date === today;
      const isSelected = date === selectedDay;
      const markers = planMarkers[date] || { study: 0, exam: 0, rest: 0 };
      days.push({
        date,
        dayNum: i,
        isCurrentMonth: true,
        isToday,
        isSelected,
        markers,
      });
    }
    return days;
  }, [
    currentYear,
    currentMonth,
    daysInMonth,
    firstDay,
    today,
    selectedDay,
    planMarkers,
  ]);

  const DayCell = ({ day }) => {
    if (!day.date) return <div className="h-16"></div>;

    const isActive = day.isCurrentMonth;
    const isToday = day.isToday;
    const isSelected = day.isSelected;
    const markers = day.markers;

    const dayClass = `w-full aspect-square flex flex-col items-center justify-center p-1 rounded-xl transition-all border-2
      ${
        !isActive
          ? "text-slate-300 border-transparent"
          : "cursor-pointer hover:bg-blue-50"
      }
      ${
        isSelected
          ? "bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-500 ring-2 ring-cyan-200"
          : isToday
          ? "border-blue-400 bg-blue-50"
          : "border-white bg-white"
      }`;

    const handleClick = () => {
      if (isActive) setSelectedDay(day.date);
    };

    return (
      <div className={dayClass} onClick={handleClick}>
        <span
          className={`text-lg font-bold ${
            isActive ? "text-slate-800" : "text-slate-300"
          }`}
        >
          {day.dayNum}
        </span>
        <div className="flex gap-1 mt-1">
          {markers.exam > 0 && (
            <div
              className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
              title="Exam Day"
            ></div>
          )}
          {markers.study > 0 && (
            <div
              className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              title={`${markers.study} Study Session(s)`}
            ></div>
          )}
          {markers.rest > 0 && (
            <div
              className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              title={`${markers.rest} Break(s)`}
            ></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-2xl font-bold text-slate-800">{monthName}</h3>
        <div className="flex gap-2 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {/* FIXED: Week starts with Monday */}
      <div className="grid grid-cols-7 text-center text-sm font-bold text-slate-500 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="p-2 text-blue-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <DayCell key={index} day={day} />
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>{" "}
          <span>Study</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"></div>{" "}
          <span>Exam</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>{" "}
          <span>Breaks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-50"></div>{" "}
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

// FIXED: Daily Plan View with checkboxes
const DailyPlanView = ({ day, sessions, checkedItems, onToggleCheck }) => {
  if (!day)
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 min-h-[300px] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <CalendarIcon size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-base">
            Select a date on the calendar to view its plan.
          </p>
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
          <CheckCircle size={32} className="mx-auto mb-3 text-green-500" />
          <p className="font-medium text-base">
            No scheduled activities on this day. Free time!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border-l-4 flex items-start gap-3 ${
                s.type === "exam"
                  ? "bg-gradient-to-r from-rose-50 to-orange-50 border-rose-500"
                  : s.type === "rest"
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500"
                  : "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-500"
              } shadow-sm`}
            >
              <button
                onClick={() => onToggleCheck(s.id)}
                className="flex-shrink-0 mt-0.5"
              >
                {checkedItems[s.id] ? (
                  <CheckSquare className="text-green-600" size={20} />
                ) : (
                  <Square className="text-slate-400" size={20} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                  <div className="flex items-center gap-3">
                    {s.type === "exam" ? (
                      <Flame size={18} className="text-rose-600" />
                    ) : s.type === "rest" ? (
                      <Coffee size={18} className="text-green-600" />
                    ) : (
                      <BookOpen size={18} className="text-cyan-600" />
                    )}
                    <h4 className="font-bold text-lg text-slate-800 truncate">
                      {s.subject}
                    </h4>
                  </div>
                  <span className="text-sm font-mono text-slate-600 md:text-right">
                    {formatTime(s.startTime)} - {formatTime(s.endTime)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 pl-6 line-clamp-2">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// FIXED: Print function
const handlePrint = (generatedPlan, userData, stats, checkedItems) => {
  const printWindow = window.open("", "_blank");

  const completedSessions = generatedPlan
    ? generatedPlan.filter((s) => checkedItems[s.id]).length
    : 0;
  const totalSessions = generatedPlan ? generatedPlan.length : 0;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StudyAI Ultimate - Study Plan</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            max-width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0ea5e9;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .plan-day {
            break-inside: avoid;
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
          }
          .session {
            margin: 10px 0;
            padding: 10px;
            border-left: 4px solid #0ea5e9;
            background: #f8fafc;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .completed { opacity: 0.7; }
          .checkbox { color: #10b981; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #0ea5e9;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          h1 { color: #0ea5e9; margin: 0; }
          h2 { color: #475569; margin: 20px 0 10px; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📚 StudyAI Ultimate - Study Plan</h1>
        <p><strong>Student:</strong> ${
          userData.name || "Not specified"
        } | <strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card" style="background: #f0f9ff;">
          <h3>Total Study Hours</h3>
          <p style="font-size: 24px; font-weight: bold; color: #0369a1;">${
            stats?.totalHours || "0"
          }h</p>
        </div>
        <div class="stat-card" style="background: #f0fdf4;">
          <h3>Active Study Days</h3>
          <p style="font-size: 24px; font-weight: bold; color: #047857;">${
            stats?.daysWithStudy || "0"
          }</p>
        </div>
        <div class="stat-card" style="background: #fef2f2;">
          <h3>Completion Rate</h3>
          <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${completionRate}%</p>
        </div>
      </div>
      
      <div class="page-break"></div>
      
      <h2>📅 Study Plan with Checklist</h2>
  `);

  if (generatedPlan) {
    const sessionsByDate = {};
    generatedPlan.forEach((session) => {
      if (!sessionsByDate[session.date]) {
        sessionsByDate[session.date] = [];
      }
      sessionsByDate[session.date].push(session);
    });

    Object.entries(sessionsByDate).forEach(([date, sessions]) => {
      printWindow.document.write(`
        <div class="plan-day">
          <h3>${formatDate(date)}</h3>
      `);

      sessions.forEach((session) => {
        const isCompleted = checkedItems[session.id];
        printWindow.document.write(`
          <div class="session ${isCompleted ? "completed" : ""}">
            <span class="checkbox">${isCompleted ? "✅" : "☐"}</span>
            <div>
              <strong>${
                session.type === "exam"
                  ? "🎯 EXAM: "
                  : session.type === "rest"
                  ? "☕ BREAK: "
                  : "📚 STUDY: "
              }${session.subject}</strong><br>
              <small>${formatTime(session.startTime)} - ${formatTime(
          session.endTime
        )}</small>
              ${
                session.description
                  ? `<br><small>${session.description}</small>`
                  : ""
              }
            </div>
          </div>
        `);
      });

      printWindow.document.write(`</div>`);
    });
  }

  printWindow.document.write(`
      <div class="footer">
        <p>Made with StudyAI Ultimate: https://studyai-ultimate.netlify.app</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// FIXED: Share function
const handleShare = (generatedPlan, userData, stats, checkedItems) => {
  const completedSessions = generatedPlan
    ? generatedPlan.filter((s) => checkedItems[s.id]).length
    : 0;
  const totalSessions = generatedPlan ? generatedPlan.length : 0;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  const shareText = `📚 My Study Plan with StudyAI Ultimate 📚

👤 Student: ${userData.name || "Not specified"}
⏱️ Total Study Hours: ${stats?.totalHours || "0"}h
📅 Active Study Days: ${stats?.daysWithStudy || "0"}
✅ Completion Rate: ${completionRate}%
📆 Generated: ${new Date().toLocaleDateString()}

Made with StudyAI Ultimate: https://studyai-ultimate.netlify.app

#StudyAI #StudyPlan #Productivity`;

  if (navigator.share) {
    navigator.share({
      title: "My StudyAI Plan",
      text: shareText,
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(shareText);
    alert("Study plan copied to clipboard! 📋");
  }
};

// --- 4. MAIN APP ---
export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [studyModeOpen, setStudyModeOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (sessionId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  useEffect(() => {
    const savedChecked = localStorage.getItem("studyai_checked_items");
    if (savedChecked) {
      setCheckedItems(JSON.parse(savedChecked));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studyai_checked_items", JSON.stringify(checkedItems));
  }, [checkedItems]);

  // [Rest of the component remains the same with minor fixes for date handling]
  // ... (Previous state and effects remain similar)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 pb-20">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        body { margin: 0; background: #f8fafc; }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      `}</style>

      {studyModeOpen && (
        <StudyNowMode
          plan={generatedPlan}
          userName={userData.name}
          onClose={() => setStudyModeOpen(false)}
        />
      )}

      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg">
              <Brain size={18} />
            </div>
            StudyAI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
              Ultimate
            </span>
          </div>
          {step > 0 && step < 6 && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                    step >= n
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                      : "bg-slate-200"
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-col items-center w-full min-h-screen">
        <main className="w-full max-w-7xl px-6 py-8">
          {/* [Previous steps remain the same] */}

          {step === 6 && (
            <div className="animate-fade-in print-content">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-3">
                <div className="w-full">
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
                    Plan{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                      Generated
                    </span>{" "}
                    Successfully!
                  </h1>
                  <p className="text-xl text-slate-500">
                    Here is your intelligent study schedule, {userData.name}.
                  </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto justify-end">
                  <button
                    onClick={() =>
                      handleShare(generatedPlan, userData, stats, checkedItems)
                    }
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg flex items-center gap-2"
                  >
                    <Share2 size={16} /> Share
                  </button>
                  <button
                    onClick={() =>
                      handlePrint(generatedPlan, userData, stats, checkedItems)
                    }
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-xl hover:shadow-lg flex items-center gap-2"
                  >
                    <Printer size={16} /> Print
                  </button>
                </div>
              </div>

              <RealTimeStatus
                generatedPlan={generatedPlan}
                userName={userData.name}
                onStartStudy={() => setStudyModeOpen(true)}
                stats={stats}
              />

              {/* Stats Panel */}
              <div className="bg-gradient-to-r from-white to-blue-50 p-6 rounded-3xl shadow-xl border border-blue-100 mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b border-blue-100 pb-3 flex items-center gap-2">
                  <TrendingUp size={20} /> Study Analytics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Stats cards */}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <CalendarView
                  viewDate={viewDate}
                  setViewDate={setViewDate}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  generatedPlan={generatedPlan}
                  userData={userData}
                />
                <DailyPlanView
                  day={selectedDay}
                  sessions={
                    generatedPlan
                      ? generatedPlan.filter((s) => s.date === selectedDay)
                      : []
                  }
                  checkedItems={checkedItems}
                  onToggleCheck={toggleCheck}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Restart Planning
                </button>
                <button
                  onClick={() => setStudyModeOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Start Focus Session
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="w-full max-w-7xl mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm px-6">
          <p>
            StudyAI Ultimate Pro Edition • Intelligent Study Planning System
          </p>
          <p className="mt-2">Designed with ❤️ for students worldwide</p>
        </footer>
      </div>
    </div>
  );
}
