import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--btn-radius)] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary — purple→blue gradient
        default:
          "bg-gradient-to-br from-[var(--purple)] to-[var(--blue)] text-white shadow-[var(--btn-primary-shadow)] hover:shadow-[var(--btn-primary-shadow-hover)] hover:-translate-y-0.5",

        // Outlined glass
        outline:
          "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] backdrop-blur-[10px] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]",

        // Secondary glass
        secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-[var(--btn-secondary-border)] backdrop-blur-[10px] hover:bg-[var(--btn-secondary-bg-hover)] hover:-translate-y-0.5",

        // Ghost
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--btn-ghost-bg-hover)] hover:text-[var(--accent-primary)]",

        // Destructive
        destructive:
          "bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)] hover:bg-[var(--scarlet-faint)]",

        // Scarlet gradient CTA
        scarlet:
          "bg-gradient-to-br from-[var(--scarlet)] to-[var(--purple)] text-white shadow-[0_4px_14px_rgba(220,20,60,0.35)] hover:shadow-[0_8px_20px_rgba(220,20,60,0.45)] hover:-translate-y-0.5",

        // Link style
        link: "text-[var(--text-link)] underline-offset-4 hover:underline hover:text-[var(--text-link-hover)]",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[10px] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[12px] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-5 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xl: "h-12 gap-2 px-7 text-base rounded-[var(--btn-radius-full)] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[10px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[12px]",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
