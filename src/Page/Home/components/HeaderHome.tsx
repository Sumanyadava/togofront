"use client";

import Searchbar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Habbits } from "./Habbits";
import { AvatarWithNotification } from "@/components/ui/avatar-with-notification";

import LongTaskUi from "@/components/TodoRelated/LongTask/LongTaskUi";
import TaskUi from "@/components/TodoRelated/TaskUi";

const HeaderHome = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "true";
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "true");
    } else {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "false");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="search_here  flex justify-between items-center border flex-col md:flex-row gap-5 p-5">
      <Button
        variant={"ghost"}
        className="mx-5 text-xl"
        onClick={toggleDarkMode}
      >
        Togo
      </Button>

      <Searchbar />

      <div className="flex gap-5 mx-5">
        <Popover>
          <PopoverTrigger asChild>
            <Button>Week</Button>
          </PopoverTrigger>
          <PopoverContent>Deadline -{/* <LongTaskUi /> */}</PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button>Habbits</Button>
          </PopoverTrigger>
          <PopoverContent>
            Habbits -{/* <LongTaskUi /> */}
            <TaskUi task_name={"hey"} isChecked={true} isEditable={false} />
            <TaskUi task_name={"hey"} isChecked={true} isEditable={false} />
            {/* <LongTaskUi /> */}
            go full
          </PopoverContent>
        </Popover>

        <Habbits />
        <div>
          <AvatarWithNotification
            src="https://github.com/shadcn.png"
            alt="Another User"
            fallback="AB"
            notificationCount={1}
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderHome;
