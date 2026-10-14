import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { Section, HudStrip } from "../components/hud"
import { useReveal } from "../lib/useReveal"
import { PHASES, TOTAL_STAGES, readoutOf, useTaskRun } from "../lib/aiPipeline"
import AICompact from "./AICompact"

// Section shell + the compact pipeline strip (see AICompact). The run state lives here so it can pause off-screen.

const AIPage = () => {
  const scope = useRef(null);
  const block = useRef(null);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const reduced = useReducedMotion();
  useReveal(scope);

  // The run only ticks while the block is on screen and the tab is visible; reduced motion = static.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.1 });
    io.observe(block.current);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  const run = useTaskRun(onScreen && tabVisible && !reduced);
  const state = reduced ? null : run;

  return (
    <Section id="AI" className="mt-10 pb-24 pt-6 text-fg">
      <div ref={scope}>
        <div data-reveal className="mb-12">
          <HudStrip left="AI / WORKFLOW" right={`${String(TOTAL_STAGES).padStart(2, "0")} STAGES / ${String(PHASES.length).padStart(2, "0")} GATES`} />
        </div>

        <div className="mb-14 max-w-3xl">
          <h2 data-reveal className="display text-[clamp(2.4rem,6.5vw,5rem)]">
            How I work with <span className="contrast">AI</span>
          </h2>
          <p data-reveal className="mt-4 max-w-2xl text-base text-fg-2 sm:text-lg">
            I built my own end-to-end multi-agent development workflow across Claude Code, Codex and Gemini: a
            main agent that plans, delegates to specialised subagents and verifies their work, tuned
            continuously from audits of my own sessions.
          </p>
        </div>

        <div ref={block} data-reveal>
          <p aria-hidden="true" className="hud mb-3 min-w-0">
            <span className="text-accent">TASK</span> ▸ {readoutOf(state)}
          </p>
          <AICompact state={state} />
        </div>
      </div>
    </Section>
  );
};

export default AIPage;
