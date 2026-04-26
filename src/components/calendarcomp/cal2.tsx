import { addDays, addMonths, addWeeks, format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
// import { DateRange, DayPicker } from 'react-day-picker'

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

export default function Cal2({
  handleDeadline,
}: {
  handleDeadline: (data: Date | null) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [noDeadline, setNoDeadline] = useState(false);

  useEffect(() => {
    if (noDeadline) {
      handleDeadline(null);
    } else if (date) {
      handleDeadline(date);
    }
  }, [date, noDeadline, handleDeadline]);

//no deadline is today
  const handleQuickSelect = (label: string, d: Date) => {
    if (label === "No") {
      setNoDeadline(true);
      setDate(undefined);
    } else {
      setNoDeadline(false);
      setDate(d);
    }
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    setNoDeadline(false);
    setDate(d);
  };

  const quickSelectDates = [
    { label: "No", date: startOfDay(new Date()) },
    { label: "Tom", date: addDays(startOfDay(new Date()), 1) },
    { label: "3 Days", date: addDays(startOfDay(new Date()), 3) },
    { label: "1 Week", date: addWeeks(startOfDay(new Date()), 1) },
    { label: "3 Weeks", date: addWeeks(startOfDay(new Date()), 3) },
    { label: "1 M", date: addMonths(startOfDay(new Date()), 1) },
    { label: "3 M", date: addMonths(startOfDay(new Date()), 3) },
    { label: "6 M", date: addMonths(startOfDay(new Date()), 6) },
  ];

  return (
    <div className="flex flex-col items-center space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto ">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            disabled={(date) => date < startOfDay(new Date())}
          />
        </PopoverContent>
      </Popover>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickSelectDates.map((quickDate) => (
          <Button
            key={quickDate.label}
            variant="outline"
            className={`w-full ${
              quickDate.label === "Today"
                ? noDeadline
                  ? "border-primary text-primary"
                  : "text-gray-400"
                : !noDeadline && date && date.toDateString() === quickDate.date.toDateString()
                  ? "border-primary text-primary"
                  : "text-gray-400"
            }`}
            onClick={() => handleQuickSelect(quickDate.label, quickDate.date)}
          >
            {quickDate.label}
          </Button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-md text-gray-600 font-semibold">Selected Date:</p>
        <p className="text-xl">
          {noDeadline
            ? <span className="text-muted-foreground italic">No Deadline</span>
            : date
            ? format(date, "PP")
            : "No date selected"}
        </p>
      </div>
    </div>
  );
}
