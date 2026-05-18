"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "./ui/button";
import { Radar, House, Timer, Book, Activity, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const navlink = [
  { place: "/", icon: House, label: "Home" },
  { place: "/timerapp", icon: Timer, label: "Timer" },
  { place: "/challenge-page", icon: Flame, label: "Challenges" },
  { place: "/habit-page", icon: Activity, label: "Habits" },
];
const NavBar = () => {
  return (
    <>
      <Sheet>
        <SheetTrigger className="fixed right-10 bottom-10" asChild>
          <Button size={"icon"} className="rounded-full">
            <Radar />
          </Button>
        </SheetTrigger>

        <SheetContent side={"left"}>
          <SheetHeader>
            <SheetTitle>Fields</SheetTitle>
            <SheetDescription>
              {navlink.map((ele, index) => {
                return (
                  <Link key={index} to={ele.place} title={ele.label}>
                    <Button
                      size="icon"
                      className="bg-white rounded-xl hover:rounded-full transition-all duration-100 ease-linear my-5 text-black flex justify-center items-center w-12 h-12"
                    >
                      {React.createElement(ele.icon)}
                    </Button>
                  </Link>
                );
              })}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NavBar;
