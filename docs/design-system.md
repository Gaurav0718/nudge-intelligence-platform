# Design System — The Nudge Intelligence

Single source of truth: `src/index.css` (tokens + shared component classes). Component primitives: `src/components/shared/ui.tsx`. Per-module theme CSS scoped under a class prefix (`.dh`, growth theme).

## Brand
Navy + gold, life-sciences executive tone. Internal tool for **Indegene**. Light default (Delivery has a dark toggle scoped to `.dh`).

## Color tokens (`:root` in index.css)
| Group | Tokens |
|---|---|
| Navy | `--navy #1B365D`, `--navy-mid #244878`, `--navy-light #2e5a96`, `--navy-faint #eef2f8`, `--navy-subtle #e4eaf4` |
| Gold | `--gold #D4AF37`, `--gold-bright #e8c547`, `--gold-muted #b89428`, `--gold-light #fdf8e8`, `--gold-pale #f5edcc` |
| Surfaces | `--bg-base #f2f5fb`, `--bg-surface #fff`, `--bg-raised #f8f9fd`, `--bg-subtle`, `--bg-hover #e8eef8` |
| Borders | `--border rgba(27,54,93,.12)`, `--border-strong rgba(27,54,93,.25)` |
| Text | `--text-1 #0d1a2e`, `--text-2 #1B365D`, `--text-3 #5a7499`, `--text-inv #fff` |
| Status | `--emerald #10b981`, `--amber #d97706`, `--red #dc2626`, `--blue #1d4ed8`, `--teal #0891b2` (+ each `-bg` at .1 alpha) |
| Brand aliases | `--brand=navy`, `--brand-2=gold`, `--brand-bg=gold-light` (fills spec §1.3 undefined-var bug) |

**RAG semantics:** Critical=red, NeedsAttention=amber, Stable=emerald. Encoded in `RAG_META` (ui.tsx) + `.rag-dot` classes.

## Shadows / glow / radius / motion
- Glow: `--glow-card`, `--glow-card-hover` (gold ring on hover), `--glow-gold`, `--glow-navy`, `--glow-sm`, text glows.
- Shadow scale: `--shadow-xs/sm/md/lg`.
- Radius: `--radius-sm 8` / `md 12` / `lg 16` / `xl 20`.
- Easing: `--ease` (standard), `--spring` (overshoot). Durations `--t 200ms`, `--t-slow 320ms`.
- Keyframes in index.css: `spin`, `landing-fade-up`, `fadeIn`, `popIn`, `left-panel-icon-effects` (+ reduced-motion guard).

## Typography (§4.2)
- Body: **Stack Sans Text** → Inter fallback. 16px / 1.65.
- Headings: h1 40/700, h2 32/600, h3 24/600. `.eyebrow` 13/500.
- **Playfair Display** reserved for exactly two "deck" moments: `.wordmark` (sidebar/landing) + `.briefing-deck` (Executive Briefing). Do NOT use Playfair elsewhere.

## Layout shell
- Fixed sidebar `--sb-w 240px` (navy gradient, gold accents), collapsible (`.sidebar.hidden` + `.main-area.sidebar-hidden`).
- Sticky topbar `--topbar-h 56px`: menu toggle, home, page title, breadcrumb, RD user chip (navy circle, gold ring).
- Content padding `24px 28px 48px` on `--bg-base`.
- Global decorative FAB `.fab-ai` (stub — spec §5, do not wire).

## Shared CSS component classes (index.css)
`.card` / `.card-clickable` (lift + gold border on hover), `.coming-badge`, buttons `.btn` + `-navy/-gold/-ghost/-glass/-danger/-success`, `.badge-{emerald,amber,red,blue,teal,navy,gold}`, `.nav-item` + `.sub-nav-item` (active=gold-bright), `.pill-filter`, `.agree-disagree` (sel-agree/partially/disagree), `.rag-dot.{critical,attention,stable}`, `.module-tabbar` + `.module-tab` (active underline=gold), `.landing-tile`.

## React primitives (`src/components/shared/ui.tsx`)
`Card`, `Badge` (color prop), `Pill`, `RagDot` + `RAG_META`, `AvatarInitials` (round <44, rounded-rect ≥44, optional gold ring), `SectionHeading` (eyebrow/title/sub/right), `AccentCallout` (tone gold/navy/red/emerald, left-border), `ExpandableInsightCard` (accordion), `MetricStat` (uppercase label + big value + sub), `EmptyState`, `ConfidencePill` (High/Med/Low → emerald/amber/red).

Other shared components: `DetailModal` + `ModalSection` (gold-topped popup, Esc/overlay close, optional source link; `fadeIn`/`popIn`), `ModuleTabBar`, `ServiceLineSelector` (dropdown filter), `Avatar`, `NudgeMark` (animated logo), `ToastHost`.

## Conventions
- Inline `style={{}}` with `var(--token)` is the dominant pattern (Tailwind is present but lightly used).
- Filters use `ServiceLineSelector` dropdowns, not pill rows (recent refactor).
- Clickable cards → `DetailModal` (Marketing) or navigate to detail route (Delivery/Growth/Competition).
- Every data-driven card should carry a source link.

## Extending
New status color: add `--x` + `--x-bg` pair, a `.badge-x`, and (if RAG-like) a `RAG_META` entry. New primitive: add to ui.tsx, style via a class in index.css section matching existing patterns. Keep the Playfair boundary intact.
