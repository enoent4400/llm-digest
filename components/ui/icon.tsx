import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 'default' | 'bold' | 'heavy';
}

export function Icon({ 
  icon: LucideIcon, 
  size = 24, 
  strokeWidth,
  variant = 'default',
  className,
  ...props 
}: IconProps) {
  // Auto-set strokeWidth based on variant if not explicitly provided
  const finalStrokeWidth = strokeWidth ?? {
    default: 2,
    bold: 2.5,
    heavy: 3
  }[variant];

  return (
    <LucideIcon
      size={size}
      strokeWidth={finalStrokeWidth}
      className={cn("text-foreground", className)}
      {...props}
    />
  );
}

// Preset icon variants for common use cases
export function IconLight(props: Omit<IconProps, 'variant'>) {
  return <Icon variant="default" strokeWidth={1.5} {...props} />;
}

export function IconBold(props: Omit<IconProps, 'variant'>) {
  return <Icon variant="bold" {...props} />;
}

export function IconHeavy(props: Omit<IconProps, 'variant'>) {
  return <Icon variant="heavy" {...props} />;
}