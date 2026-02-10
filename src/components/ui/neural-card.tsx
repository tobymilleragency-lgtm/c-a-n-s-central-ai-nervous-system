import React from "react";
import { cn } from "@/lib/utils";
interface NeuralCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}
export function NeuralCard({ children, className, glow = false, ...props }: NeuralCardProps) {
  return (
    <div
      className={cn(
        "neural-glass rounded-2xl transition-all duration-300",
        glow && "shadow-[0_0_20px_rgba(0,212,255,0.15)] border-bio-cyan/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}