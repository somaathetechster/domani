"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageEntryOptions {
  // CSS selector for elements to stagger in
  stagger?:  string;
  // Delay before starting (after transition panels clear)
  delay?:    number;
  // Duration per element
  duration?: number;
  // Y offset to animate from
  fromY?:    number;
  // Custom GSAP timeline callback
  custom?:   (tl: gsap.core.Timeline) => void;
}

export function usePageEntry(opts: PageEntryOptions = {}) {
  const {
    stagger  = "[data-entry]",
    delay    = 0.05,
    duration = 0.8,
    fromY    = 32,
    custom,
  } = opts;

  const containerRef = useRef<HTMLDivElement>(null);
  const played       = useRef(false);

  const play = () => {
    if (played.current) return;
    played.current = true;

    const container = containerRef.current;
    const targets   = container
      ? container.querySelectorAll(stagger)
      : document.querySelectorAll(stagger);

    const tl = gsap.timeline({ delay });

    if (custom) {
      custom(tl);
      return;
    }

    // Default: fade + translateY stagger
    tl.fromTo(
      targets,
      { opacity: 0, y: fromY, willChange: "opacity, transform" },
      {
        opacity:  1,
        y:        0,
        duration,
        stagger:  0.07,
        ease:     "power3.out",
        clearProps: "willChange",
      }
    );
  };

  useEffect(() => {
    // Listen for the transition system's page-enter event
    const handler = () => play();
    window.addEventListener("domani:page-enter", handler);

    // Also play immediately in case we're doing a direct page load
    const t = setTimeout(play, 100);

    return () => {
      window.removeEventListener("domani:page-enter", handler);
      clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return containerRef;
}

// ─── CHAR SPLIT UTILITY ───────────────────────────────────────────────────────
// Call this on page entry to animate large heading text character by character
export function animateChars(selector: string, delay = 0, staggerDelay = 0.03) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const text  = el.textContent || "";
    const chars = text.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      return span;
    });
    el.textContent = "";
    chars.forEach(s => el.appendChild(s));

    gsap.fromTo(
      chars,
      { opacity: 0, y: "110%", rotateX: -60 },
      {
        opacity:  1, y: "0%", rotateX: 0,
        duration: 0.65, stagger: staggerDelay, delay,
        ease: "power3.out",
        clearProps: "willChange",
      }
    );
  });
}

// ─── LINE REVEAL UTILITY ──────────────────────────────────────────────────────
// Reveals lines of text with a clip-path sweep
export function animateLines(selector: string, delay = 0) {
  const elements = document.querySelectorAll(selector);
  gsap.fromTo(
    elements,
    { clipPath: "inset(0 100% 0 0)", opacity: 0 },
    {
      clipPath: "inset(0 0% 0 0)", opacity: 1,
      duration: 0.9, stagger: 0.12, delay,
      ease: "power3.inOut",
    }
  );
}

// ─── MAGNETIC ELEMENT ─────────────────────────────────────────────────────────
// Attach magnetic hover physics to any element ref
export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const dist   = Math.sqrt(dx*dx + dy*dy);
      const radius = Math.max(rect.width, rect.height) * 1.5;

      if (dist < radius) {
        const factor = (1 - dist / radius) * strength;
        gsap.to(el, { x: dx * factor, y: dy * factor, duration: 0.4, ease: "power2.out" });
      } else {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      }
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}