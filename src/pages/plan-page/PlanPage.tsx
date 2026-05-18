import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { plansAtom, PlanItem, PlanTimeframe } from "@/state/state";
import { db, auth } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIMEFRAMES: { id: PlanTimeframe; label: string; color: string; bgGlow: string }[] = [
  { id: "day", label: "Today", color: "text-green-400", bgGlow: "bg-green-500/10" },
  { id: "week", label: "This Week", color: "text-blue-400", bgGlow: "bg-blue-500/10" },
  { id: "month", label: "This Month", color: "text-purple-400", bgGlow: "bg-purple-500/10" },
  { id: "6_months", label: "6 Months", color: "text-pink-400", bgGlow: "bg-pink-500/10" },
  { id: "1_year", label: "1 Year", color: "text-orange-400", bgGlow: "bg-orange-500/10" },
  { id: "5_years", label: "5 Years", color: "text-red-400", bgGlow: "bg-red-500/10" },
];

const PlanPage = () => {
  const [plans, setPlans] = useAtom(plansAtom);
  const [activeTab, setActiveTab] = useState<PlanTimeframe>("day");
  
  // Adding state
  const [isAdding, setIsAdding] = useState<PlanTimeframe | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = async (timeframe: PlanTimeframe) => {
    if (!newTitle.trim()) {
      setIsAdding(null);
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) return toast.error("Not authenticated");

    const newPlan: PlanItem = {
      id: crypto.randomUUID(),
      title: newTitle,
      timeframe,
      completed: false,
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, `users/${userId}/plans`, newPlan.id), newPlan);
      setPlans((prev) => [...prev, newPlan]);
      setNewTitle("");
      setIsAdding(null);
      toast.success("Added to your plan!");
    } catch (e) {
      toast.error("Failed to add plan");
    }
  };

  const toggleComplete = async (plan: PlanItem) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const updated = { ...plan, completed: !plan.completed };
    try {
      await setDoc(doc(db, `users/${userId}/plans`, plan.id), updated);
      setPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
      if (updated.completed) toast.success("Step complete. Great progress!");
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const deletePlan = async (plan: PlanItem) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      await deleteDoc(doc(db, `users/${userId}/plans`, plan.id));
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      toast.success("Removed from plan");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white p-6 md:p-12 overflow-hidden flex flex-col relative">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl">
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Vision Plan
            </h1>
          </div>
        </div>
      </div>

      {/* Mobile Tabs (visible only on small screens) */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar relative z-10 flex-shrink-0">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setActiveTab(tf.id)}
            className={cn(
              "px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
              activeTab === tf.id 
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                : "bg-white/5 text-white/50 border border-white/10"
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Board Layout (horizontal scroll on desktop, single column on mobile) */}
      <div className="flex-1 overflow-x-auto hide-scrollbar relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:h-full items-start md:pb-8">
          
          {TIMEFRAMES.map((tf) => {
            const columnPlans = plans.filter(p => p.timeframe === tf.id);
            const isVisibleOnMobile = activeTab === tf.id;

            return (
              <div 
                key={tf.id} 
                className={cn(
                  "w-full md:w-[320px] lg:w-[360px] flex-shrink-0 flex flex-col max-h-full",
                  !isVisibleOnMobile && "hidden md:flex"
                )}
              >
                <div className={cn("p-4 rounded-t-2xl border-b border-white/10 bg-white/[0.02] flex justify-between items-center", tf.bgGlow)}>
                  <h2 className={cn("font-black tracking-widest uppercase text-sm", tf.color)}>
                    {tf.label}
                  </h2>
                  <div className="bg-black/40 px-2 py-0.5 rounded-md text-xs font-bold text-white/50">
                    {columnPlans.length}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white/[0.01] border border-t-0 border-white/5 rounded-b-2xl p-4 space-y-3 custom-scrollbar">
                  <AnimatePresence>
                    {columnPlans.map(plan => (
                      <motion.div
                        key={plan.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "group relative bg-white/[0.04] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-all",
                          plan.completed && "opacity-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => toggleComplete(plan)}
                            className="mt-0.5 flex-shrink-0 text-white/30 hover:text-white transition-colors"
                          >
                            {plan.completed ? <CheckCircle2 className="text-green-500" size={18} /> : <Circle size={18} />}
                          </button>
                          <div className="flex-1">
                            <p className={cn("text-sm font-medium leading-snug", plan.completed && "line-through text-white/40")}>
                              {plan.title}
                            </p>
                          </div>
                          <button 
                            onClick={() => deletePlan(plan)}
                            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Input */}
                  {isAdding === tf.id ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAdd(tf.id);
                          if (e.key === 'Escape') setIsAdding(null);
                        }}
                        onBlur={() => handleAdd(tf.id)}
                        placeholder="What's the goal?"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 shadow-inner"
                      />
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => { setIsAdding(tf.id); setNewTitle(""); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:bg-white/5 hover:border-white/20 transition-all text-sm font-bold uppercase tracking-widest mt-2"
                    >
                      <Plus size={16} /> Add Goal
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};

export default PlanPage;
