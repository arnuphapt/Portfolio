import React, { useState, useEffect, useRef } from "react";
import { Home, User, Briefcase, Mail } from "lucide-react";

const navItems = [
  { href: "#Home",       label: "Home",      Icon: Home },
  { href: "#About",      label: "About",     Icon: User },
  { href: "#Portofolio", label: "Portfolio", Icon: Briefcase },
  { href: "#Contact",    label: "Contact",   Icon: Mail },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("Home");
  const [prevActive, setPrevActive]       = useState("Home");
  const [pulse, setPulse]                 = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const pulseTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = navItems.map(({ href }) => {
        const el = document.querySelector(href);
        if (!el) return null;
        return { id: href.replace("#", ""), top: el.offsetTop - 300, height: el.offsetHeight };
      }).filter(Boolean);

      const y = window.scrollY;
      const current = sections.find(s => y >= s.top && y < s.top + s.height);
      if (current && current.id !== activeSection) {
        setPrevActive(activeSection);
        setActiveSection(current.id);
        setPulse(true);
        clearTimeout(pulseTimer.current);
        pulseTimer.current = setTimeout(() => setPulse(false), 600);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(pulseTimer.current);
    };
  }, [activeSection]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes dock-breathe {
          0%   { transform: translateX(-50%) scale(1); }
          30%  { transform: translateX(-50%) scale(1.04); }
          60%  { transform: translateX(-50%) scale(0.98); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes item-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.25); }
          70%  { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
        @keyframes glow-ring {
          0%   { opacity: 0.7; transform: scale(0.9); }
          50%  { opacity: 1;   transform: scale(1.15); }
          100% { opacity: 0;   transform: scale(1.5); }
        }
        .dock-pulse {
          animation: dock-breathe 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .item-active-pop {
          animation: item-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .glow-ring-anim {
          animation: glow-ring 0.6s ease-out forwards;
        }
        .dock-item-tooltip {
          opacity: 0;
          transform: translateX(-50%) translateY(4px) scale(0.9);
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        .dock-item:hover .dock-item-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .dock-item:hover .dock-icon {
          transform: translateY(-4px) scale(1.15);
        }
        .dock-icon {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
      `}</style>

      {/* Top Navbar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#030014]/50 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
          <div className="flex items-center justify-between h-16">
            {/* A Logo */}
            <a
              href="#Home"
              onClick={e => scrollToSection(e, "#Home")}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))",
                border: "1px solid rgba(6,182,212,0.2)",
                color: "#22d3ee",
                fontFamily: "'Courier New', monospace",
                fontSize: "16px",
                letterSpacing: "0.1em",
                textShadow: "0 0 8px rgba(34,211,238,0.5)",
                boxShadow: "0 0 16px rgba(6,182,212,0.15)",
              }}
            >
              A
            </a>
            <a
              href="#Home"
              onClick={e => scrollToSection(e, "#Home")}
              className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
            >
              ARNUPHAP
            </a>
          </div>
        </div>
      </nav>

      {/* Floating Dock */}
      <div
        className={`fixed bottom-6 left-1/2 z-50 ${pulse ? "dock-pulse" : ""}`}
        style={{ transform: "translateX(-50%)" }}
      >
        {/* Glass pill container */}
        <div
          className="relative flex items-center gap-1 px-3 py-2 rounded-2xl"
          style={{
            background: "rgba(3, 0, 20, 0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
            overflow: "visible",
          }}
        >
          {/* Subtle top highlight */}
          <div
            className="absolute top-0 left-4 right-4 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
          />

          {navItems.map(({ href, label, Icon }) => {
            const id = href.replace("#", "");
            const isActive = activeSection === id;
            const wasActive = prevActive === id;

            return (
              <a
                key={id}
                href={href}
                onClick={e => scrollToSection(e, href)}
                className="dock-item relative flex flex-col items-center justify-center w-14 h-14 rounded-xl group"
                style={{
                  background: isActive
                    ? "rgba(6,182,212,0.12)"
                    : "transparent",
                  transition: "background 0.3s ease",
                }}
              >
                {/* Glow ring when becoming active */}
                {isActive && pulse && (
                  <div
                    className="glow-ring-anim absolute inset-0 rounded-xl"
                    style={{
                      border: "1.5px solid rgba(6,182,212,0.7)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Active border */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      border: "1px solid rgba(6,182,212,0.35)",
                      boxShadow: "0 0 12px rgba(6,182,212,0.2) inset",
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`dock-icon relative z-10 ${isActive && pulse ? "item-active-pop" : ""}`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    style={{
                      color: isActive ? "#22d3ee" : "rgba(226,211,253,0.7)",
                      filter: isActive ? "drop-shadow(0 0 6px rgba(34,211,238,0.6))" : "none",
                      transition: "color 0.25s ease, filter 0.25s ease",
                    }}
                  />
                </div>

                {/* Active dot */}
                <div
                  className="absolute bottom-1.5 w-1 h-1 rounded-full"
                  style={{
                    background: isActive ? "#22d3ee" : "transparent",
                    boxShadow: isActive ? "0 0 6px #22d3ee" : "none",
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                  }}
                />

                {/* Tooltip */}
                <div
                  className="dock-item-tooltip absolute -top-9 left-1/2 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                  style={{
                    background: "rgba(3,0,20,0.85)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2d3fd",
                    backdropFilter: "blur(8px)",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                  {/* Tooltip arrow */}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
              </a>
            );
          })}

          {/* Divider + Logo initial */}
          <div
            className="w-px h-8 mx-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <a
            href="#Home"
            onClick={e => scrollToSection(e, "#Home")}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-xs font-bold tracking-widest"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))",
              border: "1px solid rgba(6,182,212,0.2)",
              color: "#22d3ee",
              fontFamily: "'Courier New', monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textShadow: "0 0 8px rgba(34,211,238,0.5)",
            }}
          >
            A
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
