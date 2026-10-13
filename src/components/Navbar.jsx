import React, { useState, useEffect } from "react";
import { Home, User, Briefcase, Mail } from "lucide-react";

const navItems = [
  { href: "#Home",       label: "Home",      Icon: Home },
  { href: "#About",      label: "About",     Icon: User },
  { href: "#Portofolio", label: "Portfolio", Icon: Briefcase },
  { href: "#Contact",    label: "Contact",   Icon: Mail },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("Home");
  const [scrolled, setScrolled]           = useState(false);

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
        setActiveSection(current.id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  const activeIndex = Math.max(0, navItems.findIndex(({ href }) => href === `#${activeSection}`));
  const activeItem = navItems[activeIndex];

  return (
    <>
      {/* Top bar */}
      <nav
        className={`fixed top-0 z-50 w-full border-b transition-colors duration-300 ${
          scrolled ? "border-hair bg-ink/90 backdrop-blur-sm" : "border-transparent bg-transparent"
        }`}
      >
        <div className="rail">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="#Home"
                onClick={e => scrollToSection(e, "#Home")}
                aria-label="Home"
                className="flex h-9 w-9 items-center justify-center border border-hair-strong font-mono text-sm text-fg"
              >
                A
              </a>
              <a
                href="#Home"
                onClick={e => scrollToSection(e, "#Home")}
                className="display text-lg !tracking-[0.02em]"
              >
                ARNUPHAP
              </a>
            </div>
            <span className="hud">
              <span className="text-accent">{String(activeIndex + 1).padStart(2, "0")}</span> / {activeItem.label}
            </span>
          </div>
        </div>
      </nav>

      {/* Dock */}
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-stretch border border-hair-strong bg-ink/95 backdrop-blur-sm">
          {navItems.map(({ href, label, Icon }, i) => {
            const id = href.replace("#", "");
            const isActive = activeSection === id;

            return (
              <a
                key={id}
                href={href}
                onClick={e => scrollToSection(e, href)}
                aria-label={label}
                aria-current={isActive ? "true" : undefined}
                className="group relative flex h-14 w-14 flex-col items-center justify-center gap-1 border-r border-hair transition-colors duration-200 hover:bg-ink-3"
              >
                {/* active bar */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-0.5 bg-accent transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
                />
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className={`transition-colors duration-200 ${isActive ? "text-accent" : "text-fg-2 group-hover:text-fg"}`}
                />
                <span className={`hud !text-[9px] ${isActive ? "!text-fg" : ""}`}>{String(i + 1).padStart(2, "0")}</span>

                {/* Tooltip */}
                <span className="hud pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap border border-hair-strong bg-ink px-2 py-1 !text-fg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {label}
                </span>
              </a>
            );
          })}
          <a
            href="#Home"
            onClick={e => scrollToSection(e, "#Home")}
            aria-label="Back to top"
            className="flex h-14 w-12 items-center justify-center font-mono text-xs text-fg-2 transition-colors duration-200 hover:bg-ink-3 hover:text-fg"
          >
            A
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
