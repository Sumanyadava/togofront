import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { 
  notesAtom, 
  categoriesAtom, 
  shortTodoContainerAtom, 
  LongTodoContainerAtom, 
  ResearchNote, 
  Category, 
  ShortTodoJ, 
  ShortTodoContainer 
} from "@/state/state";
import { auth, db } from "@/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { Editor, EditorTextChangeEvent } from "primereact/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Settings, 
  FileText, 
  Trash2, 
  Share2, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  Circle, 
  Layers, 
  X,
  FolderKanban,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  Sparkles,
  Milestone
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_PRESETS = [
  { name: "Emerald", class: "bg-emerald-500", text: "text-emerald-400" },
  { name: "Violet", class: "bg-purple-500", text: "text-purple-400" },
  { name: "Cyan", class: "bg-cyan-500", text: "text-cyan-400" },
  { name: "Rose", class: "bg-rose-500", text: "text-rose-400" },
  { name: "Amber", class: "bg-amber-500", text: "text-amber-400" },
  { name: "Indigo", class: "bg-indigo-500", text: "text-indigo-400" },
  { name: "Zinc", class: "bg-zinc-500", text: "text-zinc-400" },
];

export const StartWritingPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [notes, setNotes] = useAtom(notesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [shortContainers, setShortContainers] = useAtom(shortTodoContainerAtom);
  const [longContainers] = useAtom(LongTodoContainerAtom);

  // Active Note State
  const [activeNoteId, setActiveNoteId] = useState<string>(id || `note_${Date.now()}`);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("random");
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<string>("");
  const [tag, setTag] = useState<string>("nonImpUrg");
  const [containerId, setContainerId] = useState<number | null>(null);
  const [shortContainerId, setShortContainerId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Milestone Lifecycle
  const [isPlanOfAction, setIsPlanOfAction] = useState<boolean>(false);
  const [showConvertDialog, setShowConvertDialog] = useState<boolean>(false);
  const [isMilestonePopoverOpen, setIsMilestonePopoverOpen] = useState<boolean>(false);
  const [newTodoText, setNewTodoText] = useState("");

  // Settings Sheet & Category Dialog
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColorPreset, setSelectedColorPreset] = useState(COLOR_PRESETS[0].class);

  // Note Switcher & Wikilink states
  const [noteSwitcherOpen, setNoteSwitcherOpen] = useState(false);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [showWikilinkPopover, setShowWikilinkPopover] = useState(false);
  const [wikilinkQuery, setWikilinkQuery] = useState("");

  // Load existing note or initialize new note
  useEffect(() => {
    if (id) {
      const existing = notes.find((n) => n.id === id);
      if (existing) {
        setActiveNoteId(existing.id);
        setTitle(existing.title || "");
        setContent(existing.content || "");
        setCategoryId(existing.categoryId || "random");
        setLinkedNoteIds(existing.linkedNoteIds || []);
        setDeadline(existing.deadline ? new Date(existing.deadline).toISOString().split("T")[0] : "");
        setTag(existing.tag || "nonImpUrg");
        setContainerId(existing.containerId || null);
        setShortContainerId(existing.shortContainerId || null);
        setIsPlanOfAction(existing.type === "plan_of_action" || (existing.linkedMilestoneIds && existing.linkedMilestoneIds.length > 0));
        return;
      }
    }

    // Try draft from localStorage
    const savedDraft = localStorage.getItem("togo_active_draft");
    if (savedDraft && !id) {
      try {
        const parsed = JSON.parse(savedDraft);
        setActiveNoteId(parsed.id || `note_${Date.now()}`);
        setTitle(parsed.title || "");
        setContent(parsed.content || "");
        setCategoryId(parsed.categoryId || "random");
        setLinkedNoteIds(parsed.linkedNoteIds || []);
        setDeadline(parsed.deadline || "");
        setTag(parsed.tag || "nonImpUrg");
        setContainerId(parsed.containerId || null);
        setShortContainerId(parsed.shortContainerId || null);
        setIsPlanOfAction(parsed.isPlanOfAction || false);
      } catch (err) {
        console.error("Failed to parse draft", err);
      }
    } else if (!id) {
      const newId = `note_${Date.now()}`;
      setActiveNoteId(newId);
      setTitle("");
      setContent("");
      setCategoryId("random");
      setLinkedNoteIds([]);
      setDeadline("");
      setTag("nonImpUrg");
      setContainerId(null);
      setShortContainerId(null);
      setIsPlanOfAction(false);
    }
  }, [id, notes]);

  // Derived note milestones / todos from shortContainers
  const currentTodos: ShortTodoJ[] = useMemo(() => {
    if (!shortContainerId) {
      const all: ShortTodoJ[] = [];
      shortContainers.forEach((c) => {
        c.shortTodos?.forEach((todo) => {
          if (todo.parentNoteId === activeNoteId) {
            all.push(todo);
          }
        });
      });
      return all;
    }
    const target = shortContainers.find((c) => c.id === shortContainerId);
    return target?.shortTodos || [];
  }, [shortContainers, shortContainerId, activeNoteId]);

  const noteType = isPlanOfAction ? "plan_of_action" : "research";

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = {
      id: activeNoteId,
      title,
      content,
      categoryId,
      linkedNoteIds,
      deadline,
      tag,
      containerId,
      shortContainerId,
      isPlanOfAction,
    };
    localStorage.setItem("togo_active_draft", JSON.stringify(draft));
  }, [activeNoteId, title, content, categoryId, linkedNoteIds, deadline, tag, containerId, shortContainerId, isPlanOfAction]);

  // Manual save to Firestore only when user clicks Save button
  const saveNoteToFirestore = useCallback(async (showToast = true) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setIsSaving(true);
    const updatedNote: ResearchNote = {
      id: activeNoteId,
      title: title || "Untitled Note",
      content,
      categoryId,
      type: noteType,
      linkedMilestoneIds: currentTodos.map((m) => m.id),
      linkedNoteIds,
      deadline: deadline ? new Date(deadline) : null,
      tag,
      containerId,
      shortContainerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await setDoc(doc(db, `users/${userId}/notes`, activeNoteId), {
        ...updatedNote,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === activeNoteId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedNote;
          return next;
        }
        return [updatedNote, ...prev];
      });

      setLastSaved(new Date());
      if (showToast) toast.success("Saved");
    } catch (err) {
      console.error("Failed to save note:", err);
      if (showToast) toast.error("Could not sync note");
    } finally {
      setIsSaving(false);
    }
  }, [activeNoteId, title, content, categoryId, noteType, currentTodos, linkedNoteIds, deadline, tag, containerId, shortContainerId, setNotes]);

  // Sync / create Home Page ShortTodoContainer for milestones
  const syncTodosToContainer = async (todos: ShortTodoJ[], newContainerTitle?: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    let targetContainerId = shortContainerId;
    const targetContainer = shortContainers.find((c) => c.id === targetContainerId);

    if (!targetContainer) {
      targetContainerId = Date.now();
      const newContainer: ShortTodoContainer = {
        id: targetContainerId,
        shortContainername: `🎯 ${newContainerTitle || title || "Plan of Action"}`,
        shortTodos: todos,
        completed: false,
        hidden: false,
        createdAt: new Date(),
        Notes: `Auto-generated milestones for Note: ${title || "Untitled"}`,
      };

      setShortContainers((prev) => [newContainer, ...prev]);
      setShortContainerId(targetContainerId);

      try {
        await setDoc(doc(db, `users/${userId}/shortTodoContainers`, `container_${targetContainerId}`), newContainer);
      } catch (err) {
        console.error("Failed to create short container:", err);
      }
    } else {
      const updatedContainer: ShortTodoContainer = {
        ...targetContainer,
        shortContainername: `🎯 ${title || targetContainer.shortContainername.replace("🎯 ", "")}`,
        shortTodos: todos,
      };

      setShortContainers((prev) =>
        prev.map((c) => (c.id === targetContainerId ? updatedContainer : c))
      );

      try {
        const q = query(
          collection(db, `users/${userId}/shortTodoContainers`),
          where("id", "==", targetContainerId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach((docSnap) => {
            updateDoc(doc(db, `users/${userId}/shortTodoContainers`, docSnap.id), {
              shortTodos: todos,
              shortContainername: updatedContainer.shortContainername,
            });
          });
        }
      } catch (err) {
        console.error("Failed to update short container:", err);
      }
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;

    const newTodo: ShortTodoJ = {
      id: Date.now(),
      shortTodoName: newTodoText.trim(),
      description: `Task for ${title || "Untitled Note"}`,
      completed: false,
      tag: "milestone",
      status: "pending",
      priority: "high",
      createdAt: new Date(),
      parentNoteId: activeNoteId,
      isMilestone: true,
    };

    const updated = [...currentTodos, newTodo];
    await syncTodosToContainer(updated, title);
    setNewTodoText("");
  };

  const handleToggleTodo = async (tId: number) => {
    const updated = currentTodos.map((t) =>
      t.id === tId ? { ...t, completed: !t.completed } : t
    );
    await syncTodosToContainer(updated);
  };

  const handleDeleteTodo = async (tId: number) => {
    const updated = currentTodos.filter((t) => t.id !== tId);
    await syncTodosToContainer(updated);
  };

  // Add custom category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const catId = newCategoryName.toLowerCase().replace(/\s+/g, "-");
    const newCat: Category = {
      id: catId,
      name: newCategoryName.trim(),
      color: selectedColorPreset,
      icon: "Tag",
      isDefault: false,
    };

    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    setCategoryId(catId);
    setIsCategoryModalOpen(false);
    setNewCategoryName("");

    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await setDoc(doc(db, `users/${userId}/categories`, catId), newCat);
        toast.success(`Category "${newCat.name}" added`);
      } catch (err) {
        console.error("Failed to persist category", err);
      }
    }
  };

  // Link note
  const handleToggleLinkNote = (otherId: string) => {
    if (otherId === activeNoteId) return;
    setLinkedNoteIds((prev) =>
      prev.includes(otherId) ? prev.filter((i) => i !== otherId) : [...prev, otherId]
    );
  };

  // Wikilink autocomplete in editor
  const handleEditorChange = (e: EditorTextChangeEvent) => {
    const val = e.htmlValue || "";
    setContent(val);

    const textVal = e.textValue || "";
    const lastBracketIndex = textVal.lastIndexOf("[[");
    if (lastBracketIndex !== -1 && textVal.indexOf("]]", lastBracketIndex) === -1) {
      const queryStr = textVal.substring(lastBracketIndex + 2);
      setWikilinkQuery(queryStr);
      setShowWikilinkPopover(true);
    } else {
      setShowWikilinkPopover(false);
    }
  };

  const handleSelectWikilinkNote = (noteToLink: ResearchNote) => {
    if (!linkedNoteIds.includes(noteToLink.id)) {
      setLinkedNoteIds((prev) => [...prev, noteToLink.id]);
    }
    setContent((prev) => `${prev} <span class="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono text-sm">[[${noteToLink.title}]]</span> `);
    setShowWikilinkPopover(false);
    toast.success(`Linked [[${noteToLink.title}]]`);
  };

  const handleMilestoneButtonClick = () => {
    if (!isPlanOfAction) {
      setShowConvertDialog(true);
    } else {
      setIsMilestonePopoverOpen((prev) => !prev);
    }
  };

  const completedCount = currentTodos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen w-full p-6 md:p-10 flex flex-col gap-4 bg-[#090a0f] text-zinc-100 selection:bg-purple-500/30">
      {/* Top Header / Breadcrumbs & Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Back Link & Note Switcher */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Home
          </Button>
          <span className="text-zinc-600">/</span>

          <Popover open={noteSwitcherOpen} onOpenChange={setNoteSwitcherOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium text-zinc-200">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span className="max-w-[160px] truncate">{title || "Untitled Note"}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2 bg-[#12131a] border-white/10 shadow-2xl rounded-2xl text-zinc-200" align="start">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Your Notes</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNoteSwitcherOpen(false);
                    navigate("/startwriting");
                  }}
                  className="h-6 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" /> New Note
                </Button>
              </div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-zinc-500" />
                <Input
                  placeholder="Search notes..."
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  className="pl-7 h-7 text-xs bg-black/40 border-white/10"
                />
              </div>
              <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                {notes
                  .filter((n) => n.title.toLowerCase().includes(noteSearchQuery.toLowerCase()))
                  .map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNoteSwitcherOpen(false);
                        navigate(`/startwriting/${n.id}`);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        n.id === activeNoteId ? "bg-purple-500/20 text-purple-300" : "hover:bg-white/5 text-zinc-400"
                      }`}
                    >
                      <span className="truncate">{n.title || "Untitled Note"}</span>
                    </button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          {lastSaved && (
            <span className="text-[11px] text-zinc-600 ml-1 hidden sm:inline">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Right Actions: Small Milestone Button in Top Bar + Graph + Settings + Save */}
        <div className="flex items-center gap-2">
          {/* Milestone Small Button with Popover */}
          <Popover open={isMilestonePopoverOpen && isPlanOfAction} onOpenChange={setIsMilestonePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMilestoneButtonClick}
                className={`h-8 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
                  isPlanOfAction
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Milestone className="w-3.5 h-3.5" />
                <span>Milestone</span>
                {isPlanOfAction && currentTodos.length > 0 && (
                  <Badge variant="outline" className="ml-0.5 text-[10px] px-1 py-0 border-emerald-500/40 text-emerald-400">
                    {completedCount}/{currentTodos.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            {/* Milestone Popover Content (Opens on top without taking screen space) */}
            <PopoverContent className="w-80 md:w-96 p-4 bg-[#12131d] border-white/10 shadow-2xl rounded-2xl text-zinc-200" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200">Action Milestones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentTodos.length > 0 && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {Math.round((completedCount / currentTodos.length) * 100)}% Done
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setIsPlanOfAction(false);
                        setIsMilestonePopoverOpen(false);
                        toast.info("Reverted back to Research mode");
                      }}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Quick Add Todo */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTodo();
                    }}
                    placeholder="Add milestone task..."
                    className="h-8 text-xs bg-black/40 border-white/10 text-zinc-200"
                  />
                  <Button
                    onClick={handleAddTodo}
                    size="sm"
                    className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Items list */}
                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 pt-1">
                  {currentTodos.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`group flex items-center justify-between p-2 rounded-xl border transition-all ${
                        item.completed
                          ? "bg-white/[0.01] border-white/5 opacity-50"
                          : "bg-white/[0.03] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div
                        onClick={() => handleToggleTodo(item.id)}
                        className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            item.completed ? "line-through text-zinc-500" : "text-zinc-200"
                          }`}
                        >
                          {item.shortTodoName || `Task ${idx + 1}`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteTodo(item.id)}
                        className="text-zinc-600 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {currentTodos.length === 0 && (
                    <p className="text-center text-xs text-zinc-600 py-3">No milestones added yet.</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Obsidian Graph Shortcut */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/graph")}
            title="Obsidian Graph View"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          {/* Note Settings Sheet Trigger */}
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Note Settings & Organization"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#101118] border-white/10 text-zinc-200 w-full sm:max-w-md overflow-y-auto custom-scrollbar">
              <SheetHeader className="pb-4 border-b border-white/10">
                <SheetTitle className="text-zinc-100 flex items-center gap-2 text-base">
                  <Settings className="w-4 h-4 text-purple-400" /> Note Settings
                </SheetTitle>
              </SheetHeader>

              <div className="py-5 space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Category
                    </label>
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          categoryId === cat.id
                            ? "bg-white/15 border-white/30 text-white"
                            : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cat.color || "bg-zinc-500"}`} />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Long Container Assignment */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-amber-400" /> File to Long Task Container
                  </label>
                  <select
                    value={containerId || ""}
                    onChange={(e) => setContainerId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">(No Container Assigned)</option>
                    {longContainers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.LongContainerName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Matrix Tag */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-cyan-400" /> Priority Quadrant
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "impUrg", label: "Urgent & Important", color: "border-red-500/40 text-red-400 bg-red-500/10" },
                      { id: "impNonUrg", label: "Important, Not Urgent", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
                      { id: "nonImpUrg", label: "Urgent, Not Important", color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
                      { id: "NonImpNonUrg", label: "Neither", color: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setTag(p.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                          tag === p.id ? p.color : "border-white/10 text-zinc-400 hover:bg-white/5"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-400" /> Target Deadline
                  </label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-black/40 border-white/10 text-zinc-200 text-xs h-9"
                  />
                </div>

                {/* Connected Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> Connect Other Notes
                  </label>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                    {notes
                      .filter((n) => n.id !== activeNoteId)
                      .map((n) => {
                        const isLinked = linkedNoteIds.includes(n.id);
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleToggleLinkNote(n.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                              isLinked ? "bg-purple-500/20 text-purple-300" : "hover:bg-white/5 text-zinc-400"
                            }`}
                          >
                            <span className="truncate">{n.title || "Untitled"}</span>
                            {isLinked && <Check className="w-3 h-3 text-purple-400" />}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    saveNoteToFirestore(true);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs h-9"
                >
                  Save Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={() => saveNoteToFirestore(true)}
            disabled={isSaving}
            className="h-8 px-4 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Title Input (styled exactly like Long Task) */}
      <div className="flex flex-col gap-2 mt-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent text-4xl md:text-6xl font-bold tracking-tight text-white placeholder-zinc-700 focus:outline-none border-b border-transparent focus:border-white/10 pb-2 transition-all"
        />
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-mono px-2 py-0.5 border ${
              isPlanOfAction
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                : "border-purple-500/40 text-purple-400 bg-purple-500/10"
            }`}
          >
            {isPlanOfAction ? "Plan of Action 🎯" : "Research Note 🧪"}
          </Badge>
          {isPlanOfAction && currentTodos.length > 0 && (
            <span className="text-xs text-zinc-500">
              {completedCount} of {currentTodos.length} milestones complete
            </span>
          )}
        </div>
      </div>

      {/* Full-width Editor Canvas (styled cleanly just like Long Task) */}
      <div className="relative w-full rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl flex-1 min-h-[550px] bg-[#020202] mt-2">
        {/* Background Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
        />

        {/* [[ Wikilink Autocomplete Popover */}
        <AnimatePresence>
          {showWikilinkPopover && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-6 top-16 z-50 w-72 bg-[#12131d] border border-purple-500/40 rounded-xl p-2 shadow-2xl text-zinc-200"
            >
              <div className="text-[11px] font-semibold text-purple-400 pb-1 mb-1 border-b border-white/10 flex items-center justify-between">
                <span>Link to: "[[{wikilinkQuery}"</span>
                <X className="w-3 h-3 cursor-pointer text-zinc-400" onClick={() => setShowWikilinkPopover(false)} />
              </div>
              <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-1">
                {notes
                  .filter((n) => n.id !== activeNoteId && n.title.toLowerCase().includes(wikilinkQuery.toLowerCase()))
                  .map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleSelectWikilinkNote(n)}
                      className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-purple-500/20 text-zinc-300 hover:text-purple-300 transition-all truncate"
                    >
                      📄 {n.title || "Untitled"}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full h-full p-2">
          <Editor
            value={content}
            onTextChange={handleEditorChange}
            placeholder="Start writing..."
            style={{ height: "calc(100vh - 280px)" }}
            className="text-zinc-200 bg-transparent"
          />
        </div>
      </div>

      {/* Convert into Plan of Action Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="bg-[#12131d] border-white/10 text-zinc-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Convert into a Plan of Action?
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Do you want to convert this research note into an actionable <strong>Plan of Action</strong>?
            </p>
            <ul className="text-xs text-zinc-400 space-y-1.5 pl-4 list-disc">
              <li>Attaches milestones that you can access right from the top bar.</li>
              <li>Syncs your milestone checklist with the Togo Home Page.</li>
              <li>Highlights this note with a green action aura in your Obsidian Graph View.</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowConvertDialog(false)}
              className="text-zinc-400 hover:text-white text-xs h-9"
            >
              Keep as Research
            </Button>
            <Button
              onClick={() => {
                setIsPlanOfAction(true);
                setShowConvertDialog(false);
                setIsMilestonePopoverOpen(true);
                toast.success("Converted to Plan of Action! 🎯");
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs h-9 px-4 shadow-lg shadow-emerald-600/20"
            >
              Yes, Convert to Plan 🎯
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="bg-[#12131d] border-white/10 text-zinc-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" /> Create Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Name
              </label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Design, Crypto..."
                className="bg-black/40 border-white/10 text-zinc-200 text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Color Accent
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedColorPreset(preset.class)}
                    className={`w-6 h-6 rounded-full ${preset.class} flex items-center justify-center transition-all ${
                      selectedColorPreset === preset.class ? "ring-2 ring-white ring-offset-2 ring-offset-[#12131d] scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {selectedColorPreset === preset.class && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCategoryModalOpen(false)}
              className="text-zinc-400 hover:text-white text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs h-8"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartWritingPage;
