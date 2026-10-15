/* eslint-disable react/prop-types -- same stance as components/hud.jsx: repo has no PropTypes convention */
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { accentOf } from "../lib/accent";
import { PHASES, STAGES, IMPL, MAX_ROUNDS, RETURN_MS, place, trackOf } from "../lib/aiPipeline";

// Compact default view of the pipeline: one slim row of stage nodes (hover / focus / tap -> preview popover), the
// return arc drawn under it (lit while a stage fails and returns).

const dot = <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 bg-[color:var(--card-accent)]" />;

// Subagent chips shown in the stage popover.
const AgentChips = ({ agents }) => (
  <ul className="relative ml-3 mt-2 space-y-1.5 border-l border-hair-strong pl-3">
    {agents.map((a) => (
      <li
        key={a.name}
        className={`relative flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border bg-ink-2 px-2.5 py-1.5 ${
          a.direct ? "border-dashed border-hair-strong" : "border-hair-strong"
        }`}
      >
        <span aria-hidden="true" className="absolute -left-3 top-1/2 h-px w-3 bg-hair-strong" />
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg">
          {dot}
          {a.name}
        </span>
        {a.role && <span className="font-mono text-[10px] leading-snug text-fg-3">{a.role}</span>}
      </li>
    ))}
  </ul>
);

// Agent branch under a stage node (xl+): one tick per agent. Each chip draws its own trunk segment (first one up to the
// node, last one stops at its tick) so the trunk ends exactly on the last tick whatever the chip heights. Lights with the node.
const Branch = ({ agents, lit }) => {
  const line = lit ? "bg-[color:var(--card-accent)]" : "bg-hair-strong";
  return (
    <ul className="relative ml-2 mt-1.5 hidden space-y-2.5 pl-2 pt-10 xl:block">
      {agents.map((a, index) => (
        <li
          key={a.name}
          className={`relative border bg-ink-2 px-1 py-1 font-mono text-[9.5px] leading-tight text-fg-2 ${
            a.direct ? "border-dashed" : ""
          } ${lit ? "border-[color:var(--card-accent)] text-fg" : "border-hair-strong"} transition-colors duration-300`}
        >
          {/* trunk segment: from the previous chip (first: from the node; ul mt + pt + border = 47px) down to this tick */}
          <span
            aria-hidden="true"
            className={`absolute -left-2 w-px transition-colors duration-300 ${index === 0 ? "-top-[47px]" : "-top-3"} ${index === agents.length - 1 ? "bottom-1/2" : "bottom-0"} ${line}`}
          />
          <span aria-hidden="true" className={`absolute -left-2 top-1/2 h-px w-2 transition-colors duration-300 ${line}`}>
            {lit && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 h-[3px] w-[3px] -translate-y-1/2 rounded-full bg-[color:var(--card-accent)]"
                style={{
                  animation: "ai-in 1.2s ease-in infinite",
                  animationDelay: `${index * 0.15}s`,
                  filter: "drop-shadow(0 0 3px var(--card-accent))",
                }}
              />
            )}
          </span>
          {a.name}
        </li>
      ))}
      {/* track for the rising light only; after the chips so space-y and the first chip stay as laid out */}
      <span aria-hidden="true" className="absolute -top-1.5 bottom-3 left-px w-px">
        {lit && (
          <span
            aria-hidden="true"
            className="absolute -left-px h-4 w-[3px] rounded-full bg-gradient-to-t from-transparent to-[color:var(--card-accent)]"
            style={{ animation: "ai-rise 1.2s ease-in infinite", filter: "drop-shadow(0 0 3px var(--card-accent))" }}
          />
        )}
      </span>
    </ul>
  );
};

// Return arc highlight: while `active`, draws a solid amber stroke along `d` once (from the failing breakpoint to 05).
const ReturnArc = ({ d, active, width }) => {
  const path = useRef(null);
  useLayoutEffect(() => {
    const el = path.current;
    if (!el) return undefined;
    if (!active) {
      gsap.set(el, { autoAlpha: 0 });
      return undefined;
    }
    const len = el.getTotalLength();
    gsap.set(el, { autoAlpha: 1, strokeDasharray: len, strokeDashoffset: len });
    const t = gsap.to(el, { strokeDashoffset: 0, duration: (RETURN_MS - 150) / 1000, ease: "power1.inOut" });
    return () => t.kill();
  }, [d, active]);
  return <path ref={path} d={d} fill="none" stroke="var(--accent-4)" strokeWidth={width} opacity="0" />;
};

// Travelling light: when the run moves into a node, a short phase-coloured streak runs the connector(s) leading into it
// (ME -> MAIN AGENT -> 01 on a cycle's first move) and fades out, landing as the node's outline lights (see the node delay).
// Overlays the connectors only (ends overshoot a few px into the node borders, never reaching the node text).
const STREAK_L = 16;
const STREAK_PAD = 6;
const STREAK_S = 0.3;
const Streak = ({ strip, state }) => {
  const rect = useRef(null);
  const mode = state?.mode;
  const i = state?.i;
  const cycle = state?.cycle;
  useLayoutEffect(() => {
    const root = strip.current;
    const el = rect.current;
    if (!root || !el || mode !== "move") return undefined;
    const links = (i === 0 ? ["me", "main"] : [i - 1])
      .map((k) => root.querySelector(`[data-link="${k}"]`))
      .filter(Boolean)
      .map((l) => place(l, root))
      .filter((p) => p.w > 0); // MAIN -> 01 is not rendered below xl
    const d = STREAK_S / links.length;
    const tl = gsap.timeline();
    links.forEach((p, k) => {
      const t = k * d;
      tl.set(el, { x: p.x - STREAK_PAD, y: p.y + p.h / 2 - 1, autoAlpha: 0 }, t)
        .to(el, { x: p.x + p.w + STREAK_PAD - STREAK_L, duration: d, ease: "power1.inOut" }, t)
        .to(el, { autoAlpha: 1, duration: d * 0.3, ease: "none" }, t)
        .to(el, { autoAlpha: 0, duration: d * 0.4, ease: "none" }, t + d * 0.6);
    });
    return () => {
      tl.kill();
      gsap.set(el, { autoAlpha: 0 });
    };
  }, [strip, mode, i, cycle]);
  return (
    <rect
      ref={rect}
      width={STREAK_L}
      height="2"
      rx="1"
      fill="url(#ai-streak)"
      opacity="0"
      style={{ filter: "drop-shadow(0 0 3px var(--streak))" }}
    />
  );
};

// Arc geometry: breakpoint diamonds (06, 07) -> down to a lane under the row -> left -> up into the bottom of 05.
const useArc = (strip) => {
  const [g, setG] = useState(null);
  useLayoutEffect(() => {
    const root = strip.current;
    if (!root) return undefined;
    const measure = () => {
      const nodes = [...root.querySelectorAll("[data-node]")].map((el) => place(el, root));
      const bps = [...root.querySelectorAll("[data-bp]")].map((el) => {
        const p = place(el, root);
        return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
      });
      if (nodes.length < STAGES.length || bps.length < 2) return;
      const lane = Math.max(...nodes.map((n) => n.y + n.h)) + 16;
      const ex = nodes[IMPL].x + nodes[IMPL].w / 2;
      const ey = nodes[IMPL].y + nodes[IMPL].h;
      setG({
        main: `M${bps[0].x} ${bps[0].y + 5} V${lane} H${ex} V${ey + 1}`,
        stub: `M${bps[1].x} ${bps[1].y + 5} V${lane} H${bps[0].x}`,
        ret: bps.map((b) => `M${b.x} ${b.y} V${lane} H${ex} V${ey}`),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [strip]);
  return g;
};

const POP_W = 288;
const connector = (link, cls) => (
  <span aria-hidden="true" data-link={link} className={`relative inline-block h-px bg-accent ${cls}`}>
    <span className="absolute -right-px top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 border-r border-t border-accent" />
  </span>
);

const AICompact = ({ state }) => {
  const strip = useRef(null);
  const lastPointer = useRef("mouse");
  const [pop, setPop] = useState(null); // { i, left, top | bottom, w }
  const arc = useArc(strip);
  const track = trackOf(state);

  // Popover: fixed + portalled so the reveal transform can't cut it; follows scroll/resize.
  const open = (i) => setPop((p) => (p && p.i === i ? p : { i }));
  const close = (i) => setPop((p) => (p && (i === undefined || p.i === i) ? null : p));
  const popI = pop ? pop.i : -1;

  useLayoutEffect(() => {
    if (popI < 0) return undefined;
    const measure = () => {
      const el = strip.current?.querySelector(`[data-node="${popI}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return setPop(null);
      const w = Math.min(POP_W, window.innerWidth - 16);
      const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 8), window.innerWidth - w - 8);
      const below = window.innerHeight - r.bottom > 240;
      setPop({ i: popI, left, w, ...(below ? { top: r.bottom + 10 } : { bottom: window.innerHeight - r.top + 10 }) });
    };
    const onDown = (e) => {
      if (!e.target.closest?.("[data-node]")) setPop(null);
    };
    const onKey = (e) => e.key === "Escape" && setPop(null);
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [popI]);

  const node = (s, i) => {
    const lit = track.lit === i;
    const failing = track.fail === i;
    return (
      <div key={s.n} className="relative" style={{ "--card-accent": accentOf(s.accent) }}>
        <button
          type="button"
          data-node={i}
          aria-describedby={popI === i ? "ai-pop" : undefined}
          onPointerDown={(e) => (lastPointer.current = e.pointerType)}
          onPointerEnter={(e) => e.pointerType === "mouse" && open(i)}
          onPointerLeave={(e) => e.pointerType === "mouse" && close(i)}
          onFocus={(e) => e.currentTarget.matches(":focus-visible") && open(i)}
          onBlur={() => close(i)}
          onClick={() => {
            if (lastPointer.current !== "mouse") setPop((p) => (p && p.i === i ? null : { i }));
          }}
          className={`relative flex h-14 w-full cursor-default flex-col items-center justify-center gap-1.5 border text-center transition-[border-color,box-shadow,background-color] duration-300 hover:border-[color:var(--card-accent)] xl:h-20 ${
            state?.mode === "move" ? "delay-150" : ""
          } ${
            failing
              ? "border-accent-4 bg-ink-3 shadow-[0_0_18px_-4px_var(--accent-4)]"
              : lit
                ? "border-[color:var(--card-accent)] shadow-[0_0_18px_-4px_var(--card-accent)]"
                : "border-hair-strong bg-ink-2"
          }`}
        >
          <span className="font-mono text-[13px] tracking-[0.14em] text-[color:var(--card-accent)] xl:text-sm">{s.n}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-2 max-xl:sr-only">{s.name}</span>
          {failing && (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-ink font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-4"
            >
              Fail
            </span>
          )}
          {s.breakpoint && (
            <span
              data-bp
              aria-hidden="true"
              className={`absolute -bottom-[5px] left-1/2 -ml-[5px] h-2.5 w-2.5 rotate-45 border border-accent-4 transition-colors duration-300 ${
                track.hot === i ? "bg-accent-4" : "bg-ink"
              }`}
            />
          )}
        </button>
        <Branch agents={s.agents} lit={lit} />
        {i < STAGES.length - 1 && (
          <span aria-hidden="true" data-link={i} className="absolute left-full top-7 h-px w-3 bg-hair-strong sm:w-4 xl:top-10 xl:w-5 2xl:w-7" />
        )}
      </div>
    );
  };

  return (
    <div
      ref={strip}
      className="relative border border-hair bg-ink bg-[radial-gradient(var(--rule-strong)_1px,transparent_1px)] bg-[length:20px_20px] p-4 sm:p-7"
    >
      {/* xl: one grid, ME/MAIN in column 1 of the node row so it stays level with the nodes above the agent branches */}
      <div
        style={{ "--n": STAGES.length }}
        className="grid grid-cols-[repeat(var(--n),minmax(0,1fr))] gap-x-3 gap-y-3 sm:gap-x-4 xl:gap-x-5 xl:gap-y-5 2xl:gap-x-7 xl:grid-cols-[auto_repeat(var(--n),minmax(0,1fr))]"
      >
        <div className="col-span-full flex items-center gap-2 max-xl:mb-2 xl:col-span-1 xl:col-start-1 xl:row-start-2 xl:h-20 xl:self-start">
          <span className="bg-fg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">Me</span>
          {connector("me", "w-4")}
          <span className="flex items-center gap-2 border border-accent bg-ink-2 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg shadow-[0_0_18px_-6px_var(--accent)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            Main Agent
          </span>
          {connector("main", "hidden w-6 xl:inline-block")}
        </div>

        {PHASES.map((p, pi) => (
          <p
            key={p.title}
            style={{ gridColumnEnd: `span ${p.stages.length}`, "--card-accent": accentOf(p.accent ?? pi) }}
            className={`border-b pb-1 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--card-accent)] [border-color:color-mix(in_srgb,var(--card-accent)_55%,transparent)] ${
              pi === 0 ? "xl:col-start-2" : ""
            }`}
          >
            {p.title}
          </p>
        ))}
        {STAGES.map(node)}
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="font-mono text-[10px] uppercase leading-snug tracking-[0.14em] text-accent-4">
          <span aria-hidden="true">↺ </span>FAIL / MUST-FIX → BACK TO BUILD · MAX {MAX_ROUNDS} ROUNDS
        </p>
        <p className="inline-flex items-center gap-2 border border-dashed border-accent-4/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent-4" />
          CAP HIT OR OFF-SPEC → STOP &amp; ASK ME
        </p>
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        style={state ? { "--streak": accentOf(STAGES[state.i].accent) } : undefined}
      >
        <defs>
          <linearGradient id="ai-streak" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--streak)", stopOpacity: 0 }} />
            <stop offset="0.7" style={{ stopColor: "var(--streak)" }} />
            <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--streak), white 60%)" }} />
          </linearGradient>
          <marker id="ai-compact-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent-4)" />
          </marker>
        </defs>
        {arc && (
          <>
            <path d={arc.stub} fill="none" stroke="var(--accent-4)" strokeWidth="1" strokeDasharray="4 3" />
            <path d={arc.main} fill="none" stroke="var(--accent-4)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#ai-compact-arrow)" />
          </>
        )}
        <Streak strip={strip} state={state} />
        {arc && STAGES.map((s, i) => s.breakpoint && <ReturnArc key={s.n} d={arc.ret[i - (IMPL + 1)]} active={track.hot === i} width="2" />)}
      </svg>

      {pop &&
        pop.left !== undefined &&
        createPortal(
          <div
            id="ai-pop"
            role="tooltip"
            style={{
              position: "fixed",
              left: pop.left,
              top: pop.top,
              bottom: pop.bottom,
              width: pop.w,
              "--card-accent": accentOf(STAGES[pop.i].accent),
            }}
            className="pointer-events-none z-[70] border border-[color:var(--card-accent)] bg-ink-2 p-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.8)]"
          >
            <h4 className="flex items-baseline gap-2">
              <span className="display text-[15px]">{STAGES[pop.i].name}</span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-[color:var(--card-accent)]">{STAGES[pop.i].n}</span>
            </h4>
            <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-fg-2">{STAGES[pop.i].details.join(" · ")}</p>
            <AgentChips agents={STAGES[pop.i].agents} />
          </div>,
          document.body
        )}
    </div>
  );
};

export default AICompact;
