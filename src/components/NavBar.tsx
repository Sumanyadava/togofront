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
Button;
import { Input } from "@/components/ui/input";
import Searchbar from "./Searchbar";
import { Radar, House, icons, Timer, Book } from "lucide-react";
import { Link } from "react-router-dom";

const navlink = [
  { place: "home", icon: House },
  { place: "timerapp", icon: Timer },
  { place: "allout", icon: Book },
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
                  <Button
                    key={index}
                    size="icon"
                    className=" bg-white rounded-xl hover:rounded-full transition-all duration-100 ease-linear my-5 text-black flex justify-center items-center"
                  >
                    <Link to={ele.place}>{React.createElement(ele.icon)}</Link>
                  </Button>
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
