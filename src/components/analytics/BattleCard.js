"use client";

import { useState } from "react";
import Tooltip from "@/components/ui/Tooltip";

function fmt(n) {
  if (typeof n !== "number") return n ?? "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

const DIM_META = {
  engagement: { label: "Eng", unit: "%", higher: true, tip: "Engagement rate" },
  save_to_view: { label: "Save", unit: "%", higher: true, tip: "Save-to-view ratio" },
  share_velocity: { label: "Share/hari", unit: "", higher: true, tip: "Share velocity (shares per day)" },
  duration: { label: "Durasi", unit: "s", higher: false, tip: "Video duration (shorter often wins reach)" },
};

function Side({ who, name, avatar, followers, metrics, win }) {
  return (
    <div className={`flex-1 rounded-xl p-3 ${win ? "bg-[#25f4ee]/10" : "bg-black/[0.03]"}`}>
      <div className="flex items-center gap-2">
        {avatar ? (
          <img src={avatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#7b2ff7]/15 text-xs font-bold text-[#7b2ff7]">
            {(name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-black">{who}</p>
          <p className="truncate text-[11px] text-black/45">{fmt(followers)} followers</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-center">
        {[["Eng", `${metrics?.engagement_rate ?? 0}%`], ["Views", fmt(metrics?.avg_views ?? 0)],
          ["Post/mgg", metrics?.posts_per_week ?? 0], ["Save", `${metrics?.save_rate ?? 0}%`]].map(([l, v]) => (
          <div key={l} className="rounded-md bg-white/70 py-1">
            <div className="text-[11px] font-bold text-black">{v}</div>
            <div className="text-[9px] uppercase tracking-wide text-black/40">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoMini({ v, owner }) {
  return (
    <div className="flex-1">
      <div className="relative w-full overflow-hidden rounded-lg bg-black/5" style={{ aspectRatio: "9/16" }}>
        {v?.cover ? (
          <img src={v.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-black/30">▶</div>
        )}
        <span className="absolute left-1 top-1 rounded bg-black/40 px-1 py-0.5 text-[9px] font-semibold text-white">{owner}</span>
        <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-[9px] text-white">{v?.duration ?? 0}s</span>
      </div>
      <p className="mt-1 truncate text-[11px] font-medium text-black">{v?.title || "(tanpa caption)"}</p>
      <p className="text-[10px] text-black/45">{fmt(v?.views ?? 0)} · {v?.engagement ?? 0}%</p>
    </div>
  );
}

function DimChip({ dimKey, dim }) {
  const meta = DIM_META[dimKey];
  if (meta) {
    const u = dim.user, c = dim.competitor;
    const userWins = meta.higher ? u > c : u < c;
    return (
      <Tooltip content={`${meta.tip}: kamu ${u}${meta.unit} vs ${c}${meta.unit}`}>
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${userWins ? "bg-[#25f4ee]/15 text-[#0fb5ad]" : "bg-[#fe2c55]/10 text-[#fe2c55]"}`}>
          {meta.label} {userWins ? "▲" : "▼"}
        </span>
      </Tooltip>
    );
  }
  // qualitative dims
  const labels = {
    hook: ["Hook", `Kamu: "${dim.user}" vs "${dim.competitor}"`],
    hashtags: ["Hashtag", `Overlap ${dim.overlap} tag`],
    music: ["Musik", `Kamu ${dim.user} vs ${dim.competitor}`],
    posting_time: ["Jam", `Kamu ${dim.user} vs ${dim.competitor}`],
  };
  const l = labels[dimKey];
  if (!l) return null;
  return (
    <Tooltip content={l[1]}>
      <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-black/60">{l[0]}</span>
    </Tooltip>
  );
}

export default function BattleCard({ user, comp }) {
  const [open, setOpen] = useState(false);
  const userWinsAccount = (user?.metrics?.engagement_rate ?? 0) >= (comp.metrics?.engagement_rate ?? 0);
  const matchups = comp.matchups || [];
  const breakdowns = comp.matchup_breakdowns || [];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      {/* Side-by-side header */}
      <div className="flex items-stretch gap-2">
        <Side who="Kamu" name={user?.nickname} avatar={user?.avatar} followers={user?.followers} metrics={user?.metrics} win={userWinsAccount} />
        <div className="grid shrink-0 place-items-center px-1">
          <span className="rounded-full bg-black px-2 py-1 text-[10px] font-bold text-white">VS</span>
        </div>
        <Side who={`@${comp.username}`} name={comp.nickname} avatar={comp.avatar} followers={comp.followers} metrics={comp.metrics} win={!userWinsAccount} />
      </div>

      {/* Verdict */}
      {comp.verdict && (
        <p className="mt-3 rounded-xl bg-black/[0.03] p-3 text-sm leading-6 text-black/70">{comp.verdict}</p>
      )}

      {/* Head-to-head toggle */}
      {matchups.length > 0 && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/[0.04]"
        >
          {open ? "Sembunyikan" : "Adu video head-to-head"} ({matchups.length})
          <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {matchups.map((mu, i) => {
            const bd = breakdowns[i] || {};
            const dims = mu.dimensions || {};
            return (
              <div key={i} className="rounded-xl border border-black/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-black/60">Matchup #{mu.rank}</span>
                  {bd.winner && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bd.winner === "user" ? "bg-[#25f4ee]/15 text-[#0fb5ad]" : "bg-[#fe2c55]/10 text-[#fe2c55]"}`}>
                      {bd.winner === "user" ? "Kamu menang" : "Mereka menang"}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <VideoMini v={mu.user_video} owner="Kamu" />
                  <VideoMini v={mu.competitor_video} owner="Mereka" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(dims).map(([k, d]) => <DimChip key={k} dimKey={k} dim={d} />)}
                </div>
                {bd.breakdown && <p className="mt-2 text-xs leading-5 text-black/60">{bd.breakdown}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Brutal AI verdict */}
      {comp.ai_verdict && (
        <div className="mt-3 rounded-xl border-l-4 border-[#fe2c55] bg-[#fe2c55]/[0.04] p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#fe2c55]">AI Verdict</p>
          <p className="text-sm leading-6 text-black/75">{comp.ai_verdict}</p>
        </div>
      )}
    </div>
  );
}
