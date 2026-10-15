import React, { useEffect, useState, useCallback, useRef } from "react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import Certificate from "../components/Certificate";
import { Section, HudStrip } from "../components/hud";
import { useReveal } from "../lib/useReveal";
import { Code, Award, Boxes } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

// Firestore project doc ids shown under "Professional"; every other project falls under "Side Projects"
const PROFESSIONAL_IDS = new Set([
  "fZQcTuZVQ9uC2jmxufpi", // e-Seed Analysis Certificate
  "QCJxvf7pTkUnZyruy7bA", // DOA-RIBS
  "6drjp0f15i81DZEf9tkH", // E-learning SMAC
  "EElKa3zsbjwNsZbFXFCR", // SMNC Dashboard
]);

// Separate ShowMore/ShowLess button component
const ToggleButton = ({ onClick, isShowingMore }) => (
  <button onClick={onClick} className="btn group">
    {isShowingMore ? "See Less" : "See More"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={`transition-transform duration-300 ${isShowingMore ? "group-hover:-translate-y-0.5" : "group-hover:translate-y-0.5"}`}
    >
      <polyline points={isShowingMore ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
    </svg>
  </button>
);

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3, px: 0 }}>
          <Typography component="div" sx={{ fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit" }}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const techStacks = [
  { icon: "nextjs.svg", language: "NextJs" },
  { icon: "reactjs.svg", language: "ReactJS" },
  { icon: "typescript.svg", language: "Typescript" },
  { icon: "tailwind.svg", language: "Tailwind CSS" },
  { icon: "nestjs.svg", language: "NestJs" },
  { icon: "nodejs.svg", language: "Node JS" },
  { icon: "postgresql.svg", language: "PostgreSQL" },
  { icon: "mysql.svg", language: "MySQL" },
  { icon: "supabase.svg", language: "Supabase" },
  { icon: "firebase.svg", language: "Firebase" },
  { icon: "docker.svg", language: "Docker" },
  { icon: "kubernetes.svg", language: "Kubernetes" },



];

// MUI tab strip restyled to the instrument language (square, hairline, mono, blue active bar)
const tabsSx = {
  minHeight: "64px",
  "& .MuiTab-root": {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    minHeight: "64px",
    padding: "14px 0",
    margin: 0,
    borderRadius: 0,
    borderRight: "1px solid var(--rule)",
    transition: "color 0.25s, background-color 0.25s",
    "&:last-of-type": { borderRight: 0 },
    "&:hover": {
      color: "#fff",
      backgroundColor: "var(--ink-3)",
    },
    "&.Mui-selected": {
      color: "#fff",
      "& .lucide": { color: "var(--tab-accent)" },
    },
    "& .lucide": { marginBottom: "6px" },
  },
  "& .MuiTabs-indicator": {
    top: 0,
    bottom: "auto",
    height: "2px",
    backgroundColor: "var(--tab-accent)",
  },
};

export default function FullWidthTabs() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [initialItems] = useState(() => window.innerWidth < 768 ? 4 : 6);

  const fetchData = useCallback(async () => {
    try {
      const projectCollection = collection(db, "projects");
      const certificateCollection = collection(db, "certificates");

      const [projectSnapshot, certificateSnapshot] = await Promise.all([
        getDocs(projectCollection),
        getDocs(certificateCollection),
      ]);

      const projectData = projectSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        TechStack: doc.data().TechStack || [],
      })).sort((a, b) => (a.Order ?? 999) - (b.Order ?? 999));

      const certificateData = certificateSnapshot.docs.map((doc) => doc.data());

      setProjects(projectData);
      setCertificates(certificateData);

      // Store in localStorage
      localStorage.setItem("projects", JSON.stringify(projectData));
      localStorage.setItem("certificates", JSON.stringify(certificateData));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const toggleShowMore = useCallback(() => {
    setShowAllCertificates(prev => !prev);
  }, []);

  // projects is already sorted by Order, filter keeps that order within each group
  const projectGroups = [
    { label: "Professional", items: projects.filter((p) => PROFESSIONAL_IDS.has(p.id)) },
    { label: "Side Projects", items: projects.filter((p) => !PROFESSIONAL_IDS.has(p.id)) },
  ];
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, initialItems);

  const headScope = useRef(null);
  const bodyScope = useRef(null);
  useReveal(headScope);
  useReveal(bodyScope, [value, projects.length, displayedCertificates.length]);

  return (
    <Section id="Portofolio" className="pb-24 pt-6">
      <div ref={headScope}>
        <div data-reveal className="mb-12">
          <HudStrip left="03 / PORTFOLIO" right={`${pad(projects.length)} PROJECTS / ${pad(certificates.length)} CERTS`} />
        </div>
        <div className="mb-12 max-w-3xl">
          <h2 data-reveal className="display text-[clamp(2.2rem,5.6vw,4.5rem)]">
            Portfolio <span className="contrast">Showcase</span>
          </h2>
          <p data-reveal className="mt-4 max-w-2xl text-sm text-fg-2 md:text-base">
            Explore my journey through projects, certifications, and technical expertise.
            Each section represents a milestone in my continuous learning path.
          </p>
        </div>
      </div>

      <Box sx={{ width: "100%" }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "transparent",
            backgroundImage: "none",
            border: "1px solid var(--rule-strong)",
            borderRadius: 0,
            boxShadow: "none",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            variant="fullWidth"
            sx={{ ...tabsSx, "--tab-accent": `var(--accent-${value + 1})` }}
          >
            <Tab
              icon={<Code className="w-5 h-5 transition-all duration-300" strokeWidth={1.5} />}
              label="Projects"
              {...a11yProps(0)}
            />
            <Tab
              icon={<Award className="w-5 h-5 transition-all duration-300" strokeWidth={1.5} />}
              label="Certificates"
              {...a11yProps(1)}
            />
            <Tab
              icon={<Boxes className="w-5 h-5 transition-all duration-300" strokeWidth={1.5} />}
              label="Tech Stack"
              {...a11yProps(2)}
            />
          </Tabs>
        </AppBar>

        <div ref={bodyScope}>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={setValue}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            {projectGroups.map((group) => (
              <div key={group.label} className="mb-10 last:mb-0">
                <div data-reveal className="mb-5">
                  <HudStrip left={`${group.label} · ${pad(group.items.length)}`} />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {group.items.map((project, index) => (
                    <div key={project.id || index} data-reveal>
                      <CardProject
                        Img={project.Img}
                        Title={project.Title}
                        Description={project.Description}
                        Link={project.Link}
                        id={project.id}
                        index={index}
                        TechStack={project.TechStack}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabPanel>

          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {displayedCertificates.map((certificate, index) => (
                <div key={index} data-reveal>
                  <Certificate ImgSertif={certificate.Img} index={index} />
                </div>
              ))}
            </div>
            {certificates.length > initialItems ? (
              <div className="mt-6 w-full flex justify-start">
                <ToggleButton
                  onClick={toggleShowMore}
                  isShowingMore={showAllCertificates}
                />
              </div>
            ) : null}
          </TabPanel>

          <TabPanel value={value} index={2} dir={theme.direction}>
            <div className="grid grid-cols-2 border-l border-t border-hair-strong md:grid-cols-3 lg:grid-cols-6">
              {techStacks.map((stack, index) => (
                <div key={index} data-reveal>
                  <TechStackIcon TechStackIcon={stack.icon} Language={stack.language} index={index} />
                </div>
              ))}
            </div>
          </TabPanel>
        </SwipeableViews>
        </div>
      </Box>
    </Section>
  );
}
