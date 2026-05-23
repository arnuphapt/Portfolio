import React, { useState } from "react";
import { Timeline } from "@/components/ui/timeline";
import { GraduationCap, Briefcase, Code2, Building2 } from "lucide-react";
import AOS from "aos";
import { useEffect } from "react";

const TABS = ["All", "Education", "Work", "Internship"];

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
          <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
            {tag}
          </span>
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
          <span key={tag} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
            {tag}
          </span>
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
          <span key={tag} className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
];

const TimelineSection = () => {
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  const filtered = activeTab === "All"
    ? ALL_ITEMS
    : ALL_ITEMS.filter(item => item.category === activeTab);

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="1000"
      className="mt-24 px-[5%] sm:px-[5%] lg:px-[10%] pb-16"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
          My Journey
        </h2>
        <p className="mt-2 text-gray-400 text-sm max-w-xl mx-auto">
          Education, work experience, and internships that shaped who I am.
        </p>
      </div>

      {/* Tab filter */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border
              ${activeTab === tab
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-white shadow-lg shadow-cyan-500/20"
                : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white bg-white/[0.03]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto">
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
