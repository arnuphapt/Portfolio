import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Code2, Github, Globe, User } from 'lucide-react';
import { Cross, HudStrip } from '../components/hud';

// Single clock: typing takes LOAD_MS, its completion starts the exit, which takes EXIT_MS.
const LOAD_MS = 4000;
const EXIT_MS = 1000;
// Skip plays the same exit with every duration scaled by SKIP_SCALE (~0.43s total).
const SKIP_SCALE = 0.3;
const SKIP_EXIT_MS = 450;

/* eslint-disable react/prop-types */
const TypewriterEffect = ({ text, still, durationMs, onDone }) => {
  const [count, setCount] = useState(still ? text.length : 0);
  const shown = still ? text : text.slice(0, count);

  useEffect(() => {
    if (still) return undefined;
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= text.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, durationMs / text.length);

    return () => clearInterval(timer);
  }, [text, still, durationMs, onDone]);

  return (
    <span className="inline-block">
      {shown}
      {still ? null : <span className="blink">_</span>}
    </span>
  );
};
/* eslint-enable react/prop-types */

// eslint-disable-next-line react/prop-types
const IconCell = ({ Icon, index }) => (
  <div className="relative flex h-14 w-14 items-center justify-center border border-hair-strong bg-ink-2 sm:h-16 sm:w-16">
    <span className="hud absolute left-1.5 top-1 !text-[9px]">{String(index + 1).padStart(2, '0')}</span>
    <Icon className="h-5 w-5 text-fg sm:h-6 sm:w-6" strokeWidth={1.5} />
  </div>
);

const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const reduced = useReducedMotion();
  const [skipped, setSkipped] = useState(false);
  const doneRef = useRef(false);
  const skippedRef = useRef(false);
  const exitTimer = useRef();
  const completeRef = useRef(onLoadingComplete);

  useEffect(() => {
    completeRef.current = onLoadingComplete;
  });

  // Only exit path to the site: runs once (end of exit animation, or skip).
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(exitTimer.current);
    completeRef.current?.();
  }, []);

  // Typing finished (or reduced-motion wait over): play exit, then finish.
  const startExit = useCallback((ms = EXIT_MS) => {
    if (doneRef.current || exitTimer.current) return;
    setIsLoading(false);
    exitTimer.current = setTimeout(finish, ms);
  }, [finish]);

  // Skip: render the full text first (the exiting node is frozen at its last render),
  // then the effect below starts a fast exit. No-op once skipped or already exiting.
  const skip = useCallback(() => {
    if (reduced) return finish();
    if (doneRef.current || exitTimer.current || skippedRef.current) return;
    skippedRef.current = true;
    setSkipped(true);
  }, [reduced, finish]);

  useEffect(() => {
    if (skipped) startExit(SKIP_EXIT_MS);
  }, [skipped, startExit]);

  // Reduced motion: no typing, keep the same total wait.
  useEffect(() => {
    if (!reduced) return undefined;
    const timer = setTimeout(startExit, LOAD_MS);
    return () => clearTimeout(timer);
  }, [reduced, startExit]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  // Skip with Enter / Space / Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);

  // Exit variants take a scale (AnimatePresence `custom`) so skip can shorten them.
  const containerVariants = {
    exit: (s = 1) => ({
      opacity: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.8 * s, ease: [0.76, 0, 0.24, 1], when: "beforeChildren", staggerChildren: 0.08 * s },
    }),
  };

  const childVariants = {
    hidden: { y: 24, opacity: 0 },
    show: (i = 0) => ({
      y: 0,
      opacity: 1,
      transition: reduced ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 },
    }),
    exit: (s = 1) => ({
      y: -16,
      opacity: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.4 * s, ease: "easeInOut" },
    }),
  };

  const motionProps = (i) => ({ variants: childVariants, initial: reduced ? false : 'hidden', animate: 'show', custom: i });

  return (
    <AnimatePresence custom={skipped ? SKIP_SCALE : 1}>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[70] cursor-pointer bg-ink"
          onClick={skip}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit="exit"
          variants={containerVariants}
        >
          {/* vignette + rail + grain */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
          <div className="rail pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 border-x border-hair !px-0 md:block" />
          <div aria-hidden="true" className="grain" />
          <button type="button" className="sr-only">Skip intro</button>

          <div className="relative flex min-h-screen flex-col px-5 py-6 sm:px-8">
            {/* top HUD */}
            <motion.div {...motionProps(0)} className="mx-auto w-full max-w-rail">
              <HudStrip left="ANUPHAP / BOOT" right="EST. 2021" />
            </motion.div>

            <div className="mx-auto flex w-full max-w-rail flex-1 items-center justify-center">
              <div className="relative w-full max-w-4xl border-y border-hair py-10 sm:py-14">
                <Cross className="left-0 top-0" />
                <Cross className="right-0 top-0" />
                <Cross className="bottom-0 left-0 !translate-y-1/2" />
                <Cross className="bottom-0 right-0 !translate-y-1/2" />

                {/* Icons */}
                <motion.div {...motionProps(1)} className="mb-8 flex justify-center gap-3 sm:mb-10 sm:gap-4">
                  {[Code2, User, Github].map((Icon, index) => (
                    <IconCell key={index} Icon={Icon} index={index} />
                  ))}
                </motion.div>

                {/* Welcome Text */}
                <motion.div {...motionProps(2)} className="mb-8 text-center sm:mb-10">
                  <h1 className="display text-[clamp(2rem,7.2vw,4.75rem)]">
                    <span className="block">Welcome To My</span>
                    <span className="mt-2 block">
                      <span className="contrast text-accent">Portfolio</span> Website
                    </span>
                  </h1>
                </motion.div>

                {/* Website Link */}
                <motion.div {...motionProps(3)} className="text-center">
                  <div className="btn !normal-case !tracking-[0.08em]">
                    <Globe className="h-4 w-4 text-fg-2" strokeWidth={1.5} />
                    <TypewriterEffect text="anuphap.portfolio" still={reduced || skipped} durationMs={LOAD_MS} onDone={startExit} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
