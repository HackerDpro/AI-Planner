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
} from "lucide-react";

// ==============================================================================
// AI STUDY ARCHITECT - ULTIMATE PRO EDITION - RESPONSIVE VERSION
// ==============================================================================

// --- 1. UTILITY FUNCTIONS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
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

const MOTIVATIONAL_QUOTES = [
  (name, subject) => `Crush this ${subject} session, ${name}!`,
  (name, subject) => `Future you will thank you for studying ${subject} now.`,
  (name, subject) => `One step closer to mastering ${subject}.`,
  (name, subject) => `Focus mode: ON. Let's destroy ${subject}.`,
  (name, subject) => `You are smarter than this ${subject} exam.`,
  (name, subject) => `${subject} is tough, but you are tougher.`,
  (name, subject) => `Small progress is still progress.`,
  (name, subject) =>
    `The expert in anything was once a beginner. Start ${subject}.`,
  (name, subject) =>
    `Discipline is choosing between what you want now and what you want most. Focus on ${subject}.`,
  (name, subject) =>
    `Don't wish it were easier, wish you were better. Dive into ${subject}, ${name}.`,
  (name, subject) => `Your dedication is the key to unlocking ${subject}.`,
  (name, subject) =>
    `Believe in your potential for ${subject}. You've got this!`,
  (name, subject) =>
    `Every minute counts. Make this ${subject} session count, ${name}.`,
  (name, subject) =>
    `A little progress each day adds up to big results. Go for ${subject}.`,
  (name, subject) =>
    `Success is the sum of small efforts repeated daily. Focus on ${subject} now.`,
  (name, subject) => `Your brain is a muscle. Exercise it with ${subject}.`,
  (name, subject) =>
    `The pain of discipline is less than the pain of regret. Study ${subject}.`,
  (name, subject) => `You are capable of amazing things in ${subject}.`,
  (name, subject) => `Turn your ${subject} weaknesses into strengths.`,
  (name, subject) =>
    `Every session brings you closer to mastery of ${subject}.`,
];

const getRandomMotivation = (name, subject) => {
  const quoteFn =
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  return quoteFn(name, subject || "subject");
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

// IMPROVED: Real-Time Status & Timer - RESPONSIVE VERSION
const RealTimeStatus = ({ generatedPlan, userName, onStartStudy, stats }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [motivation, setMotivation] = useState(
    getRandomMotivation(userName, null)
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentDate(new Date());
      setMotivation(getRandomMotivation(userName, null));
    };

    const intervalId = setInterval(updateTime, 300000);
    const secondIntervalId = setInterval(
      () => setCurrentDate(new Date()),
      1000
    );

    return () => {
      clearInterval(intervalId);
      clearInterval(secondIntervalId);
    };
  }, [userName]);

  const currentTimeStr = currentDate.toTimeString().substring(0, 5);
  const currentDateStr = currentDate.toISOString().split("T")[0];

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

  const motivationToDisplay =
    currentSession && currentSession.subject
      ? getRandomMotivation(userName, currentSession.subject)
      : motivation;

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 border border-blue-100 flex flex-col lg:flex-row justify-between items-start gap-4 animate-fade-in">
      <div className="flex items-start gap-3 md:gap-4 flex-grow">
        <div className="bg-white p-2 md:p-3 rounded-full shadow-md flex-shrink-0">
          <Clock size={24} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            {statusIcon} <span className="truncate">{statusText}</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 italic line-clamp-2">
            "{motivationToDisplay}"
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        {stats && (
          <div className="flex gap-2 md:gap-4 justify-between sm:justify-start">
            <div className="text-center bg-white border border-blue-200 p-2 md:p-3 rounded-xl min-w-[70px]">
              <div className="text-base md:text-lg font-bold text-blue-800 leading-none">
                {stats.totalHours}h
              </div>
              <div className="text-xs font-medium text-blue-600 mt-1">
                TOTAL
              </div>
            </div>
            <div className="text-center bg-white border border-green-200 p-2 md:p-3 rounded-xl min-w-[70px]">
              <div className="text-base md:text-lg font-bold text-green-800 leading-none">
                {stats.daysWithStudy}
              </div>
              <div className="text-xs font-medium text-green-600 mt-1">
                ACTIVE DAYS
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="text-center bg-blue-50 border border-blue-200 p-2 md:p-3 rounded-xl font-mono min-w-[90px]">
            <div className="text-lg md:text-2xl font-bold text-blue-800 leading-none">
              {currentTimeStr}
            </div>
            <div className="text-xs font-medium text-blue-600 mt-1">
              {formatDate(currentDateStr)}
            </div>
          </div>
          {timerValue !== null && timerValue > 0 && (
            <div className="text-center bg-indigo-50 border border-indigo-200 p-2 md:p-3 rounded-xl font-mono min-w-[90px]">
              <div className="text-lg md:text-2xl font-bold text-indigo-800 leading-none">
                {formatTimer(timerValue)}
              </div>
              <div className="text-xs font-medium text-indigo-600 mt-1">
                TIME LEFT
              </div>
            </div>
          )}
          <button
            onClick={onStartStudy}
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Play fill="currentColor" size={18} /> Focus Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Focus Mode Component - RESPONSIVE VERSION
const StudyNowMode = ({ plan, onClose, userName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentSession = useMemo(() => {
    if (!plan) return null;
    const now = currentDate;
    const todayStr = now.toISOString().split("T")[0];
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
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-white/10 rounded-full transition"
      >
        <X size={24} className="md:w-8 md:h-8" />
      </button>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyan-500 rounded-full blur-[60px] md:blur-[100px] transition-all duration-[4000ms] ${
            sessionData.isActive ? "scale-125" : "scale-100"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-indigo-600 rounded-full blur-[40px] md:blur-[80px] transition-all duration-[4000ms] delay-75 ${
            sessionData.isActive ? "scale-150" : "scale-90"
          }`}
        ></div>
      </div>

      <div className="relative z-10 text-center w-full max-w-2xl px-2 md:px-4">
        {currentSession ? (
          <>
            <div className="mb-6 md:mb-8 inline-flex items-center gap-2 bg-white/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-cyan-300 font-bold tracking-wider text-xs md:text-sm border border-white/10">
              <Brain size={14} className="md:w-4 md:h-4" /> FOCUS MODE • Streak:{" "}
              {sessionData.focusStreak} days
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 break-words">
              {currentSession.subject}
            </h2>
            <p className="text-base md:text-xl text-cyan-100/80 mb-8 md:mb-12 max-w-lg mx-auto leading-relaxed px-2">
              {getRandomMotivation(userName, currentSession.subject)}
            </p>

            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 md:mb-12 flex items-center justify-center group">
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
              <div className="text-4xl md:text-6xl font-mono font-bold tracking-widest relative z-10">
                {formatTimer(sessionData.timeLeft)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <button
                onClick={toggleActive}
                className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-blue-900 rounded-full font-bold text-base md:text-lg hover:scale-105 transition shadow-lg shadow-cyan-500/20"
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
                className="p-3 md:p-4 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md"
              >
                <RotateCcw size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            <div className="mt-8 md:mt-12 text-xs md:text-sm text-slate-300 px-2">
              Next up: {currentSession.description}
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <Coffee
              size={48}
              className="mx-auto mb-4 md:mb-6 text-cyan-400 md:w-16 md:h-16"
            />
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              You're Free!
            </h2>
            <p className="text-base md:text-xl text-slate-300">
              No study sessions scheduled for right now.
            </p>
            <p className="mt-3 md:mt-4 text-slate-400">
              Enjoy your time off, {userName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionCard = ({
  children,
  title,
  description,
  onNext,
  onBack,
  isLast,
  nextLabel = "Next",
}) => (
  <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-10 w-full max-w-4xl mx-auto transition-all duration-500 animate-fade-in border border-slate-100 flex flex-col min-h-[400px] md:min-h-[450px]">
    <div className="mb-4 md:mb-6 border-b border-slate-100 pb-4 md:pb-6">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2 md:mb-3 tracking-tight flex items-center gap-2 md:gap-3">
        {title}
      </h2>
      <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
    <div className="flex-grow mb-4 md:mb-6 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
      {children}
    </div>
    <div className="flex justify-between pt-4 md:pt-6 border-t border-slate-100 mt-auto">
      {onBack ? (
        <button
          onClick={onBack}
          className="px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-slate-600 hover:bg-slate-100 transition flex items-center gap-2 font-medium md:font-bold border border-transparent hover:border-slate-200 text-sm md:text-base"
        >
          <ChevronLeft size={18} className="md:w-5 md:h-5" /> Back
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        className={`px-6 md:px-10 py-2 md:py-3 lg:py-4 rounded-lg md:rounded-xl text-white font-bold text-base md:text-lg shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5 md:hover:-translate-y-1 transition-all ${
          isLast
            ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-rose-500/30"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/30"
        }`}
      >
        {isLast ? "Generate Plan" : nextLabel}{" "}
        <ChevronRight size={20} className="md:w-6 md:h-6" />
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
    className={`relative p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-200 w-full h-full flex flex-col hover:-translate-y-0.5 md:hover:-translate-y-1 ${
      selected
        ? "border-cyan-500 bg-gradient-to-br from-cyan-50 to-white ring-2 md:ring-4 ring-cyan-100 shadow-lg"
        : "border-slate-100 bg-white hover:border-cyan-300 hover:shadow-md"
    }`}
  >
    {selected && (
      <div className="absolute top-3 right-3 md:top-4 md:right-4 text-cyan-600">
        <CheckCircle
          size={20}
          className="md:w-6 md:h-6"
          fill="currentColor"
          className="text-white"
        />
      </div>
    )}
    <div
      className={`p-2 md:p-3 rounded-full w-fit mb-3 md:mb-4 ${
        selected
          ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
          : "bg-slate-50"
      }`}
    >
      <Icon
        className={selected ? "text-white" : colorClass}
        size={28}
        className="md:w-8 md:h-8"
      />
    </div>
    <h3
      className={`font-bold text-lg md:text-xl mb-1 md:mb-2 ${
        selected ? "text-cyan-900" : "text-slate-800"
      }`}
    >
      {title}
    </h3>
    <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
      {desc}
    </p>
  </button>
);

// --- 3. WIZARD STEPS ---
const IntroStep = ({ onStart }) => (
  <div className="text-center w-full max-w-5xl mx-auto pt-8 md:pt-16 lg:pt-24 animate-fade-in px-4">
    <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-10">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full animate-pulse opacity-20"></div>
      <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10">
        <Brain className="text-white w-12 h-12 md:w-16 md:h-16" />
      </div>
    </div>
    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight">
      Study
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
        AI
      </span>{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
        Ultimate
      </span>
    </h1>
    <p className="text-lg md:text-xl lg:text-2xl text-slate-600 mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto">
      The intelligent study planner that adapts to your life.
      <span className="block mt-1 md:mt-2 text-sm md:text-lg text-slate-400">
        Smart Scheduling • School Integration • Focus Analytics
      </span>
    </p>
    <button
      onClick={onStart}
      className="px-8 md:px-16 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-base md:text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-2 md:gap-3 mx-auto ring-2 md:ring-4 ring-blue-100"
    >
      Start Intelligent Planning <ChevronRight className="md:w-6 md:h-6" />
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
      <div className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2 uppercase tracking-wide">
              Your Name
            </label>
            <input
              type="text"
              className="w-full p-3 md:p-5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl md:rounded-2xl focus:border-cyan-500 focus:bg-white focus:ring-2 md:focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all font-bold text-base md:text-lg"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2 uppercase tracking-wide flex items-center gap-1 md:gap-2">
              <CalendarIcon size={14} className="md:w-4 md:h-4" /> Plan Start
              Date
            </label>
            <input
              type="date"
              min={today}
              className="w-full p-3 md:p-5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl md:rounded-2xl focus:border-cyan-500 focus:bg-white outline-none transition-all font-bold text-base md:text-lg"
              value={data.startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-0 mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3 text-blue-800">
              <div className="bg-white p-1 md:p-2 rounded-lg shadow-sm">
                <Sliders size={20} className="md:w-6 md:h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-base md:text-lg">
                Max Daily Study
              </h3>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 md:px-5 py-1 md:py-2 rounded-full font-bold text-base md:text-lg shadow-md">
              {data.maxStudyHours}h
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            className="w-full h-2 md:h-4 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={data.maxStudyHours}
            onChange={(e) => onChange("maxStudyHours", e.target.value)}
          />
          <p className="text-blue-600/70 text-xs md:text-sm mt-2 md:mt-3 font-medium">
            AI Strategy: We only hit this limit if exams are urgent. Most days
            will be lighter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="p-3 md:p-5 bg-white rounded-xl md:rounded-2xl border-2 border-slate-100 hover:border-cyan-200 transition">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-cyan-700">
              <Sun size={20} className="md:w-6 md:h-6" />{" "}
              <h3 className="font-bold text-base md:text-lg">Start Day</h3>
            </div>
            <input
              type="time"
              className="w-full p-2 md:p-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl font-bold text-sm md:text-base"
              value={data.dailyStart}
              onChange={(e) => onChange("dailyStart", e.target.value)}
            />
          </div>
          <div className="p-3 md:p-5 bg-white rounded-xl md:rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-indigo-700">
              <Moon size={20} className="md:w-6 md:h-6" />{" "}
              <h3 className="font-bold text-base md:text-lg">End Day</h3>
            </div>
            <input
              type="time"
              className="w-full p-2 md:p-3 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl font-bold text-sm md:text-base"
              value={data.dailyEnd}
              onChange={(e) => onChange("dailyEnd", e.target.value)}
            />
          </div>
        </div>
      </div>
    </QuestionCard>
  );
};

const StepChronotype = ({ data, onChange, onNext, onBack }) => (
  <QuestionCard
    title="2. Energy Profile"
    description="We schedule hard topics when you are most awake."
    onNext={onNext}
    onBack={onBack}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-full">
      {[
        {
          id: "morning",
          title: "Early Bird",
          desc: "Peak focus: 8AM - 12PM",
          icon: Sun,
          color: "text-amber-500",
          bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
        },
        {
          id: "afternoon",
          title: "Daytime",
          desc: "Peak focus: 11AM - 5PM",
          icon: Activity,
          color: "text-orange-500",
          bg: "bg-gradient-to-br from-orange-50 to-red-50",
        },
        {
          id: "night",
          title: "Night Owl",
          desc: "Peak focus: 6PM - 12AM",
          icon: Moon,
          color: "text-indigo-600",
          bg: "bg-gradient-to-br from-indigo-50 to-purple-50",
        },
      ].map((opt) => (
        <SelectionCard
          key={opt.id}
          {...opt}
          selected={data.chronotype === opt.id}
          onClick={() => onChange("chronotype", opt.id)}
          colorClass={opt.color}
        />
      ))}
    </div>
  </QuestionCard>
);

const StepExams = ({ data, updateExams, onNext, onBack }) => {
  const addExam = () =>
    updateExams([
      ...data.exams,
      { id: generateId(), subject: "", date: "", difficulty: 5, priority: 1 },
    ]);
  const removeExam = (id) => updateExams(data.exams.filter((e) => e.id !== id));
  const updateExamField = (index, field, value) => {
    const newExams = [...data.exams];
    newExams[index][field] = value;
    updateExams(newExams);
  };

  return (
    <QuestionCard
      title="3. The Mission"
      description="Add your exams. We prioritize them based on date and difficulty."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-3 md:space-y-4">
        {data.exams.map((exam, index) => (
          <div
            key={exam.id}
            className="bg-gradient-to-r from-slate-50 to-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-slate-200 relative shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group"
          >
            <button
              onClick={() => removeExam(exam.id)}
              className="absolute top-3 right-3 md:top-4 md:right-4 bg-white text-slate-300 hover:text-rose-500 p-1 md:p-2 rounded-full shadow-sm transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} className="md:w-5 md:h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-4 md:mb-6 items-end">
              <div className="md:col-span-5">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Economy"
                  className="w-full p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl font-bold text-slate-800 focus:border-cyan-500 outline-none text-sm md:text-base"
                  value={exam.subject}
                  onChange={(e) =>
                    updateExamField(index, "subject", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">
                  Exam Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl font-bold text-slate-800 focus:border-cyan-500 outline-none text-sm md:text-base"
                  value={exam.date}
                  onChange={(e) =>
                    updateExamField(index, "date", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">
                  Priority
                </label>
                <select
                  className="w-full p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl font-bold text-slate-800 outline-none text-sm md:text-base"
                  value={exam.priority}
                  onChange={(e) =>
                    updateExamField(index, "priority", e.target.value)
                  }
                >
                  <option value="1">Normal</option>
                  <option value="1.5">Important</option>
                  <option value="2">High</option>
                  <option value="3">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Difficulty
              </span>
              <input
                type="range"
                min="1"
                max="10"
                className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gradient-to-r from-rose-400 to-orange-400"
                value={exam.difficulty}
                onChange={(e) =>
                  updateExamField(index, "difficulty", e.target.value)
                }
              />
              <span className="font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent w-6 md:w-8 text-right text-sm md:text-base">
                {exam.difficulty}
              </span>
            </div>
          </div>
        ))}
        <button
          onClick={addExam}
          className="w-full py-4 md:py-6 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl md:rounded-3xl hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-600 font-bold flex items-center justify-center gap-2 transition-all group text-sm md:text-base"
        >
          <div className="bg-slate-200 group-hover:bg-cyan-200 p-1 md:p-2 rounded-full text-blue-700 group-hover:text-cyan-700 transition-colors">
            <Plus size={20} className="md:w-6 md:h-6" />
          </div>{" "}
          Add Exam
        </button>
      </div>
    </QuestionCard>
  );
};

const StepBlocked = ({ data, updateBlocked, onNext, onBack }) => {
  const [newBlock, setNewBlock] = useState({
    day: "Everyday",
    start: "",
    end: "",
    name: "",
  });

  const addBlock = () => {
    if (newBlock.start && newBlock.end && newBlock.name) {
      updateBlocked([...data.blockedTimes, { ...newBlock, type: "recurring" }]);
      setNewBlock({ ...newBlock, name: "", start: "", end: "" });
    }
  };

  return (
    <QuestionCard
      title="4. Life Constraints"
      description="When are you busy? We will never schedule study during these times."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-100 mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          <select
            className="p-3 md:p-4 bg-white border border-indigo-100 rounded-lg md:rounded-xl font-bold text-slate-700 outline-none text-sm md:text-base"
            value={newBlock.day}
            onChange={(e) => setNewBlock({ ...newBlock, day: e.target.value })}
          >
            {[
              "Everyday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Activity (e.g. Soccer Training)"
              className="w-full p-3 md:p-4 bg-white border border-indigo-100 rounded-lg md:rounded-xl font-bold text-slate-700 outline-none text-sm md:text-base"
              value={newBlock.name}
              onChange={(e) =>
                setNewBlock({ ...newBlock, name: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 bg-white p-2 md:p-3 rounded-lg md:rounded-xl border border-indigo-100">
          <Clock
            className="text-indigo-400 ml-1 md:ml-2"
            size={16}
            className="md:w-5 md:h-5"
          />
          <input
            type="time"
            className="bg-transparent font-bold text-slate-700 outline-none text-sm md:text-base flex-1"
            value={newBlock.start}
            onChange={(e) =>
              setNewBlock({ ...newBlock, start: e.target.value })
            }
          />
          <span className="text-slate-300">to</span>
          <input
            type="time"
            className="bg-transparent font-bold text-slate-700 outline-none text-sm md:text-base flex-1"
            value={newBlock.end}
            onChange={(e) => setNewBlock({ ...newBlock, end: e.target.value })}
          />
        </div>
        <button
          onClick={addBlock}
          className="w-full py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 text-sm md:text-base"
        >
          <Plus size={16} className="md:w-5 md:h-5" /> Add Constraint
        </button>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
        {data.blockedTimes.map((block, index) => (
          <div
            key={index}
            className="flex items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-1.5 h-8 md:h-12 rounded-full bg-gradient-to-b from-indigo-400 to-blue-400"></div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-bold text-slate-800 text-sm md:text-base truncate">
                  {block.day}
                </span>
                <span className="text-xs font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded w-fit">
                  Recurring
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs md:text-sm text-slate-500 mt-1 gap-1">
                <span className="truncate">{block.name}</span>
                <span className="font-mono">
                  {formatTime(block.start)} - {formatTime(block.end)}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                updateBlocked(data.blockedTimes.filter((_, i) => i !== index))
              }
              className="text-slate-300 hover:text-rose-500 p-1 md:p-2 flex-shrink-0"
            >
              <Trash2 size={16} className="md:w-5 md:h-5" />
            </button>
          </div>
        ))}
      </div>
    </QuestionCard>
  );
};

const StepSchoolSchedule = ({ data, onChange, onNext, onBack }) => {
  const updateSchoolSchedule = (day, field, value) => {
    const newSchedule = { ...data.schoolSchedule.weeklySchedule };

    if (field === "hasSchool") {
      newSchedule[day].hasSchool = value;
      if (!value) {
        newSchedule[day].start = "";
        newSchedule[day].end = "";
      } else {
        newSchedule[day].start = newSchedule[day].start || "08:00";
        newSchedule[day].end = newSchedule[day].end || "15:00";
      }
    } else {
      newSchedule[day][field] = value;
    }

    onChange("schoolSchedule", {
      ...data.schoolSchedule,
      weeklySchedule: newSchedule,
    });
  };

  const updateDate = (field, value) => {
    onChange("schoolSchedule", {
      ...data.schoolSchedule,
      [field]: value,
    });
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <QuestionCard
      title="5. School Schedule"
      description="When do you have school? We'll schedule study sessions around your classes."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-6 md:space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-blue-100">
          <h3 className="font-bold text-base md:text-lg text-blue-800 mb-3 md:mb-4 flex items-center gap-2">
            <CalendarIcon size={18} className="md:w-5 md:h-5" /> School Term
            Dates (Optional)
          </h3>
          <p className="text-xs md:text-sm text-blue-600/70 mb-3 md:mb-4">
            If your school has specific start/end dates (like semester breaks),
            add them here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-bold text-blue-700 mb-1 md:mb-2">
                School Starts
              </label>
              <input
                type="date"
                className="w-full p-2 md:p-3 bg-white border border-blue-200 rounded-lg md:rounded-xl font-medium text-sm md:text-base"
                value={data.schoolSchedule?.startDate || ""}
                onChange={(e) => updateDate("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-blue-700 mb-1 md:mb-2">
                School Ends
              </label>
              <input
                type="date"
                className="w-full p-2 md:p-3 bg-white border border-blue-200 rounded-lg md:rounded-xl font-medium text-sm md:text-base"
                value={data.schoolSchedule?.endDate || ""}
                onChange={(e) => updateDate("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-base md:text-lg text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
            <School size={18} className="md:w-5 md:h-5" /> Weekly School Hours
          </h3>
          <div className="space-y-2 md:space-y-3">
            {daysOfWeek.map((day) => {
              const daySchedule = data.schoolSchedule?.weeklySchedule?.[
                day
              ] || { start: "", end: "", hasSchool: false };
              return (
                <div
                  key={day}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 hover:border-blue-200 transition"
                >
                  <div className="w-6 md:w-8">
                    <input
                      type="checkbox"
                      id={`school-${day}`}
                      checked={daySchedule.hasSchool || false}
                      onChange={(e) =>
                        updateSchoolSchedule(day, "hasSchool", e.target.checked)
                      }
                      className="h-4 w-4 md:h-5 md:w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`school-${day}`}
                      className="font-bold text-slate-800 text-sm md:text-base truncate"
                    >
                      {day}
                    </label>
                  </div>
                  {daySchedule.hasSchool ? (
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <input
                        type="time"
                        value={daySchedule.start || ""}
                        onChange={(e) =>
                          updateSchoolSchedule(day, "start", e.target.value)
                        }
                        className="p-1 md:p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs md:text-sm w-24 md:w-auto"
                      />
                      <span className="text-slate-400 text-xs md:text-sm">
                        to
                      </span>
                      <input
                        type="time"
                        value={daySchedule.end || ""}
                        onChange={(e) =>
                          updateSchoolSchedule(day, "end", e.target.value)
                        }
                        className="p-1 md:p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs md:text-sm w-24 md:w-auto"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs md:text-sm font-medium">
                      No school
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-3 md:mt-4">
            💡 The AI will avoid scheduling study sessions during school hours.
            On days without school, more study time will be available.
          </p>
        </div>
      </div>
    </QuestionCard>
  );
};

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
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthName = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () =>
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const today = new Date().toISOString().split("T")[0];

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
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
        .toISOString()
        .split("T")[0];
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
    if (!day.date) return <div className="h-10 md:h-16"></div>;

    const isActive = day.isCurrentMonth;
    const isToday = day.isToday;
    const isSelected = day.isSelected;
    const markers = day.markers;

    const dayClass = `w-full aspect-square flex flex-col items-center justify-center p-0.5 md:p-1 rounded-lg md:rounded-xl transition-all border-2
      ${
        !isActive
          ? "text-slate-300 border-transparent"
          : "cursor-pointer hover:bg-blue-50"
      }
      ${
        isSelected
          ? "bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-500 ring-1 md:ring-2 ring-cyan-200"
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
          className={`text-sm md:text-lg font-bold ${
            isActive ? "text-slate-800" : "text-slate-300"
          }`}
        >
          {day.dayNum}
        </span>
        <div className="flex gap-0.5 md:gap-1 mt-0.5 md:mt-1">
          {markers.exam > 0 && (
            <div
              className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
              title="Exam Day"
            ></div>
          )}
          {markers.study > 0 && (
            <div
              className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              title={`${markers.study} Study Session(s)`}
            ></div>
          )}
          {markers.rest > 0 && (
            <div
              className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              title={`${markers.rest} Break(s)`}
            ></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">
          {monthName}
        </h3>
        <div className="flex gap-1 md:gap-2 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1.5 md:p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <ChevronLeft size={16} className="md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 md:p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <ChevronRight size={16} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs md:text-sm font-bold text-slate-500 mb-1 md:mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-1 md:p-2 text-blue-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {calendarDays.map((day, index) => (
          <DayCell key={index} day={day} />
        ))}
      </div>
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>{" "}
          <span>Study</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"></div>{" "}
          <span>Exam</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>{" "}
          <span>Breaks</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-blue-400 bg-blue-50"></div>{" "}
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

const DailyPlanView = ({ day, sessions }) => {
  if (!day)
    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 min-h-[250px] md:min-h-[300px] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <CalendarIcon
            size={32}
            className="mx-auto mb-2 md:mb-3 text-slate-300 md:w-10 md:h-10"
          />
          <p className="font-medium text-sm md:text-base">
            Select a date on the calendar to view its plan.
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 min-h-[250px] md:min-h-[300px]">
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b border-slate-100 pb-2 md:pb-3">
        Plan for {formatDate(day)}
      </h3>
      {sessions.length === 0 ? (
        <div className="text-center py-6 md:py-10 text-slate-500">
          <CheckCircle
            size={32}
            className="mx-auto mb-2 md:mb-3 text-green-500 md:w-10 md:h-10"
          />
          <p className="font-medium text-sm md:text-base">
            No scheduled activities on this day. Free time!
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-l-4 ${
                s.type === "exam"
                  ? "bg-gradient-to-r from-rose-50 to-orange-50 border-rose-500"
                  : s.type === "rest"
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500"
                  : "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-500"
              } shadow-sm`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-0">
                <div className="flex items-center gap-2 md:gap-3">
                  {s.type === "exam" ? (
                    <Flame size={18} className="text-rose-600 md:w-5 md:h-5" />
                  ) : s.type === "rest" ? (
                    <Coffee
                      size={18}
                      className="text-green-600 md:w-5 md:h-5"
                    />
                  ) : (
                    <BookOpen
                      size={18}
                      className="text-cyan-600 md:w-5 md:h-5"
                    />
                  )}
                  <h4 className="font-bold text-base md:text-lg text-slate-800 truncate">
                    {s.subject}
                  </h4>
                </div>
                <span className="text-xs md:text-sm font-mono text-slate-600 md:text-right">
                  {formatTime(s.startTime)} - {formatTime(s.endTime)}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1 pl-6 md:pl-7 line-clamp-2">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatsPanel = ({ generatedPlan, userData }) => {
  const stats = useMemo(() => {
    if (!generatedPlan) return null;

    const studySessions = generatedPlan.filter((s) => s.type === "study");
    const examDays = generatedPlan.filter((s) => s.type === "exam");
    const restSessions = generatedPlan.filter((s) => s.type === "rest");

    const totalStudyMinutes = studySessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );
    const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

    const daysWithStudy = [...new Set(studySessions.map((s) => s.date))].length;
    const daysWithExams = examDays.length;

    const subjects = {};
    studySessions.forEach((s) => {
      subjects[s.subject] = (subjects[s.subject] || 0) + s.duration;
    });

    const mostStudiedSubject = Object.entries(subjects).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalStudyHours,
      daysWithStudy,
      daysWithExams,
      totalSessions: studySessions.length,
      mostStudiedSubject: mostStudiedSubject
        ? `${mostStudiedSubject[0]} (${(mostStudiedSubject[1] / 60).toFixed(
            1
          )}h)`
        : "None",
      efficiencyScore: Math.min(
        100,
        Math.round(
          (daysWithStudy / Math.max(1, examDays.length)) * 50 +
            (totalStudyMinutes / (userData.maxStudyHours * 60)) * 50
        )
      ),
    };
  }, [generatedPlan, userData]);

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-blue-100">
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 border-b border-blue-100 pb-2 md:pb-3 flex items-center gap-2">
        <TrendingUp size={20} className="md:w-6 md:h-6" /> Study Analytics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-blue-100">
          <div className="text-lg md:text-2xl font-bold text-blue-700">
            {stats.totalStudyHours}h
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            Total Study Time
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-green-100">
          <div className="text-lg md:text-2xl font-bold text-green-700">
            {stats.daysWithStudy}
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            Active Study Days
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-rose-100">
          <div className="text-lg md:text-2xl font-bold text-rose-700">
            {stats.daysWithExams}
          </div>
          <div className="text-xs md:text-sm text-slate-500">Exam Days</div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-purple-100">
          <div className="text-lg md:text-2xl font-bold text-purple-700">
            {stats.totalSessions}
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            Study Sessions
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-amber-100">
          <div className="text-base md:text-lg font-bold text-amber-700 truncate">
            {stats.mostStudiedSubject}
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            Most Studied Subject
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-cyan-100">
          <div className="text-lg md:text-2xl font-bold text-cyan-700">
            {stats.efficiencyScore}%
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            Efficiency Score
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. MAIN APP ---
export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [studyModeOpen, setStudyModeOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const defaultSchoolSchedule = {
    startDate: "",
    endDate: "",
    weeklySchedule: {
      Monday: { start: "08:00", end: "15:00", hasSchool: true },
      Tuesday: { start: "08:00", end: "15:00", hasSchool: true },
      Wednesday: { start: "08:00", end: "15:00", hasSchool: true },
      Thursday: { start: "08:00", end: "15:00", hasSchool: true },
      Friday: { start: "08:00", end: "15:00", hasSchool: true },
      Saturday: { start: "09:00", end: "13:00", hasSchool: false },
      Sunday: { start: "09:00", end: "13:00", hasSchool: false },
    },
  };

  const [userData, setUserData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    dailyStart: "09:00",
    dailyEnd: "21:00",
    maxStudyHours: 4,
    chronotype: "afternoon",
    exams: [],
    blockedTimes: [],
    schoolSchedule: defaultSchoolSchedule,
  });

  useEffect(() => {
    const savedData = localStorage.getItem("zenithPlannerData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const normalizedData = {
          ...userData,
          ...data,
          schoolSchedule: data.schoolSchedule || defaultSchoolSchedule,
        };
        setUserData(normalizedData);
        if (data.plan) {
          setGeneratedPlan(data.plan);
          setStep(6);
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = { ...userData, plan: generatedPlan };
    const timer = setTimeout(() => {
      localStorage.setItem("zenithPlannerData", JSON.stringify(dataToSave));
    }, 1000);
    return () => clearTimeout(timer);
  }, [userData, generatedPlan]);

  useEffect(() => {
    if (generatedPlan) {
      const studySessions = generatedPlan.filter((s) => s.type === "study");
      const totalStudyMinutes = studySessions.reduce(
        (sum, s) => sum + s.duration,
        0
      );
      const daysWithStudy = [...new Set(studySessions.map((s) => s.date))]
        .length;

      setStats({
        totalHours: (totalStudyMinutes / 60).toFixed(1),
        daysWithStudy,
        totalSessions: studySessions.length,
      });
    }
  }, [generatedPlan]);

  const generateSchedule = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      try {
        const {
          exams,
          dailyStart,
          dailyEnd,
          maxStudyHours,
          blockedTimes,
          startDate,
          schoolSchedule,
        } = userData;

        const sessions = [];
        const userMaxMinutes = parseFloat(maxStudyHours) * 60;

        const start = new Date(startDate);
        const lastExamDate =
          exams.length > 0
            ? new Date(
                Math.max(...exams.map((e) => new Date(e.date).getTime()))
              )
            : new Date();
        const end = new Date(lastExamDate);
        end.setDate(end.getDate() + 1);

        let currentDate = new Date(start);
        let failSafe = 0;

        let consecutiveSessions = {};

        while (currentDate <= end && failSafe < 365) {
          failSafe++;
          const dateStr = currentDate.toISOString().split("T")[0];
          const dayName = currentDate.toLocaleDateString("en-US", {
            weekday: "long",
          });

          exams
            .filter((e) => e.date === dateStr)
            .forEach((e) => {
              sessions.push({
                id: generateId(),
                subject: e.subject,
                date: dateStr,
                startTime: "00:00",
                endTime: "23:59",
                description: `🎯 EXAM DAY: ${e.subject}. You got this!`,
                type: "exam",
                duration: 1440,
              });
            });

          const daySchedule = schoolSchedule?.weeklySchedule?.[dayName] || {
            start: "",
            end: "",
            hasSchool: false,
          };
          let availableStudyWindows = [];

          if (daySchedule.hasSchool && daySchedule.start && daySchedule.end) {
            if (daySchedule.start > dailyStart) {
              availableStudyWindows.push({
                start: dailyStart,
                end: daySchedule.start,
              });
            }
            if (daySchedule.end < dailyEnd) {
              availableStudyWindows.push({
                start: daySchedule.end,
                end: dailyEnd,
              });
            }
          } else {
            availableStudyWindows.push({
              start: dailyStart,
              end: dailyEnd,
            });
          }

          let dailyStudyMinutes = 0;
          let sessionsSinceLongBreak = 0;
          consecutiveSessions = {};

          for (const window of availableStudyWindows) {
            let currentTime = new Date(`${dateStr}T${window.start}`);
            const windowEnd = new Date(`${dateStr}T${window.end}`);

            while (
              currentTime < windowEnd &&
              dailyStudyMinutes < userMaxMinutes
            ) {
              const currentMinutes =
                currentTime.getHours() * 60 + currentTime.getMinutes();
              let isBlocked = false;
              let nextAvailableTime = new Date(currentTime);

              for (const block of blockedTimes) {
                const [sH, sM] = block.start.split(":").map(Number);
                const [eH, eM] = block.end.split(":").map(Number);
                const startBlock = sH * 60 + sM;
                const endBlock = eH * 60 + eM;

                if (
                  (block.day === "Everyday" || block.day === dayName) &&
                  currentMinutes >= startBlock &&
                  currentMinutes < endBlock
                ) {
                  isBlocked = true;
                  nextAvailableTime = new Date(currentTime);
                  nextAvailableTime.setHours(eH, eM);
                  break;
                }
              }

              if (isBlocked) {
                currentTime = nextAvailableTime;
                continue;
              }

              if (sessionsSinceLongBreak >= 3) {
                const breakEnd = new Date(currentTime);
                breakEnd.setMinutes(breakEnd.getMinutes() + 60);

                if (breakEnd >= windowEnd) break;

                sessions.push({
                  id: generateId(),
                  subject: "REST",
                  date: dateStr,
                  startTime: currentTime.toTimeString().substring(0, 5),
                  endTime: breakEnd.toTimeString().substring(0, 5),
                  description:
                    "Smart Long Break (60 min). Recharge your focus.",
                  type: "rest",
                  duration: 60,
                });

                currentTime = breakEnd;
                sessionsSinceLongBreak = 0;
                continue;
              }

              const activeExams = exams.filter(
                (e) => new Date(e.date) > currentDate
              );
              if (activeExams.length === 0) break;

              let bestExam = null;
              let highestScore = -1;

              activeExams.forEach((exam) => {
                const daysUntil = Math.max(
                  1,
                  Math.ceil(
                    (new Date(exam.date) - currentDate) / (1000 * 3600 * 24)
                  )
                );
                let score =
                  (Math.pow(Number(exam.difficulty), 2) *
                    Number(exam.priority)) /
                  (daysUntil + 0.1);

                if ((consecutiveSessions[exam.subject] || 0) >= 2) {
                  score *= 0.05;
                } else if ((consecutiveSessions[exam.subject] || 0) === 1) {
                  score *= 0.5;
                }

                if (
                  userData.chronotype === "morning" &&
                  currentTime.getHours() < 12
                ) {
                  score *= 1.3;
                } else if (
                  userData.chronotype === "night" &&
                  currentTime.getHours() >= 18
                ) {
                  score *= 1.3;
                }

                if (score > highestScore) {
                  highestScore = score;
                  bestExam = exam;
                }
              });

              if (bestExam) {
                const sessionDuration = 50;
                const shortBreakDuration = 10;
                const totalSlotDuration = sessionDuration + shortBreakDuration;

                const sessionEnd = new Date(currentTime);
                sessionEnd.setMinutes(
                  sessionEnd.getMinutes() + sessionDuration
                );

                if (
                  sessionEnd >= windowEnd ||
                  dailyStudyMinutes + sessionDuration > userMaxMinutes
                ) {
                  break;
                }

                sessions.push({
                  id: generateId(),
                  subject: bestExam.subject,
                  date: dateStr,
                  startTime: currentTime.toTimeString().substring(0, 5),
                  endTime: sessionEnd.toTimeString().substring(0, 5),
                  description: `Study session for ${bestExam.subject}`,
                  type: "study",
                  duration: sessionDuration,
                });

                dailyStudyMinutes += sessionDuration;
                sessionsSinceLongBreak++;

                Object.keys(consecutiveSessions).forEach((key) => {
                  if (key !== bestExam.subject) consecutiveSessions[key] = 0;
                });
                consecutiveSessions[bestExam.subject] =
                  (consecutiveSessions[bestExam.subject] || 0) + 1;

                currentTime.setMinutes(
                  currentTime.getMinutes() + totalSlotDuration
                );
              } else {
                currentTime.setMinutes(currentTime.getMinutes() + 30);
              }
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setGeneratedPlan(sessions);
        setLoading(false);
        setStep(6);
        setSelectedDay(new Date().toISOString().split("T")[0]);
      } catch (error) {
        console.error("Error generating schedule:", error);
        setLoading(false);
        alert(
          "Error generating schedule. Please check your inputs and try again."
        );
      }
    }, 1500);
  }, [userData]);

  const getTodaysPlan = useCallback(() => {
    if (!generatedPlan || !selectedDay) return [];
    let daysSessions = generatedPlan.filter((s) => s.date === selectedDay);

    daysSessions.sort((a, b) => {
      if (a.type === "exam" && b.type !== "exam") return -1;
      if (a.type !== "exam" && b.type === "exam") return 1;
      return a.startTime.localeCompare(b.startTime);
    });
    return daysSessions;
  }, [generatedPlan, selectedDay]);

  const todaysSessions = useMemo(() => getTodaysPlan(), [getTodaysPlan]);

  const generateICalendar = () => {
    if (!generatedPlan || generatedPlan.length === 0) {
      alert("No plan to export!");
      return;
    }

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//StudyAI Ultimate Planner//NONSGML v1.0//EN",
    ];

    generatedPlan.forEach((session) => {
      if (session.type !== "exam") {
        const startDateTime =
          session.date.replace(/-/g, "") +
          "T" +
          session.startTime.replace(/:/g, "") +
          "00";
        const endDateTime =
          session.date.replace(/-/g, "") +
          "T" +
          session.endTime.replace(/:/g, "") +
          "00";

        const summary =
          session.type === "study"
            ? `Study: ${session.subject}`
            : `BREAK: ${session.subject}`;
        const description = session.description;

        icsContent.push("BEGIN:VEVENT");
        icsContent.push(`UID:${session.id}@studyai-ultimate.netlify.app`);
        icsContent.push(
          `DTSTAMP:${new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .substring(0, 15)}Z`
        );
        icsContent.push(`DTSTART:${startDateTime}`);
        icsContent.push(`DTEND:${endDateTime}`);
        icsContent.push(`SUMMARY:${summary}`);
        icsContent.push(`DESCRIPTION:${description}`);
        icsContent.push("END:VEVENT");
      }
    });

    icsContent.push("END:VCALENDAR");
    const finalContent = icsContent.join("\n");

    const blob = new Blob([finalContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `StudyAI_Plan_${userData.name || "Study"}_${
      new Date().toISOString().split("T")[0]
    }.ics`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const data = {
      name: userData.name,
      totalHours: stats?.totalHours || "0",
      days: stats?.daysWithStudy || "0",
      date: new Date().toLocaleDateString(),
    };

    const text =
      `📚 My Study Plan with StudyAI Ultimate 📚\n\n` +
      `👤 Student: ${data.name}\n` +
      `⏱️ Total Study Hours: ${data.totalHours}h\n` +
      `📅 Active Days: ${data.days}\n` +
      `📆 Generated: ${data.date}\n\n` +
      `✨ Plan your studies at: [Your App URL Here]`;

    if (navigator.share) {
      navigator.share({
        title: "My StudyAI Plan",
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Study plan copied to clipboard! 📋");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 pb-12 md:pb-20">
      <style>{`
        body { margin: 0; background: #f8fafc; }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .accent-gradient-to-r { accent-color: #3b82f6; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        }
      `}</style>

      {studyModeOpen && (
        <StudyNowMode
          plan={generatedPlan}
          userName={userData.name}
          onClose={() => setStudyModeOpen(false)}
        />
      )}

      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-extrabold text-lg md:text-xl tracking-tight text-slate-900">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1 md:p-1.5 rounded-lg">
              <Brain size={18} className="md:w-5 md:h-5" />
            </div>
            StudyAI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 hidden sm:inline">
              Ultimate
            </span>
          </div>
          {step > 0 && step < 6 && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 w-4 md:w-6 rounded-full transition-all duration-500 ${
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

      <div className="flex flex-col items-center w-full">
        <main className="w-full max-w-7xl px-3 sm:px-4 md:px-6 py-4 md:py-8">
          {step === 0 && <IntroStep onStart={() => setStep(1)} />}
          {step === 1 && (
            <StepBasics
              data={userData}
              onChange={(f, v) => setUserData((p) => ({ ...p, [f]: v }))}
              onNext={() => setStep(2)}
              onBack={null}
            />
          )}
          {step === 2 && (
            <StepChronotype
              data={userData}
              onChange={(f, v) => setUserData((p) => ({ ...p, [f]: v }))}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepExams
              data={userData}
              updateExams={(v) => setUserData((p) => ({ ...p, exams: v }))}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepBlocked
              data={userData}
              updateBlocked={(v) =>
                setUserData((p) => ({ ...p, blockedTimes: v }))
              }
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <StepSchoolSchedule
              data={userData}
              onChange={(f, v) => setUserData((p) => ({ ...p, [f]: v }))}
              onNext={generateSchedule}
              onBack={() => setStep(4)}
              isLast={true}
              nextLabel={loading ? "Generating..." : "Generate Plan"}
            />
          )}

          {step === 6 && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3 md:gap-0">
                <div className="w-full">
                  <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-1 md:mb-2">
                    Plan{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                      Generated
                    </span>{" "}
                    Successfully!
                  </h1>
                  <p className="text-base md:text-xl text-slate-500">
                    Here is your intelligent study schedule, {userData.name}.
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={handleShare}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  >
                    <Share2 size={16} className="md:w-5 md:h-5" /> Share
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  >
                    <Printer size={16} className="md:w-5 md:h-5" /> Print
                  </button>
                </div>
              </div>

              <RealTimeStatus
                generatedPlan={generatedPlan}
                userName={userData.name}
                onStartStudy={() => setStudyModeOpen(true)}
                stats={stats}
              />

              <StatsPanel generatedPlan={generatedPlan} userData={userData} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8">
                <CalendarView
                  viewDate={viewDate}
                  setViewDate={setViewDate}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  generatedPlan={generatedPlan}
                  userData={userData}
                />
                <DailyPlanView day={selectedDay} sessions={todaysSessions} />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-6 md:mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 text-rose-600 font-bold rounded-lg md:rounded-xl hover:shadow-lg transition flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                >
                  <RotateCcw size={16} className="md:w-5 md:h-5" /> Restart
                  Planning
                </button>
                <button
                  onClick={generateICalendar}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-600 font-bold rounded-lg md:rounded-xl hover:shadow-lg transition flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                >
                  <Download size={16} className="md:w-5 md:h-5" /> Export to
                  Calendar
                </button>
                <button
                  onClick={() => setStudyModeOpen(true)}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                >
                  <Play size={16} className="md:w-5 md:h-5" /> Start Focus
                  Session
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="w-full max-w-7xl mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 text-center text-slate-500 text-xs md:text-sm px-3 sm:px-4 md:px-6">
          <p>
            StudyAI Ultimate Pro Edition • Intelligent Study Planning System
          </p>
          <p className="mt-1 md:mt-2">
            Designed with ❤️ for students worldwide
          </p>
        </footer>
      </div>
    </div>
  );
}
