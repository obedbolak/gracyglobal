"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center justify-start gap-1 rounded-[var(--card-radius)] p-1",
        className,
      )}
      style={{
        background: "var(--glass-bg-subtle)",
        border: "1px solid var(--glass-border-subtle)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "rounded-[calc(var(--card-radius)-4px)] px-3.5 py-1.5 text-sm font-medium",
        "transition-all duration-200 outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]",
        "disabled:pointer-events-none disabled:opacity-50",
        // Inactive
        "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]",
        // Active — glass pill with purple accent
        "data-[state=active]:text-[var(--accent-primary)] data-[state=active]:shadow-sm",
        className,
      )}
      style={
        {
          "--active-bg": "var(--glass-bg-strong)",
          "--active-border": "var(--glass-border)",
        } as React.CSSProperties
      }
      // Active styles applied via inline CSS variable trick + Tailwind data attr
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] rounded-[var(--card-radius)]",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
