import React, { useState, useRef } from "react";
import { 
  motion, 
  AnimatePresence, 
  useDragControls 
} from "framer-motion";
import { 
  GripVertical, 
  Minimize2, 
  Trash2,
  Palette,
  Layers,
  FileText,
  Eye,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Editor } from 'primereact/editor';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { BlockData, COLORS, notesAtom, categoriesAtom, shortTodoContainerAtom } from "@/state/state";

export type { BlockData };
export { COLORS };

interface MindBlockProps {
  block: BlockData; 
  updateBlock: (id: string, updates: Partial<BlockData>) => void;
  removeBlock: (id: string) => void;
  onFocus: () => void;
  isActive: boolean;
  containerWidth: number;
  dragConstraints: React.RefObject<HTMLDivElement>;
}

const MindBlock = ({ 
  block, 
  updateBlock, 
  removeBlock, 
  onFocus,
  isActive,
  containerWidth,
  dragConstraints
}: MindBlockProps) => {
  const dragControls = useDragControls();
  const blockRef = useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState(false);
  const [isPeekOpen, setIsPeekOpen] = useState(false);

  const navigate = useNavigate();
  const [notes] = useAtom(notesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [shortContainers, setShortContainers] = useAtom(shortTodoContainerAtom);

  const linkedNote = block.linkedNoteId ? notes.find((n) => n.id === block.linkedNoteId) : null;
  const noteCategory = linkedNote ? categories.find((c) => c.id === linkedNote.categoryId) : null;

  // Milestones for linked note
  const noteMilestones = React.useMemo(() => {
    if (!linkedNote) return [];
    if (linkedNote.shortContainerId) {
      const target = shortContainers.find((c) => c.id === linkedNote.shortContainerId);
      if (target?.shortTodos) return target.shortTodos;
    }
    const all: typeof shortContainers[0]["shortTodos"] = [];
    shortContainers.forEach((c) => {
      c.shortTodos?.forEach((todo) => {
        if (todo.parentNoteId === linkedNote.id) all.push(todo);
      });
    });
    return all;
  }, [linkedNote, shortContainers]);

  const completedMilestones = noteMilestones.filter((m) => m.completed).length;
  const progressPct = noteMilestones.length > 0 
    ? Math.round((completedMilestones / noteMilestones.length) * 100) 
    : 0;

  // Toggle milestone inside peek drawer
  const handleToggleMilestone = (mId: number) => {
    setShortContainers((prev) =>
      prev.map((c) => ({
        ...c,
        shortTodos: c.shortTodos.map((m) => (m.id === mId ? { ...m, completed: !m.completed } : m)),
      }))
    );
  };

  // Helper to extract clean plain text snippet from rich text
  const getExcerpt = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const txt = tmp.textContent || tmp.innerText || "";
    return txt.length > 120 ? txt.substring(0, 120) + "..." : txt;
  };

  return (
    <>
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={dragConstraints}
        dragElastic={0}
        ref={blockRef}
        onDragStart={() => {
          if (!block.hasBeenDragged) {
            updateBlock(block.id, { hasBeenDragged: true });
          }
        }}
        initial={{ opacity: 0, scale: 0.9, x: block.x, y: block.y }}
        animate={{ 
          opacity: 1, 
          scale: block.isMinimized ? 0.4 : 1,
          x: (block.isMinimized && !block.hasBeenDragged) ? containerWidth - 100 : block.x,
          y: block.y,
          zIndex: block.zIndex,
          transition: { type: "spring", damping: 25, stiffness: 300 }
        }}
        onDragEnd={(_, info) => {
          if (!dragConstraints.current || !blockRef.current) return;
          const containerRect = dragConstraints.current.getBoundingClientRect();
          const bWidth = blockRef.current.offsetWidth;
          const bHeight = blockRef.current.offsetHeight;
          
          const newX = Math.max(0, Math.min(containerRect.width - bWidth, block.x + info.offset.x));
          const newY = Math.max(50, Math.min(containerRect.height + 50 - bHeight, block.y + info.offset.y));
          updateBlock(block.id, { x: newX, y: newY });
        }}
        onPointerDown={onFocus}
        className={cn(
          "absolute group",
          block.isMinimized ? "cursor-pointer" : ""
        )}
      >
        <AnimatePresence mode="wait">
          {block.isMinimized ? (
            <motion.div
              key="minimized"
              layoutId={`block-${block.id}`}
              whileHover={{ scale: 1.1, y: -5 }}
              onPointerDown={(e) => {
                onFocus();
                dragControls.start(e);
              }}
              onDoubleClick={() => updateBlock(block.id, { isMinimized: false })}
              className="w-16 h-16 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: block.color }}
            >
              <FileText className="text-white/40" size={24} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-black" />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              layoutId={`block-${block.id}`}
              className={cn(
                "min-w-[340px] max-w-[480px] rounded-[2.5rem] transition-all duration-500 flex flex-col relative overflow-hidden backdrop-blur-3xl",
                linkedNote ? "border-purple-500/30 bg-[#0d0e17]/90" : "bg-white/[0.03] border-white/10",
                isActive ? "ring-2 ring-purple-500/50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] scale-105" : "shadow-2xl scale-100 opacity-95"
              )}
              style={{ 
                backgroundColor: block.hasBackground ? block.color : undefined,
              }}
            >
              {/* Header */}
              <div 
                className="h-12 flex items-center justify-between px-5 border-b border-white/5 bg-white/[0.02] select-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical size={12} className="text-white/20" />
                  {linkedNote ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      <Sparkles size={11} /> Linked Research
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Node</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {linkedNote && (
                    <>
                      <button 
                        onClick={() => setIsPeekOpen(true)} 
                        title="Quick Peek"
                        className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-purple-300 transition-all"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => navigate(`/startwriting/${linkedNote.id}`)} 
                        title="Open Full Note"
                        className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowColors(!showColors)} className="p-2 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-all"><Palette size={14} /></button>
                  <button onClick={() => updateBlock(block.id, { isMinimized: true })} className="p-2 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-all"><Minimize2 size={14} /></button>
                  <button onClick={() => removeBlock(block.id)} className="p-2 rounded-xl hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Color Picker Overlay */}
              <AnimatePresence>
                {showColors && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-6 top-14 z-50 flex gap-3 p-3 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl"
                  >
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => { updateBlock(block.id, { color: c }); setShowColors(false); }}
                        className="w-6 h-6 rounded-xl border border-white/20" style={{ backgroundColor: c }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Area */}
              {linkedNote ? (
                <div 
                  className="p-5 space-y-3 cursor-default"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">
                      {linkedNote.title || "Untitled Note"}
                    </h4>
                    {noteCategory && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0 border-white/10 text-zinc-300">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${noteCategory.color}`} />
                        {noteCategory.name}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {getExcerpt(linkedNote.content) || "No preview content available."}
                  </p>

                  {/* Progress bar if milestones exist */}
                  {noteMilestones.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Milestones</span>
                        <span>{completedMilestones} / {noteMilestones.length} ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="cursor-text bg-white/5"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Editor
                    value={block.content}
                    onTextChange={(e) => updateBlock(block.id, { content: e.htmlValue || "" })}
                    style={{ height: '200px' }}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${linkedNote ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"}`} />
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">
                    {linkedNote ? "Obsidian Connected" : "Active Insight"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  <Layers size={10} className="text-white/40" />
                  <span className="text-[9px] font-bold text-white/40 tracking-tight">L-{block.zIndex}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Peek Drawer for Linked Note */}
      {linkedNote && (
        <Sheet open={isPeekOpen} onOpenChange={setIsPeekOpen}>
          <SheetContent className="bg-[#10111a] border-white/10 text-zinc-200 w-full sm:max-w-md overflow-y-auto custom-scrollbar">
            <SheetHeader className="pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-zinc-100 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  {linkedNote.title || "Untitled Note"}
                </SheetTitle>
                <button
                  onClick={() => navigate(`/startwriting/${linkedNote.id}`)}
                  className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Full
                </button>
              </div>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Note Content */}
              <div 
                className="prose prose-invert max-w-none text-xs md:text-sm text-zinc-300 bg-white/[0.02] p-4 rounded-2xl border border-white/5"
                dangerouslySetInnerHTML={{ __html: linkedNote.content || "<p class='text-zinc-500'>Empty note</p>" }}
              />

              {/* Milestones in peek */}
              {noteMilestones.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Action Milestones ({completedMilestones}/{noteMilestones.length})
                  </h4>
                  <div className="space-y-1.5">
                    {noteMilestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(m.id)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 cursor-pointer text-xs"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                        <span className={m.completed ? "line-through text-zinc-500" : "text-zinc-200"}>
                          {m.shortTodoName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default React.memo(MindBlock);
