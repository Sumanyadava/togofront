import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { 
  notesAtom, 
  categoriesAtom, 
  shortTodoContainerAtom, 
  ResearchNote, 
  Category, 
  ShortTodoJ 
} from "@/state/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  ArrowLeft, 
  Search, 
  Maximize2, 
  Play, 
  Pause, 
  PenTool, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Layers, 
  Filter
} from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  val: number; // size
  color: string;
  type: "category" | "research" | "plan_of_action" | "milestone";
  rawNote?: ResearchNote;
  rawCategory?: Category;
  rawMilestone?: ShortTodoJ;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  color?: string;
  width?: number;
}

const CATEGORY_COLOR_HEX: Record<string, string> = {
  random: "#71717a",
  finance: "#10b981",
  health: "#f43f5e",
};

export const GraphPage: React.FC = () => {
  const navigate = useNavigate();

  const [notes] = useAtom(notesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [shortContainers, setShortContainers] = useAtom(shortTodoContainerAtom);

  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // HUD & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showMilestones, setShowMilestones] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [isPhysicsPaused, setIsPhysicsPaused] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Hover & Selection state
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [peekNode, setPeekNode] = useState<GraphNode | null>(null);
  const [isPeekOpen, setIsPeekOpen] = useState(false);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build Graph Data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    // 1. Category Hub Nodes
    categories.forEach((cat) => {
      if (selectedCategoryFilter && selectedCategoryFilter !== cat.id) return;
      const catNodeId = `cat_${cat.id}`;
      nodes.push({
        id: catNodeId,
        name: cat.name,
        val: 18,
        color: CATEGORY_COLOR_HEX[cat.id] || "#8b5cf6",
        type: "category",
        rawCategory: cat,
      });
      nodeIds.add(catNodeId);
    });

    // 2. Note Nodes & Links
    notes.forEach((note) => {
      if (selectedCategoryFilter && note.categoryId !== selectedCategoryFilter) return;

      const isAction = note.type === "plan_of_action" || (note.linkedMilestoneIds && note.linkedMilestoneIds.length > 0);
      const degree = (note.linkedNoteIds?.length || 0) + (note.linkedMilestoneIds?.length || 0) + 1;

      nodes.push({
        id: note.id,
        name: note.title || "Untitled Note",
        val: Math.min(6 + degree * 2, 22),
        color: isAction ? "#10b981" : "#a855f7",
        type: isAction ? "plan_of_action" : "research",
        rawNote: note,
      });
      nodeIds.add(note.id);

      // Link to Category Hub
      const catNodeId = `cat_${note.categoryId || "random"}`;
      if (nodeIds.has(catNodeId)) {
        links.push({
          source: catNodeId,
          target: note.id,
          color: "rgba(255, 255, 255, 0.12)",
          width: 1,
        });
      }

      // Link to other Notes (Wikilinks / Linked Notes)
      if (note.linkedNoteIds && note.linkedNoteIds.length > 0) {
        note.linkedNoteIds.forEach((targetNoteId) => {
          links.push({
            source: note.id,
            target: targetNoteId,
            color: "rgba(168, 85, 247, 0.35)",
            width: 1.8,
          });
        });
      }

      // 3. Milestone Nodes (if enabled)
      if (showMilestones) {
        // Collect milestones from shortContainers
        const targetContainer = shortContainers.find((c) => c.id === note.shortContainerId);
        const milestones = targetContainer?.shortTodos || [];

        milestones.forEach((m) => {
          const mNodeId = `milestone_${m.id}`;
          if (!nodeIds.has(mNodeId)) {
            nodes.push({
              id: mNodeId,
              name: m.shortTodoName,
              val: 4,
              color: m.completed ? "#34d399" : "#f59e0b",
              type: "milestone",
              rawMilestone: m,
              rawNote: note,
            });
            nodeIds.add(mNodeId);
          }

          links.push({
            source: note.id,
            target: mNodeId,
            color: "rgba(245, 158, 11, 0.25)",
            width: 1,
          });
        });
      }
    });

    // Filter out dead links where source or target doesn't exist
    const validLinks = links.filter((l) => {
      const s = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
      const t = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    return { nodes, links: validLinks };
  }, [notes, categories, shortContainers, selectedCategoryFilter, showMilestones]);

  // Highlight Neighborhood Set
  const highlightNodes = useMemo(() => {
    const set = new Set<string>();
    if (!hoveredNode) return set;
    set.add(hoveredNode.id);

    graphData.links.forEach((link) => {
      const sId = typeof link.source === "object" ? (link.source as GraphNode).id : link.source;
      const tId = typeof link.target === "object" ? (link.target as GraphNode).id : link.target;

      if (sId === hoveredNode.id) set.add(tId);
      if (tId === hoveredNode.id) set.add(sId);
    });
    return set;
  }, [hoveredNode, graphData]);

  // Click & Double-click handling
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (clickTimeoutRef.current) {
      // Double click detected!
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      if (node.type === "research" || node.type === "plan_of_action") {
        navigate(`/startwriting/${node.id}`);
      } else if (node.type === "milestone" && node.rawNote) {
        navigate(`/startwriting/${node.rawNote.id}`);
      }
      return;
    }

    // Single click: open Quick Peek drawer
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      setPeekNode(node);
      setIsPeekOpen(true);
      if (fgRef.current && node.x !== undefined && node.y !== undefined) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(1.8, 800);
      }
    }, 280);
  }, [navigate]);

  // Search Filter Camera Focus
  useEffect(() => {
    if (!searchQuery.trim() || !fgRef.current) return;
    const match = graphData.nodes.find((n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match && match.x !== undefined && match.y !== undefined) {
      fgRef.current.centerAt(match.x, match.y, 800);
      fgRef.current.zoom(2.2, 800);
    }
  }, [searchQuery, graphData.nodes]);

  // Custom Canvas Node Renderer for Obsidian Aesthetics
  const drawNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const { x, y, val, color, type, name } = node;
      if (x === undefined || y === undefined) return;

      const isHovered = hoveredNode?.id === node.id;
      const isNeighbor = highlightNodes.has(node.id);
      const isDimmed = hoveredNode && !isHovered && !isNeighbor;

      ctx.save();
      ctx.globalAlpha = isDimmed ? 0.2 : 1;

      // Glow effect for hubs and active nodes
      if (isHovered || type === "category") {
        ctx.shadowColor = color;
        ctx.shadowBlur = isHovered ? 25 : 12;
      }

      // Draw Main Node Circle
      ctx.beginPath();
      ctx.arc(x, y, val, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // Border Ring for Plan of Action & Category
      if (type === "plan_of_action") {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#34d399";
        ctx.stroke();
      } else if (type === "category") {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();
      }

      // Node Label (rendered when zoomed in or on hover/category)
      const shouldDrawLabel = isHovered || isNeighbor || globalScale > 1.2 || type === "category";
      if (shouldDrawLabel) {
        const fontSize = Math.max(10 / globalScale, type === "category" ? 5 : 3.5);
        ctx.font = `${type === "category" ? "bold " : ""}${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.85)";

        // Offset text slightly below circle
        ctx.fillText(name, x, y + val + fontSize + 2);
      }

      ctx.restore();
    },
    [hoveredNode, highlightNodes]
  );

  // Toggle milestone completion in Peek drawer
  const handleTogglePeekMilestone = (mId: number) => {
    setShortContainers((prev) =>
      prev.map((c) => ({
        ...c,
        shortTodos: c.shortTodos.map((m) => (m.id === mId ? { ...m, completed: !m.completed } : m)),
      }))
    );
  };

  return (
    <div className="relative w-screen h-screen bg-[#07080c] overflow-hidden select-none text-zinc-200">
      {/* Top Floating Glass HUD */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-4 pointer-events-none">
        {/* Left: Back + Title + Stats */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white rounded-2xl h-10 w-10 shadow-2xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
            <span className="font-bold tracking-wider text-xs uppercase text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Obsidian Graph
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {graphData.nodes.length} nodes · {graphData.links.length} connections
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="pointer-events-auto w-72 md:w-96 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph by title or keyword..."
              className="pl-10 h-10 bg-black/60 backdrop-blur-xl border-white/10 rounded-2xl text-xs text-zinc-200 shadow-2xl focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Right Controls: Filter + Physics + Write Shortcut */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMilestones(!showMilestones)}
            className={`h-10 px-3 rounded-2xl text-xs backdrop-blur-xl border border-white/10 shadow-2xl transition-all ${
              showMilestones ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-black/60 text-zinc-400"
            }`}
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Milestones
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (fgRef.current) fgRef.current.zoomToFit(600, 40);
            }}
            title="Reset Camera Zoom"
            className="bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-zinc-300 rounded-2xl h-10 w-10 shadow-2xl"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (fgRef.current) {
                if (isPhysicsPaused) {
                  fgRef.current.resumeAnimation();
                } else {
                  fgRef.current.pauseAnimation();
                }
                setIsPhysicsPaused(!isPhysicsPaused);
              }
            }}
            title={isPhysicsPaused ? "Resume Physics" : "Pause Physics"}
            className="bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-zinc-300 rounded-2xl h-10 w-10 shadow-2xl"
          >
            {isPhysicsPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-zinc-400" />}
          </Button>

          <Button
            onClick={() => navigate("/startwriting")}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs h-10 px-4 shadow-xl shadow-purple-600/20"
          >
            <PenTool className="w-3.5 h-3.5 mr-1.5" /> Quick Write
          </Button>
        </div>
      </header>

      {/* Category Filter Pills (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
        <button
          onClick={() => setSelectedCategoryFilter(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedCategoryFilter === null ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          All Hubs
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.id ? null : cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedCategoryFilter === cat.id ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${cat.color || "bg-zinc-500"}`} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Legend & Hint (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-30 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl text-[11px] text-zinc-400 flex items-center gap-4">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Research</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Plan of Action</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Milestone</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-500">1-Click: Peek · Double-Click: Open Note</span>
      </div>

      {/* 2D Physics Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#07080c"
          nodeCanvasObject={drawNode}
          nodeRelSize={4}
          linkWidth={(link) => link.width || 1}
          linkColor={(link) => link.color || "rgba(255, 255, 255, 0.15)"}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleSpeed={0.005}
          onNodeHover={(node) => setHoveredNode(node as GraphNode | null)}
          onNodeClick={(node) => handleNodeClick(node as GraphNode)}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={150}
        />
      </div>

      {/* Slide-over Quick Peek Drawer */}
      <Sheet open={isPeekOpen} onOpenChange={setIsPeekOpen}>
        <SheetContent className="bg-[#10111a] border-white/10 text-zinc-200 w-full sm:max-w-md overflow-y-auto custom-scrollbar">
          {peekNode && (
            <div className="space-y-6 pt-2">
              <SheetHeader className="pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                      peekNode.type === "plan_of_action"
                        ? "border-emerald-500/40 text-emerald-400"
                        : peekNode.type === "category"
                        ? "border-cyan-500/40 text-cyan-400"
                        : peekNode.type === "milestone"
                        ? "border-amber-500/40 text-amber-400"
                        : "border-purple-500/40 text-purple-400"
                    }`}
                  >
                    {peekNode.type.replace("_", " ")}
                  </Badge>

                  {(peekNode.type === "research" || peekNode.type === "plan_of_action") && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/startwriting/${peekNode.id}`)}
                      className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs h-8 px-3"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Note
                    </Button>
                  )}
                </div>

                <SheetTitle className="text-zinc-100 text-lg pt-2">
                  {peekNode.name}
                </SheetTitle>
              </SheetHeader>

              {/* Note Content Preview */}
              {peekNode.rawNote && (
                <div className="space-y-4">
                  <div 
                    className="prose prose-invert max-w-none text-xs text-zinc-300 bg-white/[0.02] p-4 rounded-2xl border border-white/5"
                    dangerouslySetInnerHTML={{ __html: peekNode.rawNote.content || "<p class='text-zinc-500'>Empty content</p>" }}
                  />

                  {/* Milestones attached */}
                  {peekNode.rawNote.shortContainerId && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" /> Milestones
                      </h4>
                      <div className="space-y-1.5">
                        {(
                          shortContainers.find((c) => c.id === peekNode.rawNote?.shortContainerId)?.shortTodos || []
                        ).map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleTogglePeekMilestone(m.id)}
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

                  {/* Connected Wikilinks */}
                  {peekNode.rawNote.linkedNoteIds && peekNode.rawNote.linkedNoteIds.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Connected Notes ({peekNode.rawNote.linkedNoteIds.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {peekNode.rawNote.linkedNoteIds.map((lId) => {
                          const target = notes.find((n) => n.id === lId);
                          return (
                            <button
                              key={lId}
                              onClick={() => {
                                setIsPeekOpen(false);
                                navigate(`/startwriting/${lId}`);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                            >
                              [[{target?.title || "Untitled"}]]
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Category Node Info */}
              {peekNode.rawCategory && (
                <div className="space-y-3 text-xs text-zinc-400">
                  <p>
                    Category Hub for <strong className="text-white">{peekNode.rawCategory.name}</strong>.
                  </p>
                  <p>
                    Contains {notes.filter((n) => n.categoryId === peekNode.rawCategory?.id).length} notes.
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GraphPage;
