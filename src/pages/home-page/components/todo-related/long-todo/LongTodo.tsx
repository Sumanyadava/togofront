"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

import { TagsLong } from "@/components/TagsLong";
import LongTaskUi from "@/pages/home-page/components/todo-related/long-todo/LongTaskUi";
import { ShortAction } from "@/pages/short-list-page/shortDetailComp/ShortTodoAction";
import Cal2 from "@/components/calendarcomp/cal2";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAtom } from "jotai";
import { LongTodoContainerAtom, LongTodoJ, LongTodoContainer } from "@/state/state";
import { db, auth } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { X, Check, Calendar, Tag as TagIcon, Plus, Edit3, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useLongPress from "@/hooks/useLongpress";

const LongTodo: React.FC<{
  LongContainerName: string;

  id: number;
}> = ({ LongContainerName, id }) => {
  const [headerHeight, setHeaderHeight] = useState(false);
  const [longText, setLongText] = useState("");
  const [LongTaskS, setLongTaskS] = useState<LongTodoJ[]>([]);
  const [TagDaTa, setTagDaTa] = useState("");
  const [DeadlineState, setDeadlineState] = useState<Date | null>(null);
  const [showCardActions, setShowCardActions] = useState(false);
  const [isRenamingContainer, setIsRenamingContainer] = useState(false);
  const [newContainerName, setNewContainerName] = useState(LongContainerName);

  const [LongTodoArray, setLongTodoArray] = useAtom(LongTodoContainerAtom);

  useEffect(() => {
    const LongArray = LongTodoArray.find((Lt) => Lt.id == id);

    setLongTaskS(LongArray ? LongArray?.LongTodo : []);
  }, [LongTodoArray, id]);

  

  const handleTag = (data: string) => {
    setTagDaTa(data);
  };

  const handleDeadline = (data: Date | null) => {
    setDeadlineState(data);
  };

  const syncWithFirebase = async (updatedContainer: LongTodoContainer) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(
        collection(db, `users/${userId}/longTodoContainers`),
        where("id", "==", updatedContainer.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          updateDoc(doc(db, `users/${userId}/longTodoContainers`, docSnap.id), {
            LongTodo: updatedContainer.LongTodo,
            LongContainerName: updatedContainer.LongContainerName,
            completed: updatedContainer.completed || false
          });
        });
      }
    } catch (error) {
      console.error("Firebase sync failed:", error);
      toast.error("Failed to sync with cloud");
    }
  };

  const updateContainer = async (updater: (container: LongTodoContainer) => LongTodoContainer) => {
    let updated: LongTodoContainer | null = null;
    
    // 1. Update local state immediately for UI responsiveness
    setLongTodoArray((prev) =>
      prev.map((container) => {
        if (container.id === id) {
          updated = updater(container);
          return updated;
        }
        return container;
      })
    );

    // 2. Sync with Firebase and wait for completion
    if (updated) {
      await syncWithFirebase(updated);
    }
  };

  const handleLong = async () => {
    if (!longText.trim()) {
      if (!headerHeight) setHeaderHeight(true);
      return;
    }

    const newTask: LongTodoJ = {
      id: Date.now(),
      LongTodoName: longText.trim(),
      deadline: DeadlineState,
      tag: TagDaTa || "General",
      completed: false,
      milestone: [],
      planText: "",
      createedAt: new Date(),
    };

    await updateContainer((container) => ({
      ...container,
      LongTodo: [...container.LongTodo, newTask],
    }));

    setLongText("");
    setTagDaTa("");
    setDeadlineState(null);
    setHeaderHeight(false);
    toast.success("Task added to long-term list!");
  };

  const handleDeleteTask = async (taskId: number) => {
    await updateContainer((container) => ({
      ...container,
      LongTodo: container.LongTodo.filter((t) => t.id !== taskId)
    }));
    toast.error("Goal removed from cloud");
  };

  const handleRenameTask = async (taskId: number, newName: string) => {
    await updateContainer((container) => ({
      ...container,
      LongTodo: container.LongTodo.map((t) => t.id === taskId ? { ...t, LongTodoName: newName } : t)
    }));
    toast.success("Goal renamed in cloud");
  };

  const handleToggleTaskComplete = async (taskId: number) => {
    await updateContainer((container) => ({
      ...container,
      LongTodo: container.LongTodo.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const handleDeleteContainer = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(
        collection(db, `users/${userId}/longTodoContainers`),
        where("id", "==", id)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          deleteDoc(doc(db, `users/${userId}/longTodoContainers`, docSnap.id));
        });
      }
      setLongTodoArray((prev) => prev.filter((c) => c.id !== id));
      toast.success("Long-term list deleted");
    } catch (error) {
      toast.error("Failed to delete list");
    }
  };

  const handleRenameContainer = async () => {
    if (newContainerName.trim() && newContainerName !== LongContainerName) {
      await updateContainer((container) => ({
        ...container,
        LongContainerName: newContainerName.trim()
      }));
      toast.success("List renamed in cloud!");
    }
    setIsRenamingContainer(false);
    setShowCardActions(false);
  };

  const cardLongPressRef = useLongPress<HTMLDivElement>(() => {
    setShowCardActions(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  }, () => {}, 1500);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card 
        ref={cardLongPressRef}
        className="w-[350px] m-5 h-min relative overflow-hidden border-white/5 bg-black/20 backdrop-blur-sm hover:border-white/10 transition-all duration-500"
      >
        {/* Card Actions Overlay */}
        <AnimatePresence>
          {showCardActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
            >
              <div className="flex gap-4">
                <button
                  onClick={() => setIsRenamingContainer(true)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/btn"
                >
                  <Edit3 className="text-white group-hover/btn:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleDeleteContainer}
                  className="p-4 bg-red-500/20 hover:bg-red-500/40 rounded-2xl transition-all group/btn"
                >
                  <Trash2 className="text-red-400 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
              <button
                onClick={() => setShowCardActions(false)}
                className="mt-4 text-sm text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rename Modal/Input Overlay */}
        <AnimatePresence>
          {isRenamingContainer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-0 top-0 z-[60] p-4 bg-black/80 backdrop-blur-xl border-b border-white/10"
            >
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameContainer();
                    if (e.key === "Escape") setIsRenamingContainer(false);
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={handleRenameContainer} className="p-2 bg-primary/20 text-primary rounded-lg">
                  <Check size={18} />
                </button>
                <button onClick={() => setIsRenamingContainer(false)} className="p-2 bg-white/5 text-white/40 rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      <CardHeader
        className={`p-0 overflow-hidden transition-all duration-500 ease-in-out ${
          headerHeight ? "h-[220px]" : "h-[75px]"
        }`}
      >
        <div 
          className="p-5 flex justify-between items-center cursor-pointer group/header"
          onClick={() => !headerHeight && setHeaderHeight(true)}
        >
          <div className="relative flex-1 min-w-0">
            {!headerHeight ? (
              <h3 className="font-bold text-xl text-white/90 truncate py-1">
                {LongContainerName}
              </h3>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-70">Long-term Goal</span>
                  <input
                    autoFocus
                    type="text"
                    value={longText}
                    onChange={(e) => setLongText(e.target.value)}
                    className="w-full bg-transparent border-b border-primary/30 focus:border-primary transition-colors py-1 focus:outline-none font-bold text-lg text-white placeholder:text-white/10"
                    placeholder="What are we aiming for?"
                    onKeyDown={(e) => e.key === "Enter" && handleLong()}
                  />
                </div>

                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex-1 flex items-center gap-2 p-2 px-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[11px] font-medium text-white/60">
                        <Calendar size={14} className={DeadlineState ? "text-primary" : ""} />
                        {DeadlineState ? DeadlineState.toLocaleDateString() : "Set Deadline"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-black/90 backdrop-blur-xl border-white/10 p-0" align="start">
                      <Cal2 handleDeadline={handleDeadline} />
                    </PopoverContent>
                  </Popover>

                  <div className="flex-1">
                    <TagsLong handleTag={handleTag} />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button 
                    onClick={handleLong}
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold h-9"
                  >
                    <Plus size={16} className="mr-2" /> Add Goal
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setHeaderHeight(false); }}
                    className="h-9 w-9 text-white/20 hover:text-white hover:bg-white/5"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {!headerHeight && (
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-white/10 px-2 py-1 bg-white/5 rounded-md">
                 {LongTaskS.length} Goals
               </span>
               <ShortAction />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="scrollbar-custom overflow-y-scroll h-[300px] p-4 pt-0">
        <AnimatePresence initial={false}>
          {LongTaskS.map((long) => (
            <LongTaskUi 
              key={long.id} 
              long={long} 
              containerId={id} 
              onDelete={handleDeleteTask}
              onRename={handleRenameTask}
              onToggleComplete={handleToggleTaskComplete}
            />
          ))}
        </AnimatePresence>
      </CardContent>
      </Card>
    </motion.div>
  );
};

export default LongTodo;
