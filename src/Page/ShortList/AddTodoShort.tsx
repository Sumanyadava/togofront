import * as React from "react";
import { Plus, CheckCircle, AlertCircle, Tag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { shortTodoContainerAtom, ShortTodoJ } from "@/state";
import { useAtom } from "jotai";

export default function AddTodoShort({ tid }: {tid?:string}) {
  const [shortArray, setShortArray] = useAtom(shortTodoContainerAtom);
  const [newTask, setNewTask] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [settings, setSettings] = React.useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTodoCreate: ShortTodoJ = {
        id: Date.now(),
        shortTodoName: newTask,
        completed: false,
        tag: tag || "",
        status: status || "Pending",
        priority: priority || "Normal",
        createdAt: new Date(),
      };

      console.log("Creating new task:", newTodoCreate);
      console.log("Target container ID (tid):", tid);

      const updatedTodoArrayNow = shortArray.map((con) => {
        if (con.id == Number(tid)) {
          console.log("yes");

          return {
            ...con,
            shortTodos: [...con.shortTodos, newTodoCreate],
          };
        }

        return con;
      });
      
      setShortArray(updatedTodoArrayNow);

      setNewTask("");
      setStatus("");
      setPriority("");
      setTag("");
      setSettings("");
      
    }

    console.log(shortArray);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-3/4"
          />
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-1/4 flex items-end justify-center"
          >
            <Plus />
            &nbsp;Add
          </Button>
        </form>

        <div className="flex gap-2 justify-around flex-wrap">
          <Select onValueChange={setStatus}>
            <SelectTrigger className="w-max bg-background">
              <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setPriority}>
            <SelectTrigger className="w-max bg-background">
              <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setTag}>
            <SelectTrigger className="w-max bg-background">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="study">Study</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSettings}>
            <SelectTrigger className="w-max bg-background">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Settings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="add-tag">Add Tag</SelectItem>
              <SelectItem value="add-status">Add Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
