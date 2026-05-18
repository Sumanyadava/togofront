// import React from "react";

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
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import TaskUi from "@/components/TodoRelated/ShortTaskUi";
// import LongTaskUi from "@/components/TodoRelated/LongTask/LongTaskUi";

import { useAtom } from "jotai";
import { LongTodoContainerAtom, LongTodoContainer, LongTodoJ } from "@/state/state";
import { db, auth } from "@/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";

export default function CurrentlyWorking() {
  const [longTodoArray, setLongTodoArray] = useAtom(LongTodoContainerAtom);

  const syncWithFirebase = async (updatedContainer: LongTodoContainer) => {
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

  const handleUpdateTask = async (containerId: number, taskId: number, updates: Partial<LongTodoJ>) => {
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
    if (containerToSync) await syncWithFirebase(containerToSync);
  };

  const activeTasks = longTodoArray.flatMap(container => 
    container.LongTodo
      .filter(task => !task.completed)
      .map(task => ({ task, containerId: container.id }))
  );

  return (
    <Card className="w-[350px] m-5 h-min bg-black/20 backdrop-blur-md border-white/5">
      <CardHeader>
        <CardTitle className="text-white/90">Currently Working</CardTitle>
        <CardDescription className="text-white/40">
          Quick access to your active long-term goals
        </CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-custom overflow-y-auto max-h-[40vh] mb-3 px-4">
        {activeTasks.length > 0 ? (
          activeTasks.map(({ task, containerId }) => (
            <LongTaskUi 
              key={task.id} 
              long={task} 
              containerId={containerId} 
              onDelete={(id) => handleUpdateTask(containerId, id, { completed: true })} // Simple delete for dashboard
              onRename={(id, name) => handleUpdateTask(containerId, id, { LongTodoName: name })}
              onToggleComplete={(id) => handleUpdateTask(containerId, id, { completed: !task.completed })}
            />
          ))
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
