"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Collapsible section. Header is always visible; body toggles.
 * `defaultOpen` controls initial state. `badge` renders a small pill in header.
 */
export default function Collapsible({ title, subtitle, defaultOpen = true, badge, accent = "#fe2c55", children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          {badge != null && (
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold text-black/60">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-black/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {subtitle && <p className="mb-3 mt-1 max-w-2xl text-sm text-black/50">{subtitle}</p>}
      {open && <div className={subtitle ? "" : "mt-4"}>{children}</div>}
    </section>
  );
}
