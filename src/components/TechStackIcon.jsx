import React from 'react';
import { accentOf } from '../lib/accent';

// eslint-disable-next-line react/prop-types
const TechStackIcon = ({ TechStackIcon, Language, index }) => {
  return (
    <div
      className="group relative flex h-full flex-col items-center justify-center gap-4 overflow-hidden border-b border-r border-hair-strong p-6 transition-colors duration-300 hover:bg-ink-3"
      style={{ '--card-accent': accentOf(index) }}
    >
      <span aria-hidden="true" className="acc-bar" />
      <span aria-hidden="true" className="acc-badge absolute left-2 top-2 !text-[9px]">
        {String((index ?? 0) + 1).padStart(2, '0')}
      </span>
      <img
        src={TechStackIcon}
        alt={`${Language} icon`}
        className={`h-14 w-14 opacity-70 grayscale ${Language === 'NextJs' ? 'invert' : ''} transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:h-16 md:w-16`}
      />
      <span className="hud text-center !text-fg-2 transition-colors duration-300 group-hover:!text-fg">
        {Language}
      </span>
    </div>
  );
};

export default TechStackIcon;
