// TikTok glyph with the signature cyan/red offset. `mono` renders a single
// solid-color note (uses currentColor) for places that need a flat icon.
export default function TikTokIcon({ size = 24, mono = false, className = "" }) {
  const note = (fill, dx = 0, dy = 0) => (
    <path
      transform={`translate(${dx} ${dy})`}
      fill={fill}
      d="M28.5 8.2c1.6 1.1 3.5 1.8 5.6 1.9v4.1c-2-.1-3.9-.6-5.6-1.5v8.4c0 4.6-3.7 8.3-8.3 8.3S11.9 25.7 11.9 21c0-4.6 3.7-8.3 8.3-8.3.4 0 .8 0 1.2.1v4.2c-.4-.1-.8-.2-1.2-.2-2.3 0-4.1 1.9-4.1 4.2s1.8 4.2 4.1 4.2 4.1-1.9 4.1-4.2V4h4.2c.1 1.5.6 2.9 1.5 4.2z"
    />
  );

  if (mono) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 36"
        className={className}
        fill="currentColor"
        aria-hidden
      >
        {note("currentColor")}
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 36"
      className={className}
      aria-hidden
    >
      {note("var(--accent-blue)", -1.4, 1.4)}
      {note("var(--accent-red)", 1.4, -1.4)}
      {note("#0a0a0a")}
    </svg>
  );
}
