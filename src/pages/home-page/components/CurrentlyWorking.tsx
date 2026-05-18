import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LongTaskUi from "./todo-related/long-todo/LongTaskUi";
import ShortTaskUi from "./todo-related/short-todo/ShortTaskUi";

import { useAtom } from "jotai";
import { 
  LongTodoContainerAtom, 
  LongTodoContainer, 
  LongTodoJ,
  shortTodoContainerAtom,
  ShortTodoContainer,
  ShortTodoJ
} from "@/state/state";
import { db, auth } from "@/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function CurrentlyWorking() {
  const [longTodoArray, setLongTodoArray] = useAtom(LongTodoContainerAtom);
  const [shortTodoArray, setShortTodoArray] = useAtom(shortTodoContainerAtom);

  const syncLongWithFirebase = async (updatedContainer: LongTodoContainer) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !updatedContainer) return;
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
          });
        });
      }
    } catch (error) {
      console.error("Firebase sync failed:", error);
    }
  };

  const syncShortWithFirebase = async (updatedContainer: ShortTodoContainer) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !updatedContainer) return;
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
          });
        });
      }
    } catch (error) {
      console.error("Firebase sync failed:", error);
    }
  };

  const handleUpdateLongTask = async (containerId: number, taskId: number, updates: Partial<LongTodoJ>) => {
    let containerToSync: LongTodoContainer | null = null;
    setLongTodoArray((prev) =>
      prev.map((c) => {
        if (c.id === containerId) {
          containerToSync = {
            ...c,
            LongTodo: c.LongTodo.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          };
          return containerToSync;
        }
        return c;
      })
    );
    if (containerToSync) await syncLongWithFirebase(containerToSync);
  };

  const handleUpdateShortTask = async (containerId: number, taskId: number, updates: Partial<ShortTodoJ>) => {
    let containerToSync: ShortTodoContainer | null = null;
    setShortTodoArray((prev) =>
      prev.map((c) => {
        if (c.id === containerId) {
          containerToSync = {
            ...c,
            shortTodos: c.shortTodos.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          };
          return containerToSync;
        }
        return c;
      })
    );
    if (containerToSync) await syncShortWithFirebase(containerToSync);
  };

  const handleDeleteShortTask = async (containerId: number, taskId: number) => {
    let containerToSync: ShortTodoContainer | null = null;
    setShortTodoArray((prev) =>
      prev.map((c) => {
        if (c.id === containerId) {
          containerToSync = {
            ...c,
            shortTodos: c.shortTodos.filter((t) => t.id !== taskId),
          };
          return containerToSync;
        }
        return c;
      })
    );
    if (containerToSync) await syncShortWithFirebase(containerToSync);
  };

  const activeLongTasks = longTodoArray.flatMap(container => 
    container.LongTodo
      .filter(task => !task.completed && task.tag === "impUrg")
      .map(task => ({ task, containerId: container.id, type: "long" as const }))
  );

  const activeShortTasks = shortTodoArray.flatMap(container =>
    container.shortTodos
      .filter(task => !task.completed && task.status === "In Progress" && !(task as any).hidden)
      .map(task => ({ task, containerId: container.id, type: "short" as const }))
  );

  const hasTasks = activeLongTasks.length > 0 || activeShortTasks.length > 0;

  return (
    <Card className="w-[350px] m-5 h-min bg-black/20 backdrop-blur-md border-white/5">
      <CardHeader>
        <CardTitle className="text-white/90">Currently Working</CardTitle>
        <CardDescription className="text-white/40">
          Quick access to your active long-term goals
        </CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-custom overflow-y-auto max-h-[40vh] mb-3 px-4">
        {hasTasks ? (
          <div className="space-y-4">
            {activeLongTasks.length > 0 && (
              <div>
                {/* <h4 className="text-xs font-semibold text-white/30 uppercase mb-2">Long-Term (Important & Urgent)</h4> */}
                {activeLongTasks.map(({ task, containerId }) => (
                  <LongTaskUi 
                    key={`long-${task.id}`} 
                    long={task} 
                    containerId={containerId} 
                    onDelete={(id) => handleUpdateLongTask(containerId, id, { completed: true })} 
                    onRename={(id, name) => handleUpdateLongTask(containerId, id, { LongTodoName: name })}
                    onToggleComplete={(id) => handleUpdateLongTask(containerId, id, { completed: !task.completed })}
                  />
                ))}
              </div>
            )}
            
            {activeShortTasks.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-primary/60 tracking-widest uppercase mb-2 mt-4 px-1">In Progress Tasks</h4>
                {activeShortTasks.map(({ task, containerId }) => (
                  <ShortTaskUi
                    key={`short-${task.id}`}
                    taskId={task.id}
                    isChecked={task.completed}
                    isEditable={false}
                    task_name={task.shortTodoName}
                    description={task.description}
                    status={task.status}
                    isHidden={(task as any).hidden ?? false}
                    onDelete={(id) => handleDeleteShortTask(containerId, id)}
                    onToggleHide={(id) => handleUpdateShortTask(containerId, id, { hidden: true })}
                    onRename={(id, name) => handleUpdateShortTask(containerId, id, { shortTodoName: name })}
                    onToggleComplete={(id) => handleUpdateShortTask(containerId, id, { 
                      completed: !task.completed, 
                      status: !task.completed ? "Done" : "Pending" 
                    })}
                    onUpdate={(id, updates) => handleUpdateShortTask(containerId, id, updates)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-white/10 text-sm font-medium italic">
            No active goals found.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/5 pt-4">
        <Button variant="ghost" className="text-white/40 hover:text-white" size="sm">View All</Button>
        <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">Manage Projects</Button>
      </CardFooter>
    </Card>
  );
}
