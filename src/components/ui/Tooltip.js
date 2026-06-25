"use client";

import { useState } from "react";

/**
 * Lightweight hover tooltip. Wraps children; shows `content` on hover/focus.
 */
export default function Tooltip({ content, children, className = "" }) {
  const [show, setShow] = useState(false);
  if (!content) return children;
  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-black px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-lg">
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black" />
        </span>
      )}
    </span>
  );
}
