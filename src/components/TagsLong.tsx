import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Timer, TimerOff } from "lucide-react";

interface TagLongProps {
  handleTag: (data: string) => void;
}

export function TagsLong({ handleTag }: TagLongProps) {
  const [selectedTag, setSelectedTag] = React.useState("");

  // Function to handle setting the selected tag and its background color
  const handleSelectChange = (value: string) => {
    setSelectedTag(value);
    handleTag(value);
  };

  // Function to determine background color based on selected value
  const getBackgroundColor = () => {
    switch (selectedTag) {
      case "impUrg":
        return "bg-red-400";
      case "nonImpUrg":
        return "bg-orange-400";
      case "impNonUrg":
        return "bg-yellow-500";
      case "NonImpNonUrg":
        return "bg-green-600";
      case "Timeless":
        return "bg-black";
      default:
        return "bg-inherit";
    }
  };

  return (
    <Select onValueChange={handleSelectChange}>
      <SelectTrigger className={`w-1/2  ml-1 ${getBackgroundColor()}`}>
        <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="flex flex-col gap-2 ">
          <SelectLabel>Tags</SelectLabel>
          <SelectItem value="impUrg" className="bg-red-400 ">
            Important and Urgent
          </SelectItem>
          <SelectItem value="nonImpUrg" className="bg-orange-400 ">
            Not Important but Urgent
          </SelectItem>
          <SelectItem value="impNonUrg" className="bg-yellow-500">
            Important but Not Urgent
          </SelectItem>
          <SelectItem value="NonImpNonUrg" className="bg-green-600">
            Not Important and Not Urgent
          </SelectItem>
          <SelectItem value="Timeless" className="bg-inherit flex">
            <TimerOff /> 
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
