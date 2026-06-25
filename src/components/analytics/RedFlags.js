/**
 * RedFlags — only meaningful when serious issues are detected.
 * Accepts the merged red_flags from the report (AI prose) or raw signals.
 */

const SEV = {
  high: { color: "#fe2c55", label: "Kritis" },
  medium: { color: "#f59e0b", label: "Perlu perhatian" },
};

export default function RedFlags({ flags = [] }) {
  if (!flags.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {flags.map((f, i) => {
        const sev = SEV[f.severity] || SEV.medium;
        return (
          <div key={i} className="rounded-2xl border-l-4 bg-white p-4 shadow-sm" style={{ borderLeftColor: sev.color }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🚩</span>
              <p className="text-sm font-semibold text-black">{f.title}</p>
              <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: sev.color, background: `color-mix(in srgb, ${sev.color} 12%, transparent)` }}>
                {sev.label}
              </span>
            </div>
            {(f.explanation || f.data) && (
              <p className="mt-2 text-sm leading-6 text-black/65">{f.explanation || f.data}</p>
            )}
            {f.priority_fix && (
              <p className="mt-2 text-sm leading-6 text-black/75">
                <span className="font-semibold text-black">Prioritas: </span>{f.priority_fix}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
