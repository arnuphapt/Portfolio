import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Vertical scroll "ruler": a 60px tick strip on the right edge (1:1 document-length track, needle, readout) plus
// interactive section labels that live to its left. Labels move between three homes by scroll position:
//   queued (bottom, compact) -> riding the rail (vertical, at the section's top) -> stacked at the top (current = big).
// Hovering the strip zooms the track into a full-page map (z: 0 -> 1, damped); the labels follow by the same z.
// One rAF loop writes styles through refs; React renders only on measure.

const PAD = 24; // px kept free at the top/bottom of the viewport for the needle
const STRIP = 60; // gutter width: ticks, needle, readout. Labels' right edge = this strip's left edge (local x = 0).
const XV = STRIP / 2; // centre line of a word riding the rail
const SLOT = 20; // vertical pitch of the stacked labels
const QBOT = 36; // centre of the last queue slot, from the viewport bottom
const TOPC = 92; // centre of the first compact top slot (28px under the 64px nav)
const CUR_DY = 26; // the current section's label sits this much lower than a compact one
const SQ = 0.47; // letter scale: queued and compact-stacked labels
const SR = 0.59; // letter scale: riding the rail
const SMAP = 0.5; // letter scale: map state
const PEEL_START = 20; // peel begins when the section top is this far below the viewport bottom
const PEEL_RANGE = 88; // px of section-top travel over which a queued word peels onto the rail
const FLIP_HI = 277; // section-top y where a riding word starts flipping into the top stack
const FLIP_LO = 130; // ... and where the flip is complete
const SPREAD = 0.6; // fraction of a transition spent staggering letters (last letter leaves first)
const PEEL_BOW = 6; // px a letter bows up while peeling
const FLIP_BOW = 8; // px a letter bows left while flipping
const INTENT_MS = 160; // hover intent delay before the zoom starts
const LEAVE_MS = 160; // grace before the zoom closes, so the pointer can travel from the strip onto a map label
const FOLLOW = 14; // 1/s: how quickly label progress follows the scroll
const MAJORS = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5 ... 100
const MINORS = Array.from({ length: 101 }, (_, i) => i);
const SECTIONS = [
  { id: "Home", label: "HOME" },
  { id: "About", label: "ABOUT" },
  { id: "Portofolio", label: "PORTFOLIO" }, // id spelling matches the DOM
  { id: "Contact", label: "CONTACT" },
];
const N = SECTIONS.length;
const GRAY = "rgba(255,255,255,"; // white, alpha appended below
const BLUE = "#3b82f6";

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const lerp = (a, b, t) => a + (b - a) * t;
// a letter's own progress: the tail letter leaves first, the head letter last
const letterU = (t, k, n) => clamp01((t - (n > 1 ? (SPREAD * (n - 1 - k)) / (n - 1) : 0)) / (1 - SPREAD));
// position progress runs slightly ahead of the rotation/scale progress
const posP = (u) => 1 - Math.pow(1 - u, 1.25);

// The one mapping. Inputs: scrollY, doc height H, viewport height V. All outputs are viewport-space px.
//  - needleY: scrollbar-thumb mapping, p of the way down the usable height [PAD, V - PAD].
//  - trackY : translate of the 1:1 track (tick q sits at q*H inside it). A plain `-scrollY` puts tick p at p*V,
//             so a scroll-dependent offset PAD*(1 - 2p) is added to move it onto needleY.
// Invariant: tick p lands at p*H + trackY = p*H - p*(H-V) + PAD*(1-2p) = p*V + PAD - 2*PAD*p = needleY.
// The map state keeps it: tick p sits at PAD + p*(V - 2*PAD) = needleY, so the needle always points at its tick.
function rulerMap(scrollY, H, V) {
  const max = H - V;
  const p = max > 0 ? clamp01(scrollY / max) : 0;
  const needleY = PAD + p * (V - 2 * PAD);
  const trackY = -p * Math.max(max, 0) + PAD * (1 - 2 * p);
  return { p, needleY, trackY };
}

const fmt = (p) => `${String(Math.round(p * 100)).padStart(3, "0")}%`;

// null = render nothing (coarse pointer / small screen), 'static' = reduced motion, 'full' = full instrument
function useRulerMode() {
  const [mode, setMode] = useState(null);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMode(!fine.matches ? null : reduce.matches ? "static" : "full");
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);
  return mode;
}

const ScrollRuler = () => {
  const mode = useRulerMode();
  const animated = mode === "full";
  const [H, setH] = useState(0);
  const dirty = useRef(true);
  const geo = useRef({ H: 0, V: 0, tops: [] });
  const adv = useRef(SECTIONS.map(({ label }) => label.split("").map(() => 20))); // letter advances at 34px
  const zTarget = useRef(0);
  const intentT = useRef(0);
  const leaveT = useRef(0);
  const trackRef = useRef(null);
  const needleRef = useRef(null);
  const readoutRef = useRef(null);
  const ghostRef = useRef(null);
  const boxRef = useRef(null);
  const navRef = useRef(null);
  const measureRef = useRef(null);
  const tickRefs = useRef([]);
  const numRefs = useRef([]);
  const letterRefs = useRef(SECTIONS.map(() => []));

  // hide the native scrollbar only in the full instrument
  useEffect(() => {
    if (!animated) return;
    const style = document.createElement("style");
    style.textContent =
      "html{scrollbar-width:none!important}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}";
    document.head.appendChild(style);
    return () => style.remove();
  }, [animated]);

  // measure section tops / doc height / letter advances now, on resize, when fonts load, and when the body resizes
  useLayoutEffect(() => {
    if (!mode) return;
    const measure = () => {
      const docH = document.documentElement.scrollHeight;
      const V = window.innerHeight;
      const tops = SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });
      geo.current = { H: docH, V, tops };
      const mw = measureRef.current;
      if (mw) {
        // measured at 340px and divided by 10: sub-pixel advances at the 34px letter size, immune to transforms
        adv.current = SECTIONS.map((_, i) =>
          Array.from(mw.children[i].children, (s) => s.getBoundingClientRect().width / 10)
        );
      }
      dirty.current = true;
      setH((prev) => (prev === docH ? prev : docH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    document.fonts?.addEventListener?.("loadingdone", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener?.("loadingdone", measure);
    };
  }, [mode]);

  // single rAF loop: writes transforms directly, no React renders while scrolling
  useEffect(() => {
    if (!mode) return;
    let raf;
    let last = performance.now();
    let lastY = -1;
    let lastZ = -1;
    let z = 0;
    const aS = SECTIONS.map(() => 0); // peel progress per section (damped follow of the scroll-derived target)
    const bS = SECTIONS.map(() => 0); // flip progress per section
    let primed = false;
    const obs = []; // flat [lo, hi, weight] triples: label spans that fade the percent numbers
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const y = window.scrollY;

      let moving = false;
      // z: damped toward the hover target (never leaves 0 in reduced motion)
      const zT = animated ? zTarget.current : 0;
      if (z !== zT) {
        z += (zT - z) * (1 - Math.exp(-dt * 11));
        if (Math.abs(zT - z) < 0.002) z = zT;
        else moving = true;
      }
      const { H: docH, V, tops } = geo.current;
      if (!V) return;
      const { p, needleY, trackY } = rulerMap(y, docH, V);

      // label progress targets: pure functions of the scroll position
      const k = 1 - Math.exp(-dt * FOLLOW);
      for (let i = 0; i < N; i++) {
        const ty = tops[i] == null ? 1e9 : tops[i] + trackY; // where the section's top sits on the rail
        let a = clamp01((V + PEEL_START - ty) / PEEL_RANGE); // 0 queued -> 1 riding
        let b = clamp01((FLIP_HI - ty) / (FLIP_HI - FLIP_LO)); // 0 riding -> 1 stacked at the top
        if (i === N - 1) b = Math.max(b, clamp01((p - 0.96) / 0.04)); // last section may never scroll to the top
        if (!animated) {
          aS[i] = Math.round(a);
          bS[i] = Math.round(b);
        } else if (!primed) {
          aS[i] = a;
          bS[i] = b;
        } else {
          aS[i] += (a - aS[i]) * k;
          bS[i] += (b - bS[i]) * k;
          if (Math.abs(a - aS[i]) < 0.001) aS[i] = a;
          else moving = true;
          if (Math.abs(b - bS[i]) < 0.001) bS[i] = b;
          else moving = true;
        }
      }
      primed = true;
      if (y === lastY && !dirty.current && !moving && z === lastZ) return;
      lastY = y;
      const zWas = lastZ;
      lastZ = z;
      dirty.current = false;

      const span = V - 2 * PAD;
      if (trackRef.current) trackRef.current.style.transform = `translate3d(0,${trackY}px,0)`;
      if (needleRef.current) needleRef.current.style.transform = `translate3d(0,${needleY}px,0)`;
      if (readoutRef.current) readoutRef.current.textContent = fmt(p);
      if (ghostRef.current) ghostRef.current.style.background = `${GRAY}${0.4 + 0.55 * z})`;
      if (boxRef.current) {
        // the part of the page currently on screen, in map coordinates
        boxRef.current.style.transform = `translate3d(0,${PAD + (y / docH) * span}px,0)`;
        boxRef.current.style.height = `${(V / docH) * span}px`;
        boxRef.current.style.opacity = String(z);
      }
      // tick q: y(q) = (1-z)*(q*H + trackY) + z*(PAD + q*span). Relative to the track that is an affine offset.
      const A = PAD - trackY;
      const B = span - docH;
      if (z > 0 || zWas > 0) {
        for (let q = 0; q <= 100; q++) {
          const el = tickRefs.current[q];
          if (el) el.style.transform = `translate3d(0,${z * (A + (B * q) / 100)}px,0)`;
        }
      }

      // --- label lifecycle -------------------------------------------------------------------------------
      obs.length = 0;
      for (let i = 0; i < N; i++) {
        const row = adv.current[i];
        const letters = letterRefs.current[i];
        const n = row.length;
        let len = 0;
        for (let m = 0; m < n; m++) len += row[m];
        const ty = tops[i] == null ? 1e9 : tops[i] + trackY;
        const a = aS[i];
        const b = bS[i];
        const qy = V - QBOT - (N - 1 - i) * SLOT; // bottom queue slot
        const lenR = len * SR;
        const yT = Math.min(ty + 2, qy + 3 - lenR); // top edge of the riding word, pinned so it never starts below the queue
        const cur = clamp01(b - (i + 1 < N ? bS[i + 1] : 0)); // 1 while this is the current section
        const sTop = lerp(SQ, 1, cur);
        const topY = TOPC + i * SLOT + CUR_DY * cur; // top stack slot
        const mapY = Math.max(PAD + 9, PAD + (tops[i] == null ? 0 : tops[i] / docH) * span); // map position
        let pre = 0;
        for (let m = 0; m < n; m++) {
          const w = row[m];
          const suf = len - pre - w;
          const qx = -(suf + w / 2) * SQ; // queue pose: right-aligned, right edge at the strip's left edge
          const ry = yT + lenR - (pre + w / 2) * SR; // rail pose
          const tx = -(suf + w / 2) * sTop; // top pose
          let x;
          let yy;
          let rot;
          let sc;
          let op;
          if (b > 0) {
            // rail -> top stack
            const u = letterU(b, m, n);
            // x leads y: a trailing letter slides left under the row first, then rises into place (never through its neighbours)
            const px = 1 - Math.pow(1 - u, 1.6);
            x = lerp(XV, tx, px) - FLIP_BOW * Math.sin(Math.PI * px);
            yy = lerp(ry, topY, u);
            rot = -90 * (1 - u);
            sc = lerp(SR, sTop, u);
            op = lerp(0.55, 0.5 + 0.5 * cur, u);
          } else {
            // queue -> rail
            const u = letterU(a, m, n);
            const pp = posP(u);
            x = lerp(qx, XV, pp);
            yy = lerp(qy, ry, pp) - PEEL_BOW * Math.sin(Math.PI * pp);
            rot = -90 * u;
            sc = lerp(SQ, SR, u);
            op = lerp(0.5, 0.55, u);
          }
          // 1:1 -> map: right-aligned at the strip's left edge, at the section's percent position
          const mx = -(suf + w / 2) * SMAP;
          x = lerp(x, mx, z);
          yy = lerp(yy, mapY, z);
          rot = lerp(rot, 0, z);
          sc = lerp(sc, SMAP, z);
          op = tops[i] == null ? 0 : lerp(op, 0.95, z);
          const el = letters[m];
          if (el) {
            el.style.transform = `translate3d(${x - w / 2}px,${yy - 17}px,0) rotate(${rot}deg) scale(${sc})`;
            el.style.opacity = String(op);
          }
          pre += w;
        }
        if (tops[i] != null) obs.push(yT - 4, yT + lenR + 4, a * (1 - b) * (1 - z));
      }
      if (navRef.current) navRef.current.style.opacity = "1";

      // percent numbers: positioned like their ticks, faded where a riding word is in the way
      for (let qi = 0; qi < MAJORS.length; qi++) {
        const q = MAJORS[qi];
        const el = numRefs.current[qi];
        if (!el) continue;
        el.style.transform = `translate3d(0,${z * (A + (B * q) / 100)}px,0) translateY(-50%)`;
        const yq = (1 - z) * ((q / 100) * docH + trackY) + z * (PAD + (q / 100) * span);
        let keep = 1;
        for (let j = 0; j < obs.length; j += 3) {
          const d = yq < obs[j] ? obs[j] - yq : yq > obs[j + 1] ? yq - obs[j + 1] : 0;
          keep *= 1 - obs[j + 2] * (1 - Math.min(1, d / 8));
        }
        el.style.opacity = String(keep);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [mode, animated]);

  useEffect(
    () => () => {
      clearTimeout(intentT.current);
      clearTimeout(leaveT.current);
    },
    []
  );

  if (!mode) return null;

  // viewport y -> progress, the inverse of rulerMap's needle mapping
  const pFromClientY = (cy) => clamp01((cy - PAD) / (window.innerHeight - 2 * PAD));
  const onMove = (e) => {
    const g = ghostRef.current;
    if (!g) return;
    const y = PAD + pFromClientY(e.clientY) * (window.innerHeight - 2 * PAD);
    g.style.transform = `translate3d(0,${y}px,0)`;
    g.style.opacity = "1";
  };
  // zoom intent comes only from the tick strip; label buttons hold the current state (cancel a pending open / close)
  const onStripEnter = () => {
    clearTimeout(leaveT.current);
    if (!animated) return;
    clearTimeout(intentT.current);
    intentT.current = setTimeout(() => {
      zTarget.current = 1;
      dirty.current = true;
    }, INTENT_MS);
  };
  const release = () => {
    clearTimeout(intentT.current);
    clearTimeout(leaveT.current);
    leaveT.current = setTimeout(() => {
      zTarget.current = 0;
      dirty.current = true;
    }, LEAVE_MS);
  };
  const onStripLeave = () => {
    if (ghostRef.current) ghostRef.current.style.opacity = "0";
    release();
  };
  const hold = () => {
    clearTimeout(intentT.current);
    clearTimeout(leaveT.current);
  };
  const behavior = animated ? "smooth" : "instant"; // 'instant' beats the global `scroll-behavior: smooth !important`
  const onClick = (e) => {
    // scrollbar-thumb mapping, in the 1:1 state and in the map alike
    const { H: docH, V } = geo.current;
    const max = Math.max(docH - V, 0);
    window.scrollTo({ top: pFromClientY(e.clientY) * max, behavior });
  };
  const jump = (id) => (e) => {
    e.stopPropagation();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior });
  };

  const mono = { fontFamily: 'ui-monospace, "Geist Mono", SFMono-Regular, Menlo, Consolas, monospace' };

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-[55] select-none" style={{ width: STRIP, ...mono }}>
      {/* tick track, viewport box, pointer line (decorative) */}
      <div aria-hidden="true" className="absolute inset-0 z-[1] overflow-hidden">
        <div ref={trackRef} className="absolute inset-x-0 top-0 will-change-transform" style={{ height: H }}>
          {MINORS.map((q) => (
            <div
              key={q}
              ref={(el) => (tickRefs.current[q] = el)}
              className="absolute right-0"
              style={{
                top: `${q}%`,
                width: q % 5 === 0 ? 20 : 6,
                height: 1,
                background: `${GRAY}${q % 5 === 0 ? 0.85 : 0.22})`,
              }}
            />
          ))}
          {MAJORS.map((q, i) => (
            <span
              key={q}
              ref={(el) => (numRefs.current[i] = el)}
              className="absolute"
              style={{
                ...mono,
                top: `${q}%`,
                right: 24,
                transform: "translateY(-50%)",
                fontSize: 10,
                lineHeight: "14px",
                color: `${GRAY}0.5)`,
              }}
            >
              {q}
            </span>
          ))}
        </div>
        <div
          ref={boxRef}
          className="absolute inset-x-0 top-0"
          style={{ opacity: 0, background: `${GRAY}0.08)`, border: `1px solid ${GRAY}0.3)` }}
        />
        <div ref={ghostRef} className="absolute inset-x-0 top-0" style={{ height: 2, background: `${GRAY}0.4)`, opacity: 0 }} />
      </div>

      {/* tick strip: the only zoom trigger and click-to-scroll target */}
      <div
        onClick={onClick}
        onMouseEnter={onStripEnter}
        onMouseLeave={onStripLeave}
        onMouseMove={onMove}
        className="rl-strip pointer-events-auto absolute inset-y-0 right-0 z-[2] cursor-pointer"
        style={{ width: STRIP }}
      />

      {/* section labels: real buttons, each letter its own span (positions are written by the rAF loop) */}
      <nav ref={navRef} aria-label="Page sections" className="pointer-events-none absolute inset-0 z-[3]" style={{ opacity: 0 }}>
        {SECTIONS.map(({ id, label }, i) => (
          <button key={id} type="button" aria-label={`Jump to ${label.toLowerCase()} section`} className="rl-btn" onClick={jump(id)} onMouseEnter={hold} onMouseLeave={release}>
            {label.split("").map((ch, k) => (
              <span key={k} ref={(el) => (letterRefs.current[i][k] = el)} aria-hidden="true" className="rl-ch">
                {ch}
              </span>
            ))}
          </button>
        ))}
      </nav>

      {/* needle + readout (decorative) */}
      <div aria-hidden="true" ref={needleRef} className="pointer-events-none absolute inset-x-0 top-0 z-[4] will-change-transform">
        <div style={{ position: "absolute", right: 0, top: 0, width: STRIP, height: 1, background: BLUE }} />
        <span
          ref={readoutRef}
          style={{
            ...mono,
            position: "absolute",
            right: 3,
            top: 3,
            fontSize: 10,
            lineHeight: "12px",
            color: BLUE,
          }}
        >
          000%
        </span>
      </div>

      {/* hidden: letter advances are measured here */}
      <div aria-hidden="true" ref={measureRef} className="rl-measure">
        {SECTIONS.map(({ id, label }) => (
          <div key={id}>
            {label.split("").map((ch, k) => (
              <span key={k}>{ch}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollRuler;
