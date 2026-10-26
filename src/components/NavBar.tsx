import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Button } from "./ui/button";
import { Radar, House, Timer, Activity, Flame, CalendarDays, PenTool, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const navlink = [
  { place: "/", icon: House, label: "Home" },
  { place: "/startwriting", icon: PenTool, label: "Write" },
  { place: "/graph", icon: Share2, label: "Graph View" },
  { place: "/plan-page", icon: CalendarDays, label: "Plans" },
  { place: "/challenge-page", icon: Flame, label: "Challenges" },
  { place: "/habit-page", icon: Activity, label: "Habits" },
  { place: "/timerapp", icon: Timer, label: "Gallery" },
];

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="fixed right-10 bottom-10 z-50 shadow-2xl" asChild>
        <Button size={"icon"} aria-label="Toggle navigation menu" className="rounded-full w-12 h-12 bg-primary/90 hover:bg-primary shadow-lg backdrop-blur-md">
          <Radar className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side={"left"} className="bg-black/90 backdrop-blur-2xl border-white/10 w-64">
        <SheetHeader>
          <SheetTitle className="text-white text-xl font-bold tracking-tight">Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-8">
          {navlink.map((ele, index) => {
            const Icon = ele.icon;
            return (
              <SheetClose asChild key={index}>
                <Link
                  to={ele.place}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all group font-medium"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{ele.label}</span>
                </Link>
              </SheetClose>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavBar;
