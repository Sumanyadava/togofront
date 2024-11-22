
import React from "react";
import { Checkbox } from "../../ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { ShortAction } from "./ShortAction";
import {format} from 'date-fns'
import { ShortTodoJ } from "@/state";
// import Checkboxss from "../../checkBox/ch1";
const ShortTask: React.FC<{comp:ShortTodoJ ,num:number}> = ({ comp,num}) => {

  
  
  return (
    <div className="bg-white/20 p-3 rounded-sm flex justify-between items-center my-2 mx-5  ">
      <div className=" flex items-center w-1/4 gap-5  justify-around  ">
        {num+1}
        <Checkbox className="h-10 w-10" />

        <Badge>{comp.tag}</Badge>

      </div>

      <p className="ml-5">{comp.shortTodoName}</p>
      <div className="flex w-1/2  h-full justify-around items-center overflow-auto gap-5 scrollbar-custom  ">
        <div className="div">{comp.status}</div>

        <div className="priory">{comp.priority}</div>
        <div>{format(new Date(comp.createdAt),'dd/MM/yy')}</div>

        <ShortAction taid={comp.id} />
      </div>
    </div>
  );
};

export default ShortTask;
