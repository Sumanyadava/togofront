import React from 'react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils"

interface EyeCatchingButtonProps {
  children: string;
  className?: string;
}

export const EyeCatchingButton_v2: React.FC<EyeCatchingButtonProps> = ({ children, className }) => {
  return (
    <Button
      className={cn(
        'animate-bg-shine border-[1px] rounded-lg  bg-[length:200%_100%] tracking-wide font-bold text-lg',
        // 'dark:bg-[linear-gradient(110deg,#09090B,45%,#27272A,55%,#09090B)] dark:text-zinc-200 dark:border-zinc-800',
        'bg-[linear-gradient(110deg,#FFF,45%,#E4E4E7,55%,#FFF)] text-zinc-800 border-zinc-300',
        className
      )}
    >
      {children}
    </Button>
  );
};
