import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Swal from "sweetalert2";
import AnimatedBackground from "./Background";
import { Section, HudStrip, Hud, Cross } from "./hud";
import { useReveal } from "../lib/useReveal";
import { accentOf } from "../lib/accent";

const pad = (n) => String(n).padStart(2, "0");

const handleGithubClick = (githubLink) => {
  if (githubLink === "Private") {
    Swal.fire({
      icon: "info",
      title: "Source Code Private",
      text: "Maaf, source code untuk proyek ini bersifat privat.",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#3b82f6",
      background: "#141518",
      color: "#ffffff",
    });
    return false;
  }
  return true;
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [position, setPosition] = useState({ index: 0, total: 0 }); // place in the cached Projects list (same as its card)
  const scope = useRef(null);
  useReveal(scope, [project]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const index = storedProjects.findIndex((p) => String(p.id) === id);
    const selectedProject = storedProjects[index];

    if (selectedProject) {
      const enhancedProject = {
        ...selectedProject,
        Features: selectedProject.Features || [],
        TechStack: selectedProject.TechStack || [],
        Github: selectedProject.Github || "",
      };
      setProject(enhancedProject);
      setPosition({ index, total: storedProjects.length });
    }
  }, [id]);

  if (!project) {
    return (
      <>
        <AnimatedBackground />
        <div className="grid min-h-screen place-items-center">
          <div className="text-center">
            <Hud>
              <span className="blink mr-2 inline-block h-1.5 w-1.5 bg-accent align-middle" aria-hidden="true" />
              Loading Project...
            </Hud>
          </div>
        </div>
      </>
    );
  }

  const { index, total } = position;
  // Title emphasis, same rule as CardProject: the last word takes the accent (split on a space or hyphen); a title
  // with no natural break (e.g. a single Thai phrase) takes it as a whole.
  const m = /^(.*[\s-])(\S+)$/s.exec(project.Title ?? "");
  const techCount = project.TechStack.length;
  const featureCount = project.Features.length;

  return (
    <>
      <AnimatedBackground />
      <Section rule={false} className="min-h-screen pb-16 pt-8" >
        <div ref={scope} style={{ "--card-accent": accentOf(index) }}>
          <div data-reveal>
            <HudStrip
              left={
                <>
                  <span className="acc-badge mr-2">{pad(index + 1)}</span>PRJ / {pad(index + 1)}
                </>
              }
              right={`${pad(index + 1)} OF ${pad(total)}`}
            />
          </div>

          <div data-reveal className="mt-6">
            <button type="button" onClick={() => navigate(-1)} className="btn group">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
              Back to portfolio
            </button>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left: title, description, meta, tech, actions */}
            <div className="space-y-8 lg:col-span-7">
              <h1 data-reveal className="display text-[clamp(2.2rem,5.2vw,4.5rem)] [overflow-wrap:anywhere]">
                {m ? (
                  <>
                    {m[1]}
                    <span className="text-[color:var(--card-accent)]">{m[2]}</span>
                  </>
                ) : (
                  <span className="text-[color:var(--card-accent)]">{project.Title}</span>
                )}
              </h1>

              <p data-reveal className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-fg-2 md:text-lg">
                {project.Description}
              </p>

              {(techCount > 0 || featureCount > 0) && (
                <div data-reveal className="grid max-w-md grid-cols-2 border-l border-t border-hair-strong">
                  {techCount > 0 && (
                    <div className="border-b border-r border-hair-strong p-4">
                      <div className="display text-4xl">{pad(techCount)}</div>
                      <Hud className="mt-2 block">Technologies</Hud>
                    </div>
                  )}
                  {featureCount > 0 && (
                    <div className="border-b border-r border-hair-strong p-4">
                      <div className="display text-4xl">{pad(featureCount)}</div>
                      <Hud className="mt-2 block">Features</Hud>
                    </div>
                  )}
                </div>
              )}

              <div data-reveal>
                <Hud className="mb-3 block">Technologies used</Hud>
                {techCount > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.TechStack.map((tech, i) => (
                      <span
                        key={i}
                        className="border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--card-accent)]"
                        style={{ borderColor: "color-mix(in srgb, var(--card-accent) 35%, transparent)" }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Hud>No technologies added.</Hud>
                )}
              </div>

              <div data-reveal className="flex flex-wrap gap-3">
                {project.Link && (
                  <a
                    href={project.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn group !border-[color:var(--card-accent)] !bg-[color:var(--card-accent)] !text-ink hover:!border-fg hover:!bg-fg"
                  >
                    <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" strokeWidth={1.5} />
                    Live Demo
                  </a>
                )}
                {project.Github && (
                  <a
                    href={project.Github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn group"
                    onClick={(e) => !handleGithubClick(project.Github) && e.preventDefault()}
                  >
                    <Github className="h-4 w-4" strokeWidth={1.5} />
                    Github
                  </a>
                )}
              </div>
            </div>

            {/* Right: framed screenshot */}
            <div className="lg:col-span-5">
              <figure data-reveal className="group">
                <div className="corners relative border border-hair-strong bg-ink-2 p-3">
                  <Cross className="left-0 top-0" />
                  <Cross className="right-0 top-0" />
                  <Cross className="bottom-0 left-0" />
                  <Cross className="bottom-0 right-0" />
                  <span aria-hidden="true" className="acc-bar" />
                  <img
                    src={project.Img}
                    alt={project.Title}
                    className="block h-auto w-full grayscale-[40%] transition-[filter] duration-700 ease-out-expo group-hover:grayscale-0"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-between gap-4">
                  <Hud>FIG. 01</Hud>
                  <Hud className="truncate">{project.Title}</Hud>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20">
            <div data-reveal>
              <HudStrip left="Key features" right={featureCount > 0 ? `${pad(featureCount)} ITEMS` : ""} />
            </div>
            {featureCount > 0 ? (
              <ol className="mt-6 max-w-3xl border-t border-hair">
                {project.Features.map((feature, i) => (
                  <li key={i} data-reveal className="grid grid-cols-[3rem_1fr] items-baseline gap-2 border-b border-hair py-4">
                    <span className="font-mono text-xs tracking-[0.14em] text-[color:var(--card-accent)]">{pad(i + 1)}</span>
                    <span className="text-sm leading-relaxed text-fg-2 md:text-base">{feature}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Hud className="mt-6 block">No features added.</Hud>
            )}
          </div>
        </div>
      </Section>
    </>
  );
};

export default ProjectDetails;
