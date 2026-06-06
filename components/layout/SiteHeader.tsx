"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { easeBrand } from "@/lib/motion/easings";
import type { PageVisibility } from "@/lib/cms";
import { CONTACT_FORM_HREF } from "@/lib/navigation";

const START_PROJECT_LABEL = "Start a Project";
const START_PROJECT_HREF = CONTACT_FORM_HREF;

const BASE_NAV = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/capabilities", label: "Services" },
  { href: "/journal", label: "Newsletter", visibilityKey: "journal" },
];

type NavItem = (typeof BASE_NAV)[number];

type Props = {
  visibility?: PageVisibility;
};

function MobileNavDrawer({
  open,
  onClose,
  nav,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const itemCount = nav.length + 1;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.42, ease: easeBrand }}
          className="fixed inset-0 z-[60] md:hidden bg-stone text-ink"
        >
          <div className="flex h-full flex-col px-5 pb-10 pt-20">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.08, ease: easeBrand }}
              className="text-eyebrow text-ink/50 mb-4"
            >
              / Menu
            </motion.p>

            <nav className="flex flex-1 flex-col justify-start" aria-label="Mobile primary">
              <div className="flex flex-col gap-2">
                {nav.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{
                      duration: 0.32,
                      delay: 0.1 + index * 0.055,
                      ease: easeBrand,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block border-b border-ink/10 py-4 font-[family-name:var(--font-display)] text-[clamp(2rem,9vw,3.25rem)] font-light leading-[0.98] tracking-[-0.02em] text-ink transition-colors hover:text-ink/70"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{
                  duration: 0.32,
                  delay: 0.1 + nav.length * 0.055,
                  ease: easeBrand,
                }}
                className="mt-16 pt-8"
              >
                <Link
                  href={START_PROJECT_HREF}
                  onClick={onClose}
                  className="inline-flex h-14 items-center rounded-full border border-ink/25 bg-ink px-7 text-[var(--color-stone-veil)] transition-colors hover:bg-ink/90"
                >
                  <span className="text-label">{START_PROJECT_LABEL}</span>
                </Link>
              </motion.div>
            </nav>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, delay: 0.1 + itemCount * 0.055, ease: easeBrand }}
              className="text-label text-ink/45"
            >
              Lineamode Apparel
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The admin console owns its own chrome (sidebar + topbar). Suppress the
  // marketing header on every /admin route so we don't double-up the UI.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        data-hidden={hidden}
        className={cn(
          "fixed left-1/2 top-3 md:top-4",
          open ? "z-[70]" : "z-50",
          "w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] md:max-w-[1480px]",
          "rounded-full border border-stone/30 bg-stone/55 backdrop-blur-[6px] backdrop-saturate-150",
          "shadow-[0_8px_24px_-18px_rgba(15,15,12,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]",
          "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          hidden && !open ? "opacity-0" : "opacity-100",
        )}
        style={{
          transform: hidden && !open
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
              onClick={() => setOpen(false)}
            >
              <BrandLogo context="light" priority className="h-3.5" />
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
              href={START_PROJECT_HREF}
              className="inline-flex items-center text-label border border-ink/30 px-4 py-2 rounded-full hover:bg-ink hover:text-[var(--color-stone-veil)] transition-colors"
            >
              {START_PROJECT_LABEL}
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
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
      </header>

      <MobileNavDrawer open={open} onClose={() => setOpen(false)} nav={NAV} />
    </>
  );
}
