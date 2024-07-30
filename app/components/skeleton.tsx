import React, { ReactNode, cloneElement } from "react";
import { twMerge } from "tailwind-merge";

interface SkeletonItemProps {
  className?: string;
  width: string | number;
  height: string | number;
  animationDelay?: number; // Optional delay for staggering
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({
  className,
  width,
  height,
  animationDelay = 0,
}) => {
  return (
    <div
      className={twMerge("bg-slate-100 rounded animate-pulse", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        animationDelay: `${animationDelay}s`,
      }}
    />
  );
};

interface SkeletonGroupProps {
  children: ReactNode;
  className?: string;
}
const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={twMerge("flex flex-col gap-2 w-full", className)}>
      {React.Children.map(children, (child, index) =>
        cloneElement(child as React.ReactElement, {
          animationDelay: 0.2 * index,
        }),
      )}
    </div>
  );
};

export { SkeletonItem, SkeletonGroup };

export default SkeletonItem;
