"use client";
import LongTaskUi from "@/components/TodoRelated/LongTask/LongTaskUi";
import { useEffect, useState } from "react";
// import AddTodoLong from "./AddTodoLong";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import {
  LongTodoContainer,
  LongTodoContainerAtom,
  LongTodoJ,
} from "@/state";
import { Pen} from "lucide-react";

const LongList = () => {
  const [todoView] = useState<String>("block");

  const { containerId } = useParams();

  const [longTodoArray] = useAtom<LongTodoContainer[]>(
    LongTodoContainerAtom
  );

  const [longTaskS, setLongTaskS] = useState<LongTodoJ[]>([]);

  const [longContainerNameState, setLongContainerNameState] = useState("");

  useEffect(() => {
    const longTask = longTodoArray.find(
      (taskContainer) => taskContainer.id === Number(containerId)
    );
    setLongContainerNameState(longTask ? longTask.LongContainerName : "");

    setLongTaskS(longTask ? longTask.LongTodo : []);
  }, [longTodoArray, containerId]);

  return (
    <div className="h-screen w-full overflow-hidden p-5">
      <Link to="/" className="absolute">
        <Button className="">Back</Button>
      </Link>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
        <h1 className="text-9xl font-bold text-gray-300 m-10">
          {longContainerNameState}
        </h1>

        {/* <div className="addLongTask flex justify-around sm:w-[20%] w-full flex-wrap gap-5 items-center">
          <AddTodoLong tid={id} />
        </div> */}
      </div>

      {/* <input
        className="bg-inherit w-full focus:outline-none p-2"
        type="text"
        placeholder="// project description: one line max"
      /> */}

      {todoView == "block" ? (
        <div className="w-full h-[80%] flex gap-5">
          <div className="_table rounded-lg border h-full overflow-hidden shadow-gray-800 w-2/3 gap-5">
            <div className="p-5 border-gray-500 border m-5 border-b-4 rounded-lg">
              <h1 className="flex justify-between items-center">
                Project Notes & Plan
                <Pen className="w-5 h-5" />
              </h1>
            </div>
            <textarea
              className="bg-yellow-200 h-full p-5 w-full text-black"
              placeholder="...write your project notes, milestones, and planning details here"
            ></textarea>
          </div>





          <div className="_table rounded-lg border h-full overflow-hidden shadow-gray-800 w-1/3">
            <div className="bg-muted/50 p-4 border-b">
              <div className="grid grid-cols-5 gap-4 font-semibold text-sm">
                <div>Task Name</div>
                <div>Deadline</div>
                <div>Tag</div>
                <div>Milestone</div>
                <div>Status</div>
              </div>
            </div>
            <div className="overflow-y-auto h-full scrollbar-custom bg-white pb-10">
              {longTaskS.map((e, index) => {
                return <LongTaskUi key={index} long={e} containerId={Number(containerId)} />;
              })}
              <div className="mb-20">end here</div>
            </div>
          </div>


          
        </div>
      ) : (
        <h1>Make a Dragable Element Todo list here</h1>
      )}
    </div>
  );
};

export default LongList;
