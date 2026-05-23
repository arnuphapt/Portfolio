import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, X } from "lucide-react";

const timelineVariants = cva("relative flex flex-col", {
  variants: {
    variant: {
      default: "gap-4",
      compact: "gap-2",
      spacious: "gap-8",
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: { variant: "default", orientation: "vertical" },
});

const timelineItemVariants = cva("relative flex gap-3 pb-2", {
  variants: {
    orientation: {
      vertical: "flex-row",
      horizontal: "flex-col min-w-64 shrink-0",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

const timelineConnectorVariants = cva("bg-border", {
  variants: {
    orientation: {
      vertical: "absolute left-3 top-9 h-full w-px",
      horizontal: "absolute top-3 left-8 w-full h-px",
    },
    status: {
      default: "bg-white/20",
      completed: "bg-cyan-500",
      active: "bg-cyan-500",
      pending: "bg-white/10",
      error: "bg-red-500",
    },
  },
  defaultVariants: { orientation: "vertical", status: "default" },
});

const timelineIconVariants = cva(
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-[#030014] text-xs font-medium",
  {
    variants: {
      status: {
        default: "border-white/20 text-gray-400",
        completed: "border-cyan-500 bg-cyan-500 text-white",
        active: "border-cyan-500 bg-[#030014] text-cyan-500 animate-pulse",
        pending: "border-white/20 text-gray-500",
        error: "border-red-500 bg-red-500 text-white",
      },
    },
    defaultVariants: { status: "default" },
  }
);

function getStatusIcon(status) {
  switch (status) {
    case "completed": return <Check className="h-3 w-3" />;
    case "active":
    case "pending": return <Clock className="h-3 w-3" />;
    case "error": return <X className="h-3 w-3" />;
    default: return <div className="h-2 w-2 rounded-full bg-current" />;
  }
}

export function Timeline({
  items,
  className,
  variant,
  orientation = "vertical",
  showConnectors = true,
  showTimestamps = true,
  timestampPosition = "top",
  ...props
}) {
  const timelineContent = (
    <div className={cn(timelineVariants({ variant, orientation }), orientation === "horizontal" ? "pb-4" : "")}>
      {items.map((item, index) => (
        <div key={item.id} className={cn(timelineItemVariants({ orientation }))}>
          {showConnectors && index < items.length - 1 && (
            <div className={cn(timelineConnectorVariants({ orientation, status: item.status }))} />
          )}

          <div className="relative z-10 flex shrink-0">
            <div className={cn(timelineIconVariants({ status: item.status }))}>
              {item.icon || getStatusIcon(item.status)}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {showTimestamps && timestampPosition === "top" && item.timestamp && (
              <time className="text-xs text-gray-500">{item.timestamp}</time>
            )}

            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white leading-tight text-sm">{item.title}</h3>
              {showTimestamps && timestampPosition === "inline" && item.timestamp && (
                <time className="shrink-0 text-xs text-gray-500">{item.timestamp}</time>
              )}
            </div>

            {item.subtitle && (
              <p className="text-xs text-cyan-400 font-medium">{item.subtitle}</p>
            )}

            {item.description && (
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            )}

            {item.content && <div className="mt-2">{item.content}</div>}

            {showTimestamps && timestampPosition === "bottom" && item.timestamp && (
              <time className="text-xs text-gray-500">{item.timestamp}</time>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (orientation === "horizontal") {
    return (
      <ScrollArea orientation="horizontal" className={cn("w-full", className)} {...props}>
        {timelineContent}
      </ScrollArea>
    );
  }

  return <div className={className} {...props}>{timelineContent}</div>;
}
