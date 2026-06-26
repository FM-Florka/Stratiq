"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

function Item({ icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-black">
          <span className="text-base">{icon}</span>{title}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-black/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-black/[0.06] p-4">{children}</div>}
    </div>
  );
}

function Reason({ children }) {
  return <p className="mt-1 text-xs leading-5 text-black/45">{children}</p>;
}

export default function ContentPlaybook({ playbook, collabRadar = [] }) {
  if (!playbook) return null;
  const fb = playbook.format_blueprint || [];
  const gw = playbook.golden_windows || {};
  const hc = playbook.hashtag_clusters || [];
  const audio = playbook.audio_strategy || {};
  const collab = (collabRadar.length ? collabRadar : playbook.collab_radar) || [];
  const plan = playbook.action_plan_30d || [];

  const recColor = (r) => /perbanyak|do more|gandakan/i.test(r) ? "#0fb5ad" : /kurangi|drop/i.test(r) ? "#fe2c55" : "#7b2ff7";

  return (
    <div className="flex flex-col gap-3">
      {/* Format Blueprint */}
      <Item icon="🎬" title="Format Blueprint" defaultOpen>
        <div className="flex flex-col gap-2.5">
          {fb.map((f, i) => (
            <div key={i} className="rounded-xl bg-black/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-black">{f.format}</span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ color: recColor(f.recommendation), background: `color-mix(in srgb, ${recColor(f.recommendation)} 12%, transparent)` }}>
                  {f.recommendation}
                </span>
              </div>
              <Reason>{f.reason}</Reason>
            </div>
          ))}
        </div>
      </Item>

      {/* Golden Posting Windows */}
      <Item icon="⏰" title="Golden Posting Windows">
        {gw.summary && <p className="mb-3 text-sm leading-6 text-black/65">{gw.summary}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {(gw.slots || []).map((s, i) => (
            <div key={i} className="rounded-xl bg-black/[0.03] p-3">
              <p className="text-sm font-semibold text-black">{s.day} · {s.window}</p>
              <Reason>{s.reason}</Reason>
            </div>
          ))}
        </div>
      </Item>

      {/* Hashtag Clusters */}
      <Item icon="#️⃣" title="Hashtag Clusters">
        <div className="flex flex-col gap-2.5">
          {hc.map((c, i) => (
            <div key={i} className="rounded-xl bg-black/[0.03] p-3">
              <p className="text-sm font-semibold text-black">{c.theme} <span className="font-normal text-black/45">· {c.use_for}</span></p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(c.tags || []).map((t) => (
                  <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-black/70">{t}</span>
                ))}
              </div>
              <Reason>{c.reason}</Reason>
            </div>
          ))}
        </div>
      </Item>

      {/* Audio Strategy */}
      <Item icon="🎵" title="Audio Strategy">
        {audio.what_works && <p className="text-sm leading-6 text-black/70">{audio.what_works}</p>}
        {(audio.jump_on || []).length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-black">Sound trending untuk dicoba:</p>
            <ul className="mt-1 flex flex-col gap-1">
              {audio.jump_on.map((a, i) => <li key={i} className="text-sm text-black/60">🎶 {a}</li>)}
            </ul>
          </div>
        )}
        {audio.reason && <Reason>{audio.reason}</Reason>}
      </Item>

      {/* Collab Radar */}
      <Item icon="🤝" title="Collab Radar">
        <div className="grid gap-2 sm:grid-cols-2">
          {collab.map((c, i) => (
            <div key={i} className="rounded-xl bg-black/[0.03] p-3">
              <p className="text-sm font-semibold text-black">@{c.username}</p>
              <p className="mt-0.5 text-xs text-black/60">{c.why}</p>
              <p className="mt-1 text-xs font-medium text-[#7b2ff7]">{c.move}</p>
            </div>
          ))}
          {collab.length === 0 && <p className="text-sm text-black/45">Belum ada kandidat kolaborasi.</p>}
        </div>
      </Item>

      {/* 30-Day Action Plan */}
      <Item icon="🗓️" title="30-Day Action Plan" defaultOpen>
        <div className="flex flex-col gap-2.5">
          {plan.map((w, i) => (
            <div key={i} className="rounded-xl bg-black/[0.03] p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-[11px] font-bold text-white">M{w.week}</span>
                <span className="text-sm font-semibold text-black">{w.focus}</span>
              </div>
              <ul className="mt-1.5 flex flex-col gap-1 pl-8">
                {(w.actions || []).map((a, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-black/65">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#fe2c55]" />{a}
                  </li>
                ))}
              </ul>
              {w.expected_impact && <Reason>📈 {w.expected_impact}</Reason>}
            </div>
          ))}
        </div>
      </Item>
    </div>
  );
}
