import { useEffect, useState } from "react";

// Data + run state for the AI section.

export const PHASES = [
  {
    title: "Plan",
    stages: [
      {
        n: "01",
        name: "Intake",
        details: ["assigned tasks pulled from the team tracker", "into a notes vault"],
        agents: [{ name: "Vault-keeper", role: "notes" }],
      },
      {
        n: "02",
        name: "Grill",
        details: ["interrogate the requirement", "pin down domain terms"],
        agents: [{ name: "Main Agent", role: "no subagent", direct: true }],
      },
      {
        n: "03",
        name: "Spec",
        details: ["written spec", "code mapped", "data checked"],
        agents: [
          { name: "Code-explorer", role: "scout" },
          { name: "DB-analyst", role: "dba" },
        ],
      },
      {
        n: "04",
        name: "Tickets",
        details: ["vertical slices", "explicit blocking order"],
        agents: [{ name: "Vault-keeper", role: "notes" }],
      },
    ],
  },
  {
    title: "Build",
    stages: [
      {
        n: "05",
        name: "Implement",
        impl: true,
        details: ["surgical, scoped changes from a brief"],
        agents: [
          { name: "Dev", role: "software engineer" },
          { name: "Gemini worker", role: "second model · well-scoped edits" },
          { name: "Debugger", role: "bugs: root cause + every caller first" },
        ],
      },
    ],
  },
  {
    title: "Verify",
    stages: [
      {
        n: "06",
        name: "Review",
        breakpoint: true,
        details: ["code ∥ security in parallel", "authz / IDOR", "row-level security", "secrets"],
        agents: [{ name: "Code-reviewer" }, { name: "Security-reviewer" }],
      },
      {
        n: "07",
        name: "Test",
        breakpoint: true,
        details: ["did it land?", "does it behave?", "real browser when user-facing"],
        agents: [{ name: "Tester" }],
      },
    ],
  },
  {
    title: "Ship",
    accent: 4, // skip accent-4: amber is the fail colour
    stages: [
      {
        n: "08",
        name: "Commit",
        details: ["feature branch only, never dev / main", "rebase on fresh dev", "push"],
        agents: [{ name: "Main Agent", role: "on my go-ahead", direct: true }],
      },
      {
        n: "09",
        name: "Retro",
        details: ["session log", "lessons feed back into the agents' rules"],
        agents: [{ name: "Vault-keeper", role: "notes" }],
      },
    ],
  },
];

// Flat stage list carrying the phase index and its accent index.
export const STAGES = PHASES.flatMap((p, phase) => p.stages.map((s) => ({ ...s, phase, accent: p.accent ?? phase })));
export const TOTAL_STAGES = STAGES.length;
export const MAX_ROUNDS = 3;
const LAST = STAGES.length - 1;
export const IMPL = STAGES.findIndex((s) => s.impl);

// Position of `el` inside `root` from the offset chain: unaffected by css transforms.
export const place = (el, root) => {
  let x = 0;
  let y = 0;
  for (let e = el; e && e !== root; e = e.offsetParent) {
    x += e.offsetLeft;
    y += e.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

// ---- task run: one state machine --------------------------------------------------------------
// move (i becomes active) -> sit -> next. Odd cycles fail once at a breakpoint (06, then 07 on the next odd
// cycle): fail (flash) -> back (return arc lights up toward 05) -> sit at 05 in round 2 -> forward again and passes.
const MOVE = 550;
const HOLD = 700;
const FAIL = 1000;
const BACK = 1400;
const END = 2400;
export const RETURN_MS = FAIL + BACK; // fail + back: how long the return arc is lit
const START = { i: 0, mode: "move", round: 1, cycle: 0 };
const failAt = (cycle) => (cycle % 2 === 0 ? -1 : cycle % 4 === 1 ? IMPL + 1 : IMPL + 2);

const step = (s) => {
  if (s.mode === "move") return [MOVE, { ...s, mode: "sit" }];
  if (s.mode === "fail") return [FAIL, { ...s, mode: "back" }];
  if (s.mode === "back") return [BACK, { ...s, i: IMPL, mode: "sit", round: 2 }];
  if (s.i === failAt(s.cycle) && s.round === 1) return [HOLD, { ...s, mode: "fail" }];
  if (s.i === LAST) return [END, { i: 0, mode: "move", round: 1, cycle: s.cycle + 1 }];
  return [HOLD, { ...s, i: s.i + 1, mode: "move" }];
};

export function useTaskRun(active) {
  const [s, setS] = useState(START);
  useEffect(() => {
    if (!active) return undefined;
    const [delay, next] = step(s);
    const t = setTimeout(() => setS(next), delay);
    return () => clearTimeout(t);
  }, [s, active]);
  return s;
}

// What the nodes/readout show for a run state.
export const trackOf = (s) => ({
  lit: s && (s.mode === "move" || s.mode === "sit") ? s.i : -1,
  fail: s && s.mode === "fail" ? s.i : -1,
  hot: s && (s.mode === "fail" || s.mode === "back") ? s.i : -1,
});

export const readoutOf = (s) => {
  if (!s) return `${String(TOTAL_STAGES).padStart(2, "0")} STAGES · MAX ${MAX_ROUNDS} ROUNDS`;
  const st = STAGES[s.i];
  const at = `${st.n} ${st.name.toUpperCase()}`;
  const round = `ROUND ${s.round}/${MAX_ROUNDS}`;
  if (s.mode === "fail") return `${at} · FAIL · ${round}`;
  if (s.mode === "back") return `RETURNING → ${STAGES[IMPL].n} ${STAGES[IMPL].name.toUpperCase()} · ${round}`;
  if (s.i === LAST && s.mode === "sit") return `${at} · DONE · ${round}`;
  return `${at} · ${round}`;
};
