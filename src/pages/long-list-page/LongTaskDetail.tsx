import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { LongTodoContainerAtom, LongTodoJ } from "@/state/state";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { db, auth } from "@/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import {
  Calendar,
  Tag,
  Milestone,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Plus,
  GripVertical,
  FileText,
  Layers,
  Save,
} from "lucide-react";
import RichTextCanvas from "./richtext";
import { Editor } from 'primereact/editor';
import MindBlock, { BlockData, COLORS } from "./MindBlock";

const LongTaskDetail = () => {
  const { containerId, taskId } = useParams();
  const [longTodoArray, setLongTodoArray] = useAtom(LongTodoContainerAtom);
  const [task, setTask] = useState<LongTodoJ | null>(null);
  const [containerName, setContainerName] = useState("");
  const [text, setText] = useState<string>("");

  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = longTodoArray.find((c) => c.id === Number(containerId));
    if (container) {
      setContainerName(container.LongContainerName);
      const found = container.LongTodo.find((t) => t.id === Number(taskId));
      setTask(found ?? null);
      if (found) {
        if (text === "" && found.planText !== text) {
          setText(found.planText || "");
        }
        if (found.blocks && blocks.length === 0) {
          setBlocks(found.blocks);
          const maxZ = Math.max(1, ...found.blocks.map((b: BlockData) => b.zIndex || 1));
          setMaxZIndex(maxZ);
        }
      }
    }
  }, [longTodoArray, containerId, taskId]);

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

  const handleSave = async () => {
    if (!task) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    const container = longTodoArray.find((c) => c.id === Number(containerId));
    if (!container) return;

    const updatedTasks = container.LongTodo.map((t) =>
      t.id === Number(taskId) ? { ...t, planText: text, blocks: blocks } : t
    );

    const updatedContainer = {
      ...container,
      LongTodo: updatedTasks,
    };

    setLongTodoArray((prev) =>
      prev.map((c) => (c.id === Number(containerId) ? updatedContainer : c))
    );

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
            completed: updatedContainer.completed || false,
          });
        });
      }

      const btn = document.getElementById("save-btn");
      if (btn) {
        btn.classList.add("bg-green-500/20", "text-green-500");
        setTimeout(
          () => btn.classList.remove("bg-green-500/20", "text-green-500"),
          2000
        );
      }
      toast.success("Plan updated successfully!");
    } catch (error) {
      console.error("Firebase sync failed:", error);
      toast.error("Failed to sync with cloud");
    }
  };

  if (!task) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl text-muted-foreground">Task not found.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Button>
        </Link>
      </div>
    );
  }

  const deadlineLabel = task.deadline
    ? format(new Date(task.deadline), "PPP")
    : "No Deadline";

  // Progress bar: % of time elapsed from creation → deadline
  let progressPct = 0;
  if (task.deadline) {
    const created = new Date(task.createedAt).getTime();
    const deadline = new Date(task.deadline).getTime();
    const now = Date.now();
    progressPct = Math.min(
      100,
      Math.max(0, Math.round(((now - created) / (deadline - created)) * 100))
    );
  }

  return (
    <div className="min-h-screen w-full p-6 md:p-10 flex flex-col gap-4">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link to={`/`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {containerName}
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground truncate max-w-xs">
          {task.LongTodoName}
        </span>
      </div>

      {/* Title + status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {task.completed ? (
            <CheckCircle2 className="h-7 w-7 text-green-500 shrink-0" />
          ) : (
            <Circle className="h-7 w-7 text-muted-foreground shrink-0" />
          )}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {task.LongTodoName}
          </h1>
        </div>
        <p className="text-muted-foreground ml-10">
          {task.completed ? "Completed" : "In progress"}
        </p>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-3 ml-1">
        <MetaChip
          icon={<Calendar className="h-4 w-4" />}
          label="Deadline"
          value={deadlineLabel}
          highlight={!task.deadline}
        />
        {task.tag && (
          <MetaChip
            icon={<Tag className="h-4 w-4" />}
            label="Tag"
            value={task.tag}
          />
        )}
        {task.milestone && (
          <MetaChip
            icon={<Milestone className="h-4 w-4" />}
            label="Milestone"
            value={task.milestone}
          />
        )}
        <MetaChip
          icon={<Calendar className="h-4 w-4" />}
          label="Created"
          value={format(new Date(task.createedAt), "PPP")}
        />
      </div>

      {/* Progress bar (only when deadline is set) */}
      {task.deadline && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Time elapsed</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPct >= 80
                  ? "bg-red-500"
                  : progressPct >= 50
                  ? "bg-orange-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Spatial Planning Canvas */}
      <div className="flex flex-col gap-4 mt-8 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            <Layers className="h-4 w-4" />
            Spatial Planning Canvas
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => addBlock()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Plus size={14} /> New Node
            </button>
            <button
              id="save-btn"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="relative w-full rounded-[1.5rem] overflow-hidden border border-white/10 group/canvas shadow-xl flex-1 min-h-[500px] bg-[#020202]"
          onClick={() => setActiveId(null)}
        >
          {/* Background Aesthetic */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
            style={{ backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
          />

          <div className="w-full h-full">
            <Editor 
              value={text} 
              onTextChange={(e) => setText(e.htmlValue || "")} 
              style={{ height: '100vh' }} 
            />
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
        </div>
      </div>

     
    </div>
  );
};

/* ── Helper ── */
const MetaChip = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
      highlight ? "border-muted-foreground/40 text-muted-foreground italic" : ""
    }`}
  >
    {icon}
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default LongTaskDetail;
