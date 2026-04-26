import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, EyeOff, Star, Eye } from "lucide-react";

interface ShortActionProps {
  taid?: number;
  isHidden?: boolean;
  onDelete?: () => void;
  onHide?: () => void;
}

export function ShortAction({ taid, isHidden, onDelete, onHide }: ShortActionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-white/10 transition-colors"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] bg-[#1A1A1A] border-white/5 text-white">
        <DropdownMenuItem 
          onClick={onHide}
          className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer"
        >
          {isHidden ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              Unhide
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer">
          <Star className="h-3.5 w-3.5" />
          Favorite
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          onClick={onDelete}
          className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
          <DropdownMenuShortcut className="text-red-400/50">⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
