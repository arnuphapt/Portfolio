/** @type {import('tailwindcss').Config} */
// Design tokens. Values live as CSS variables in src/index.css (:root); this file only maps them to utilities.
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			backdropBlur: {
				sm: '4px',
			},
			colors: {
				ink: { DEFAULT: 'var(--ink)', 2: 'var(--ink-2)', 3: 'var(--ink-3)' },
				hair: { DEFAULT: 'var(--rule)', strong: 'var(--rule-strong)' },
				fg: { DEFAULT: 'var(--fg)', 2: 'var(--fg-2)', 3: 'var(--fg-3)' },
				accent: {
					DEFAULT: 'var(--accent)',
					1: 'var(--accent-1)',
					2: 'var(--accent-2)',
					3: 'var(--accent-3)',
					4: 'var(--accent-4)',
					5: 'var(--accent-5)',
					6: 'var(--accent-6)',
				},
			},
			fontFamily: {
				display: 'var(--font-display)',
				serif: 'var(--font-serif)',
				sans: 'var(--font-sans)',
				mono: 'var(--font-mono)',
			},
			maxWidth: { rail: 'var(--rail)' },
			transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)' },
		},
	},
	plugins: [],
}
