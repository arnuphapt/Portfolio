import React, { useRef, useState } from "react";
import { Timeline } from "@/components/ui/timeline";
import { GraduationCap, Code2, Building2 } from "lucide-react";
import { HudStrip } from "./hud";
import { useReveal } from "../lib/useReveal";

const TABS = ["All", "Education", "Work", "Internship"];

const Tag = ({ children }) => (
  <span className="chip !px-2 !py-0.5 !text-[10px]">{children}</span>
);

const ALL_ITEMS = [
  {
    id: "work-1",
    category: "Work",
    title: "Full Stack Developer",
    subtitle: "Waygrown Solution",
    description: "Building and maintaining full stack web applications. Working across frontend and backend with React, Next.js, NestJS, and modern tooling to deliver production-ready products.",
    timestamp: "2025 – Present",
    status: "active",
    icon: <Building2 className="h-3 w-3" />,
    content: (
      <div className="flex flex-wrap gap-2 mt-1">
        {["React", "Next.js", "NestJS", "TypeScript", "TailwindCSS"].map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    ),
  },
  {
    id: "intern-1",
    category: "Internship",
    title: "Frontend Developer Intern",
    subtitle: "สำนักงานเทคโนโลยีดิจิทัล มข.",
    description: "Gained hands-on experience in network infrastructure and IT systems at the university's digital technology office.",
    timestamp: "2024 (2 months)",
    status: "completed",
    icon: <Code2 className="h-3 w-3" />,
    content: (
      <div className="flex flex-wrap gap-2 mt-1">
        {["Network", "IT Infrastructure", "System Admin"].map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    ),
  },
  {
    id: "edu-1",
    category: "Education",
    title: "Khon Kaen University",
    subtitle: "B.Sc. Computer Science · Faculty of Computing",
    description: "Studying core CS fundamentals, algorithms, data structures, and software engineering. Active in tech community and coding competitions.",
    timestamp: "2021 – 2025",
    status: "completed",
    icon: <GraduationCap className="h-3 w-3" />,
    content: (
      <div className="flex flex-wrap gap-2 mt-1">
        {["Algorithms", "Data Structures", "Web Dev", "Database", "CP"].map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    ),
  },
];

const TimelineSection = () => {
  const [activeTab, setActiveTab] = useState("All");
  const headScope = useRef(null);
  const listScope = useRef(null);
  useReveal(headScope);
  useReveal(listScope, [activeTab]);

  const filtered = activeTab === "All"
    ? ALL_ITEMS
    : ALL_ITEMS.filter(item => item.category === activeTab);

  return (
    <div className="mt-28">
      <div ref={headScope}>
      {/* Header */}
      <div data-reveal className="mb-10">
        <HudStrip left="02.1 / JOURNEY" right={`${String(filtered.length).padStart(2, "0")} ENTRIES`} className="mb-8" />
        <h2 className="display text-[clamp(2.2rem,5.5vw,4.25rem)]">
          My <span className="contrast">Journey</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm text-fg-2 sm:text-base">
          Education, work experience, and internships that shaped who I am.
        </p>
      </div>

      {/* Tab filter */}
      <div data-reveal className="mb-10 flex flex-wrap gap-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`chip cursor-pointer transition-colors duration-200 ${
              activeTab === tab
                ? "!border-accent !text-accent"
                : "hover:!border-hair-strong hover:!text-fg"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      </div>

      {/* Timeline */}
      <div ref={listScope} className="max-w-2xl">
        <Timeline
          items={filtered}
          variant="spacious"
          showTimestamps={true}
          timestampPosition="top"
        />
      </div>
    </div>
  );
};

export default TimelineSection;
