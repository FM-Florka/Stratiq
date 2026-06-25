"use client";

import { useState } from "react";

/**
 * Interactive vertical bar chart with hover tooltips.
 * data: [{ label, value, tip }]. `unit` appended in tooltip.
 */
export default function BarChart({ data = [], unit = "", accents = ["#fe2c55", "#7b2ff7", "#25f4ee"], height = 112 }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="relative flex-1"
          style={{ height: "100%" }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div
            className="absolute bottom-0 w-full rounded-t-sm transition-opacity"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: accents[i % accents.length],
              opacity: hover === null || hover === i ? 0.9 : 0.45,
            }}
          />
          {hover === i && (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 w-max max-w-[180px] -translate-x-1/2 rounded-lg bg-black px-2 py-1 text-[11px] text-white shadow-lg">
              {d.tip || `${d.label}: ${d.value}${unit}`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
