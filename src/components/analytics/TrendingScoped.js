"use client";

import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";

function fmt(n) {
  if (typeof n !== "number") return n ?? "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function VideoCard({ v }) {
  const [open, setOpen] = useState(false);
  const ai = v.ai || {};
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5">
          {v.cover ? <img src={v.cover} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-black/30"><Play size={18} /></div>}
          <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-[9px] text-white">{v.duration}s</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-black">{v.desc || "(tanpa caption)"}</p>
          <p className="mt-1 text-xs text-black/45">{fmt(v.views)} views · {v.engagement_rate}% eng</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(v.hashtags || []).slice(0, 3).map((t) => (
              <span key={t} className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-black/55">#{t}</span>
            ))}
          </div>
          {ai.compatible != null && (
            <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${ai.compatible ? "bg-[#25f4ee]/15 text-[#0fb5ad]" : "bg-black/[0.06] text-black/50"}`}>
              {ai.compatible ? "Cocok buat kamu" : "Kurang cocok"}
            </span>
          )}
        </div>
      </div>

      <button onClick={() => setOpen((o) => !o)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/10 py-1.5 text-xs font-semibold text-black/70 hover:bg-black/[0.04]">
        {open ? "Tutup analisis" : "Kenapa ini tren & cara adaptasi"}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 text-xs leading-5 text-black/65">
          {ai.why_trending && <p><span className="font-semibold text-black">Kenapa tren: </span>{ai.why_trending}</p>}
          {ai.hook_pattern && <p><span className="font-semibold text-black">Pola hook: </span>{ai.hook_pattern}</p>}
          {ai.compatibility_reason && <p><span className="font-semibold text-black">Kecocokan: </span>{ai.compatibility_reason}</p>}
          {ai.how_to_adapt && <p className="rounded-lg bg-[#7b2ff7]/[0.06] p-2"><span className="font-semibold text-[#7b2ff7]">Cara adaptasi: </span>{ai.how_to_adapt}</p>}
        </div>
      )}
    </div>
  );
}

export default function TrendingScoped({ videos = [] }) {
  if (!videos.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {videos.map((v) => <VideoCard key={v.id} v={v} />)}
    </div>
  );
}
