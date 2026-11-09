"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Mark } from "@/components/mark";
import { discussMailto } from "@/lib/site";
import { cn } from "@/lib/utils";

// Absolute so the nav still works from subpages such as /experiments.
const links = [
  { href: "/#patrol", id: "patrol", label: "Patrol" },
  { href: "/#cleaning", id: "cleaning", label: "Cleaning" },
  { href: "/#approach", id: "approach", label: "Approach" },
  { href: "/#contact", id: "contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = links
      .map((link) => document.getElementById(link.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ??
          [],
      );
    const first = focusable()[0];
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = focusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const toggle = toggleRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (previouslyFocused ?? toggle)?.focus();
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 861px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <a className="wordmark" href="/#top">
        <Mark className="wordmark-mark" />
        <span>iServe</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="nav-link"
            aria-current={current === link.id ? "location" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <a
        className={cn(buttonVariants({ variant: "default" }), "desktop-cta header-cta")}
        href={discussMailto}
      >
        Discuss your deployment
      </a>
      <Button
        ref={toggleRef}
        type="button"
        variant="outline"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-nav"
        data-testid="menu-button"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </Button>
      {open ? (
        <div
          ref={panelRef}
          id="mobile-nav"
          className="mobile-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-testid="mobile-nav"
        >
          <p id={titleId} className="kicker">
            iServe Robotics
          </p>
          <nav aria-label="Mobile">
            <ul className="mobile-links">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            className={cn(buttonVariants({ variant: "default" }), "header-cta mobile-cta")}
            href={discussMailto}
            onClick={() => setOpen(false)}
          >
            Discuss your deployment
          </a>
        </div>
      ) : null}
    </header>
  );
}
