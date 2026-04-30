"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/Wordmark";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/products", label: "Products" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/journal", label: "Journal" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled
          ? "py-3 backdrop-blur-md bg-stone/80"
          : "py-5 bg-transparent",
      )}
    >
      <div className="shell flex items-center justify-between gap-6">
        <Link href="/" aria-label="Lineamode home" className="flex items-center">
          <Wordmark
            className={cn(
              "transition-all duration-500",
              scrolled ? "h-3.5" : "h-4",
            )}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
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

        <Link
          href="/contact"
          className="hidden md:inline-flex items-center gap-2 text-label border border-ink/30 px-4 py-2 rounded-full hover:bg-ink hover:text-stone transition-colors"
        >
          <span className="size-1.5 rounded-full bg-ink group-hover:bg-stone" />
          Start a project
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2"
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

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-[60px] bg-stone border-t hairline transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden",
          open ? "max-h-[80vh]" : "max-h-0",
        )}
      >
        <nav className="shell flex flex-col gap-4 py-8" aria-label="Mobile primary">
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
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 text-label inline-flex items-center gap-2 self-start border border-ink/30 px-4 py-2 rounded-full"
          >
            Start a project
          </Link>
        </nav>
      </div>

      {/* Hairline underline (Linear Grid motif) */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-ink/10 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
    </header>
  );
}
