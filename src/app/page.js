"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InteractiveGrid from "@/components/InteractiveGrid";
import TikTokIcon from "@/components/TikTokIcon";

const CARDS = [
  {
    kind: "quality",
    title: "Kualitas Konten",
    body: "Hook, kejelasan, dan daya tonton dinilai dalam sekejap.",
    accent: "var(--accent-purple)",
    tilt: "sm:group-hover:-translate-x-28 sm:group-hover:-rotate-12",
    rest: "sm:-rotate-3",
  },
  {
    kind: "engagement",
    title: "Pola Engagement",
    body: "Lihat apa yang membuat orang suka, komentar, dan membagikan.",
    accent: "var(--accent-red)",
    tilt: "sm:group-hover:-translate-y-6",
    rest: "sm:rotate-0",
  },
  {
    kind: "tips",
    title: "Tips yang Bisa Diterapkan",
    body: "Langkah dengan bahasa sederhana yang bisa kamu terapkan hari ini.",
    accent: "var(--accent-blue)",
    tilt: "sm:group-hover:translate-x-28 sm:group-hover:rotate-12",
    rest: "sm:rotate-3",
  },
];

// ---- Card preview visuals (illustrative sample data) ----

function ScoreGauge({ accent }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const pct = 0.87;
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="7"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          className="transition-[stroke-dashoffset] duration-700 ease-out [stroke-dashoffset:var(--on)] sm:[stroke-dashoffset:var(--off)] sm:group-hover/card:[stroke-dashoffset:var(--on)]"
          style={{ "--off": circ, "--on": circ * (1 - pct) }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-bold text-black">
        87
      </span>
    </div>
  );
}

function MiniBars({ accent }) {
  const bars = [40, 62, 48, 80, 70, 95, 64];
  return (
    <div>
      <div className="flex h-[60px] items-end gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-2.5 origin-bottom rounded-sm transition-transform duration-500 ease-out [transform:scaleY(1)] sm:[transform:scaleY(0.35)] sm:group-hover/card:[transform:scaleY(1)]"
            style={{
              height: `${h}%`,
              background: accent,
              transitionDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-black/50">
        ❤ 12.4k · 💬 980 · ↗ 4.2%
      </p>
    </div>
  );
}

function Checklist({ accent }) {
  const items = ["Posting jam 7–9 malam", "Hook di 2 detik pertama", "Tambah teks/caption"];
  return (
    <ul className="flex flex-col gap-2">
      {items.map((t, i) => (
        <li
          key={t}
          className="flex items-center gap-2 text-sm text-black/70 transition-all duration-500 [opacity:1] [transform:translateX(0)] sm:[opacity:0.55] sm:[transform:translateX(-4px)] sm:group-hover/card:[opacity:1] sm:group-hover/card:[transform:translateX(0)]"
          style={{ transitionDelay: `${i * 70}ms` }}
        >
          <span
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
            style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke={accent}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function CardVisual({ kind, accent }) {
  if (kind === "quality") return <ScoreGauge accent={accent} />;
  if (kind === "engagement") return <MiniBars accent={accent} />;
  return <Checklist accent={accent} />;
}

function CardBody({ card }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">{card.title}</h3>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: card.accent }}
        />
      </div>

      {/* Preview visual */}
      <div className="mt-4 flex flex-1 items-center">
        <CardVisual kind={card.kind} accent={card.accent} />
      </div>
    </>
  );
}

// Mobile-only swipeable card deck (stacked → swipe to send front to back).
function MobileDeck({ cards }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(null);

  function onDown(e) {
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onMove(e) {
    if (startX.current == null) return;
    setDrag(e.clientX - startX.current);
  }
  function onUp() {
    if (startX.current == null) return;
    const d = drag;
    startX.current = null;
    setDragging(false);
    if (Math.abs(d) > 70) {
      setDrag(d > 0 ? 440 : -440); // fling out
      setTimeout(() => {
        setOrder((o) => [...o.slice(1), o[0]]); // front → back
        setDrag(0);
      }, 280);
    } else {
      setDrag(0); // snap back
    }
  }

  return (
    <div className="mt-10 w-full sm:hidden">
      <div className="relative mx-auto h-64 w-full max-w-xs select-none">
        {order.map((idx, p) => {
          const card = cards[idx];
          const front = p === 0;
          const transform = front
            ? `translateX(${drag}px) rotate(${drag * 0.05}deg)`
            : `translateY(${p * 14}px) scale(${1 - p * 0.05})`;
          return (
            <article
              key={card.title}
              onPointerDown={front ? onDown : undefined}
              onPointerMove={front ? onMove : undefined}
              onPointerUp={front ? onUp : undefined}
              onPointerCancel={front ? onUp : undefined}
              className="group/card absolute left-0 right-0 top-0 flex h-56 flex-col rounded-2xl border border-black/10 bg-white p-5 text-left shadow-lg"
              style={{
                transform,
                zIndex: cards.length - p,
                opacity: p > 2 ? 0 : 1 - p * 0.12,
                transition:
                  dragging && front
                    ? "none"
                    : "transform 0.3s ease, opacity 0.3s ease",
                borderTopColor: card.accent,
                borderTopWidth: "4px",
                touchAction: "pan-y",
                cursor: front ? "grab" : "default",
              }}
            >
              <CardBody card={card} />
            </article>
          );
        })}
      </div>

      {/* Indicator + hint */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {order.map((idx, p) => (
          <span
            key={idx}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: p === 0 ? 18 : 6,
              background: p === 0 ? cards[idx].accent : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-black/35">
        Geser untuk menjelajah →
      </p>
    </div>
  );
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function handleAnalyze(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const u = username.trim().replace(/^@/, "");
    router.push(u ? `/analytics?u=@${encodeURIComponent(u)}` : "/analytics");
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <InteractiveGrid />

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-xl font-bold tracking-tight text-black">
          Stratiq
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-black backdrop-blur">
          <TikTokIcon size={16} />
          Gratis untuk UMKM
        </span>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-black sm:text-6xl">
          Pahami{" "}
          <span className="text-[#fe2c55]">TikTok</span>-mu
          <br />
          Kembangkan{" "}
          <span className="relative inline-block">
            bisnismu
            <svg
              className="absolute -bottom-2 left-0 w-full overflow-visible"
              viewBox="0 0 220 18"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 11 C 45 3, 80 16, 120 8 S 190 4, 216 10"
                stroke="#fe2c55"
                strokeWidth="5"
                strokeLinecap="round"
                className="scribble-underline"
              />
            </svg>
          </span>
          .
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-black/60 sm:text-lg">
          Masukkan username TikTok-mu dan dapatkan analisis instan tentang
          kualitas konten, pola engagement, serta rekomendasi yang bisa langsung
          diterapkan — gratis.
        </p>

        {/* Input */}
        <form
          onSubmit={handleAnalyze}
          className="mt-10 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-black/10 bg-white p-2 ring-1 ring-black/5 transition-all duration-300 [box-shadow:0_12px_30px_-12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.04)] focus-within:ring-black/15 focus-within:[box-shadow:0_20px_45px_-14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-xl bg-black/[0.035] px-3 py-1 [box-shadow:inset_0_2px_5px_rgba(0,0,0,0.12),inset_0_-1px_0_rgba(255,255,255,0.7)]">
            <span className="shrink-0 text-xl font-semibold text-black/40">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usernamekamu"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-black placeholder:text-black/30 focus:outline-none"
            />
          </div>

          {/* Analyze button with marching scribble when input has a value */}
          <span className="relative shrink-0">
            <svg
              aria-hidden
              className={`pointer-events-none absolute -inset-[5px] h-[calc(100%+10px)] w-[calc(100%+10px)] overflow-visible transition-opacity duration-300 ${
                username ? "opacity-100" : "opacity-0"
              }`}
              preserveAspectRatio="none"
            >
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="14"
                ry="14"
                fill="none"
                stroke="#fe2c55"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="scribble-loop"
              />
            </svg>
            <button
              type="submit"
              disabled={submitting}
              className="relative inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-black/85 active:scale-[0.98] disabled:opacity-70 [box-shadow:0_6px_14px_-4px_rgba(0,0,0,0.5)]"
            >
              {submitting && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {submitting ? "Menganalisis…" : "Analisis"}
            </button>
          </span>
        </form>

        {/* Fan cards — desktop */}
        <div className="group relative mt-20 hidden items-end justify-center sm:flex sm:[perspective:1200px]">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className={`group/card relative -mx-10 flex h-56 w-60 cursor-default flex-col rounded-2xl border border-black/10 bg-white p-5 text-left shadow-lg transition-all duration-500 ease-out ${card.rest} ${card.tilt} hover:!translate-y-[-1.5rem] hover:!rotate-0 hover:scale-105 hover:shadow-2xl`}
              style={{ borderTopColor: card.accent, borderTopWidth: "4px" }}
            >
              <CardBody card={card} />
            </article>
          ))}
        </div>

        {/* Swipe deck — mobile */}
        <MobileDeck cards={CARDS} />
      </main>

      <footer className="px-6 py-6 text-center text-xs text-black/40">
        Stratiq · Dibuat untuk usaha kecil di TikTok
      </footer>
    </div>
  );
}
