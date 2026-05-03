"use client";

import Searchbar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Habbits } from "./Habbits";
import { AvatarWithNotification } from "@/components/ui/avatar-with-notification";

// import LongTaskUi from "@/components/TodoRelated/LongTask/LongTaskUi";
// import ShortTaskUi from "@/components/TodoRelated/ShortTaskUi";
import { LogOut, User as UserIcon, Settings, Bell } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

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
            
            {/* <LongTaskUi /> */}
            go full
          </PopoverContent>
        </Popover>

        <Habbits />
        <Popover>
          <PopoverTrigger asChild>
            <div className="cursor-pointer group">
              <AvatarWithNotification
                src={auth.currentUser?.photoURL || "https://github.com/shadcn.png"}
                alt={auth.currentUser?.displayName || "User"}
                fallback={auth.currentUser?.displayName?.slice(0, 2).toUpperCase() || "US"}
                notificationCount={1}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-56 p-2 bg-black/80 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Account</p>
              <p className="text-sm font-medium text-white truncate">{auth.currentUser?.displayName || "User"}</p>
              <p className="text-[11px] text-white/30 truncate">{auth.currentUser?.email}</p>
            </div>
            
            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                <UserIcon className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                <Bell className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                Notifications
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                <Settings className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                Settings
              </button>
            </div>

            <div className="h-px bg-white/5 my-1" />

            <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <LogOut className="w-4 h-4 text-red-500/50 group-hover:text-red-400 transition-colors" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default HeaderHome;
