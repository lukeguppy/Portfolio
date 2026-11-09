# Luke Guppy Portfolio — Design System & Architecture (`DESIGN.md`)

## 1. Aesthetic Direction: Fluid Autonomy & Telemetry Interface

This portfolio presents Luke Guppy as a software engineer working across AI systems, autonomous navigation, and mission-critical avionics. Instead of a static résumé page, the interface acts as a **fluid, dark-mode interactive telemetry & simulation environment** where each page demonstrates real engineering and interactive polish:

- **Home (`/Portfolio/`)**: Full-viewport interactive multi-agent autonomy simulation (`#autonomy-canvas`) with lidar sensor cones, vehicle-to-vehicle (V2V) communication meshes, and real-time cursor-avoidance steering, paired with scroll-revealed engineering domain cards and interactive page portals.
- **About Me (`/Portfolio/about-me/`)**: Orbital telemetry header canvas, interactive engineering stack chips, a **scroll-linked growing vertical career spine** that illuminates each role node (`AlphaSights`, `Leonardo Helicopters`, `Metaswitch Networks`), and an interactive **Split-Stage Projects Lab** where scrolling or selecting each of the 6 projects morphs a live procedural simulation canvas (`Lidar & PPO Intersection`, `Transformer Token Probability Stream`, `Dynamic Pricing & Slot Optimizer`, `Mobile Mesh DTN Routing`, `Huygens-Fresnel Wave Interference`, and `3D Wireframe Terrain Engine`).
- **Dissertation (`/Portfolio/dissertation/`)**: 3D perspective grid hero, **scroll-linked vertical pipeline spine** (`01 System Overview`, `02 The Environment` with live 9-ray lidar & intersection simulation, `03 The Brain` with live pulsing PPO actor-critic neural network, `04 Reward Logic`), and an embedded interactive PDF.js reader.
- **Playground (`/Portfolio/playground/`)**: Five full-viewport monumental interactive game portals (`COUNTRIES QUIZ` over the rotating D3.js orthographic globe, `CHESS` with a 3D wooden slab and live hover-revealed match, `WORDLE SOLVER` with 3D flipping tiles, `MAP PLOTTER` with dual-ring compass rose and flight arcs, and `BLOCK BLAST` with 3D translucent blocks).
- **Contact (`/Portfolio/contact/`)**: Direct communication channels with one-click clipboard copy over the interactive autonomy canvas.

---

## 2. Color & Atmospheric Polarity (`src/styles/tokens/color.css`)

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--bg` | `#05070c` | Primary deep obsidian viewport canvas |
| `--bg-elevated` | `#0a0f1a` | Elevated simulation & card surfaces |
| `--surface-glass` | `rgba(12, 18, 30, 0.72)` | Translucent glassmorphic panels (`backdrop-filter: blur(16px)`) |
| `--surface-pill` | `rgba(15, 23, 42, 0.78)` | Floating navigation pill surface |
| `--fg` | `#f1f5f9` | Primary crisp alabaster text |
| `--fg-secondary` | `#cbd5e1` | Secondary body copy |
| `--fg-muted` | `#94a3b8` | Muted telemetry & metadata labels |
| `--accent` | `#2dd4bf` | Primary electric teal/cyan signal |
| `--accent-cyan` | `#00f0ff` | High-intensity lidar / spine head glow |
| `--accent-warm` | `#f59e0b` | Secondary amber telemetry signal |

---

## 3. Typography (`src/styles/tokens/type.css` & `src/styles/base/fonts.css`)

All fonts are self-hosted `.woff2` files copied into `docs/assets/fonts/` during build (zero external Google Fonts requests):

- **`--font-display` / `--font-sans`**: `'Overpass Variable'` — precision technical grotesque used for headings, UI navigation, and engineering dossiers.
- **`--font-portal`**: `'Bebas Neue'` — monumental condensed display face used exclusively for the full-viewport Playground portal titles.
- **`--font-mono`**: `'JetBrains Mono Variable'` — tabular monospace used for coordinates, telemetry readouts, dates, and tags.
- **`--font-serif`**: `'Literata Variable'` — editorial serif available for long-form pull quotes.

---

## 4. Modular CSS & JS Architecture

Instead of monolithic CSS or inline scripts, styles and scripts are organized into single-purpose modules and bundled per page via `esbuild` (`build/assets.js`):

```text
src/
├── styles/
│   ├── main.css                    # Shared bundle entry
│   ├── tokens/                     # Design tokens (color, type, space, motion)
│   ├── base/                       # Reset, self-hosted @font-face, typography, utilities
│   ├── layout/                     # Page shell, container, grid primitives
│   ├── components/                 # Floating pill header, footer, buttons, tags, cards, prose
│   ├── playground/                 # Per-portal styles (portal-stage, quiz, chess, wordle, map, block)
│   └── pages/                      # Page-specific entry points (home, about, dissertation, playground, contact)
└── scripts/
    ├── main.js                     # Shared nav & scroll reveal entry
    ├── utils/                      # DOM helpers & reduced-motion media query helper
    ├── components/                 # Modular interactive engines:
    │   ├── autonomy-field.js       # Interactive multi-agent lidar & V2V canvas
    │   ├── timeline-scroll.js      # Scroll-linked growing vertical spine for Experience Timeline
    │   ├── projects-stage.js       # 6-mode interactive simulation canvas for About Me projects
    │   ├── pipeline-scroll.js      # Scroll-linked spine for Dissertation walkthrough
    │   ├── env-sim-canvas.js       # Live 9-ray lidar & traffic intersection canvas
    │   ├── brain-canvas.js         # Live pulsing PPO neural network canvas
    │   └── pdf-viewer.js           # Embedded PDF.js reader with zoom & fallback
    ├── playground/                 # Playground portal observer, D3 globe, chess, wordle, map, block
    └── pages/                      # Page entry points (home, about, dissertation, playground, contact)
```
