import React, { useState, useEffect, useCallback, useRef, memo } from "react"
import { Github, Linkedin, Mail, ExternalLink, Instagram } from "lucide-react"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useReducedMotion } from "framer-motion"
import { Section, HudStrip, Hud, Cross } from "../components/hud"
import { useReveal } from "../lib/useReveal"

// Memoized Components
const StatusBadge = memo(() => (
  <div className="chip !text-fg">
    <span className="blink inline-block h-1.5 w-1.5 bg-accent" aria-hidden="true" />
    Ready to Dev
  </div>
));

const MainTitle = memo(() => (
  <h1 className="display text-[clamp(1.9rem,5.4vw,4.6rem)]">
    <span className="block whitespace-nowrap">Full&#8209;stack</span>
    <span className="contrast mt-1 block">Developer</span>
  </h1>
));

const TechStack = memo(({ tech }) => (
  <div className="chip hidden sm:inline-flex">
    {tech}
  </div>
));

const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href} className="btn group w-[160px]">
    {text}
    <Icon className={`h-4 w-4 transition-transform duration-300 ${text === 'Contact' ? 'group-hover:translate-x-1' : 'group-hover:rotate-45'}`} strokeWidth={1.5} />
  </a>
));

const SocialLink = memo(({ icon: Icon, link, label }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" aria-label={label} className="btn !p-3">
    <Icon className="h-5 w-5" strokeWidth={1.5} />
  </a>
));

// Constants
const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 2000;
const WORDS = ["Computer science Student", "Full-stack Developer", "CP Student"];
const TECH_STACK = ["Next.js", "Typescript", "Nest.js", "MySql", "Postgresql"];
const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/arnuphapt", label: "GitHub" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/arnuphap-thaiwong-a16662359/", label: "LinkedIn" },
  { icon: Instagram, link: "https://www.instagram.com/parxdice_", label: "Instagram" }
];

const Home = () => {
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const reduced = useReducedMotion()
  const scope = useRef(null)
  useReveal(scope)

  // Optimize typing effect
  const handleTyping = useCallback(() => {
    if (isTyping) {
      if (charIndex < WORDS[wordIndex].length) {
        setText(prev => prev + WORDS[wordIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else {
        setWordIndex(prev => (prev + 1) % WORDS.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex]);

  useEffect(() => {
    if (reduced) return undefined; // reduced motion: static line below, no typing loop
    const timeout = setTimeout(
      handleTyping,
      isTyping ? TYPING_SPEED : ERASING_SPEED
    );
    return () => clearTimeout(timeout);
  }, [handleTyping, reduced, isTyping]);

  // Lottie configuration
  const lottieOptions = {
    src: "/Cat.lottie",
    loop: !reduced,
    autoplay: !reduced,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      progressiveLoad: true,
    },
    style: { width: "100%", height: "100%" },
    className: `w-full h-full transition-all duration-500 ${
      isHovering
        ? "scale-[104%] rotate-1"
        : "scale-100"
    }`
  };

  return (
    <Section id="Home" rule={false} className="min-h-screen">
      <div ref={scope} className="flex min-h-screen flex-col pb-10 pt-20">
        <div data-reveal>
          <HudStrip left="01 / HOME" right="N 16.43° E 102.82°" />
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-7">
            <div data-reveal><StatusBadge /></div>
            <div data-reveal><MainTitle /></div>

            {/* Typing Effect */}
            <div data-reveal className="flex h-8 items-center font-mono text-base text-fg-2 md:text-lg">
              <span className="mr-3 text-accent" aria-hidden="true">&gt;</span>
              <span>{reduced ? WORDS.join(" / ") : text}</span>
              {reduced ? null : <span className="blink ml-1 h-5 w-[2px] bg-fg" aria-hidden="true"></span>}
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech, index) => (
                <div key={index} data-reveal><TechStack tech={tech} /></div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div data-reveal className="flex flex-row gap-3">
              <CTAButton href="#Portofolio" text="Projects" icon={ExternalLink} />
              <CTAButton href="#Contact" text="Contact" icon={Mail} />
            </div>

            {/* Social Links */}
            <div className="hidden gap-3 sm:flex">
              {SOCIAL_LINKS.map((social, index) => (
                <div key={index} data-reveal><SocialLink {...social} /></div>
              ))}
            </div>
          </div>

          {/* Right Column - framed Lottie */}
          <div className="lg:col-span-5">
            <div data-parallax="-48">
              <div
                data-reveal
                className="relative aspect-square w-full border border-hair-strong bg-ink-2"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Cross className="left-0 top-0" />
                <Cross className="right-0 top-0" />
                <Cross className="bottom-0 left-0" />
                <Cross className="bottom-0 right-0" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="h-full w-full opacity-90">
                    <DotLottieReact {...lottieOptions} />
                  </div>
                </div>
                <Hud className="absolute left-3 top-3 z-10">FIG. 01</Hud>
                <Hud className="absolute bottom-3 right-3 z-10">CAT.LOTTIE / LIVE</Hud>
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(180deg, var(--rule-strong) 0 1px, transparent 1px 12px)" }} />
              </div>
            </div>
          </div>
        </div>

        <div data-reveal>
          <HudStrip left="SCROLL TO EXPLORE" right="SECTION 01" />
        </div>
      </div>
    </Section>
  );
};

export default memo(Home);
