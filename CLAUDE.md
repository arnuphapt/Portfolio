# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

No test suite is configured.

## Architecture

Single-page portfolio app built with **React 18 + Vite + Tailwind CSS**. Three routes:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `LandingPage` | Full portfolio (Home → About → Portfolio → Contact sections) |
| `/project/:id` | `ProjectDetails` | Individual project detail page |
| `/admin` | `Admin` | CMS dashboard to add projects/certificates |

**`/` is a single scrollable page** — `Home`, `About`, `Portofolio`, `ContactPage` are stacked vertically, not separate routes. Sections use anchor IDs (`#Home`, `#About`, `#Portofolio`, `#Contact`) for Navbar links.

### Firebase Integration

Two Firebase instances are initialized separately to avoid collision:

- `src/firebase.js` — default app, used for projects/certificates (Firestore + Storage)
- `src/firebase-comment.js` — named `'comments-app'`, used for comments (Firestore + Storage)

Data (projects, certificates, comments) is stored in **Firestore**; images are stored in **Firebase Storage**. The Admin page writes to Firestore; Portfolio/About pages read from it.

### Key Component Relationships

- `Portofolio.jsx` fetches projects + certificates from Firestore, renders them in MUI `Tabs` (Projects / Tech Stack / Certificates tabs) using `SwipeableViews`
- `CardProject` → links to `/project/:id` for details, and to external live demo URL
- `TechStackIcon` — renders tech icons from a local mapping
- `WelcomeScreen` — shown once on first load; `App.jsx` gates it via `showWelcome` state

### Animation Stack

Multiple animation libraries are in use simultaneously:
- **AOS** — scroll-triggered fade/slide animations (initialized in `Home.jsx` and `Portofolio.jsx`)
- **Framer Motion** — `AnimatePresence` for WelcomeScreen transition
- **GSAP** — available but check component-level usage
- **@react-spring/web** — available but check component-level usage
- **Lottie** (`@lottiefiles/dotlottie-react`) — `.lottie` files served from `public/`

### Styling

Tailwind CSS with dark theme. Background color convention: `bg-[#030014]` (near-black). Gradient accents use `from-cyan-500 to-blue-500` or `from-blue-500 to-purple-600`. No CSS modules — all styles are Tailwind utility classes inline.

MUI components (`AppBar`, `Tabs`, `Tab`) are used in `Portofolio.jsx` alongside Tailwind — emotion is the MUI styling engine.
