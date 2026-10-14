import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Code2, Github, Globe, User } from 'lucide-react';
import { Cross, Hud, HudStrip } from '../components/hud';

const LOAD_MS = 4000;

const TypewriterEffect = ({ text, still }) => {
  const [displayText, setDisplayText] = useState(still ? text : '');

  useEffect(() => {
    if (still) return undefined;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 260);

    return () => clearInterval(timer);
  }, [text, still]);

  return (
    <span className="inline-block">
      {displayText}
      {still ? null : <span className="blink">_</span>}
    </span>
  );
};

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 1000);
    }, LOAD_MS);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  const containerVariants = {
    exit: {
      opacity: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.8, ease: [0.76, 0, 0.24, 1], when: "beforeChildren", staggerChildren: 0.08 },
    },
  };

  const childVariants = {
    hidden: { y: 24, opacity: 0 },
    show: (i = 0) => ({
      y: 0,
      opacity: 1,
      transition: reduced ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 },
    }),
    exit: {
      y: -16,
      opacity: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.4, ease: "easeInOut" },
    },
  };

  const motionProps = (i) => ({ variants: childVariants, initial: reduced ? false : 'hidden', animate: 'show', custom: i });

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[70] bg-ink"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit="exit"
          variants={containerVariants}
        >
          {/* vignette + rail + grain */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
          <div className="rail pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 border-x border-hair !px-0 md:block" />
          <div aria-hidden="true" className="grain" />

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
                  <a
                    href="https://arnuphapt.vercel.app"
                    className="btn !normal-case !tracking-[0.08em]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4 text-fg-2" strokeWidth={1.5} />
                    <TypewriterEffect text="arnuphapt.portfolio" still={reduced} />
                  </a>
                </motion.div>
              </div>
            </div>

            {/* bottom HUD: loading bar over the existing 4s delay */}
            <motion.div {...motionProps(4)} className="mx-auto w-full max-w-rail">
              <div className="mb-2 flex items-center justify-between">
                <Hud>LOADING</Hud>
                <Hud>SECTION 00</Hud>
              </div>
              <div className="h-px w-full bg-hair">
                <div
                  className="h-px bg-accent"
                  style={{
                    width: reduced ? '100%' : undefined,
                    animation: reduced ? undefined : `welcome-load ${LOAD_MS}ms linear forwards`,
                  }}
                />
              </div>
            </motion.div>
          </div>

          <style>{`@keyframes welcome-load { from { width: 0 } to { width: 100% } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
