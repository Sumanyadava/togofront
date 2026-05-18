import { LongTodoJ } from "@/state/state";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useLongPress from "@/hooks/useLongpress";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, SquarePen, Target, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface LongTaskUiProps {
  long: LongTodoJ;
  containerId: number;
  onDelete: (taskId: number) => void;
  onRename: (taskId: number, newName: string) => void;
  onToggleComplete: (taskId: number) => void;
}

const LongTaskUi: React.FC<LongTaskUiProps> = ({ 
  long, 
  containerId, 
  onDelete, 
  onRename, 
  onToggleComplete 
}) => {
  const navigate = useNavigate();
  const [deadlineWidth, setDeadlineWidth] = useState(60);
  const [showAction, setShowAction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(long.LongTodoName);

  const getBackgroundColor = () => {
    switch (long.tag) {
      case "impUrg": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
      case "nonImpUrg": return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
      case "impNonUrg": return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
      case "NonImpNonUrg": return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
      case "Timeless": return "hidden";
      default: return "bg-white/20";
    }
  };

  useEffect(() => {
    if (!long.createedAt || !long.deadline) return;
    const createdDate = new Date(long.createedAt).getTime();
    const deadlineDate = new Date(long.deadline).getTime();
    const currentTime = new Date().getTime();
  
    const totalDuration = deadlineDate - createdDate;
    const elapsedTime = currentTime - createdDate;
  
    if (totalDuration > 0) {
      let percentagePassed = (elapsedTime / totalDuration) * 100;
      percentagePassed = Math.min(Math.max(percentagePassed, 0), 100);
      setDeadlineWidth(Math.round(percentagePassed));
    }
  }, [long.createedAt, long.deadline]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigating
    onToggleComplete(long.id);
  };

  const handleCardClick = () => {
    if (isEditing) return;
    if (showAction) {
      setShowAction(false);
    } else {
      navigate(`/LongProjects/${containerId}/task/${long.id}`);
    }
  };

  const handleLongPress = () => {
    setShowAction(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const longPressRef = useLongPress<HTMLDivElement>(handleLongPress, handleCardClick);

  const startEdit = () => {
    setEditText(long.LongTodoName);
    setIsEditing(true);
    setShowAction(false);
  };

  const confirmEdit = () => {
    if (editText.trim() && editText.trim() !== long.LongTodoName) {
      onRename(long.id, editText.trim());
      toast.success("Goal renamed");
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(long.id);
    toast.error("Goal removed");
  };

  function daysLeft(targetDate: Date | null | undefined) {
    if (!targetDate) return 0;
    const currentDate = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const differenceInMs = target - currentDate;
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      ref={longPressRef}
      className={`group relative my-3 rounded-2xl transition-all duration-300 border overflow-hidden select-none cursor-pointer ${
        long.completed 
          ? "border-white/5 bg-white/[0.02] opacity-70 grayscale-[0.3]" 
          : "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] hover:border-primary/30 hover:bg-white/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
      }`}
    >
      {/* Dynamic Progress Background */}
      {!long.completed && long.deadline && (
        <div
          style={{ width: `${deadlineWidth}%` }}
          className="h-full absolute top-0 left-0 bg-gradient-to-r from-primary/5 to-primary/10 transition-all duration-1000 ease-out pointer-events-none"
        />
      )}

      <div className="relative z-10 p-4 flex items-center gap-4">
        {/* Checkbox Toggle */}
        <button 
          onClick={handleToggle}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            long.completed 
              ? "border-primary bg-primary text-black" 
              : "border-white/20 text-transparent hover:border-primary/50 hover:bg-primary/10"
          }`}
        >
          <Check size={14} className={long.completed ? "opacity-100" : "opacity-0"} strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {isEditing ? (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="flex-1 bg-black/40 text-sm px-3 py-1.5 rounded-lg outline-none border border-primary/50 focus:ring-1 focus:ring-primary shadow-inner text-white"
                onClick={(e) => e.stopPropagation()}
              />
              <button onClick={(e) => { e.stopPropagation(); confirmEdit(); }} className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                <Check size={16} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium truncate transition-colors duration-300 ${
                  long.completed ? "line-through text-white/40" : "text-white/90 group-hover:text-white"
                }`}>
                  {long.LongTodoName}
                </h4>
                <div className={`w-1.5 h-1.5 rounded-full ${getBackgroundColor()}`} />
              </div>
              
              <div className="flex items-center gap-2.5">
                 {long.deadline && (
                   <div className="flex items-center gap-1 text-[10px] font-medium text-white/40 bg-black/20 px-1.5 py-0.5 rounded-md border border-white/5">
                     <Target size={10} className={deadlineWidth > 80 ? "text-red-400" : "text-primary/60"} />
                     <span className={deadlineWidth > 80 ? "text-red-400/80" : ""}>
                       {daysLeft(long.deadline)} days left
                     </span>
                   </div>
                 )}
               
              </div>
            </div>
          )}
        </div>

        {/* Action / Arrow */}
        {!isEditing && (
          <div className="flex items-center gap-2 shrink-0">
             <AnimatePresence mode="wait">
               {showAction ? (
                 <motion.div 
                   key="actions"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="flex items-center gap-1 bg-black/60 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-lg"
                 >
                   <button
                     onClick={(e) => { e.stopPropagation(); startEdit(); }}
                     className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all"
                   >
                     <SquarePen size={14} />
                   </button>
                   <button
                     onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                     className="p-2 rounded-lg hover:bg-red-500/20 text-red-400/80 hover:text-red-400 transition-all"
                   >
                     <Trash2 size={14} />
                   </button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="arrow"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="p-1.5 text-white/20 group-hover:text-primary transition-colors duration-300"
                 >
                   <ChevronRight size={18} className={long.completed ? "opacity-0" : ""} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LongTaskUi;
