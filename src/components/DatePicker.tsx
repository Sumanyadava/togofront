import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  addMonths,
  addYears,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EnhancedDateTimePicker: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [hours, setHours] = useState<string>("00");
  const [minutes, setMinutes] = useState<string>("00");

  useEffect(() => {
    if (date) {
      setHours(format(date, "HH"));
      setMinutes(format(date, "mm"));
    }
  }, [date]);

  const updateDateTime = (
    newDate?: Date,
    newHours: string = hours,
    newMinutes: string = minutes
  ) => {
    if (newDate) {
      const updatedDate = new Date(newDate);
      updatedDate.setHours(parseInt(newHours), parseInt(newMinutes));
      setDate(updatedDate);
    }
  };

  const shortcuts = [
    { label: "Today", action: () => setDate(new Date()) },
    { label: "Tomorrow", action: () => setDate(addDays(new Date(), 1)) },
    { label: "This Week", action: () => setDate(startOfWeek(new Date())) },
    { label: "In a Month", action: () => setDate(addMonths(new Date(), 1)) },
    { label: "In 3 Months", action: () => setDate(addMonths(new Date(), 3)) },
    { label: "In 6 Months", action: () => setDate(addMonths(new Date(), 6)) },
    { label: "In a Year", action: () => setDate(addYears(new Date(), 1)) },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-auto justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "d/M/yy HH:mm") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => updateDateTime(newDate)}
              
            />
          </div>
          <div className="p-3 border-t sm:border-t-0 sm:border-l border-border">
            <div className="flex space-x-2">
              <Select
                value={hours}
                onValueChange={(value: string) => updateDateTime(date, value, minutes)}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="h-[200px] overflow-y-auto">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString().padStart(2, "0")}
                    >
                      {index.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={minutes}
                onValueChange={(value: string) => updateDateTime(date, hours, value)}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="h-[200px] overflow-y-auto">
                  {Array.from({ length: 60 }).map((_, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString().padStart(2, "0")}
                    >
                      {index.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 space-y-2 flex flex-col">
              {shortcuts.map((shortcut, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={shortcut.action}
                >
                  {shortcut.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t border-border">
          <Button variant="outline" onClick={() => setDate(undefined)}>
            Cancel
          </Button>
          <Button onClick={() => console.log(date)}>Update</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedDateTimePicker;
