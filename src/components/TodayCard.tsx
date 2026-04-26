import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "./ui/button";
import { Settings, X, Plus, Trash2, CheckCircle2, Circle, Clock, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import HoursLeftInDay from "@/helper/timeRelated/HoursLeftInDay";
import { useAtom } from "jotai";
import { dailyTodoContainerAtom, DailyTodo } from "@/state";
import { toast } from "sonner";
import { timeLeftInTodayAtom } from "@/stateHelper";
import { Input } from "./ui/input";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 300, staggerChildren: 0.1 }
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
};

// --- Sub-components ---

const ProgressCircle: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ 
  progress, 
  size = 40, 
  strokeWidth = 3 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
        <HoursLeftInDay />
      </div>
    </div>
  );
};

const DailyTaskItem: React.FC<{
  task: DailyTodo;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ task, onToggle, onDelete }) => (
  <motion.div
    layout
    variants={itemVariants}
    className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
    onClick={onToggle}
  >
    <div className="flex-shrink-0">
      {task.completed ? (
        <CheckCircle2 className="w-5 h-5 text-green-400 fill-green-400/20" />
      ) : (
        <Circle className="w-5 h-5 text-white/30 group-hover:text-white/50" />
      )}
    </div>
    
    <span className={`flex-1 text-sm transition-all duration-300 ${
      task.completed ? "text-white/30 line-through" : "text-white/90"
    }`}>
      {task.DailyName}
    </span>

    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </motion.div>
);

const TodayCard: React.FC = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [hoursLeft] = useAtom(timeLeftInTodayAtom);
  const [tasks, setTasks] = useAtom(dailyTodoContainerAtom);
  const [newTaskName, setNewTaskName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Derived state
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const allDone = totalTasks > 0 && completedCount === totalTasks;
  const isLate = hoursLeft <= 4;
  
  // Progress calculation for the day (assuming 24h day for simple visual)
  const dayProgress = Math.max(0, Math.min(100, ((24 - hoursLeft) / 24) * 100));

  const toggleTaskCompletion = (index: number) => {
    setTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    toast.info("Task removed");
  };

  const addNewTask = () => {
    if (tasks.length >= 3) {
      toast.error("Daily limit is 3 tasks");
      return;
    }

    if (newTaskName.trim()) {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          DailyName: newTaskName.trim(),
          completed: false,
        },
      ]);
      setNewTaskName("");
      setIsAdding(false);
      toast.success("Task added!");
    } else {
      toast.error("Task name cannot be empty");
    }
  };

  return (
    <Popover open={isCardVisible} onOpenChange={setIsCardVisible}>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          className={`relative w-14 h-14 rounded-full shadow-2xl transition-all duration-500 overflow-hidden ${
            isCardVisible 
              ? "bg-white/20 backdrop-blur-xl scale-90" 
              : allDone 
                ? "bg-green-500/80 hover:bg-green-500" 
                : isLate 
                  ? "bg-orange-500/80 hover:bg-orange-500" 
                  : "bg-white/10 hover:bg-white/20 backdrop-blur-md"
          } border border-white/20`}
        >
          <AnimatePresence mode="wait">
            {isCardVisible ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className={allDone ? "text-white" : isLate ? "text-white" : "text-primary"}
              >
                {allDone ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <ProgressCircle progress={dayProgress} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        side="top" 
        align="end" 
        sideOffset={15}
        className="w-80 p-0 overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-5 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-white text-xl font-bold tracking-tight">Today's Focus</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  isLate ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-white/5 text-white/50 border-white/5"
                }`}>
                  <Clock className="w-3 h-3" />
                  <HoursLeftInDay />h left
                </div>
                <div className="text-[10px] text-white/30">
                  {completedCount}/{totalTasks} completed
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-white/30 hover:text-white hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar (mini) */}
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
              className="h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
            />
          </div>

          {/* Task List */}
          <LayoutGroup>
            <div className="flex flex-col gap-2 min-h-[100px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <DailyTaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTaskCompletion(index)}
                      onDelete={() => deleteTask(index)}
                    />
                  ))
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 text-white/20" />
                    </div>
                    <p className="text-sm text-white/30 px-6">
                      What are the 3 most important things to do today?
                    </p>
                  </motion.div>
                )}

                {/* All Done Celebration */}
                {allDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
                  >
                    <p className="text-xs font-semibold text-green-400">
                      ✨ Fantastic journey today!
                    </p>
                  </motion.div>
                )}

                {/* Add Task Input Slot */}
                {!allDone && tasks.length < 3 && (
                  <motion.div layout>
                    {isAdding ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mt-2"
                      >
                        <Input
                          autoFocus
                          placeholder="What needs to be done?"
                          className="bg-white/5 border-white/5 focus-visible:ring-white/20 focus-visible:border-white/20 text-sm h-10"
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addNewTask();
                            if (e.key === "Escape") setIsAdding(false);
                          }}
                        />
                        <Button 
                          size="sm" 
                          onClick={addNewTask}
                          className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3"
                        >
                          Add
                        </Button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setIsAdding(true)}
                        className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:bg-white/5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-medium">Add a focus task</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>

          {/* Footer Warning */}
          {isLate && !allDone && (
            <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <p className="text-[10px] text-orange-300 font-medium">
                Running out of time! Focus on finishing these.
              </p>
            </div>
          )}
        </motion.div>

        {/* Glossy bottom bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </PopoverContent>
    </Popover>
  );
};

export default TodayCard;
