import * as React from "react";
import { useEffect } from "react";
import { Plus, Milestone, Tag } from "lucide-react";
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
import { LongTodoContainerAtom, LongTodoJ } from "@/state/state";
import { useAtom } from "jotai";

export default function AddTodoLong({ tid }: { tid?: string }) {
  const [longArray, setLongArray] = useAtom(LongTodoContainerAtom);
  const [newTask, setNewTask] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [milestone, setMilestone] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [planText, setPlanText] = React.useState("");
  
  useEffect(() => {
    console.log("Long Todo editor initialized for container:", tid);
  }, [tid]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newLongTodo: LongTodoJ = {
        id: Date.now(),
        LongTodoName: newTask,
        deadline: deadline ? new Date(deadline) : new Date(),
        tag: tag || "",
        completed: false,
        milestone: milestone || "",
        planText: planText || "",
        createedAt: new Date(),
      };

      console.log("Creating new long todo:", newLongTodo);
      console.log("Target container ID (tid):", tid);

      const updatedLongTodoArray = longArray.map((con) => {
        if (con.id == Number(tid)) {
          console.log("Found matching container");

          return {
            ...con,
            LongTodo: [...con.LongTodo, newLongTodo],
          };
        }

        return con;
      });

      setLongArray(updatedLongTodoArray);

      setNewTask("");
      setDeadline("");
      setMilestone("");
      setTag("");
      setPlanText("");
    }

    console.log(longArray);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new long-term goal or project..."
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
          <div className="w-full sm:w-auto">
            <label className="text-sm text-muted-foreground mb-1 block">Deadline</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-background"
            />
          </div>

          <Select onValueChange={setMilestone}>
            <SelectTrigger className="w-max bg-background">
              <Milestone className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Milestone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning Phase</SelectItem>
              <SelectItem value="research">Research Phase</SelectItem>
              <SelectItem value="development">Development Phase</SelectItem>
              <SelectItem value="testing">Testing Phase</SelectItem>
              <SelectItem value="completion">Completion Phase</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setTag}>
            <SelectTrigger className="w-max bg-background">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <label className="text-sm text-muted-foreground mb-1 block">Plan / Description</label>
          <textarea
            placeholder="Describe your plan, milestones, and key deliverables..."
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            className="w-full min-h-[100px] p-3 rounded-md border bg-background text-foreground resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
}

