/**
 * AmbientBackground
 * Three soft colour fields drift slowly behind every screen. Fixed and
 * negative-z so it sits above the page colour but below all content,
 * cards and chrome. pointer-events-none and aria-hidden — it is texture,
 * not interface. The global prefers-reduced-motion rule freezes it.
 */
export function AmbientBackground() {
  return (
    <div
      className="k-no-print pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas"
      aria-hidden="true"
    >
      <div className="k-circuit-pattern absolute inset-0 opacity-70" />
      <div className="k-drift k-drift-a" />
      <div className="k-drift k-drift-b" />
      <div className="k-drift k-drift-c" />
    </div>
  );
}
