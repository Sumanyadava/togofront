import {
  Check,
  Ellipsis,
  EyeOff,
  EyeOffIcon,
  SquarePen,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Alert, AlertTitle } from "../ui/alert";
import { toast } from "sonner";

interface TaskUiProps {
  isChecked: boolean; // Specify the type for isChecked
  task_name: string; // Specify the type for task_name
  isEditable: boolean;
}

const TaskUi: React.FC<TaskUiProps> = ({
  isChecked,
  task_name,
  isEditable = true,
}) => {
  const [shortChecked, setShortChecked] = useState(isChecked);
  const handleShortClick = () => {
    setShortChecked(!shortChecked);
    toast.success("hii");
  };
  return (
    <div
      className={` p-3 rounded-sm flex justify-between items-center my-2 transition-all duration-300  ${
        shortChecked ? "bg-white/5" : "bg-white/10 hover:bg-white/20 "
      } `}
    >
      <div className=" flex items-center w-full ">
        <Checkbox
          checked={shortChecked}
          className="h-5 w-5"
          onClick={handleShortClick}
        />
        <p className="ml-5 cursor-pointer" onClick={handleShortClick}>
          {task_name}
        </p>
      </div>

      {isEditable && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"ghost"}>
              <Ellipsis />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="  flex w-min [&>*]:m-1  ">
            <button>
              <SquarePen size={20} className="hover:bg-white" />
            </button>
            <button>
              <EyeOff size={20} />
            </button>
            <button>
              <Trash2 size={20} />
            </button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default TaskUi;
