"use client";

/**
 * AnalyzeGate — wrapping boundary for the analytics page.
 *
 * In Next.js App Router, the page is already a Server Component that fetches
 * data server-side.  This client wrapper provides a minimal fade-in reveal
 * so the skeleton (loading.js) → real page transition is smooth.
 *
 * When `handle` is empty, it renders children immediately (no fetch needed).
 */

import { useState, useEffect, useRef } from "react";

export default function AnalyzeGate({ handle, children }) {
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    if (!handle) {
      setReady(true);
      return;
    }

    // Small delay so the loading.js skeleton gets replaced cleanly.
    // The real data fetch already happened server-side — this just
    // waits for hydration + a brief settle.
    const id = setTimeout(() => {
      if (mounted.current) setReady(true);
    }, 100);

    return () => {
      mounted.current = false;
      clearTimeout(id);
    };
  }, [handle]);

  if (ready) {
    return <div className="fade-in-up">{children}</div>;
  }

  // Render nothing here — loading.js shows the skeleton.
  return null;
}
