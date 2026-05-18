import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { challengesAtom, Challenge } from "@/state/state";
import { db, auth } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { format, differenceInDays, addDays, isSameDay, isBefore, startOfDay } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Flame,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Target,
  Trophy,
  History,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ChallengePage = () => {
  const [challenges, setChallenges] = useAtom(challengesAtom);
  const [isCreating, setIsCreating] = useState(false);

  // New challenge form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDuration, setNewDuration] = useState(30);

  const activeChallenge = challenges.find((c) => c.status === "active");
  const pastChallenges = challenges.filter((c) => c.status !== "active");

  const handleCreate = async () => {
    if (!newTitle.trim()) return toast.error("Title is required");
    
    const userId = auth.currentUser?.uid;
    if (!userId) return toast.error("Not authenticated");

    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: newDesc,
      startDate: new Date(),
      durationDays: newDuration,
      completedDates: [],
      status: "active",
    };

    try {
      await setDoc(doc(db, `users/${userId}/challenges`, newChallenge.id), newChallenge);
      setChallenges((prev) => [...prev, newChallenge]);
      setIsCreating(false);
      setNewTitle("");
      setNewDesc("");
      setNewDuration(30);
      toast.success("Challenge Started!");
    } catch (e) {
      toast.error("Failed to start challenge");
    }
  };

  const checkInToday = async () => {
    if (!activeChallenge) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (activeChallenge.completedDates.includes(todayStr)) {
      return toast.info("Already checked in today!");
    }

    const updated = {
      ...activeChallenge,
      completedDates: [...activeChallenge.completedDates, todayStr]
    };

    // Check if challenge is completed
    const start = startOfDay(activeChallenge.startDate);
    const end = addDays(start, activeChallenge.durationDays - 1);
    if (isBefore(end, new Date()) || isSameDay(end, new Date())) {
      if (updated.completedDates.length === activeChallenge.durationDays) {
         updated.status = "completed";
         toast.success("CHALLENGE COMPLETED! INCREDIBLE!");
      }
    }

    try {
      await setDoc(doc(db, `users/${userId}/challenges`, updated.id), updated);
      setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c));
      if (updated.status !== "completed") toast.success("Checked in for today! Keep it up!");
    } catch(e) {
      toast.error("Failed to check in");
    }
  };

  const markFailed = async () => {
    if (!activeChallenge) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const updated = { ...activeChallenge, status: "failed" as const };
    try {
      await setDoc(doc(db, `users/${userId}/challenges`, updated.id), updated);
      setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.error("Challenge marked as failed. Don't give up next time!");
    } catch(e) {
      toast.error("Failed to update challenge");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white p-6 md:p-12 overflow-x-hidden relative">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl">
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            Challenges
          </h1>
        </div>
        {!activeChallenge && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-white text-black font-bold tracking-widest uppercase rounded-xl hover:bg-white/90 px-6 py-5 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <Plus className="mr-2 h-5 w-5" /> New Challenge
          </Button>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Active Challenge Section */}
        {activeChallenge ? (
          <div className="space-y-4">
            <ActiveChallengeCard challenge={activeChallenge} onCheckIn={checkInToday} />
            <div className="flex justify-end">
              <button 
                onClick={markFailed}
                className="text-white/20 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                <XCircle size={14} /> Forfeit Challenge
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center backdrop-blur-sm">
            <Flame className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Active Challenge</h2>
            <p className="text-white/40 mb-6 max-w-md mx-auto">Push your limits. Start a new habit building or goal oriented challenge today.</p>
            <Button onClick={() => setIsCreating(true)} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl">
              Start Your Journey
            </Button>
          </div>
        )}

        {/* Past Challenges */}
        {pastChallenges.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white/50 uppercase tracking-widest font-bold text-sm">
              <History size={16} /> Past Challenges
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastChallenges.map((c) => (
                <PastChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
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
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Create Challenge</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Challenge Title</label>
                  <input 
                    value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. 75 Hard, 30 Days of Code"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Description</label>
                  <textarea 
                    value={newDesc} onChange={e => setNewDesc(e.target.value)}
                    placeholder="What are the rules?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 block">Duration (Days)</label>
                  <div className="flex flex-wrap gap-3">
                    {[7, 21, 30, 75, 100].map(d => (
                      <button 
                        key={d}
                        onClick={() => setNewDuration(d)}
                        className={cn("flex-1 py-2 px-4 rounded-lg border text-sm font-bold transition-all min-w-[60px]", 
                          newDuration === d ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreate}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-6 rounded-xl shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-transform mt-4"
                >
                  Initiate Challenge
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

const ActiveChallengeCard = ({ challenge, onCheckIn }: { challenge: Challenge, onCheckIn: () => void }) => {
  const start = startOfDay(challenge.startDate);
  const now = new Date();
  const currentDayIndex = differenceInDays(now, start);
  const todayStr = format(now, "yyyy-MM-dd");
  const isCheckedInToday = challenge.completedDates.includes(todayStr);

  const progressPct = Math.round((challenge.completedDates.length / challenge.durationDays) * 100);

  // Generate grid cells
  const cells = useMemo(() => {
    return Array.from({ length: challenge.durationDays }).map((_, i) => {
      const cellDate = addDays(start, i);
      const cellDateStr = format(cellDate, "yyyy-MM-dd");
      const isCompleted = challenge.completedDates.includes(cellDateStr);
      const isPast = isBefore(cellDate, startOfDay(now));
      const isToday = isSameDay(cellDate, now);

      let status: "completed" | "missed" | "future" | "today" = "future";
      if (isCompleted) status = "completed";
      else if (isPast) status = "missed";
      else if (isToday) status = "today";

      return { index: i + 1, status, date: cellDateStr };
    });
  }, [challenge, start, now]);

  return (
    <div className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Info */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3 text-primary uppercase tracking-widest font-black text-xs">
            <Flame size={16} /> Active Challenge
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-tight">{challenge.title}</h2>
            <p className="text-white/50 text-lg leading-relaxed">{challenge.description || "Stay disciplined. Every day counts."}</p>
          </div>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Progress</span>
              <span className="text-2xl font-black">{challenge.completedDates.length} <span className="text-white/20">/ {challenge.durationDays}</span></span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Current Day</span>
              <span className="text-2xl font-black">Day {Math.min(currentDayIndex + 1, challenge.durationDays)}</span>
            </div>
          </div>

          <div className="pt-6">
            <Button 
              onClick={onCheckIn}
              disabled={isCheckedInToday}
              className={cn(
                "w-full md:w-auto px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all",
                isCheckedInToday 
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              )}
            >
              {isCheckedInToday ? <><CheckCircle2 className="mr-2" /> Completed Today</> : "Check In Today"}
            </Button>
          </div>
        </div>

        {/* Right Grid */}
        <div className="flex-1 flex flex-col justify-center">
           <div className="bg-black/40 border border-white/5 rounded-3xl p-6 shadow-inner">
             <div className="flex justify-between items-center mb-6">
               <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Journey Timeline</span>
               <span className="text-xs font-bold text-white/40">{progressPct}%</span>
             </div>
             
             <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 md:gap-3">
               {cells.map((cell) => (
                 <div
                   key={cell.index}
                   title={`Day ${cell.index} - ${cell.date}`}
                   className={cn(
                     "aspect-square rounded-md md:rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                     cell.status === "completed" && "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105",
                     cell.status === "missed" && "bg-red-500/20 text-red-500/50 border border-red-500/20",
                     cell.status === "today" && !isCheckedInToday && "bg-white/20 text-white border border-white/40 animate-pulse",
                     cell.status === "future" && "bg-white/5 text-white/10"
                   )}
                 >
                   {cell.status === "completed" ? <CheckCircle2 size={12} /> : cell.status === "missed" ? <XCircle size={12} /> : cell.index}
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const PastChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const [, setChallenges] = useAtom(challengesAtom);
  const isSuccess = challenge.status === "completed";
  const pct = Math.round((challenge.completedDates.length / challenge.durationDays) * 100);

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/challenges`, challenge.id));
      setChallenges((prev) => prev.filter(c => c.id !== challenge.id));
      toast.success("Record deleted");
    } catch(e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-colors relative group">
      <button 
        onClick={handleDelete}
        className="absolute top-4 right-4 text-white/0 group-hover:text-white/30 hover:!text-red-500 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-xl", isSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
          {isSuccess ? <Trophy size={20} /> : <XCircle size={20} />}
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight truncate pr-6">{challenge.title}</h3>
          <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{isSuccess ? "Completed" : "Failed"}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-white/60 mb-2">
        <span>Completion</span>
        <span className="font-bold">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", isSuccess ? "bg-green-500" : "bg-red-500")} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-white/40">
        <span className="flex items-center gap-1"><CalendarDays size={12} /> {challenge.durationDays} Days</span>
        <span className="flex items-center gap-1"><Target size={12} /> {challenge.completedDates.length} Hits</span>
      </div>
    </div>
  );
};

export default ChallengePage;
