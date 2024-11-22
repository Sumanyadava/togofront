import { Check, Ellipsis, EyeOff, SquarePen, Trash2 } from "lucide-react";
import React from "react";
import { Checkbox } from "../../ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../../ui/button";
import { ShortAction } from "./ShortAction";
// import Checkboxss from "../../checkBox/ch1";
const ShortTaskHead = () => {
  return (
    <div className="bg-gray-700 p-3 rounded-sm flex justify-between items-center m-5   ">
      <div className=" flex items-center w-1/4 gap-5  justify-around  ">
        no.
        <Checkbox disabled className="h-10 w-10" />
        <p className="px-2">Tag&nbsp;&nbsp;&nbsp;&nbsp;</p>
      </div>

      <p className="ml-7">Task&nbsp;Name</p>
      <div className="flex w-1/2  justify-around items-center ">
        <div className="div">Status</div>

        <div className="priory">Priority</div>
        <div>Time</div>

        <p>Action</p>
      </div>
    </div>
  );
};

export default ShortTaskHead;
