"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 duration-200",
        "supports-backdrop-filter:backdrop-blur-sm",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      style={{ background: "var(--modal-backdrop)" }}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const sideClasses = {
    top: "inset-x-0 top-0 rounded-b-[var(--card-radius-lg)] data-open:slide-in-from-top data-closed:slide-out-to-top",
    bottom:
      "inset-x-0 bottom-0 rounded-t-[var(--card-radius-lg)] data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-[var(--card-radius-lg)] data-open:slide-in-from-left data-closed:slide-out-to-left",
    right:
      "inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-[var(--card-radius-lg)] data-open:slide-in-from-right data-closed:slide-out-to-right",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 p-5 duration-200",
          "data-open:animate-in data-closed:animate-out data-closed:duration-200",
          sideClasses[side],
          className,
        )}
        style={{
          background: "var(--modal-bg)",
          border: "1px solid var(--modal-border)",
          boxShadow: "var(--modal-shadow)",
          backdropFilter: "var(--modal-blur)",
          WebkitBackdropFilter: "var(--modal-blur)",
          color: "var(--text-primary)",
        }}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className="absolute top-4 right-4 rounded-lg p-1.5 transition-all hover:bg-[var(--btn-ghost-bg-hover)]"
          style={{ color: "var(--text-muted)" }}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-auto pt-4",
        className,
      )}
      style={{ borderTop: "1px solid var(--divider)" }}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold leading-none", className)}
      style={{ color: "var(--text-primary)" }}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm leading-relaxed", className)}
      style={{ color: "var(--text-muted)" }}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
