import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LongTodoJ } from "@/state/state";

import { motion, AnimatePresence } from "framer-motion";
import { SquarePen, Trash2, Check, X } from "lucide-react";
import useLongPress from "@/hooks/useLongpress";
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
  const [deadlineWidth, setDeadlineWidth] = useState(60);
  const [mileShow, setMileShow] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(long.LongTodoName);

  const getBackgroundColor = () => {
    switch (long.tag) {
      case "impUrg":
        return "bg-red-400";
      case "nonImpUrg":
        return "bg-orange-400";
      case "impNonUrg":
        return "bg-yellow-500";
      case "NonImpNonUrg":
        return "bg-green-600";
      case "Timeless":
        return "hidden"  
      default:
        return "bg-black";
    }
  };

  useEffect(() => {
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

  const handleToggle = () => {
    if (isEditing) return;
    onToggleComplete(long.id);
  };

  const handleLongPress = () => {
    setShowAction((prev) => !prev);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const longPressRef = useLongPress<HTMLDivElement>(handleLongPress, handleToggle);

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
  



  function daysLeft(targetDate: Date) {
  const currentDate: any = new Date() 
    const target: any = new Date(targetDate); // Target date
  
    // Calculate the difference in milliseconds
    const differenceInMs = target - currentDate;
  
    // Convert milliseconds to days
    const daysLeft = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
  
    return daysLeft >= 0 ? daysLeft : 0; // Return 0 if the date has passed
  }
  

  // console.log(long);
  

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      ref={longPressRef}
      className={`group relative my-3 rounded-xl transition-all duration-300 border border-white/5 overflow-hidden select-none cursor-pointer ${
        long.completed 
          ? "opacity-60 grayscale-[0.5] bg-white/5" 
          : "bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/10"
      }`}
    >
      <div className="relative w-full">
        {/* Progress Background */}
        <div
          style={{ width: `${deadlineWidth}%` }}
          className="h-full absolute top-0 left-0 bg-primary/10 transition-all duration-1000 ease-out pointer-events-none"
        />

        <div className="relative z-10 p-3.5 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
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
                  className="flex-1 bg-white/10 text-sm px-2 py-1 rounded-lg outline-none border border-white/10 focus:border-primary/50"
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={(e) => { e.stopPropagation(); confirmEdit(); }} className="p-1.5 rounded-lg bg-primary/20 text-primary">
                  <Check size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="p-1.5 rounded-lg bg-white/5 text-white/40">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold truncate ${long.completed ? "line-through text-white/30" : "text-white/90"}`}>
                    {long.LongTodoName}
                  </h4>
                  <div className={`w-2 h-2 rounded-full ${getBackgroundColor()}`} />
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                     {deadlineWidth < 90 ? `${daysLeft(long.deadline)} days left` : "Deadline near"}
                   </span>
                   {long.tag && (
                     <span className="text-[10px] font-medium text-primary/40 px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                       {long.tag}
                     </span>
                   )}
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
             <div className="flex items-center gap-2 shrink-0">
                <AnimatePresence>
                  {showAction ? (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/10"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(); }}
                        className="p-1.5 rounded-md hover:bg-white/10 text-white/70 transition-colors"
                      >
                        <SquarePen size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <Link
                      to={`/LongProjects/${containerId}/task/${long.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors group/link"
                    >
                      <Check className="text-white/10 group-hover/link:text-primary transition-colors" size={18} />
                    </Link>
                  )}
                </AnimatePresence>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LongTaskUi;
