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
  const [headerHeight, setHeaderHeight] = useState(() => {
    return localStorage.getItem("header") === "true";
  });
  const [shortTodoContainers] = useAtom(shortTodoContainerAtom);
  const [LongTodoContainer] = useAtom(LongTodoContainerAtom);

  const [todoParts, setTodoParts] = useState(3);
  const [todoPage, setTodoPage] = useState(1);

  const combineTodo = [
    ...shortTodoContainers.map((item) => ({ ...item, type: "short" as const })),
    ...LongTodoContainer.map((item) => ({ ...item, type: "long" as const }))
  ];

  // Pagination Calculations
  const totalPages = Math.ceil(combineTodo.length / todoParts) || 1;
  const lastIndexPage = todoPage * todoParts;
  const firstIndexPage = lastIndexPage - todoParts;
  const currentTodos = combineTodo.slice(firstIndexPage, lastIndexPage);

  // Build page numbers array using a simple loop
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="text-lg h-screen">
      <HeaderHome />

      {/* challenges */}
      <div className="body_here flex flex-wrap gap-4 justify-center ">
        <AnimatePresence>
          {headerHeight && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "min-content", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="top_header dark:bg-black flex flex-col-reverse w-full justify-around items-center md:flex-row relative overflow-hidden"
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
<div className="h-full w-full  flex items-center justify-center mt-16">
        {currentTodos.map((ele) => {
          if (ele.type === "short") {
            return (
              <ShortTodo
                key={`short-${ele.id}`}
                shortContainerName={ele.shortContainername}
                shortTaskArray={ele.shortTodos}
                id={ele.id}
              />
            );
          }

          return (
            <LongTodo
              key={`long-${ele.id}`}
              id={ele.id}
              LongContainerName={ele.LongContainerName}
            />
          );
        })}
</div>

      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 my-6">
        <Button
          variant="outline"
          disabled={todoPage === 1}
          onClick={() => setTodoPage((prev) => Math.max(prev - 1, 1))}
        >
          Prev
        </Button>

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={todoPage === page ? "default" : "outline"}
            onClick={() => setTodoPage(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          disabled={todoPage === totalPages}
          onClick={() => setTodoPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </Button>
      </div>

      <div className="right-10 bottom-20 fixed mb-1">
        <TodayCard />
      </div>
    </div>
  );
};

export default HomePage;