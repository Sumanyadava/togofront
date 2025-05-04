import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import TaskUi from "../TaskUi";
import { ScanSearch } from "lucide-react";

import { useAtom } from "jotai";
import { ShortAction } from "./ShortAction";
import { AnimatePresence } from "framer-motion";

import { shortTodoContainerAtom, ShortTodoJ } from "@/state";
import { Link } from "react-router-dom";

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

  
  useEffect(() => {
    const shortTask = shortTodoArray.find(
      (taskContainer) => taskContainer.id === id
    );
    setShortTaskS(shortTask ? shortTask.shortTodos : []);
    // console.log(shortTask);
  }, [shortTodoArray, id]);

  const handleShortAdd = () => {
    if (text.trim()) {
      const newTask: ShortTodoJ = {
        id: Date.now(),
        shortTodoName: text,
        completed: false,
        tag: "",
        status: "Pending", // Default status
        priority: "Normal", // Default priority
        createdAt: new Date(),
      };

      const updatedTodoArray = shortTodoArray.map((container) => {
        if (container.id === id) {
          return {
            ...container,
            shortTodos: [...container.shortTodos, newTask],
          };
        }

        return container;
      });
      setTodoArray(updatedTodoArray);
      setText("");

      // console.log(shortTodoArray);
    }
  };

  return (
    <AnimatePresence>
      <Card className="w-[350px] m-5 h-min">
        <div
          className={`flex flex-col space-y-1.5 p-6 bg-gray-20 overflow-hidden transition-height duration-500 ease-in-out ${
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
                  focus:border-b-primary p-5 bg-inherit cursor-pointer font-semibold"
                placeholder={shortContainerName}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 peer-focus:w-full"></div>
            </div>

            <div className="w-[10%] flex flex-col justify-start items-center">
              <Link to={`/shortList/${id}`}>
                <ScanSearch className="cursor-pointer hover:bg-gray-800 rounded-sm" />
              </Link>
              <ShortAction taid={id} />
            </div>
          </div>
          <Button onClick={handleShortAdd}>Add</Button>
        </div>
        <CardContent className="scrollbar-custom overflow-y-scroll h-[250px]">
          {shortTaskS.map((e, index) => {
            return (
              <TaskUi
                key={index}
                isChecked={e.completed}
                isEditable={false}
                task_name={e.shortTodoName}
              />
            );
          })}
        </CardContent>
      </Card>
    </AnimatePresence>
  );
};

export default ShortTodo;
