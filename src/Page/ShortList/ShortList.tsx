"use client";
// import { ShortFilter } from "@/components/TodoRelated/shortTask/ShortFiler";
import ShortTask from "@/components/TodoRelated/shortTask/ShortTask";
import ShortTaskHead from "@/components/TodoRelated/shortTask/ShortTaskHead";

// import SearchBar from "@/components/ui/searchbar";
import { useEffect, useState } from "react";
import AddTodoShort from "./AddTodoShort";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import {
  ShortTodoContainer,
  shortTodoContainerAtom,
  ShortTodoJ,
} from "@/state";
import { Pen } from "lucide-react";

const ShortList = () => {
  const [todoView, setTodoView] = useState<String>("block");

  const { id } = useParams();

  const [shortTodoArray, setTodoArray] = useAtom<ShortTodoContainer[]>(
    shortTodoContainerAtom
  );

  const [shortTaskS, setShortTaskS] = useState<ShortTodoJ[]>([]);

  const [shortContainerNameState, setShortContainerNameState] = useState("");

  useEffect(() => {
    const shortTask = shortTodoArray.find(
      (taskContainer) => taskContainer.id === Number(id)
    );
    setShortContainerNameState(shortTask ? shortTask.shortContainername : "");

    setShortTaskS(shortTask ? shortTask.shortTodos : []);
  }, [shortTodoArray, id]);





  return (
    <div className="h-screen w-full  overflow-hidden p-5 ">

<Link to="/" className="absolute">
          <Button className="">Back</Button>
        </Link>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-5 ">
        

        <h1 className="text-9xl font-bold text-gray-300">{shortContainerNameState} </h1>

        <div className="addshortTask flex justify-around sm:w-[20%] w-full flex-wrap gap-5 items-center ">
          <AddTodoShort tid={id} />
        </div>
      </div>

      <input
        className="bg-inherit w-full focus:outline-none p-2"
        type="text"
        placeholder="// description: one line max"
      />

      {todoView == "block" ? (
        <div className="w-full  h-[70%] flex gap-5">
          {" "}
          <div className="_table rounded-lg border h-full  overflow-hidden shadow-gray-800 w-2/3">
            <ShortTaskHead />
            <div className="overflow-y-auto h-full scrollbar-custom">
              {shortTaskS.map((e, index) => {
                return <ShortTask key={index} num={index} comp={e} />;
              })}
            </div>
          </div>
          <div className="_table rounded-lg border h-full overflow-hidden shadow-gray-800 w-1/3 gap-5">
            <div className="p-5 border-gray-500 border m-5 border-b-4 rounded-lg ">
              <h1 className="flex justify-between">Write your notes here <Pen></Pen></h1>
              
            </div>
            <textarea
              className="bg-yellow-200 h-full p-5 w-full text-black "
              placeholder="...write you notes related to this here"
            ></textarea>
          </div>
        </div>
      ) : (
        <h1>Make a Dragable Element Todo list here </h1>
      )}
    </div>
  );
};

export default ShortList;
