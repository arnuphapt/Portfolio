import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { accentOf } from '../lib/accent';

// eslint-disable-next-line react/prop-types
const CardProject = ({ Img, Title, Description, Link: ProjectLink, id, index, TechStack }) => {
  // Handle kasus ketika ProjectLink kosong
  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      console.log("ProjectLink kosong");
      e.preventDefault();
      alert("Live demo link is not available");
    }
  };

  const handleDetails = (e) => {
    if (!id) {
      console.log("ID kosong");
      e.preventDefault();
      alert("Project details are not available");
    }
  };


  // Title emphasis: the last word takes the card's accent (split on a space or hyphen). A title with no natural
  // break (e.g. a single Thai phrase) takes the accent as a whole, on hover only.
  const m = /^(.*[\s-])(\S+)$/s.exec(Title ?? '');
  const chips = [].concat(TechStack ?? []).slice(0, 3);

  return (
    <div
      className="corners group relative h-full w-full overflow-hidden border border-hair bg-ink-2 transition-colors duration-300 hover:border-hair-strong"
      style={{ '--card-accent': accentOf(index) }}
    >
      <span aria-hidden="true" className="acc-bar" />
      <div className="relative p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <span className="acc-badge">{String((index ?? 0) + 1).padStart(2, '0')}</span>
            <span className="hud">PRJ</span>
          </span>
          <span aria-hidden="true" className="ticks ml-4 w-1/3" />
        </div>

        <div className="relative h-48 overflow-hidden border border-hair md:h-64">
          <img
            src={Img}
            alt={Title}
            className="h-full w-full object-cover grayscale-[40%] transition-[filter,transform] duration-700 ease-out-expo group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        </div>

        <div className="mt-5 space-y-3">
          <h3
            className={`font-display text-xl font-bold uppercase leading-tight tracking-tight text-fg [font-stretch:115%] ${
              m ? '' : 'transition-colors duration-300 group-hover:text-[color:var(--card-accent)]'
            }`}
          >
            {m ? (
              <>
                {m[1]}
                <span className="text-[color:var(--card-accent)]">{m[2]}</span>
              </>
            ) : (
              Title
            )}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-fg-3">
            {Description}
          </p>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((tech, i) => (
                <span
                  key={i}
                  className="border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--card-accent)]"
                  style={{ borderColor: 'color-mix(in srgb, var(--card-accent) 35%, transparent)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-hair pt-4">
            {ProjectLink ? (
              <a
                href={ProjectLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLiveDemo}
                className="hud inline-flex items-center gap-2 !text-fg-2 transition-colors duration-200 hover:!text-[color:var(--card-accent)] focus-visible:!text-[color:var(--card-accent)]"
              >
                <span>Live Demo</span>
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            ) : (
              <span className="hud">Demo Not Available</span>
            )}

            {id ? (
              <Link
                to={`/project/${id}`}
                onClick={handleDetails}
                className="hud inline-flex items-center gap-2 !text-fg transition-colors duration-200 hover:!text-[color:var(--card-accent)] focus-visible:!text-[color:var(--card-accent)]"
              >
                <span>Details</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            ) : (
              <span className="hud">Details Not Available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardProject;
