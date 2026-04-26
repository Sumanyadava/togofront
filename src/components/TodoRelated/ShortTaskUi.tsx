import {
  EyeOff,
  SquarePen,
  Trash2,
  Check,
  X,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import useLongPress from "@/hooks/useLongpress";
import { motion, AnimatePresence } from "framer-motion";

interface ShortTaskUiProps {
  isChecked: boolean;
  task_name: string;
  isEditable: boolean;
  taskId: number;
  onDelete: (taskId: number) => void;
  onToggleHide: (taskId: number) => void;
  onRename: (taskId: number, newName: string) => void;
  onToggleComplete: (taskId: number) => void;
  isHidden?: boolean;
}

const ShortTaskUi: React.FC<ShortTaskUiProps> = ({
  isChecked,
  task_name,
  isEditable,
  taskId,
  onDelete,
  onToggleHide,
  onRename,
  onToggleComplete,
  isHidden = false,
}) => {
  const [shortChecked, setShortChecked] = useState(isChecked);
  const [showAction, setShowAction] = useState(isEditable);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task_name);

  const handleShortClick = () => {
    if (isEditing) return; // Don't toggle while editing
    setShortChecked((prev) => !prev);
    onToggleComplete(taskId);
    toast.success(shortChecked ? "Task marked incomplete" : "Task completed!", {
      icon: shortChecked ? "↩️" : "✅",
      style: {
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
      }
    });
  };

  const handleLongPress = () => {
    setShowAction((prev) => !prev);
    if (!showAction) {
      // Haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  const longPressRef = useLongPress<HTMLDivElement>(handleLongPress, handleShortClick);

  // ── Edit handlers ──────────────────────────────────────────────
  const startEdit = () => {
    setEditText(task_name);
    setIsEditing(true);
    setShowAction(false);
  };

  const confirmEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task_name) {
      onRename(taskId, trimmed);
      toast.success("Task renamed!");
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditText(task_name);
    setIsEditing(false);
  };

  // ── Delete handler ─────────────────────────────────────────────
  const handleDelete = () => {
    onDelete(taskId);
    toast.error("Task deleted", { 
      duration: 2000,
      style: {
        background: "rgba(239, 68, 68, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        color: "#fca5a5"
      }
    });
  };

  // ── Hide handler ───────────────────────────────────────────────
  const handleHide = () => {
    onToggleHide(taskId);
    toast.info(isHidden ? "Task shown" : "Task hidden");
  };

  if (isHidden) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      ref={longPressRef}
      className={`group relative p-3 rounded-xl flex justify-between items-center my-2 transition-all duration-300 border border-transparent select-none cursor-pointer ${
        shortChecked 
          ? "bg-white/5 opacity-60 grayscale-[0.5]" 
          : "bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/10 active:scale-[0.98]"
      }`}
    >
      <div className="flex items-center w-full gap-3">
        <Checkbox
          checked={shortChecked}
          className={`h-5 w-5 shrink-0 transition-all duration-300 ${
            shortChecked ? "border-primary bg-primary" : "border-white/20"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleShortClick();
          }}
        />

        {isEditing ? (
          /* ── Inline edit input ── */
          <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in duration-200">
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="flex-1 bg-white/10 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); confirmEdit(); }} 
                className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); cancelEdit(); }} 
                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`ml-1 text-sm flex-1 font-medium transition-all duration-300 ${
              shortChecked ? "line-through text-white/30" : "text-white/90"
            }`}
          >
            {task_name}
          </p>
        )}
      </div>

      {/* ── Action buttons (shown on long-press) ── */}
      <AnimatePresence>
        {showAction && !isEditing && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="flex items-center gap-1.5 shrink-0 ml-2 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); startEdit(); }}
              title="Rename"
              className="p-2 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-all transform active:scale-90"
            >
              <SquarePen size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleHide(); }}
              title="Hide"
              className="p-2 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-all transform active:scale-90"
            >
              <EyeOff size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              title="Delete"
              className="p-2 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all transform active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ShortTaskUi;
