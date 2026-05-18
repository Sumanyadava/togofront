import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  Plus, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Command,
  ChevronDown,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MindBlock, { BlockData, COLORS } from "./MindBlock";

// --- Google Fonts Import ---
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&family=Outfit:wght@300;400;700;900&family=Space+Grotesk:wght@300;400;700&family=Playfair+Display:wght@700;900&family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
`;

// --- Constants ---

const FONTS = ["Inter", "Outfit", "Space Grotesk", "Playfair Display", "JetBrains Mono", "Syne"];
const SIZES = ["12px", "14px", "16px", "20px", "24px", "32px"];

// --- Sub-components ---

const HeaderButton = ({ 
  onClick, 
  icon: Icon, 
  active = false,
  text
}: { 
  onClick: () => void; 
  icon?: React.ElementType; 
  active?: boolean;
  text?: string;
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      "px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center text-[11px] font-black uppercase tracking-widest",
      active ? "text-white bg-white/10" : "text-white/40 hover:text-white hover:bg-white/5"
    )}
  >
    {Icon ? <Icon size={14} /> : text}
  </button>
);

const ToolbarSelect = ({ 
  options, 
  value, 
  onChange, 
  className 
}: { 
  options: string[]; 
  value: string; 
  onChange: (val: string) => void;
  className?: string;
}) => (
  <div className={cn("relative group flex items-center", className)}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 pr-10 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#0a0a0a] text-white py-2">
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-3 text-white/20 pointer-events-none group-hover:text-white transition-colors" />
  </div>
);

const VerticalDivider = () => <div className="w-px h-5 bg-white/10 mx-2" />;

// --- Main Canvas ---

export default function RichTextCanvas() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [mainContent, setMainContent] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const mainEditorRef = useRef<HTMLDivElement>(null);

  const [font, setFont] = useState("Outfit");
  const [size, setSize] = useState("16px");

  const addBlock = useCallback((e?: React.MouseEvent) => {
    const id = crypto.randomUUID();
    let x = window.innerWidth / 2 - 200;
    let y = window.innerHeight / 2 - 150;

    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      x = e.clientX - rect.left - 180;
      y = e.clientY - rect.top - 80;
    }

    const newBlock: BlockData = {
      id, x, y, content: "", isMinimized: false, zIndex: maxZIndex + 1, color: COLORS[0], hasBackground: true, hasBeenDragged: false
    };
    setBlocks((prev) => [...prev, newBlock]);
    setMaxZIndex((prev) => prev + 1);
    setActiveId(id);
  }, [maxZIndex]);

  const updateBlock = (id: string, updates: Partial<BlockData>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const executeCommand = (command: string, value?: string) => {
    if (command === 'fontSize' || command === 'fontName') {
      document.execCommand('styleWithCSS', false, 'true');
      if (command === 'fontSize') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const span = document.createElement("span");
          span.style.fontSize = value || "16px";
          range.surroundContents(span);
        }
      } else {
        document.execCommand(command, false, value);
      }
    } else {
      document.execCommand(command, false, value);
    }
    if (activeId === null && mainEditorRef.current) mainEditorRef.current.focus();
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setMainContent(e.currentTarget.innerHTML);
  };

  const handleSave = () => {
    const data = {
      mainContent,
      blocks,
      savedAt: new Date().toISOString(),
      metadata: {
        totalBlocks: blocks.length,
        activeFont: font,
        activeSize: size
      }
    };
    console.log("💾 CANVAS DATA SAVED:", data);
    
    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.classList.add('bg-green-500/20', 'text-green-500');
      setTimeout(() => btn.classList.remove('bg-green-500/20', 'text-green-500'), 2000);
    }
  };

  // Handle content sync for main editor
  useEffect(() => {
    if (mainEditorRef.current && mainEditorRef.current.innerHTML !== mainContent) {
      mainEditorRef.current.innerHTML = mainContent;
    }
  }, [mainContent]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[850px] bg-[#020202] overflow-hidden rounded-[3.5rem] border border-white/5 group/canvas shadow-2xl"
    >
      <style>{FONT_IMPORT}</style>
      {/* Background Aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
      />

      {/* Structured Global Header */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-8 border-b border-white/10 bg-black/40 backdrop-blur-3xl z-[1000]">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-3 mr-8">
              <Command size={18} className="text-primary" />
              <div className="flex flex-col select-none">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Deep Thoughts</span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{activeId ? "Targeting Block" : "Spatial Canvas"}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 select-none">
              <ToolbarSelect options={FONTS} value={font} onChange={(f) => { setFont(f); executeCommand('fontName', f); }} className="w-36" />
              <ToolbarSelect options={SIZES} value={size} onChange={(s) => { setSize(s); executeCommand('fontSize', s); }} className="w-24" />
            </div>
            
            <VerticalDivider />
            
            <HeaderButton onClick={() => executeCommand('bold')} text="B" />
            <HeaderButton onClick={() => executeCommand('italic')} text="I" />
            <HeaderButton onClick={() => executeCommand('underline')} text="U" />
            <HeaderButton onClick={() => executeCommand('strikeThrough')} icon={Strikethrough} />
            
            <VerticalDivider />
            
            <HeaderButton onClick={() => executeCommand('justifyLeft')} icon={AlignLeft} />
            <HeaderButton onClick={() => executeCommand('justifyCenter')} icon={AlignCenter} />
            <HeaderButton onClick={() => executeCommand('justifyRight')} icon={AlignRight} />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              id="save-btn"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Save size={14} /> Save
            </button>
            <button 
              onClick={() => addBlock()}
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary text-white shadow-[0_15px_30px_-10px_rgba(var(--primary),0.5)] hover:scale-105 transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Plus size={16} /> New Node
            </button>
          </div>
      </div>

      {/* Main Content Backplane */}
      <div 
        className="absolute inset-0 p-24 pt-32 no-scrollbar scroll-smooth"
        onClick={() => setActiveId(null)}
      >
        <div
          ref={mainEditorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setActiveId(null)}
          className="min-h-full outline-none text-white/20 text-2xl font-light leading-relaxed prose-modern focus:text-white/80 transition-all duration-700    select-text cursor-text"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        {mainContent === "" && (
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none opacity-[0.02]">
            <h1 className="text-[12rem] font-black uppercase tracking-tighter leading-none">Mind</h1>
          </div>
        )}
      </div>

      {/* Movable Blocks Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div ref={constraintsRef} className="absolute inset-0 top-[50px] left-0 right-0 bottom-0 pointer-events-none" />
        {blocks.map((block) => (
          <div key={block.id} className="pointer-events-auto">
            <MindBlock
              block={block}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              containerWidth={containerRef.current?.offsetWidth || 1200}
              dragConstraints={constraintsRef}
              onFocus={() => {
                setActiveId(block.id);
                if (block.zIndex < maxZIndex) {
                  updateBlock(block.id, { zIndex: maxZIndex + 1 });
                  setMaxZIndex(prev => prev + 1);
                }
              }}
              isActive={activeId === block.id}
            />
          </div>
        ))}
      </div>

      <style>{`
        .prose-modern b { font-weight: 800; color: #fff; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
