"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Timer } from "lucide-react";

import { TagsLong } from "@/components/TagsLong";
import LongTaskUi from "./LongTaskUi";
import { ShortAction } from "../shortTask/ShortTodoAction";
import Cal2 from "@/components/calendarcomp/cal2";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useAtom } from "jotai";
import { LongTodoContainerAtom, LongTodoJ } from "@/state";

const LongTodo: React.FC<{
  LongContainerName: string;

  id: number;
}> = ({ LongContainerName, id }) => {
  const [headerHeight, setHeaderHeight] = useState(false);
  const [longText, setLongText] = useState("");
  const [LongTaskS, setLongTaskS] = useState<LongTodoJ[]>([]);
  const [TagDaTa, setTagDaTa] = useState("");
  const [DeadlineState, setDeadlineState] = useState<Date>();

  const [LongTodoArray, setLongTodoArray] = useAtom(LongTodoContainerAtom);

  useEffect(() => {
    const LongArray = LongTodoArray.find((Lt) => Lt.id == id);

    setLongTaskS(LongArray ? LongArray?.LongTodo : []);
  }, [LongTodoArray, id]);

  const handleTag = (data: string) => {
    setTagDaTa(data);
  };

  const handleDeadline = (data: Date) => {
    setDeadlineState(data);
  };

  const handleLong = () => {
    setHeaderHeight(true);

    if (longText.trim()) {
      if (TagDaTa.trim()) {
        const newTask: LongTodoJ = {
          id: Date.now(), // or use a more reliable ID generator
          LongTodoName: longText,
          deadline: DeadlineState, // Set this to an appropriate value
          tag: TagDaTa, // Set a default tag if needed
          completed: false,
          milestone: "", // Set this based on your logic
          planText: "", // Set this based on your logic
          createedAt: new Date(),
        };

        const updatedLongTodoArray = LongTodoArray.map((container) => {
          if (container.id === id) {
            return {
              ...container,
              LongTodo: [...container.LongTodo, newTask],
            };
          }
          return container;
        });

        setLongTodoArray(updatedLongTodoArray);
        setLongText(""); // Clear the input field

        console.log(LongTodoArray);
        setHeaderHeight(false);
      }
    }
  };

  return (
    <Card className="w-[350px] m-5 h-min peer border-slate-800">
      <CardHeader
        className={`${
          headerHeight ? "h-[170px]" : "h-[70px]"
        } overflow-hidden  transition-all ease-in`}
      >
        <div className="flex justify-between items-center">
          <div className="relative w-[80%]">
            <input
              type="text"
              onChange={(e) => setLongText(e.target.value)}
              value={longText}
              className="flex h-10 w-full focus:outline-none disabled:cursor-not-allowed px-3 bg-inherit text-xl peer "
              placeholder={LongContainerName}
              onFocus={handleLong}
            />
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 peer-focus:w-full"></div>
          </div>

          <div className="w-[10%] flex flex-col justify-start items-center">
            <ShortAction />
          </div>
        </div>
        <div className="flex">
          {/* <DatePicker /> */}
          <div className="w-1/2">
            <Popover>
              <PopoverTrigger className="border p-2 px-4 rounded-lg flex gap-2 text-sm items-center text-gray-400">
                <Timer />
                Finish&nbsp;Time
              </PopoverTrigger>
              <PopoverContent>
                <Cal2 handleDeadline={handleDeadline} />
              </PopoverContent>
            </Popover>
          </div>

          <TagsLong handleTag={handleTag} />
        </div>
        <Button onClick={handleLong}>Add</Button>
      </CardHeader>
      <CardContent className="scrollbar-custom overflow-y-scroll h-[250px] ">
        {LongTaskS.map((long) => {
          return <LongTaskUi key={long.id} long={long} />;
        })}
      </CardContent>
    </Card>
  );
};

export default LongTodo;
