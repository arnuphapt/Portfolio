/* eslint-disable react/prop-types -- tiny presentational primitives, repo has no PropTypes convention */

// Shared HUD primitives (phase 1 landing page). Classes live in src/index.css.

export const Cross = ({ className = "" }) => <span aria-hidden="true" className={`cross ${className}`} />;

export const Hud = ({ children, className = "" }) => <span className={`hud ${className}`}>{children}</span>;

// label ---- tick measurement line ---- label
export const HudStrip = ({ left, right, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <Hud>{left}</Hud>
    <span aria-hidden="true" className="ticks min-w-4 flex-1" />
    {right ? <Hud className="text-right">{right}</Hud> : null}
  </div>
);

// Full-width section with a hairline at its top (draws on scroll), a centered rail and crosshairs where the
// hairline meets the rail edges. `id` stays on the outermost element so anchors and the ruler can find it.
export const Section = ({ id, rule = true, className = "", children }) => (
  <section id={id} className={`relative ${className}`}>
    {rule ? <span data-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-hair" /> : null}
    <div className="rail relative">
      {rule ? (
        <>
          <Cross className="left-0 top-0" />
          <Cross className="right-0 top-0" />
        </>
      ) : null}
      {children}
    </div>
  </section>
);
