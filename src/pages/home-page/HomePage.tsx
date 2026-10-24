import { useState } from "react";
import CurrentlyWorking from "./components/CurrentlyWorking";

import TodayCard from "@/components/TodayCard";
import ShortTodo from "./components/todo-related/short-todo/ShortTodo";
import ChallengeTimer from "@/components/ChallengeTimer";
import LongTodo from "./components/todo-related/long-todo/LongTodo";

import HeaderHome from "./components/HeaderHome";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { LongTodoContainerAtom, shortTodoContainerAtom } from "@/state/state";


const HomePage = () => {


  const [headerHeight, setHeaderHeight] = useState(() => {return localStorage.getItem("header") === "true";});
  const [shortTodoContainers] = useAtom(shortTodoContainerAtom);
  const [LongTodoContainer] = useAtom(LongTodoContainerAtom);


  return (
    <div className="text-lg min-h-screen pb-20 relative">
      <HeaderHome />

      {/* main  */}
      <div className="body_here flex flex-wrap gap-4 justify-center relative">
        <AnimatePresence>
          {headerHeight && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="top_header flex flex-col-reverse w-full justify-around items-center md:flex-row relative overflow-hidden"
            >
              <CurrentlyWorking />
              <ChallengeTimer />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          className="absolute right-2"
          onClick={() =>
            setHeaderHeight((prev) => {
              localStorage.setItem("header", (!headerHeight).toString());

              return !prev;
            })
          }
        >
          {headerHeight ? <ArrowUpCircle /> : <ArrowDownCircle />}
        </Button>

        {shortTodoContainers.map((ele, index) => {
          return (
            <ShortTodo
              key={index}
              shortContainerName={ele.shortContainername}
              shortTaskArray={ele.shortTodos}
              id={ele.id}
            />
          );
        })}

        {LongTodoContainer.map((ele, index) => {
          return (
            <LongTodo
              key={index}
              id={ele.id}
              LongContainerName={ele.LongContainerName}
            />
          );
        })}
      
        
      </div>


      <div className=" right-10 bottom-20 fixed mb-1">
        <TodayCard />
      </div>
    </div>
  );
};

export default HomePage;
