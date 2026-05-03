import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function ShortFilter() {
  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(new Set());
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
    { label: "Option 4", value: "option4" },
    { label: "Option 5", value: "option5" },
    { label: "Option 6", value: "option6" },
  ];

  const handleSelect = (value: string) => {
    setSelectedValues(prev => {
      const newSelectedValues = new Set(prev);
      if (newSelectedValues.has(value)) {
        newSelectedValues.delete(value);
      } else {
        newSelectedValues.add(value);
      }
      return newSelectedValues;
    });
  };

  const handleClear = () => {
    setSelectedValues(new Set());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Filters
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  Array.from(selectedValues).map(value => {
                    const option = options.find(option => option.value === value);
                    return (
                      <Badge
                        variant="secondary"
                        key={value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option?.label}
                      </Badge>
                    );
                  })
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border rounded-md p-1"
          />
          <div className="mt-2">
            {options.map(option => {
              const isSelected = selectedValues.has(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center p-2 cursor-pointer ${isSelected ? "bg-gray-800" : ""}`}
                >
                  <div
                    className={`mr-2 h-4 w-4 flex items-center justify-center rounded-sm border ${isSelected ? "bg-blue-500 text-white" : "border-gray-300"}`}
                  >
                    {isSelected && <CheckIcon className="h-4 w-4" />}
                  </div>
                  <span>{option.label}</span>
                </div>
              );
            })}
            {selectedValues.size > 0 && (
              <div
                onClick={handleClear}
                className="mt-2 text-center cursor-pointer text-blue-500"
              >
                Clear filters
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
