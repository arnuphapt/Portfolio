import React, { useEffect, memo, useMemo, useRef, useState } from "react"
import { FileText, Code, Award, Globe, ArrowUpRight } from "lucide-react"
import TimelineSection from "../components/TimelineSection"
import { Section, HudStrip, Hud, Cross } from "../components/hud"
import { useReveal } from "../lib/useReveal"

// Memoized Components
const Header = memo(() => (
  <div className="mb-12 max-w-3xl">
    <h2 data-reveal className="display text-[clamp(2.4rem,6.5vw,5rem)]">
      About <span className="contrast">Me</span>
    </h2>
    <p data-reveal className="mt-4 max-w-2xl text-base text-fg-2 sm:text-lg">
      Someone who can't sacrifice anything, can never change anything
    </p>
  </div>
));

const ProfileImage = memo(() => (
  <div data-reveal className="group relative mx-auto w-full max-w-sm lg:ml-auto lg:mr-0">
    <div className="relative aspect-square w-full border border-hair-strong bg-ink-2 p-3">
      <Cross className="left-0 top-0" />
      <Cross className="right-0 top-0" />
      <Cross className="bottom-0 left-0" />
      <Cross className="bottom-0 right-0" />
      <div className="relative h-full w-full overflow-hidden">
        <img
          src="/me.jpg"
          alt="Profile"
          className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between">
      <Hud>FIG. 02</Hud>
      <Hud>PORTRAIT / ANUPHAP T.</Hud>
    </div>
  </div>
));

const StatCard = memo(({ icon: Icon, value, label, description, index }) => (
  <div data-reveal className="corners group flex h-full flex-col justify-between gap-10 border border-hair bg-ink-2 p-6 transition-colors duration-300 hover:bg-ink-3">
    <div className="flex items-start justify-between">
      <Hud>{`STAT ${String(index + 1).padStart(2, "0")}`}</Hud>
      <Icon className="h-5 w-5 text-fg-3 transition-colors group-hover:text-accent" strokeWidth={1.5} />
    </div>
    <div>
      <div className="display text-6xl">{value}</div>
      <p className="hud mt-4 !text-fg-2">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-sm text-fg-3">{description}</p>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-fg-3 transition-colors group-hover:text-fg" strokeWidth={1.5} />
      </div>
    </div>
  </div>
));

const readStats = () => {
  const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
  const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]");
  const startDate = new Date("2025-05-04");
  const today = new Date();
  const experience = today.getFullYear() - startDate.getFullYear() -
    (today < new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate()) ? 1 : 0);
  return {
    totalProjects: storedProjects.length,
    totalCertificates: storedCertificates.length,
    YearExperience: experience,
  };
};

const AboutPage = () => {
  const [counts, setCounts] = useState(readStats);
  const scope = useRef(null);
  useReveal(scope);

  // Re-read when Portofolio.jsx writes to localStorage after fetching
  useEffect(() => {
    const handleStorage = () => setCounts(readStats());
    window.addEventListener("storage", handleStorage);

    // Also poll once after short delay to catch same-tab writes
    const t = setTimeout(() => setCounts(readStats()), 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearTimeout(t);
    };
  }, []);

  const { totalProjects, totalCertificates, YearExperience } = counts;

  // Memoized stats data
  const statsData = useMemo(() => [
    {
      icon: Code,
      value: totalProjects,
      label: "Total Projects",
      description: "Innovative web solutions crafted",
    },
    {
      icon: Award,
      value: totalCertificates,
      label: "Certificates",
      description: "Professional skills validated",
    },
    {
      icon: Globe,
      value: YearExperience,
      label: "Years of Experience",
      description: "Continuous learning journey",
    },
  ], [totalProjects, totalCertificates, YearExperience]);

  return (
    <Section id="About" className="mt-10 pb-24 pt-6 text-fg">
      <div ref={scope}>
        <div data-reveal className="mb-12">
          <HudStrip left="02 / ABOUT" right="EST. 2021 / 16.43°N 102.82°E" />
        </div>

        <Header />

        <div className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h2 data-reveal className="display text-[clamp(1.9rem,4.2vw,3.25rem)]">
                <span className="contrast">Hello,</span> I'm
                <span className="mt-2 block bg-[linear-gradient(90deg,var(--accent),var(--accent-3),var(--accent-2))] bg-clip-text text-transparent">
                  Anuphap Thaiwong
                </span>
              </h2>

              <p data-reveal className="max-w-xl text-base leading-relaxed text-fg-2 sm:text-lg">
                Computer Science student at Khon Kaen University, Thailand.
                Full Stack Developer — always exploring new tools and frameworks to build fast, efficient, and visually compelling systems.
              </p>

              <div data-reveal className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn !border-fg !bg-fg !text-ink hover:!border-accent hover:!bg-accent hover:!text-white"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.5} /> View CV
                </a>
                <a href="#Portofolio" className="btn">
                  <Code className="h-4 w-4" strokeWidth={1.5} /> View Projects
                </a>
              </div>
            </div>

            <ProfileImage />
          </div>

          <a href="#Portofolio" className="mt-20 block">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {statsData.map((stat, index) => (
                <StatCard key={stat.label} index={index} {...stat} />
              ))}
            </div>
          </a>
        </div>
      </div>

      <TimelineSection />
    </Section>
  );
};

export default memo(AboutPage);
