import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LongTodoJ } from "@/state";

interface LongTaskUiProps {
  long: LongTodoJ; // Define props interface
}

const LongTaskUi: React.FC<LongTaskUiProps> = ({ long }) => {
  const [deadlineWidth, setDeadlineWidth] = useState(60)
  const [mileShow, setMileShow] = useState(false);

  const getBackgroundColor = () => {
    switch (long.tag) {
      case "impUrg":
        return "bg-red-400";
      case "nonImpUrg":
        return "bg-orange-400";
      case "impNonUrg":
        return "bg-yellow-500";
      case "NonImpNonUrg":
        return "bg-green-600";
      case "Timeless":
        return "hidden"  
      default:
        return "bg-black";
    }
  };

  useEffect(() => {
    const createdDate = new Date(long.createedAt).getTime();
    const deadlineDate = new Date(long.deadline).getTime();
    const currentTime = new Date().getTime();
  
    // Calculate the total duration between creation and deadline
    const totalDuration = deadlineDate - createdDate;
  
    // Calculate the elapsed time from creation to now
    const elapsedTime = currentTime - createdDate;
  
    // Calculate the percentage of time that has passed
    let percentagePassed = (elapsedTime / totalDuration) * 100;
  
    // Ensure percentagePassed is within the range 1 to 100
    percentagePassed = Math.min(Math.max(percentagePassed, 1), 100);
  
    setDeadlineWidth(Math.round(percentagePassed));
    
  }, [long.createedAt, long.deadline]);
  



  function daysLeft(targetDate: Date) {
  const currentDate: any = new Date() 
    const target: any = new Date(targetDate); // Target date
  
    // Calculate the difference in milliseconds
    const differenceInMs = target - currentDate;
  
    // Convert milliseconds to days
    const daysLeft = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
  
    return daysLeft >= 0 ? daysLeft : 0; // Return 0 if the date has passed
  }
  
  

  return (
    <div className="my-2">
      <div
        className="relative w-full cursor-pointer"
        onClick={() => setMileShow(!mileShow)}
        role="button"
        aria-expanded={mileShow}
        aria-controls={`milestone-${long.id}`} // Add unique ID for accessibility
      >
        <div
          style={{ width: `${deadlineWidth}%` }}
          className="h-full rounded-lg bg-orange-200 dark:bg-gradient-to-r from-slate-900 to-slate-800 absolute"
        >
          &nbsp; {/* Placeholder for the gradient */}
        </div>

        <div className="w-full h-full p-3 bg-gray-400 dark:bg-gray-900 rounded-lg rounded-br-none flex justify-between">
          <span className="z-10">{long.LongTodoName}</span>

          <span className={`${
            getBackgroundColor()
          } rounded-lg w-3 h-3 absolute top-1 -right-2`}>

            
          </span>

          <span className="z-10">
            {deadlineWidth < 80 ? daysLeft(long.deadline) : "almost"}
          </span>
        </div>
      </div>
      <div
        id={`milestone-${long.id}`} // For accessibility
        className={`ml-3 px-2 bg-gray-500 transition-all duration-300 rounded-b-lg ${
          mileShow ? "visible max-h-40 opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <Link to={`/LongProjects/${long.id}`} className="text-white">
          {long.milestone || "Expand"}
        </Link>
      </div>
    </div>
  );
};

export default LongTaskUi;
