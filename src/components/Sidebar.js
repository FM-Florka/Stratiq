"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, LineChart, Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import TikTokIcon from "@/components/TikTokIcon";

const NAV = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/analytics", label: "Analitik", icon: LineChart },
];

/**
 * Minimal left sidebar. Icon rail by default; toggle to show labels.
 * Active route highlighted with the TikTok red accent.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <aside
      className={`sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-black/10 bg-white/80 backdrop-blur transition-[width] duration-200 sm:flex ${
        open ? "w-52" : "w-16"
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black text-white">
          <TikTokIcon size={16} />
        </span>
        {open && <span className="truncate text-lg font-bold tracking-tight text-black">Stratiq</span>}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-[#fe2c55]/10 text-[#fe2c55]" : "text-black/60 hover:bg-black/[0.04] hover:text-black"
              }`}
            >
              <Icon size={20} className="shrink-0" strokeWidth={2} />
              {open && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="flex flex-col gap-1 px-2 pb-4">
        <a
          href="https://github.com/FM-Florka/Stratiq"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black/60 transition-colors hover:bg-black/[0.04] hover:text-black"
        >
          <Sparkles size={20} className="shrink-0" />
          {open && <span className="truncate">GitHub</span>}
        </a>
        <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-black/40" title="Gratis untuk UMKM">
          <Sparkles size={20} className="shrink-0 text-[#7b2ff7]" />
          {open && <span className="truncate">Gratis untuk UMKM</span>}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black/50 transition-colors hover:bg-black/[0.04] hover:text-black"
          aria-label={open ? "Tutup sidebar" : "Buka sidebar"}
        >
          {open ? <PanelLeftClose size={20} className="shrink-0" /> : <PanelLeft size={20} className="shrink-0" />}
          {open && <span className="truncate">Ciutkan</span>}
        </button>
      </div>
    </aside>
  );
}
