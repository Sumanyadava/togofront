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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor } from 'primereact/editor';

// --- Constants ---

export const COLORS = [
  "rgba(255, 255, 255, 0.05)", 
  "rgba(59, 130, 246, 0.15)",   
  "rgba(168, 85, 247, 0.15)",   
  "rgba(236, 72, 153, 0.15)",   
  "rgba(34, 197, 94, 0.15)",    
];

// --- Types ---

export interface BlockData {
  id: string;
  x: number;
  y: number;
  content: string;
  isMinimized: boolean;
  zIndex: number;
  color: string;
  hasBackground: boolean;
  hasBeenDragged: boolean;
}

// --- Main Component ---

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

  return (
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
              "min-w-[340px] max-w-[480px] rounded-[2.5rem] transition-all duration-500 flex flex-col relative overflow-hidden",
              isActive ? "border-white/30 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] scale-105" : "border-white/10 shadow-2xl scale-100 opacity-90"
            )}
            style={{ 
              backgroundColor: block.hasBackground ? block.color : "transparent",
              backdropFilter: block.hasBackground ? "blur(60px)" : "none",
            }}
          >
            {/* Premium Header */}
            <div 
              className="h-12 flex items-center justify-between px-5 border-b border-white/5 bg-white/[0.02] select-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="flex items-center gap-2">
                <GripVertical size={12} className="text-white/20" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Node</span>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
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

            {/* Removed inline styles for custom todo list */}

            {/* Footer */}
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Active Insight</span>
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
  );
};

export default React.memo(MindBlock);
