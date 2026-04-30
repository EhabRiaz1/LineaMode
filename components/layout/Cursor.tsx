"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor — a 6px dot tracking the pointer 1:1, plus a 32px ring that
 * trails with inertia. Ring scales/fills on hover targets and on press.
 * Hidden on touch / coarse pointer devices via CSS.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onDown = () => ring.setAttribute("data-state", "press");
    const onUp = () => ring.setAttribute("data-state", visible ? "hover" : "");

    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const handleHover = () => {
      const handler = (e: Event) => {
        const t = e.target as HTMLElement;
        const interactive = t.closest(
          "a, button, [role='button'], input, textarea, select, [data-cursor='hover']",
        );
        ring.setAttribute("data-state", interactive ? "hover" : "");
      };
      document.addEventListener("pointerover", handler);
      return () => document.removeEventListener("pointerover", handler);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const cleanupHover = handleHover();
    raf = requestAnimationFrame(tick);

    dot.style.opacity = "0";
    ring.style.opacity = "0";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cleanupHover();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
