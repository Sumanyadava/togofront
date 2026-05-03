import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShortAction } from "./ShortAction";
import { format } from 'date-fns';
import { ShortTodoJ } from "@/state/state";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShortTaskProps {
  comp: ShortTodoJ;
  num: number;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onUpdate: (updates: Partial<ShortTodoJ>) => void;
}

const statuses = ["Pending", "In Progress", "Done", "Blocked"];
const priorities = ["Low", "Normal", "High", "Critical"];

const ShortTask: React.FC<ShortTaskProps> = ({ 
  comp, 
  num, 
  onToggle, 
  onDelete, 
  onRename, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(comp.shortTodoName);
  const [tempDesc, setTempDesc] = useState(comp.description || "");

  const handleRenameConfirm = () => {
    const nameChanged = tempName.trim() && tempName !== comp.shortTodoName;
    const descChanged = tempDesc.trim() !== (comp.description || "");
    
    if (nameChanged || descChanged) {
      onUpdate({ 
        shortTodoName: tempName.trim() || comp.shortTodoName, 
        description: tempDesc.trim() || undefined 
      });
    }
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ x: 2, scale: 1.002 }}
      className={`group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all duration-200 ${
        comp.completed 
          ? "bg-white/[0.01] border-white/5 opacity-50" 
          : comp.hidden
          ? "bg-white/[0.01] border-dashed border-white/5 opacity-40"
          : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {/* Drag Handle - Hidden on touch to avoid conflict with scroll */}
      <div className="hidden sm:block cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-40">
         <GripVertical className="h-3.5 w-3.5 text-white/20" />
      </div>

      {/* Index & Control */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-[40px] sm:min-w-[50px]">
        <span className="hidden sm:inline text-[10px] font-medium text-white/10 w-4 font-mono">{String(num + 1).padStart(2, '0')}</span>
        <div 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="cursor-pointer relative"
        >
           <Checkbox 
            checked={comp.completed} 
            className={`h-5 w-5 rounded-md transition-all duration-300 ${
              comp.completed ? "bg-primary border-transparent" : "border-white/20 bg-black/40"
            }`} 
          />
        </div>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              <input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameConfirm();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="w-full bg-black/40 text-sm px-2 py-1 rounded-lg outline-none border border-white/10 focus:border-white/30"
              />
              <textarea
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-black/40 text-xs px-2 py-1 rounded-lg outline-none border border-white/10 focus:border-white/30 min-h-[40px] resize-none"
              />
              <div className="flex justify-end gap-1">
                 <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-[10px] rounded-lg bg-white/5 text-white/40 hover:bg-white/10">
                    Cancel
                 </button>
                 <button onClick={handleRenameConfirm} className="px-3 py-1 text-[10px] rounded-lg bg-white text-black hover:bg-white/90">
                    Save Changes
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="display"
              className="flex flex-col gap-0.5 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate transition-all ${
                  comp.completed ? "text-white/20 line-through" : "text-white/90"
                }`}>
                  {comp.shortTodoName}
                </p>
                {comp.description && (
                  <p className={`text-[11px] line-clamp-1 transition-all ${
                    comp.completed ? "text-white/10" : "text-white/30"
                  }`}>
                    {comp.description}
                  </p>
                )}
                {comp.hidden && (
                  <Badge className="text-[9px] bg-white/5 border-white/10 text-white/30 tracking-wider font-semibold py-0 px-1.5 rounded-md w-fit">Hidden</Badge>
                )}
              </div>
              
              {/* Mobile Meta Row (Priority & Status) */}
              <div className="flex sm:hidden items-center gap-2 mt-1.5">
                 {/* Mobile Status Trigger */}
                 <DropdownMenu>
                    <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="outline-none">
                       <Badge className={`text-[9px] px-2 py-0 h-4 rounded-md font-bold transition-all ${
                          comp.status === "Done" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          comp.status === "In Progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          comp.status === "Blocked" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-white/5 text-white/40 border-white/10"
                       } border hover:bg-white/10`}>
                          {comp.status}
                       </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl">
                       {statuses.map(s => (
                          <DropdownMenuItem key={s} onClick={(e) => { e.stopPropagation(); onUpdate({ status: s, completed: s === "Done" }); }} className="focus:bg-white focus:text-black font-medium text-xs px-4 py-2 cursor-pointer">
                             {s}
                          </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                 </DropdownMenu>

                 {/* Mobile Priority Trigger */}
                 <DropdownMenu>
                    <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="outline-none">
                       <Badge className={`text-[9px] px-2 py-0 h-4 rounded-md font-bold transition-all ${
                          comp.priority === "Critical" || comp.priority === "High" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white/20 border-white/10"
                       } border hover:bg-white/10`}>
                          {comp.priority}
                       </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl">
                       {priorities.map(p => (
                          <DropdownMenuItem key={p} onClick={(e) => { e.stopPropagation(); onUpdate({ priority: p }); }} className="focus:bg-white focus:text-black font-medium text-xs px-4 py-2 cursor-pointer">
                             {p}
                          </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>

             
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics & Actions */}
      <div className="flex items-center gap-3 sm:gap-7 shrink-0">
        {/* Status Dropdown (Desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hidden md:flex flex-col items-end gap-0.5 min-w-[70px] cursor-pointer hover:bg-white/5 p-1 px-2 rounded-lg transition-all group/status">
               <span className="text-[10px] font-semibold text-white/10 uppercase tracking-wider">Status</span>
               <span className={`text-[11px] font-medium transition-colors ${
                 comp.status === "Done" ? "text-emerald-500" : 
                 comp.status === "In Progress" ? "text-blue-500" :
                 comp.status === "Blocked" ? "text-red-500" :
                 "text-white/40"
               }`}>{comp.status}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl">
            {statuses.map(s => (
              <DropdownMenuItem key={s} onClick={() => onUpdate({ status: s, completed: s === "Done" })} className="focus:bg-white focus:text-black font-medium text-xs px-4 py-2 cursor-pointer">
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Dropdown (Desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hidden lg:flex flex-col items-end gap-0.5 min-w-[60px] cursor-pointer hover:bg-white/5 p-1 px-2 rounded-lg transition-all group/risk">
               <span className="text-[10px] font-semibold text-white/10 uppercase tracking-wider">Risk</span>
               <span className={`text-[11px] font-medium transition-colors ${
                 comp.priority === "High" || comp.priority === "Critical" ? "text-red-500" : "text-white/20"
               }`}>{comp.priority}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl">
            {priorities.map(p => (
              <DropdownMenuItem key={p} onClick={() => onUpdate({ priority: p })} className="focus:bg-white focus:text-black font-medium text-xs px-4 py-2 cursor-pointer">
                {p}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-[50px]">
           <span className="text-[10px] font-semibold text-white/10 uppercase tracking-wider">Logged</span>
           <span className="text-[11px] font-medium text-white/30 font-mono">{format(new Date(comp.createdAt), 'dd.MM')}</span>
        </div>

        <ShortAction 
          taid={comp.id} 
          isHidden={comp.hidden}
          onDelete={onDelete}
          onHide={() => onUpdate({ hidden: !comp.hidden })}
        />
      </div>
    </motion.div>
  );
};

export default ShortTask;
