// Per-item accent, cycled by index: set it as the CSS variable --card-accent on the item (see .acc-badge / .acc-bar in index.css).
export const accentOf = (index = 0) => `var(--accent-${(index % 6) + 1})`;
