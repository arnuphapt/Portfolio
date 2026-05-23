import React, { useEffect, useState } from "react";
import { Github, Instagram, Linkedin, Mail, MapPin, ExternalLink, ArrowUpRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const SOCIAL = [
  {
    name: "LinkedIn",
    handle: "Arnuphap Thaiwong",
    sub: "Let's connect professionally",
    url: "https://www.linkedin.com/in/arnuphap-thaiwong-a16662359/",
    Icon: Linkedin,
    color: "#0A66C2",
    glow: "rgba(10,102,194,0.35)",
    gradient: "from-[#0A66C2]/20 to-[#0077B5]/10",
    border: "hover:border-[#0A66C2]/50",
  },
  {
    name: "GitHub",
    handle: "@arnuphapt",
    sub: "Check out my code",
    url: "https://github.com/arnuphapt",
    Icon: Github,
    color: "#e6edf3",
    glow: "rgba(230,237,243,0.2)",
    gradient: "from-[#30363d]/60 to-[#161b22]/60",
    border: "hover:border-white/30",
  },
  {
    name: "Instagram",
    handle: "@parxdice_",
    sub: "Follow my journey",
    url: "https://www.instagram.com/parxdice_",
    Icon: Instagram,
    color: "#E4405F",
    glow: "rgba(228,64,95,0.3)",
    gradient: "from-[#833AB4]/20 via-[#E4405F]/20 to-[#FCAF45]/10",
    border: "hover:border-[#E4405F]/40",
  },
  {
    name: "Email",
    handle: "arnuphap.t@kkumail.com",
    sub: "Drop me a message",
    url: "mailto:arnuphap.t@kkumail.com",
    Icon: Mail,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    gradient: "from-[#06b6d4]/20 to-[#3b82f6]/10",
    border: "hover:border-cyan-500/40",
  },
];

const ContactPage = () => {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <section id="Contact" className="relative overflow-hidden px-[5%] lg:px-[10%] pt-16 pb-24">

      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute right-[-5%] bottom-[10%] h-[350px] w-[350px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="text-center mb-16">
        <h2
          data-aos="fade-down"
          data-aos-duration="800"
          className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          Contact Me
        </h2>
        <p
          data-aos="fade-up"
          data-aos-duration="900"
          className="mt-3 text-slate-400 text-sm md:text-base max-w-xl mx-auto"
        >
          Got a question? Send me a message, and I'll get back to you soon.
        </p>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

        {/* LEFT — Status + info */}
        <div data-aos="fade-right" data-aos-duration="1000" className="space-y-8">

          {/* Main text */}
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Let's build something
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                great together.
              </span>
            </h3>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Available for Onsite, Hybrid, or Work-from-Home positions. Ready to start within 1 week.
              I&apos;m friendly, easy-going, and always up for a hangout — also a big dog &amp; cat lover. Feel free to reach out anytime!
            </p>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Khon Kaen & Bangkok, Thailand
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
              <Mail className="w-4 h-4 text-cyan-400" />
              arnuphap.t@kkumail.com
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-cyan-500/30 via-white/10 to-transparent" />

        </div>

        {/* RIGHT — Social cards grid */}
        <div
          data-aos="fade-left"
          data-aos-duration="1000"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {SOCIAL.map((s, i) => (
            <a
              key={s.name}
              href={s.url}
              target={s.name !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              data-aos-duration="700"
              className={`group relative overflow-hidden rounded-2xl border border-white/10 ${s.border}
                          bg-white/[0.03] backdrop-blur-sm p-5
                          transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl`}
              style={{
                boxShadow: hovered === i ? `0 8px 40px ${s.glow}` : undefined,
              }}
            >
              {/* Gradient fill on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

              {/* Shine sweep */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent
                                -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              <div className="relative flex flex-col gap-4">
                {/* Icon + arrow row */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}18` }}
                  >
                    <s.Icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <ExternalLink
                    className="w-4 h-4 text-gray-600 group-hover:text-white/60
                               translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0
                               transition-all duration-300"
                  />
                </div>

                {/* Text */}
                <div>
                  <div className="text-white font-semibold text-sm leading-tight">{s.handle}</div>
                  <div className="text-gray-500 text-xs mt-1 group-hover:text-gray-400 transition-colors">{s.sub}</div>
                </div>

                {/* Platform name */}
                <div
                  className="text-xs font-medium tracking-widest uppercase"
                  style={{ color: `${s.color}99` }}
                >
                  {s.name}
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ContactPage;
