import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border-transparent",
        secondary:
          "bg-[var(--glass-bg)] text-[var(--text-secondary)] border-[var(--glass-border)] backdrop-blur-sm",
        destructive:
          "bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)]",
        outline:
          "border-[var(--glass-border)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--glass-bg-subtle)]",
        ghost:
          "bg-transparent text-[var(--text-muted)] hover:bg-[var(--glass-bg-subtle)] hover:text-[var(--text-secondary)]",
        purple:
          "bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border-transparent",
        scarlet:
          "bg-[var(--badge-scarlet-bg)] text-[var(--badge-scarlet-text)] border-transparent",
        blue: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border-transparent",
        success:
          "bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]",
        warning:
          "bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
