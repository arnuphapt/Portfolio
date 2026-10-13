import React, { useRef } from "react";
import { Github, Instagram, Linkedin, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Section, HudStrip } from "../components/hud";
import { useReveal } from "../lib/useReveal";

const SOCIAL = [
  {
    name: "LinkedIn",
    handle: "Arnuphap Thaiwong",
    sub: "Let's connect professionally",
    url: "https://www.linkedin.com/in/arnuphap-thaiwong-a16662359/",
    Icon: Linkedin,
  },
  {
    name: "GitHub",
    handle: "@arnuphapt",
    sub: "Check out my code",
    url: "https://github.com/arnuphapt",
    Icon: Github,
  },
  {
    name: "Instagram",
    handle: "@parxdice_",
    sub: "Follow my journey",
    url: "https://www.instagram.com/parxdice_",
    Icon: Instagram,
  },
  {
    name: "Email",
    handle: "arnuphap.t@kkumail.com",
    sub: "Drop me a message",
    url: "mailto:arnuphap.t@kkumail.com",
    Icon: Mail,
  },
];

const ContactPage = () => {
  const scope = useRef(null);
  useReveal(scope);

  return (
    <Section id="Contact" className="pb-24 pt-6">
      <div ref={scope}>
        <div data-reveal className="mb-12">
          <HudStrip left="04 / CONTACT" right="REPLY ≤ 1 WEEK" />
        </div>

        {/* Header */}
        <div className="mb-14 max-w-3xl">
          <h2 data-reveal className="display text-[clamp(2.4rem,6vw,4.75rem)]">
            Contact <span className="contrast">Me</span>
          </h2>
          <p data-reveal className="mt-4 max-w-xl text-sm text-fg-2 md:text-base">
            Got a question? Send me a message, and I'll get back to you soon.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — Status + info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 data-reveal className="display text-[clamp(1.8rem,3.4vw,2.75rem)]">
                Let's build something
                <span className="contrast block text-accent">
                  great together.
                </span>
              </h3>
              <p data-reveal className="max-w-md text-base leading-relaxed text-fg-2">
                Available for Onsite, Hybrid, or Work-from-Home positions. Ready to start within 1 week.
                I&apos;m friendly, easy-going, and always up for a hangout — also a big dog &amp; cat lover. Feel free to reach out anytime!
              </p>
            </div>

            <div data-reveal className="flex flex-wrap gap-3">
              <div className="chip !normal-case !tracking-normal !text-sm">
                <MapPin className="h-4 w-4 text-fg-3" strokeWidth={1.5} />
                Khon Kaen & Bangkok, Thailand
              </div>
              <div className="chip !normal-case !tracking-normal !text-sm">
                <Mail className="h-4 w-4 text-fg-3" strokeWidth={1.5} />
                arnuphap.t@kkumail.com
              </div>
            </div>

            <span data-reveal aria-hidden="true" className="ticks block w-full" />
          </div>

          {/* RIGHT — Social cells (shared hairline grid) */}
          <div className="grid grid-cols-1 border-l border-t border-hair-strong sm:grid-cols-2">
            {SOCIAL.map((s, i) => (
              <div key={s.name} data-reveal>
                <a
                  href={s.url}
                  target={s.name !== "Email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex h-full min-h-[180px] flex-col justify-between gap-8 border-b border-r border-hair-strong p-5 transition-colors duration-300 hover:bg-ink-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="hud">{`${String(i + 1).padStart(2, "0")} / ${s.name}`}</span>
                    <ArrowUpRight
                      className="h-4 w-4 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <s.Icon className="mb-4 h-5 w-5 text-fg-2" strokeWidth={1.5} />
                    <div className="break-all text-sm font-medium leading-tight text-fg">{s.handle}</div>
                    <div className="mt-1 text-xs text-fg-3">{s.sub}</div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ContactPage;
