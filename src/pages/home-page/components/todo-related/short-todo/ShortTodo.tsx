import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShortTaskUi from "./ShortTaskUi";
import { ScanSearch, Trash2, Edit3, X, Check } from "lucide-react";
import { useAtom } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { shortTodoContainerAtom, ShortTodoJ, ShortTodoContainer } from "@/state/state";
import { Link } from "react-router-dom";
import {db, auth} from '@/firebase'
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import useLongPress from "@/hooks/useLongpress";



const ShortTodo: React.FC<{
  shortContainerName: string;
  shortTaskArray: ShortTodoJ[];
  id: number;
}> = ({ shortContainerName, id }) => {
  //full array
  const [shortTodoArray, setTodoArray] = useAtom(shortTodoContainerAtom);
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const [shortTaskS, setShortTaskS] = useState<ShortTodoJ[]>([]);
  const [showCardActions, setShowCardActions] = useState(false);
  const [isRenamingContainer, setIsRenamingContainer] = useState(false);
  const [newContainerName, setNewContainerName] = useState(shortContainerName);

  
  useEffect(() => {
    const shortTask = shortTodoArray.find(
      (taskContainer) => taskContainer.id === id
    );
    setShortTaskS(shortTask ? shortTask.shortTodos : []);
  }, [shortTodoArray, id]);


  const syncWithFirebase = async (updatedContainer: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(
        collection(db, `users/${userId}/shortTodoContainers`),
        where("id", "==", updatedContainer.id)
      );
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
      toast.error("Failed to sync with cloud");
    }
  };


  const updateContainer = (updater: (container: ShortTodoContainer) => ShortTodoContainer) => {
    setTodoArray((prev) =>
      prev.map((container) => {
        if (container.id === id) {
          const updatedContainer = updater(container);
          syncWithFirebase(updatedContainer);
          return updatedContainer;
        }
        return container;
      })
    );
  };

  const handleDelete = (taskId: number) => {
    updateContainer((container) => ({
      ...container,
      shortTodos: container.shortTodos.filter((t) => t.id !== taskId)
    }));
  };

  const handleToggleHide = (taskId: number) => {
    updateContainer((container) => ({
      ...container,
      shortTodos: container.shortTodos.map((t) => (t.id === taskId ? { ...t, hidden: !t.hidden } : t))
    }));
  };

  const handleRename = (taskId: number, newName: string) => {
    updateContainer((container) => ({
      ...container,
      shortTodos: container.shortTodos.map((t) =>
        t.id === taskId ? { ...t, shortTodoName: newName } : t
      )
    }));
  };

  const handleToggleComplete = (taskId: number) => {
    updateContainer((container) => ({
      ...container,
      shortTodos: container.shortTodos.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed, status: !t.completed ? "Done" : "Pending" } : t
      )
    }));
  };

  const handleUpdateTask = (taskId: number, updates: Partial<ShortTodoJ>) => {
    updateContainer((container) => ({
      ...container,
      shortTodos: container.shortTodos.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    }));
  };

  const handleDeleteContainer = async () => {
    // Check if all tasks are completed before allowing deletion
    const allCompleted = shortTaskS.length === 0 || shortTaskS.every(task => task.completed);
    
    if (!allCompleted) {
      toast.warning("Cannot delete list", {
        description: "Please complete all tasks in the list before deleting it.",
        style: {
          background: "rgba(234, 179, 8, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(234, 179, 8, 0.2)",
          color: "#fef08a"
        }
      });
      setShowCardActions(false);
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(
        collection(db, `users/${userId}/shortTodoContainers`),
        where("id", "==", id)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          deleteDoc(doc(db, `users/${userId}/shortTodoContainers`, docSnap.id));
        });
      }
      setTodoArray((prev) => prev.filter((c) => c.id !== id));
      toast.success("List deleted successfully");
    } catch (error) {
      toast.error("Failed to delete list");
    }
  };

  const handleRenameContainer = () => {
    if (newContainerName.trim() && newContainerName !== shortContainerName) {
      updateContainer((container) => ({
        ...container,
        shortContainername: newContainerName.trim()
      }));
      toast.success("List renamed!");
    }
    setIsRenamingContainer(false);
    setShowCardActions(false);
  };

  const handleShortAdd = () => {
    if (text.trim()) {
      const newTask: ShortTodoJ = {
        id: Date.now(),
        shortTodoName: text,
        description: description.trim() || undefined,
        completed: false,
        tag: "",
        status: "Pending", 
        priority: "Normal", 
        createdAt: new Date(),
      };

      updateContainer((container) => ({
        ...container,
        shortTodos: [...container.shortTodos, newTask]
      }));
      setText("");
      setDescription("");
    }
  };

  const cardLongPressRef = useLongPress<HTMLDivElement>(() => {
    setShowCardActions(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  }, () => {},3000);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          ref={cardLongPressRef}
          className="w-[350px] m-5 h-min relative overflow-hidden group/card border-white/5 bg-black/20 backdrop-blur-sm hover:border-white/10 transition-all duration-500"
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

          <div
            className={`flex flex-col space-y-2 p-5 transition-all duration-500 ease-in-out ${
              inputFocus ? "h-[260px]" : "h-[75px]"
            } cursor-pointer`}
            onClick={() => !inputFocus && setInputFocus(true)}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="relative flex-1 min-w-0">
                {!inputFocus ? (
                  <h3 className="font-bold text-xl text-white/90 truncate py-1">
                    {shortContainerName}
                  </h3>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-70">Task Title</span>
                      <input
                        autoFocus
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent border-b border-primary/30 focus:border-primary transition-colors py-1 focus:outline-none font-bold text-lg text-white placeholder:text-white/10"
                        placeholder="What needs doing?"
                        onKeyDown={(e) => e.key === "Enter" && handleShortAdd()}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Details</span>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add more context..."
                        className="w-full bg-white/5 rounded-lg p-3 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-primary/30 border border-white/5 min-h-[80px] resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Link to={`/shortList/${id}`} onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                    <ScanSearch size={18} className="text-white/20 group-hover:text-white transition-colors" />
                  </button>
                </Link>
                {inputFocus && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setInputFocus(false); }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <X size={18} className="text-white/20 group-hover:text-red-400 transition-colors" />
                  </button>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {inputFocus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Button 
                    onClick={handleShortAdd}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold py-5"
                  >
                    Create Task
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <CardContent className="scrollbar-custom overflow-y-scroll h-[300px] px-4">
            <AnimatePresence initial={false}>
              {shortTaskS.map((e) => (
                <ShortTaskUi
                  key={e.id}
                  taskId={e.id}
                  isChecked={e.completed}
                  isEditable={false}
                  task_name={e.shortTodoName}
                  description={e.description}
                  status={e.status}
                  isHidden={(e as any).hidden ?? false}
                  onDelete={handleDelete}
                  onToggleHide={handleToggleHide}
                  onRename={handleRename}
                  onToggleComplete={handleToggleComplete}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>


      </motion.div>
    </AnimatePresence>
  );
};

export default ShortTodo;
