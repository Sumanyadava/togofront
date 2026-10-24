"use client";

import Searchbar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AvatarWithNotification } from "@/components/ui/avatar-with-notification";
import { LogOut, User as UserIcon, Settings, Bell, Sun, Moon, CalendarDays, Activity, PenTool, Share2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { themeAtom } from "@/state/state";

const HeaderHome = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="search_here flex justify-between items-center border-b border-white/5 flex-col md:flex-row gap-5 p-5 bg-background/50 backdrop-blur-md">
      <Button
        variant={"ghost"}
        className="mx-5 text-xl font-bold flex items-center gap-2 group"
        onClick={toggleDarkMode}
        title="Toggle Theme"
      >
        <span>Togo.V2</span>
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-blue-500 transition-transform group-hover:-rotate-12" />
        )}
      </Button>

      <Searchbar />

      <div className="flex items-center gap-2 mx-5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl flex items-center gap-1.5 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
          onClick={() => navigate("/startwriting")}
        >
          <PenTool className="w-3.5 h-3.5 text-purple-400" />
          <span>Write</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl flex items-center gap-1.5 border-white/10 hover:bg-white/5"
          onClick={() => navigate("/graph")}
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Graph</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl flex items-center gap-1.5 border-white/10 hover:bg-white/5"
          onClick={() => navigate("/plan-page")}
        >
          <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
          <span>Plans</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl flex items-center gap-1.5 border-white/10 hover:bg-white/5"
          onClick={() => navigate("/habit-page")}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Habits</span>
        </Button>
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
