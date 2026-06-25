"use client";

import { useEffect, useRef } from "react";

const CELL = 72; // px
const RADIUS = 170; // cursor lift reach
const PULSE_RADIUS = 200; // auto-lift reach
const ACCENTS = ["123, 47, 247", "254, 44, 85", "37, 244, 238"]; // purple, red, blue (rgb)

export default function InteractiveGrid() {
  const wrapRef = useRef(null);
  const cellsRef = useRef([]); // { el, cx, cy, accent }
  const pointer = useRef({ x: -9999, y: -9999, inside: false });
  const pulses = useRef([]); // { x, y, born, dur }
  const rafRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function build() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);

      wrap.style.gridTemplateColumns = `repeat(${cols}, ${CELL}px)`;
      wrap.style.gridTemplateRows = `repeat(${rows}, ${CELL}px)`;
      wrap.innerHTML = "";
      cellsRef.current = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const el = document.createElement("span");
          el.className = "grid-cell";
          wrap.appendChild(el);
          cellsRef.current.push({
            el,
            cx: c * CELL + CELL / 2,
            cy: r * CELL + CELL / 2,
            accent: ACCENTS[(r + c) % ACCENTS.length],
          });
        }
      }
    }

    function liftFrom(cell, x, y, radius, strength) {
      const dx = cell.cx - x;
      const dy = cell.cy - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= radius) return 0;
      return (1 - dist / radius) * strength;
    }

    function frame(now) {
      // Drop finished pulses.
      pulses.current = pulses.current.filter((p) => now - p.born < p.dur);

      const p = pointer.current;
      const active = p.inside || pulses.current.length > 0;

      for (const cell of cellsRef.current) {
        let f = p.inside ? liftFrom(cell, p.x, p.y, RADIUS, 1) : 0;
        for (const pulse of pulses.current) {
          const t = (now - pulse.born) / pulse.dur; // 0..1
          const s = Math.sin(t * Math.PI); // ease in/out, peak at mid
          const pf = liftFrom(cell, pulse.x, pulse.y, PULSE_RADIUS, s);
          if (pf > f) f = pf;
        }

        if (f > 0.001) {
          const a = cell.accent;
          cell.el.style.transform = `translateY(${-14 * f}px) scale(${1 + 0.12 * f})`;
          cell.el.style.background = `rgba(${a}, ${0.22 * f * f})`;
          cell.el.style.zIndex = "1";
        } else if (cell.el.style.transform) {
          cell.el.style.transform = "";
          cell.el.style.background = "";
          cell.el.style.zIndex = "";
        }
      }

      if (active) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = 0; // idle until next pointer move / pulse
      }
    }

    function ensureLoop() {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(frame);
    }

    function onMove(e) {
      pointer.current = { x: e.clientX, y: e.clientY, inside: true };
      ensureLoop();
    }

    function onLeave() {
      pointer.current.inside = false;
      ensureLoop();
    }

    // Auto-lift: random spot every few seconds.
    let timer;
    function scheduleAuto() {
      const delay = 500 + Math.random() * 500; // 0.5s–1s
      timer = setTimeout(() => {
        pulses.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          born: performance.now(),
          dur: 1500 + Math.random() * 900,
        });
        ensureLoop();
        scheduleAuto();
      }, delay);
    }

    build();
    scheduleAuto();
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 grid overflow-hidden bg-white [perspective:800px]"
    />
  );
}
