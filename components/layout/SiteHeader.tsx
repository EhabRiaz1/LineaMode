"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LINEAMODE_HOME_INTRO_REPLAY } from "@/components/layout/IntroLoader";
import type { PageVisibility } from "@/lib/cms";

const BASE_NAV = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/capabilities", label: "Services" },
  { href: "/journal", label: "Newsletter", visibilityKey: "journal" },
  { href: "/contact", label: "Contact" },
];

type Props = {
  visibility?: PageVisibility;
};

export function SiteHeader({ visibility }: Props) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  const NAV = useMemo(() => {
    return BASE_NAV.filter((item) => {
      if (!item.visibilityKey) return true;
      const pageVisibility = visibility?.[item.visibilityKey];
      return pageVisibility?.navbar !== false;
    });
  }, [visibility]);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;

      if (y < 80) {
        setHidden(false);
      } else if (dy > 4 && y > 120) {
        setHidden(true);
      } else if (dy < -4) {
        setHidden(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The admin console owns its own chrome (sidebar + topbar). Suppress the
  // marketing header on every /admin route so we don't double-up the UI.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      data-hidden={hidden}
      className={cn(
        "fixed left-1/2 top-3 md:top-4 z-50",
        "w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] md:max-w-[1480px]",
        "rounded-full border border-stone/30 bg-stone/35 backdrop-blur-[6px] backdrop-saturate-150",
        "shadow-[0_8px_24px_-18px_rgba(15,15,12,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]",
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden ? "opacity-0" : "opacity-100",
      )}
      style={{
        transform: hidden
          ? "translate(-50%, -160%)"
          : "translate(-50%, 0)",
      }}
    >
      <div className="px-5 md:px-7 py-2.5 md:py-3 flex items-center gap-6">
        <div className="flex-shrink-0">
          <Link
            href="/"
            aria-label="Lineamode home"
            className="flex items-center"
            onClick={() => {
              if (pathname === "/") {
                window.dispatchEvent(new CustomEvent(LINEAMODE_HOME_INTRO_REPLAY));
              }
            }}
          >
            <BrandLogo
              context="light"
              priority
              className="h-3.5"
            />
          </Link>
        </div>

        <nav
          className="hidden md:flex flex-1 items-center justify-center gap-6 pl-10 md:translate-x-4"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-label text-ink/80 hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 text-label border border-ink/30 px-4 py-2 rounded-full hover:bg-ink hover:text-[var(--color-stone-veil)] transition-colors"
          >
            <span className="size-1.5 rounded-full bg-ink group-hover:bg-[var(--color-stone-veil)]" />
            Start a project
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => {
            const nextOpen = !open;
            setOpen(nextOpen);
            if (nextOpen) setHidden(false);
          }}
          className="md:hidden flex flex-col gap-1.5 p-2 ml-auto"
        >
          <span
            className={cn(
              "block h-px w-6 bg-ink transition-transform duration-500",
              open && "translate-y-[7px] rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-px w-6 bg-ink transition-opacity duration-300",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-px w-6 bg-ink transition-transform duration-500",
              open && "-translate-y-[5px] -rotate-45",
            )}
          />
        </button>
      </div>

      {/* Mobile menu — anchored to the floating pill so it slides out
          from underneath rather than from the very top of the viewport. */}
      <div
        className={cn(
          "md:hidden absolute inset-x-0 top-full mt-2 rounded-2xl bg-stone border border-ink/10 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <nav className="px-5 py-6 flex flex-col gap-4" aria-label="Mobile primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-h2 text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/start"
            onClick={() => setOpen(false)}
            className="mt-4 text-label inline-flex items-center gap-2 self-start border border-ink/30 px-4 py-2 rounded-full"
          >
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}
