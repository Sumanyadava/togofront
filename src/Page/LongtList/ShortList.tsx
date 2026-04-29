import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import {
  ShortTodoContainer,
  shortTodoContainerAtom,
  ShortTodoJ,
} from "@/state";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  // AlertCircle,
  Pen,
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  Search,
  ArrowUpDown,
  // GripVertical
} from "lucide-react";
import ShortTask from "@/components/TodoRelated/shortTask/ShortTask";
import ShortTaskHead from "@/components/TodoRelated/shortTask/ShortTaskHead";
// @ts-ignore
import { db, auth } from '../../../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion, AnimatePresence, Reorder } from "framer-motion";

const ShortList = () => {
  const { id } = useParams();
  const containerId = Number(id);

  const [shortTodoArray, setTodoArray] = useAtom<ShortTodoContainer[]>(
    shortTodoContainerAtom
  );
  
  // ── Derived State ──
  const currentContainer = useMemo(() => 
    shortTodoArray.find((c) => c.id === containerId),
  [shortTodoArray, containerId]);

  const shortTaskS = useMemo(() => 
    currentContainer?.shortTodos || [],
  [currentContainer]);

  // ── Local Input/UI State ──
  const [containerName, setContainerName] = useState("");
  const [notes, setNotes] = useState("");
  const [newTask, setNewTask] = useState("");
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "status">("date");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  // Sync component state with global atom when list changes
  useEffect(() => {
    if (currentContainer) {
      setContainerName(currentContainer.shortContainername);
      setNotes(currentContainer.Notes || "");
      setTempTitle(currentContainer.shortContainername);
    }
  }, [currentContainer?.id]); // Only re-init when switching containers

  const completed = shortTaskS.filter((t) => t.completed).length;
  const total = shortTaskS.length;
  const progress = total === 0 ? 0 : (completed / total) * 100;
  const isFullyComplete = progress === 100 && total > 0;

  // Filter and Sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let tasks = [...shortTaskS];
    if (!showHidden) tasks = tasks.filter(t => !t.hidden);
    if (searchQuery) tasks = tasks.filter(t => t.shortTodoName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus !== "All") tasks = tasks.filter(t => t.status === filterStatus);
    if (filterPriority !== "All") tasks = tasks.filter(t => t.priority === filterPriority);
    
    if (sortBy === "priority") {
      const prioMap = { "Critical": 0, "High": 1, "Normal": 2, "Low": 3 };
      tasks.sort((a, b) => (prioMap[a.priority as keyof typeof prioMap] ?? 2) - (prioMap[b.priority as keyof typeof prioMap] ?? 2));
    } else if (sortBy === "status") {
      tasks.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === "date") {
      tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return tasks;
  }, [shortTaskS, showHidden, searchQuery, sortBy, filterStatus, filterPriority]);

  // ── Persistence ──
  const syncWithFirebase = async (updatedContainer: ShortTodoContainer) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !updatedContainer) return;

    try {
      const q = query(collection(db, `users/${userId}/shortTodoContainers`), where("id", "==", updatedContainer.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          updateDoc(doc(db, `users/${userId}/shortTodoContainers`, docSnap.id), {
            shortTodos: updatedContainer.shortTodos,
            shortContainername: updatedContainer.shortContainername,
            Notes: updatedContainer.Notes || "",
            completed: updatedContainer.completed || false,
            hidden: updatedContainer.hidden || false,
            createdAt: updatedContainer.createdAt || new Date()
          });
        });
      }
    } catch (error) {
      console.error("Firebase sync failed:", error);
      toast.error("Cloud sync failed");
    }
  };

  const updateContainer = (updater: (container: ShortTodoContainer) => ShortTodoContainer) => {
    let containerToSync: ShortTodoContainer | null = null;
    
    setTodoArray((prev) =>
      prev.map((container) => {
        if (container.id === containerId) {
          containerToSync = updater(container);
          return containerToSync;
        }
        return container;
      })
    );

    // Call side effect OUTSIDE of the state updater
    if (containerToSync) {
      syncWithFirebase(containerToSync);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleReorder = (newTasks: ShortTodoJ[]) => {
    // Only allow reordering if list is unfiltered
    if (searchQuery || filterStatus !== "All" || filterPriority !== "All") return;

    if (showHidden) {
       updateContainer((c) => ({ ...c, shortTodos: newTasks }));
    } else {
       // Merge reordered visible tasks back with hidden tasks
       const hiddenTasks = shortTaskS.filter(t => t.hidden);
       updateContainer((c) => ({ ...c, shortTodos: [...newTasks, ...hiddenTasks] }));
    }
  };

  const handleRenameContainer = () => {
    if (tempTitle.trim() && tempTitle !== containerName) {
      updateContainer((c) => ({ ...c, shortContainername: tempTitle.trim() }));
      toast.success("List renamed");
    }
    setIsEditingTitle(false);
  };

  const handleAddTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    const task: ShortTodoJ = {
      id: Date.now(),
      shortTodoName: trimmed,
      completed: false,
      tag: "Priority",
      status: "In Progress",
      priority: "Normal",
      createdAt: new Date(),
      hidden: false
    };
    
    updateContainer((c) => ({
      ...c,
      shortTodos: [task, ...(c.shortTodos || [])]
    }));
    setNewTask("");
    setIsAddingTask(false);
    toast.success("Task added");
  };

  const handleUpdateTask = (taskId: number, updates: Partial<ShortTodoJ>) => {
    updateContainer((c) => ({
      ...c,
      shortTodos: (c.shortTodos || []).map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    }));
  };

  const handleDeleteTask = (taskId: number) => {
    updateContainer((c) => ({
      ...c,
      shortTodos: (c.shortTodos || []).filter((t) => t.id !== taskId)
    }));
    toast.error("Task deleted");
  };

  const handleSaveNotes = () => {
    updateContainer((c) => ({
      ...c,
      Notes: notes
    }));
    toast.success("Notes saved");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col gap-4 sm:gap-6 p-3 sm:p-6 md:p-8 overflow-x-hidden bg-[#020202] text-white">
      
      {/* ── Background Ambience ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/[0.04] rounded-full blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-40 -right-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500/[0.02] rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute inset-0 bg-grid-white/[0.01]" />
      </div>

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 flex items-center gap-2 shrink-0 px-1">
        <Link to="/">
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-white/30 hover:text-white transition-colors text-xs font-medium px-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-xs font-medium text-white/50 truncate max-w-[150px] sm:max-w-xs">
          {containerName}
        </span>
      </div>

      {/* ── Header Section ── */}
      <div className="relative z-10 flex flex-col gap-4 sm:gap-5 shrink-0 px-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 group">
          {isEditingTitle ? (
            <div className="flex items-center gap-4 w-full">
              <input
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameContainer()}
                onBlur={handleRenameContainer}
                className="text-2xl sm:text-3xl md:text-4xl font-bold bg-transparent border-b border-primary/20 outline-none text-white w-full py-1"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-primary transition-all duration-300 tracking-tight">
                {containerName || "Untitled List"}
              </h1>
              <Pen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/10 group-hover:text-white/40 transition-all" />
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <StatChip
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                label="Done"
                value={String(completed)}
              />
              <StatChip
                icon={<Circle className="h-3.5 w-3.5 text-white/20" />}
                label="Left"
                value={String(total - completed)}
              />
            </div>
            
            <div className="ml-auto flex items-center gap-4 sm:gap-6">
               <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/30">Progress</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg sm:text-xl font-bold ${isFullyComplete ? "text-primary" : "text-white"}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
               </div>
               
               <AnimatePresence>
                  {isFullyComplete && (
                     <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[9px] sm:text-[10px] flex items-center gap-2"
                     >
                        <Check className="h-3 w-3" /> <span className="hidden sm:inline">Mission Clear</span>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
          
          <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full transition-all duration-700 ${
                isFullyComplete ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-white/10"
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="relative z-10 flex flex-col gap-3 sm:gap-4 bg-white/[0.02] border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
         <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input 
                 placeholder="Search tasks..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-xl py-2 sm:py-2.5 pl-11 pr-4 text-sm outline-none focus:border-white/20 transition-all placeholder:text-white/10"
              />
           </div>
           
           <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="flex-1 sm:flex-initial bg-black/40 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-xs font-medium text-white/60 outline-none focus:border-white/20 cursor-pointer"
              >
                 <option value="All">All Status</option>
                 <option value="Pending">Pending</option>
                 <option value="In Progress">Active</option>
                 <option value="Done">Completed</option>
                 <option value="Blocked">Blocked</option>
              </select>

              <select 
                 value={filterPriority}
                 onChange={(e) => setFilterPriority(e.target.value)}
                 className="flex-1 sm:flex-initial bg-black/40 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-xs font-medium text-white/60 outline-none focus:border-white/20 cursor-pointer"
              >
                 <option value="All">All Priority</option>
                 <option value="Low">Low</option>
                 <option value="Normal">Normal</option>
                 <option value="High">High</option>
                 <option value="Critical">Critical</option>
              </select>

              <div className="hidden sm:block h-5 w-px bg-white/10 mx-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => sortBy === "date" ? setSortBy("priority") : sortBy === "priority" ? setSortBy("status") : setSortBy("date")}
                className="flex-1 sm:flex-initial h-9 sm:h-10 px-3 sm:px-4 gap-2 border-white/10 bg-transparent text-xs font-medium text-white/40 hover:text-white rounded-xl"
              >
                 <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                 <span className="hidden sm:inline">Sort: {sortBy}</span>
                 <span className="sm:hidden font-mono truncate">{sortBy.slice(0,1)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHidden(!showHidden)}
                className={`flex-1 sm:flex-initial h-9 sm:h-10 px-3 sm:px-4 gap-2 text-xs font-medium rounded-xl transition-all ${
                  showHidden ? "text-primary bg-primary/10 border border-primary/20" : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
              >
                {showHidden ? <Eye className="h-4 w-4 shrink-0" /> : <EyeOff className="h-4 w-4 shrink-0" />}
                <span className="hidden sm:inline">Hidden</span>
              </Button>
           </div>
         </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 sm:gap-8 min-h-0 flex-1">
        
        {/* Task Section */}
        <div className="flex-1 flex flex-col min-h-0 order-1">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-white/40">Tasks ({filteredAndSortedTasks.length})</h2>
            <Button 
              onClick={() => setIsAddingTask(true)}
              className="h-9 sm:h-10 gap-2 bg-white text-black hover:bg-white/90 font-bold text-xs rounded-xl px-4 sm:px-6"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 overflow-hidden flex flex-col min-h-0">
            <ShortTaskHead />
            <div className="overflow-y-auto flex-1 scrollbar-custom p-2 sm:p-4">
              <Reorder.Group 
                 axis="y" 
                 values={filteredAndSortedTasks} 
                 onReorder={handleReorder}
                 className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {isAddingTask && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="mb-3"
                    >
                      <div className="p-3 sm:p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3 sm:gap-4">
                        <input
                          autoFocus
                          placeholder="What needs to be done?"
                          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-white/10"
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTask();
                            if (e.key === "Escape") setIsAddingTask(false);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleAddTask} className="h-8 bg-white text-black font-bold text-xs px-4 sm:px-6 rounded-lg">
                            Save
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setIsAddingTask(false)} className="h-8 w-8 text-white/30 hover:text-white">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {filteredAndSortedTasks.length === 0 && !isAddingTask ? (
                    <div className="flex flex-col items-center justify-center h-40 sm:h-60 text-white/5 gap-4">
                      <Search className="h-10 w-10 opacity-10" />
                      <p className="text-sm font-medium text-center">No tasks match your filters</p>
                    </div>
                  ) : (
                    filteredAndSortedTasks.map((e, index) => (
                      <Reorder.Item 
                         key={e.id} 
                         value={e}
                         dragListener={!searchQuery && showHidden && filterStatus === "All" && filterPriority === "All"}
                         className="touch-none"
                      >
                         <ShortTask 
                           num={index} 
                           comp={e} 
                           onToggle={() => handleUpdateTask(e.id, { completed: !e.completed })}
                           onDelete={() => handleDeleteTask(e.id)}
                           onRename={(newName) => handleUpdateTask(e.id, { shortTodoName: newName })}
                           onUpdate={(updates) => handleUpdateTask(e.id, updates)}
                         />
                      </Reorder.Item>
                    ))
                  )}
                </AnimatePresence>
              </Reorder.Group>
            </div>
          </div>
        </div>

        {/* Notes Side Panel */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col min-h-[300px] lg:min-h-0 order-2 lg:order-2">
          <div className="flex flex-col flex-1 rounded-3xl border border-white/10 bg-black/20 overflow-hidden shadow-2xl">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                 <Pen className="h-4 w-4 text-primary" />
                 <span className="text-xs font-semibold text-white/40">Notes & Details</span>
               </div>
            </div>
            <textarea
               className="flex-1 resize-none p-5 sm:p-6 text-sm bg-transparent focus:outline-none placeholder:text-white/10 text-white/80 leading-relaxed scrollbar-custom font-medium min-h-[150px]"
               placeholder="Jot down some mission context..."
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
            />
            <div className="p-4 sm:p-6 border-t border-white/5 bg-white/[0.01]">
               <Button 
                  className="w-full h-11 sm:h-12 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 rounded-xl transition-all shadow-xl"
                  onClick={handleSaveNotes}
               >
                  Sync Notes
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-sm transition-all hover:bg-white/5 hover:border-white/10">
    <div className="p-1 rounded-lg bg-white/5">{icon}</div>
    <span className="text-white/40 font-medium text-xs">{label}</span>
    <span className="text-white font-bold ml-1 font-mono">{value.padStart(2, '0')}</span>
  </div>
);

export default ShortList;
