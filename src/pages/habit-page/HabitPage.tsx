import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { habitsAtom, Habit } from "@/state/state";
import { db, auth } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Activity,
  Heart,
  Book,
  Dumbbell,
  Coffee,
  Droplet,
  Moon,
  Sun,
  Flame,
  Target,
  Check,
  X,
  MoreVertical,
  Trash2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Activity, Heart, Book, Dumbbell, Coffee, Droplet, Moon, Sun, Flame, Target
};

const COLOR_PRESETS = [
  "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-red-500", 
  "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-teal-500"
];

const HabitPage = () => {
  const [habits, setHabits] = useAtom(habitsAtom);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);
  const [newIcon, setNewIcon] = useState("Activity");

  const handleCreate = async () => {
    if (!newTitle.trim()) return toast.error("Title is required");
    const userId = auth.currentUser?.uid;
    if (!userId) return toast.error("Not authenticated");

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: newDesc,
      frequency: "daily",
      completedDates: [],
      color: newColor,
      icon: newIcon,
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, `users/${userId}/habits`, newHabit.id), newHabit);
      setHabits((prev) => [...prev, newHabit]);
      setIsCreating(false);
      setNewTitle("");
      setNewDesc("");
      toast.success("Habit Created!");
    } catch (e) {
      toast.error("Failed to create habit");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white p-6 md:p-12 overflow-x-hidden relative">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl">
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            Habits
          </h1>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-white text-black font-bold tracking-widest uppercase rounded-xl hover:bg-white/90 px-6 py-5 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
        >
          <Plus className="mr-2 h-5 w-5" /> New Habit
        </Button>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {habits.length === 0 ? (
          <div className="w-full rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center backdrop-blur-sm mt-20">
            <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Habits Yet</h2>
            <p className="text-white/40 mb-6 max-w-md mx-auto">Build consistency and transform your daily routine. Start tracking a new habit today.</p>
            <Button onClick={() => setIsCreating(true)} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl">
              Create First Habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative"
            >
              <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-white/40 hover:text-white">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Create Habit</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Habit Name</label>
                  <input 
                    value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Morning Run, Read 10 Pages"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Description (Optional)</label>
                  <input 
                    value={newDesc} onChange={e => setNewDesc(e.target.value)}
                    placeholder="Why are you doing this?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(ICON_MAP).map(key => {
                      const IconComp = ICON_MAP[key];
                      return (
                        <button
                          key={key} onClick={() => setNewIcon(key)}
                          className={cn("p-3 rounded-xl border transition-all", newIcon === key ? "bg-white/20 border-white" : "bg-white/5 border-white/10 hover:bg-white/10")}
                        >
                          <IconComp size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map(c => (
                      <button
                        key={c} onClick={() => setNewColor(c)}
                        className={cn("w-10 h-10 rounded-full transition-all border-2", c, newColor === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100")}
                      />
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreate}
                  className="w-full bg-teal-500 text-white font-black uppercase tracking-widest py-6 rounded-xl shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:bg-teal-400 hover:scale-[1.02] transition-all mt-4"
                >
                  Start Habit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HabitCard = ({ habit }: { habit: Habit }) => {
  const [, setHabits] = useAtom(habitsAtom);
  const [showOptions, setShowOptions] = useState(false);
  const IconComp = ICON_MAP[habit.icon] || Activity;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isCompletedToday = habit.completedDates.includes(todayStr);

  const toggleToday = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    let newDates = [...habit.completedDates];
    if (isCompletedToday) {
      newDates = newDates.filter(d => d !== todayStr);
    } else {
      newDates.push(todayStr);
    }

    const updated = { ...habit, completedDates: newDates };

    try {
      await setDoc(doc(db, `users/${userId}/habits`, habit.id), updated);
      setHabits(prev => prev.map(h => h.id === habit.id ? updated : h));
      if (!isCompletedToday) {
        toast.success(`Nailed it! ${habit.title} completed for today.`);
      }
    } catch (e) {
      toast.error("Failed to update habit");
    }
  };

  const deleteHabit = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/habits`, habit.id));
      setHabits(prev => prev.filter(h => h.id !== habit.id));
      toast.success("Habit deleted");
    } catch (e) {
      toast.error("Failed to delete habit");
    }
  };

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0;
    let currDate = new Date();
    // If not completed today, start checking from yesterday
    if (!isCompletedToday) {
      currDate = subDays(currDate, 1);
    }
    
    while (true) {
      const dStr = format(currDate, "yyyy-MM-dd");
      if (habit.completedDates.includes(dStr)) {
        count++;
        currDate = subDays(currDate, 1);
      } else {
        break;
      }
    }
    return count;
  }, [habit.completedDates, isCompletedToday]);

  // Last 7 days heat map
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i); // 6 days ago to today
      const dStr = format(d, "yyyy-MM-dd");
      const done = habit.completedDates.includes(dStr);
      return { date: d, done, isToday: i === 6 };
    });
  }, [habit.completedDates]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative bg-white/[0.03] border rounded-[2rem] p-6 backdrop-blur-md transition-all duration-300 group",
        isCompletedToday ? "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]" : "border-white/5 hover:border-white/10"
      )}
    >
      {/* Options Menu */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <MoreVertical size={16} />
        </button>
        <AnimatePresence>
          {showOptions && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[120px]"
            >
              <button 
                onClick={deleteHabit}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-white/5 text-sm font-bold transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className={cn("p-4 rounded-2xl flex-shrink-0 text-white shadow-lg", habit.color)}>
          <IconComp size={24} />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="text-xl font-bold leading-tight mb-1">{habit.title}</h3>
          {habit.description && <p className="text-sm text-white/40 line-clamp-1">{habit.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className={cn("w-5 h-5", streak > 0 ? "text-yellow-500 fill-yellow-500" : "text-white/20")} />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Streak</span>
            <span className="font-black text-lg leading-none">{streak} <span className="text-white/30 text-sm font-medium">Days</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total</span>
            <span className="font-black text-lg leading-none">{habit.completedDates.length}</span>
          </div>
        </div>
      </div>

      {/* Week Tracker Grid */}
      <div className="bg-black/40 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Last 7 Days</span>
        </div>
        <div className="flex justify-between gap-1">
          {last7Days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className={cn("text-[9px] font-bold uppercase", day.isToday ? "text-white" : "text-white/30")}>
                {format(day.date, "E").charAt(0)}
              </span>
              <div 
                className={cn(
                  "w-full aspect-square rounded-md transition-all duration-500 flex items-center justify-center",
                  day.done ? habit.color : "bg-white/5",
                  day.isToday && !day.done && "border border-white/20"
                )}
              >
                {day.done && <Check size={10} className="text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={toggleToday}
        className={cn(
          "w-full py-6 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300",
          isCompletedToday 
            ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
            : cn("text-white hover:scale-[1.02] shadow-lg", habit.color)
        )}
      >
        {isCompletedToday ? "Completed" : "Mark as Done"}
      </Button>

    </motion.div>
  );
};

export default HabitPage;
