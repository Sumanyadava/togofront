import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AvatarWithNotificationProps {
  src?: string;
  alt?: string;
  fallback: string;
  notificationCount?: number;
  className?: string;
}

export function AvatarWithNotification({
  src,
  alt,
  fallback,
  notificationCount,
  className,
}: AvatarWithNotificationProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {notificationCount !== undefined && notificationCount > 0 && (
        <Badge
          variant="secondary"
          className="absolute -bottom-2 -right-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5 flex items-center justify-center"
        >
          {notificationCount > 99 ? "99+" : notificationCount}
        </Badge>
      )}
    </div>
  );
}
