import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-purple-700 text-white hover:bg-purple-800",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700 border-emerald-200",
        warning: "border-transparent bg-amber-100 text-amber-700 border-amber-200",
        info: "border-transparent bg-blue-100 text-blue-700 border-blue-200",
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
        review: "bg-amber-50 text-amber-700 border-amber-200",
        finalized: "bg-green-50 text-green-700 border-green-200",
        archived: "bg-gray-100 text-gray-500 border-gray-200",
        criminal: "bg-red-50 text-red-700 border-red-200",
        civil: "bg-blue-50 text-blue-700 border-blue-200",
        property: "bg-orange-50 text-orange-700 border-orange-200",
        family: "bg-pink-50 text-pink-700 border-pink-200",
        admin: "bg-purple-50 text-purple-700 border-purple-200",
        lawyer: "bg-blue-50 text-blue-700 border-blue-200",
        "legal-assistant": "bg-teal-50 text-teal-700 border-teal-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
