import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import ShortTaskUi from "../ShortTaskUi";
import { ScanSearch, Trash2, Edit3, X, Check } from "lucide-react";
import { useAtom } from "jotai";
import { ShortAction } from "./ShortAction";
import { AnimatePresence, motion } from "framer-motion";
import { shortTodoContainerAtom, ShortTodoJ, ShortTodoContainer } from "@/state";
import { Link } from "react-router-dom";
//@ts-ignore
import {db, auth} from '../../../../firebase.js'
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
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
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
            className={`flex flex-col space-y-1.5 p-6 bg-gray-20 overflow-hidden transition-all duration-500 ease-in-out ${
              inputFocus ? "h-[150px]" : "h-[70px]"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="relative w-[80%]">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  className="peer flex h-10 w-full focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 
                  border-b border-transparent transition-all duration-500 ease-linear
                    focus:border-b-primary p-5 bg-inherit cursor-pointer font-bold text-lg"
                  placeholder={shortContainerName}
                  onFocus={() => setInputFocus(true)}
                  onBlur={() => setInputFocus(false)}
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 peer-focus:w-full"></div>
              </div>

              <div className="w-[10%] flex flex-col justify-start items-center gap-2">
                <Link to={`/shortList/${id}`}>
                  <ScanSearch className="text-white/40 hover:text-white transition-colors cursor-pointer" />
                </Link>
              </div>
            </div>
            <Button 
              onClick={handleShortAdd}
              className="mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-semibold"
            >
              Add Task
            </Button>
          </div>

























          <CardContent className="scrollbar-custom overflow-y-scroll h-[300px] p-4">
            <AnimatePresence initial={false}>
              {shortTaskS.map((e) => (
                <ShortTaskUi
                  key={e.id}
                  taskId={e.id}
                  isChecked={e.completed}
                  isEditable={false}
                  task_name={e.shortTodoName}
                  isHidden={(e as any).hidden ?? false}
                  onDelete={handleDelete}
                  onToggleHide={handleToggleHide}
                  onRename={handleRename}
                  onToggleComplete={handleToggleComplete}
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
