"use client";

import { useTransition } from "@/lib/transitions/TransitionContext";
import { MouseEvent, ReactNode, CSSProperties } from "react";

interface Props {
  href:      string;
  children:  ReactNode;
  className?: string;
  style?:    CSSProperties;
  transition?: "split" | "diagonal" | "ink" | "particles";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export function TransitionLink({
  href, children, className, style,
  transition, onMouseEnter, onMouseLeave, onClick,
}: Props) {
  const { navigate, isTransitioning } = useTransition();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (isTransitioning) return;
    onClick?.();
    navigate(href, transition);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ cursor: "none", textDecoration: "none", ...style }}
    >
      {children}
    </a>
  );
}