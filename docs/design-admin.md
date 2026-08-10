---
version: alpha
scope: admin-console
description: A high-density admin console that inherits the Cal.com monochrome discipline (near-black ink on white canvas, light-gray surfaces, soft 12px cards) but inverts the rhythm for data work. Where Cal.com breathes with 96px section gaps, the admin tightens spacing to pack information; where Cal.com uses generous display type, the admin uses crisp tabular Inter with selective Cal Sans moments for orientation. Signature accent: a single electric-blue voltage line (the "live wire") that threads through active states — it is the only color above the monochrome floor and is what keeps a dense table from reading as a spreadsheet. Motion is restrained but fluid: surfaces lift on 200ms ease-out, the active rail glides rather than snaps, focus rings bloom softly. The result reads as an instrument, not a form — every pixel earns its place.

colors:
  # ── Ink floor (inherited from Cal.com, tightened for density) ──
  primary: "#0A0A0B"
  primary-active: "#18181B"
  primary-disabled: "#E4E4E7"
  ink: "#0A0A0B"
  ink-soft: "#27272A"
  body: "#3F3F46"
  muted: "#71717A"
  muted-soft: "#A1A1AA"
  muted-faint: "#D4D4D8"
  hairline: "#E4E4E7"
  hairline-soft: "#F4F4F5"
  canvas: "#FCFCFD"
  surface-soft: "#FAFAFA"
  surface-panel: "#F4F4F5"
  surface-hover: "#E4E4E7"
  surface-active: "#D4D4D8"
  surface-inset: "#F4F4F5"

  # ── Elevated surfaces (dense cards) ──
  surface-card: "#FFFFFF"
  surface-raised: "#FFFFFF"
  surface-overlay: "#FFFFFF"

  # ── Dark mode (rail + command bar + code) ──
  surface-dark: "#09090B"
  surface-dark-elevated: "#18181B"
  surface-dark-sunken: "#050506"
  on-dark: "#FAFAFA"
  on-dark-soft: "#A1A1AA"
  on-dark-faint: "#52525B"
  dark-hairline: "#27272A"
  dark-hairline-soft: "#18181B"

  # ── Voltage accent (the live wire — used sparingly, never on bulk UI) ──
  accent: "#2563EB"
  accent-hover: "#1D4ED8"
  accent-soft: "#DBEAFE"
  accent-faint: "#EFF6FF"
  accent-on: "#FFFFFF"
  accent-glow: "rgba(37, 99, 235, 0.24)"
  accent-rail: "#3B82F6"

  # ── Semantic (desaturated, tuned for monochrome harmony) ──
  success: "#059669"
  success-soft: "#D1FAE5"
  success-faint: "#ECFDF5"
  warning: "#D97706"
  warning-soft: "#FEF3C7"
  warning-faint: "#FFFBEB"
  danger: "#DC2626"
  danger-soft: "#FEE2E2"
  danger-faint: "#FEF2F2"
  info: "#0284C7"
  info-soft: "#E0F2FE"
  info-faint: "#F0F9FF"

  # ── Data viz palette (sequential blue + categorical accents, low-sat) ──
  viz-blue-1: "#1E3A8A"
  viz-blue-2: "#2563EB"
  viz-blue-3: "#60A5FA"
  viz-blue-4: "#93C5FD"
  viz-blue-5: "#DBEAFE"
  viz-neutral: "#A1A1AA"
  viz-warm: "#F59E0B"
  viz-cool: "#14B8A6"
  viz-violet: "#8B5CF6"
  viz-rose: "#F43F5E"

typography:
  # ── Density-optimized scale. Base 13px, not 16px. ──
  # Inter is the workhorse. Tabular numbers everywhere data appears.
  # Cal Sans reserved for moments of orientation (page H1, empty states) — not running text.

  page-title:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.6px
  section-title:
    fontFamily: "Inter, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.1px
  card-title:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.05px
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-strong:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  body-sm-strong:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.1px
  micro:
    fontFamily: "Inter, sans-serif"
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.5px
    textTransform: uppercase
  # ── Data numerics — tabular figures, never proportional ──
  metric:
    fontFamily: "Inter, sans-serif"
    fontFeatureSettings: "'tnum' 1, 'cv01' 1"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.6px
  metric-lg:
    fontFamily: "Inter, sans-serif"
    fontFeatureSettings: "'tnum' 1"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.8px
  metric-sm:
    fontFamily: "Inter, sans-serif"
    fontFeatureSettings: "'tnum' 1"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.3px
  tabular:
    fontFamily: "Inter, sans-serif"
    fontFeatureSettings: "'tnum' 1"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  tabular-sm:
    fontFamily: "Inter, sans-serif"
    fontFeatureSettings: "'tnum' 1"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontFeatureSettings: "'tnum' 1"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-item:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  nav-item-active:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  2xl: 14px
  pill: 9999px
  full: 9999px

spacing:
  # ── Tighter than Cal.com. The admin packs information. ──
  hair: 2px
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  2xl: 32px
  3xl: 40px
  section: 56px

density:
  # ── Row heights define density tier per surface ──
  row-compact: 32px
  row-cozy: 40px
  row-comfortable: 48px
  cell-x: 12px
  cell-y: 8px
  cell-y-cozy: 10px

motion:
  fast: 120ms
  base: 200ms
  slow: 320ms
  ease-out: cubic-bezier(0.22, 1, 0.36, 1)
  ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)

components:
  # ── App shell ──
  app-shell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    fontFamily: "{typography.body}"
  sidebar:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    width: 240px
    width-collapsed: 64px
  sidebar-section-label:
    typography: "{typography.micro}"
    textColor: "{colors.on-dark-faint}"
    padding: 0 16px
    margin-top: 20px
    margin-bottom: 6px
  sidebar-nav-item:
    typography: "{typography.nav-item}"
    textColor: "{colors.on-dark-soft}"
    height: 32px
    padding: 0 12px
    rounded: "{rounded.sm}"
    iconSize: 16px
    iconGap: 10px
  sidebar-nav-item-active:
    typography: "{typography.nav-item-active}"
    textColor: "{colors.on-dark}"
    backgroundColor: "{colors.surface-dark-elevated}"
    accentRail: "2px solid {colors.accent-rail}"
    accentGlow: "0 0 12px {colors.accent-glow}"
  sidebar-nav-item-hover:
    textColor: "{colors.on-dark}"
    backgroundColor: "{colors.surface-dark-elevated}"
  topbar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 56px
    borderBottom: "1px solid {colors.hairline}"

  # ── Data container (the workhorse) ──
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
    padding: 20px
  card-header:
    padding: "16px 20px"
    borderBottom: "1px solid {colors.hairline-soft}"
  card-section:
    padding: "16px 20px"
    borderBottom: "1px solid {colors.hairline-soft}"

  # ── Metric cards (the signature "instrument" moment) ──
  metric-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
    padding: 16px
  metric-card-label:
    typography: "{typography.caption}"
    textColor: "{colors.muted}"
  metric-card-value:
    typography: "{typography.metric}"
    textColor: "{colors.ink}"
  metric-card-delta-up:
    typography: "{typography.caption}"
    textColor: "{colors.success}"
  metric-card-delta-down:
    typography: "{typography.caption}"
    textColor: "{colors.danger}"
  metric-card-spark:
    height: 32px

  # ── Tables (density-forward, the core surface) ──
  table:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.tabular}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
  table-header-row:
    backgroundColor: "{colors.surface-inset}"
    typography: "{typography.micro}"
    textColor: "{colors.muted}"
    height: 36px
    borderBottom: "1px solid {colors.hairline}"
  table-row:
    typography: "{typography.tabular}"
    textColor: "{colors.ink}"
    height: 44px
    borderBottom: "1px solid {colors.hairline-soft}"
  table-row-compact:
    height: 36px
  table-row-hover:
    backgroundColor: "{colors.surface-soft}"
  table-row-selected:
    backgroundColor: "{colors.accent-faint}"
  table-cell:
    padding: "0 16px"
  table-cell-numeric:
    textAlign: right
    fontFeatureSettings: "'tnum' 1"

  # ── Buttons (monochrome discipline + accent as exception) ──
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 32px
    padding: "0 14px"
    iconSize: 14px
    iconGap: 6px
  button-primary-hover:
    backgroundColor: "{colors.primary-active}"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 32px
    padding: "0 14px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-soft}"
    border: "1px solid {colors.surface-active}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 32px
    padding: "0 10px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
  button-accent:
    # The only colored button. Reserved for the single primary create/confirm action on a page.
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-on}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 32px
    padding: "0 14px"
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
  button-icon:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    size: 30px
    iconSize: 16px
  button-icon-hover:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
  button-icon-active:
    textColor: "{colors.accent}"

  # ── Inputs (dense, crisp) ──
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    height: 32px
    padding: "0 10px"
  input-focused:
    border: "1px solid {colors.accent}"
    boxShadow: "0 0 0 3px {colors.accent-glow}"
  input-error:
    border: "1px solid {colors.danger}"
  input-disabled:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
  search-input:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    border: "1px solid transparent"
    rounded: "{rounded.md}"
    height: 32px
    padding: "0 10px 0 32px"
    placeholder: "{colors.muted-soft}"

  # ── Badges & pills ──
  badge-neutral:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  badge-neutral-pill:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-hover}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  status-dot:
    size: 6px
    rounded: "{rounded.full}"
    glow: "0 0 0 3px"

  # ── Pagination & segmented controls ──
  segmented:
    backgroundColor: "{colors.surface-panel}"
    rounded: "{rounded.md}"
    padding: 3px
  segmented-item:
    typography: "{typography.body-sm-strong}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    height: 26px
    padding: "0 10px"
  segmented-item-active:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)"

  # ── Command palette (the fluid moment) ──
  command-palette:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
    boxShadow: "0 20px 50px -10px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.1)"
    width: 560px
    backdropFilter: blur(12px)
  command-item:
    typography: "{typography.body}"
    textColor: "{colors.ink}"
    height: 40px
    padding: "0 16px"
    rounded: "{rounded.md}"
  command-item-active:
    backgroundColor: "{colors.accent-faint}"

  # ── Drawers & modals ──
  drawer:
    backgroundColor: "{colors.surface-card}"
    width: 480px
    borderLeft: "1px solid {colors.hairline}"
    boxShadow: "-20px 0 50px -10px rgba(0,0,0,0.15)"
  modal:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
    boxShadow: "0 20px 50px -10px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.1)"

  # ── Empty state (the Cal Sans orientation moment) ──
  empty-state:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    padding: 48px
  empty-state-title:
    typography: "{typography.page-title}"
    textColor: "{colors.ink-soft}"
---

## Overview

This admin console inherits **Cal.com's monochrome discipline** — near-black ink on a near-white canvas, light-gray surfaces for separation, soft 10–12px radii — but **inverts its rhythm for data work**.

The contrast is intentional. Cal.com is a marketing surface: it breathes with `{spacing.section}` (96px) gaps, leans on `{typography.display-xl}` (64px) headlines, and uses generous whitespace so a single CTA dominates each band. An admin console is the opposite — its job is to **pack the screen with information a human must scan, compare, and act on**. So where Cal.com breathes, the admin **tightens**: base type drops from 16px → 13px, section gaps shrink 96px → 56px, row heights compress to 36–44px, and every numeric column gets tabular figures (`font-feature-settings: 'tnum'`) so digits align like a financial statement.

What keeps this density from becoming a spreadsheet is three things:

1. **The live wire.** A single electric blue (`{colors.accent}` — #2563EB) runs through the interface as a 2px rail on the active sidebar item, a glow on focused inputs, and the lone colored CTA on each page. It is the *only* hue above the monochrome floor. It gives the eye a thread to follow through dense data, and it is what makes the console read as "live" rather than "static form".

2. **Cal Sans at the moment of orientation.** Where Cal.com uses its custom display face for every headline, the admin reserves it for **one moment per view** — the page title, or an empty state's headline. Everything else is crisp Inter. The contrast makes the page title feel like a chapter heading in a book of dense prose: a breath before the data.

3. **Restrained, fluid motion.** Surfaces lift on `{motion.base}` (200ms) with `{motion.ease-out}` — cards rise 1px on hover, the active rail **glides** between sidebar items rather than snapping, focus rings bloom softly with a 12px blue glow. Nothing bounces, nothing overshoots, but everything moves. The console feels like an instrument with weight and inertia, not a static wall of fields.

**The result reads as an instrument, not a form.** Dense, but legible. Monochrome, but alive. Calm, but quick.

---

## Design DNA — What comes from Cal.com, what's new

| Layer | From Cal.com | Adapted for admin |
|---|---|---|
| **Palette** | Near-black ink on white, light-gray surfaces, hairline borders | Tightened grays for density; added a voltage-blue accent (Cal.com stays nearly pure mono, the admin needs one live wire) |
| **Type** | Inter body + Cal Sans display split | Inter drops 16→13px base; Cal Sans reserved for page title + empty states only; tabular numerics everywhere |
| **Radius** | 8/12/16px hierarchy | Same hierarchy, slightly smaller top end (10/12px) — denser cards read better with tighter corners |
| **Spacing** | 96px sections, 32px card padding | 56px sections, 16–20px card padding — information density is the job |
| **Cards** | Light-gray `surface-card` (#f5f5f5) feature cards | White `surface-card` on a faintly off-white canvas (#FCFCFD) — the *canvas* is slightly recessed, cards float forward |
| **Motion** | Minimal (press darken only) | Added lift, glide, and glow — an admin is interactive, not editorial |
| **Dark surface** | Footer only (one dark band per page) | Sidebar rail is permanently dark — the chrome frame, not a closing band |

The throughline: **monochrome discipline with one accent that earns its presence.**

---

## Colors

### The Monochrome Floor

The admin runs on a six-step neutral scale, slightly cooler than Cal.com's warm grays (Cal.com's `surface-card` is #f5f5f5; here it's pure white, and the *canvas* is the faintly-recessed #FCFCFD). This inversion matters: in Cal.com the cards are gray and the page is white; **here the cards are white and the page is faintly recessed**. The cards become the foreground objects, the canvas recedes. On a dense table view, this makes rows feel like they're floating on a slightly darker worktop rather than printed on a flat sheet.

- **Canvas** (`{colors.canvas}` — #FCFCFD): The worktop. Faintly off-white so cards float.
- **Surface Card / Raised** (`{colors.surface-card}` — #FFFFFF): Tables, metric cards, drawers. The foreground.
- **Surface Soft** (`{colors.surface-soft}` — #FAFAFA): Hover fills, search input background.
- **Surface Panel** (`{colors.surface-panel}` — #F4F4F5): Segmented controls, neutral badges, the inset table header.
- **Surface Inset** (`{colors.surface-inset}` — #F4F4F5): Table header rows, sunken sub-areas.
- **Surface Hover / Active** (`{colors.surface-hover}` / `{colors.surface-active}`): Hover and pressed states on light surfaces.

### The Voltage Accent — the live wire

> **Rule: there is only one hue above the monochrome floor.** It appears in exactly five places: the active sidebar rail, focus rings, the single accent CTA per page, selected table rows, and inline links. Nowhere else.

- **Accent** (`{colors.accent}` — #2563EB): The primary blue. Used on the live wire, focus rings, and the one accent CTA.
- **Accent Hover** (`{colors.accent-hover}` — #1D4ED8): Pressed state.
- **Accent Soft** (`{colors.accent-soft}` — #DBEAFE): Selected row tint, command palette active item.
- **Accent Faint** (`{colors.accent-faint}` — #EFF6FF): Very pale tint for hover on accent surfaces.
- **Accent Glow** (`{colors.accent-glow}` — rgba(37,99,235,0.24)): The 12px bloom on focus rings and the active rail.

### The Dark Frame

The sidebar is permanently dark — it's the chrome that holds the work surface, like the bezel of an instrument. Cal.com reserves dark for the footer (one closing band); the admin keeps it as a **persistent left frame**. This is the single largest visual departure from Cal.com's marketing surface, and it's non-negotiable for an admin: the dark rail grounds the interface and gives the live wire somewhere to glow against.

- **Surface Dark** (`{colors.surface-dark}` — #09090B): Sidebar background. Near-black with a hair of warmth.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #18181B): Hovered/active sidebar items.
- **On Dark** (`{colors.on-dark}` — #FAFAFA): Active sidebar text.
- **On Dark Soft** (`{colors.on-dark-soft}` — #A1A1AA): Inactive sidebar text.
- **On Dark Faint** (`{colors.on-dark-faint}` — #52525B): Section labels in the sidebar.
- **Dark Hairline** (`{colors.dark-hairline}` — #27272A): Dividers within the dark rail.

### Semantic Colors

Desaturated versions that sit in harmony with the monochrome floor — they never shout. Each comes in a `soft` (badge background) and `faint` (大面积 hover/background) variant.

- **Success** (`{colors.success}` — #059669 / soft #D1FAE5): Confirmations, "active" status, positive deltas.
- **Warning** (`{colors.warning}` — #D97706 / soft #FEF3C7): Pending states, attention-needed.
- **Danger** (`{colors.danger}` — #DC2626 / soft #FEE2E2): Errors, destructive actions, negative deltas.
- **Info** (`{colors.info}` — #0284C7 / soft #E0F2FE): Informational toasts, neutral notifications.

### Data Visualization Palette

For charts inside cards. A sequential blue scale (the brand hue, deepened and lightened) plus three low-saturation categoricals. **Never use more than 5 hues in a single chart** — prefer the blue sequential scale for anything time-series.

- **Sequential blue**: `{colors.viz-blue-1}` → `{colors.viz-blue-5}` (deep navy → pale ice).
- **Categorical accents** (use sparingly, max 3 per chart): warm `{colors.viz-warm}`, cool `{colors.viz-cool}`, violet `{colors.viz-violet}`, rose `{colors.viz-rose}`.
- **Neutral series**: `{colors.viz-neutral}` for "other" or "baseline" series.

---

## Typography

### The Density Decision

Cal.com's body is 16px. **The admin's body is 13px.** This is the single most important typographic choice in the system.

A 16px body assumes a reader scanning one paragraph at a time, deciding whether to click a CTA. A 13px body assumes a reader **scanning a table of 200 rows**, comparing five columns, and clicking the right one. The 3px difference, multiplied across a dense screen, is the difference between "12 rows visible" and "20 rows visible" — between scrolling and seeing.

The trade-off is managed by:
- **Tabular figures** (`font-feature-settings: 'tnum'`) on every numeric token — digits align in columns, so density doesn't cost legibility.
- **Generous line-height** (1.5 on body, 1.4 on small text) — vertical air compensates for smaller x-height.
- **A crisp weight ladder** (400 / 500 / 600) — weight contrast does the emphasis work that size can't.
- **Cal Sans reserved for orientation** — the page title gets the brand voice; everything else gets the workhorse.

### Font Stack

- **Inter** — body, UI, tables, metrics, buttons, nav. The entire interface except page titles and empty states.
- **Cal Sans** — `{typography.page-title}` and `{typography.empty-state-title}` only. Inherits Cal.com's 600 weight and negative letter-spacing (-0.6px at 24px).
- **JetBrains Mono** — code snippets, IDs, log lines in the command palette.
- **Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` for Inter; `ui-monospace, monospace` for code.

If Cal Sans is unavailable: **Inter 600 at -0.04em** is the documented fallback (per Cal.com's own spec). **Geist** or **Manrope 700** are close geometric alternatives.

### Hierarchy

| Token | Size | Weight | LH | LS | Use |
|---|---|---|---|---|---|
| `{typography.page-title}` | 24px | 600 | 1.2 | -0.6px | View title (the one Cal Sans moment per page) — "Customers", "Orders" |
| `{typography.metric-lg}` | 36px | 600 | 1.05 | -0.8px | Hero metric (dashboard top card) — tnum |
| `{typography.metric}` | 28px | 600 | 1.1 | -0.6px | Standard metric card value — tnum |
| `{typography.metric-sm}` | 20px | 600 | 1.2 | -0.3px | Compact metric — tnum |
| `{typography.section-title}` | 15px | 600 | 1.3 | -0.1px | Card section headers, panel titles |
| `{typography.card-title}` | 14px | 600 | 1.3 | -0.05px | Card titles, list item titles |
| `{typography.body}` | 13px | 400 | 1.5 | 0 | Default running text, descriptions |
| `{typography.body-strong}` | 13px | 600 | 1.5 | 0 | Emphasized inline text, row primary |
| `{typography.tabular}` | 13px | 500 | 1.4 | 0 | Table cell default — tnum |
| `{typography.tabular-sm}` | 12px | 500 | 1.4 | 0 | Dense table cell — tnum |
| `{typography.body-sm}` | 12px | 400 | 1.45 | 0 | Secondary text, helper text, captions |
| `{typography.body-sm-strong}` | 12px | 600 | 1.45 | 0 | Small emphasized labels |
| `{typography.caption}` | 11px | 500 | 1.4 | 0.1px | Badges, status labels, timestamps |
| `{typography.micro}` | 10px | 600 | 1.2 | 0.5px | Table column headers, section labels — UPPERCASE |
| `{typography.button}` | 13px | 600 | 1 | 0 | All button labels |
| `{typography.nav-item}` | 13px | 500 | 1.2 | 0 | Sidebar nav items |
| `{typography.code}` | 12px | 400 | 1.5 | 0 | Code, IDs — JetBrains Mono, tnum |

### Principles

- **Inter does the work. Cal Sans gives the orientation.** One page title per view. Never Cal Sans on a card title, a metric value, or a button.
- **Tabular figures are non-optional on data.** Every token in the `metric-*` and `tabular-*` family has `font-feature-settings: 'tnum'`. Proportional digits in a table column look broken.
- **Weight, not size, for emphasis.** In a 13px world, going from 400 → 600 weight is the primary emphasis tool. Reserve 700 for nothing — the system doesn't use it.
- **Negative letter-spacing only on display sizes.** Body and table text sit at 0 tracking; only page titles and large metrics get the Cal Sans-style negative tracking.
- **UPPERCASE micro labels for column headers.** The 10px/0.5px-tracking uppercase `{typography.micro}` token is what makes a dense table header read as "structured" rather than "cramped" — it's a deliberate typographic signal that says "this is a label, not data".

---

## Layout

### App Shell — three-zone frame

The console is built on a **persistent three-zone shell**: a dark left rail (navigation), a slim top bar (orientation + global actions), and a recessed canvas worktop holding the content.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────┐ ┌───────────────────────────────────────────┐  │
│  │         │ │  Topbar (56px)                            │  │
│  │         │ │  breadcrumb · search · actions · profile  │  │
│  │ Sidebar │ ├───────────────────────────────────────────┤  │
│  │ (dark)  │ │                                            │  │
│  │ 240px   │ │  Canvas worktop (#FCFCFD)                 │  │
│  │         │ │  ┌─────────────────────────────────────┐  │  │
│  │  nav    │ │  │  Page title (Cal Sans)              │  │  │
│  │  items  │ │  │  ─────                               │  │  │
│  │  with   │ │  │  Content cards (white, floating)    │  │  │
│  │  live   │ │  │                                     │  │  │
│  │  wire   │ │  └─────────────────────────────────────┘  │  │
│  │         │ │                                            │  │
│  └─────────┘ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Zone roles:**

| Zone | Width | Background | Role |
|---|---|---|---|
| **Sidebar** | 240px (64px collapsed) | `{colors.surface-dark}` | Primary navigation. Permanent dark frame. Holds the live wire on the active item. |
| **Topbar** | fluid, 56px tall | `{colors.canvas}` | Orientation: breadcrumb, page context, global search (⌘K), notifications, profile. |
| **Canvas** | fluid | `{colors.canvas}` (#FCFCFD) | The worktop. Faintly recessed so white cards float forward. |

### Content Grid

Within the canvas, content sits in a **fluid grid with a max width**:

- **Max content width**: 1440px (centered on ultrawide; fluid below).
- **Content margin**: `{spacing.2xl}` (32px) from the canvas edges at desktop; `{spacing.base}` (16px) at < 1200px.
- **Standard grid**: 12 columns, `{spacing.base}` (16px) gutter.
- **Card gap**: `{spacing.base}` (16px) between cards in a grid — tight enough to read as a system, loose enough to separate.

### Density Tiers

A single interface supports three row heights, switchable per-surface (most tables default to **cozy**):

| Tier | Row height | When to use |
|---|---|---|
| **Compact** (`{density.row-compact}` — 32px) | Audit logs, raw event streams, any list where the user is scanning for a known target |
| **Cozy** (`{density.row-cozy}` — 40px) | **Default.** Most tables — orders, customers, content lists |
| **Comfortable** (`{density.row-comfortable}` — 48px) | Tables with avatar + secondary text, or where scannability > density |

The tier is exposed as a density toggle (segmented control) in the table toolbar. It is **the** density control — users who want more rows pick compact; users who want air pick comfortable.

### Whitespace Philosophy

Cal.com's whitespace is **generous for scanning one idea at a time**. The admin's whitespace is **calibrated for scanning many rows at once**.

- Section padding (56px) gives breathing room between major content blocks without losing the screen to air.
- Card padding (16–20px) is tight enough that a 4-up metric grid feels like a dashboard, not a poster.
- Table cell padding (`{density.cell-x}` 12px horizontal, `{density.cell-y}` 8px vertical) is the tightest layer — this is where density lives, and it's protected by tabular figures so tightness doesn't cost alignment.

The rhythm: **generous between sections, moderate inside cards, tight inside tables.** Three layers of density, each appropriate to its content.

---

## Motion

### Philosophy — fluid, not flashy

Cal.com's motion is almost absent (press-darken on buttons, nothing else). The admin **cannot** be that still — it's interactive, not editorial — but its motion is restrained and purposeful. Three rules:

1. **Nothing snaps.** Everything moves on `{motion.base}` (200ms) or `{motion.fast}` (120ms) with `{motion.ease-out}`. The active rail glides between sidebar items; it doesn't teleport.
2. **Nothing bounces.** `{motion.ease-spring}` (the one overshoot curve) is reserved for the rare celebratory moment — a successful save confirmation, a task completed. It is **never** used on routine UI.
3. **Motion carries meaning.** Hover lift signals "this is clickable"; focus bloom signals "this is where you are"; the live wire's glow signals "this is active". Motion is a state channel, not decoration.

### Motion Tokens

| Token | Duration | Curve | Use |
|---|---|---|---|
| `{motion.fast}` | 120ms | `{motion.ease-out}` | Hover state changes (background fill, icon color) |
| `{motion.base}` | 200ms | `{motion.ease-out}` | Default — card lift, drawer slide, rail glide, panel expand |
| `{motion.slow}` | 320ms | `{motion.ease-out}` | Modal/drawer entrance, large surface transitions |
| `{motion.ease-spring}` | 320ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Success celebrations only — never routine UI |

### Signature Motions

- **The rail glide.** When the active sidebar item changes, the 2px accent rail slides vertically to the new position over 200ms. The glow follows. This is the console's signature animation — it makes navigation feel like a needle moving on a dial.
- **The focus bloom.** A focused input grows a 3px ring of `{colors.accent-glow}` (24% alpha blue) over 120ms. It blooms, it doesn't pop.
- **The card lift.** On hover, a clickable card rises 1px and gains a faint shadow. Over 200ms, ease-out. Subtle — you feel it more than you see it.
- **The row wash.** Hovering a table row washes it with `{colors.surface-soft}` (#FAFAFA) over 120ms. The wash follows the cursor down the column.
- **The drawer slide.** Drawers slide in from the right over 320ms, pushing the canvas. The overlay fades in behind.

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| **Recessed** | `{colors.canvas}` (#FCFCFD) — no border | The worktop. Slightly darker than cards. |
| **Flat card** | `{colors.surface-card}` (#FFFFFF) + 1px `{colors.hairline}` border | Default cards, tables. The hairline is the elevation — no shadow. |
| **Flat inset** | `{colors.surface-inset}` (#F4F4F5) | Table headers, sunken areas inside a card. |
| **Lifted** | Card + `0 1px 2px rgba(0,0,0,0.04)` | Hover state on clickable cards. Barely visible — felt more than seen. |
| **Raised** | `0 4px 12px rgba(0,0,0,0.08)` | Sticky table headers, floating toolbars. |
| **Overlay** | `0 20px 50px -10px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.1)` | Modals, command palette, drawers. |
| **Dark frame** | `{colors.surface-dark}` — no shadow, color contrast | The sidebar. Depth via inversion, not shadow. |
| **Glow** | `{colors.accent-glow}` (rgba) | Focus rings, the active rail. The only "glowing" elevation. |

### Philosophy

**Hairlines do most of the elevation work; shadows are scarce.** This is the Cal.com inheritance — Cal.com uses faint shadows sparingly and relies on surface contrast. The admin pushes further: most cards have **only a hairline border, no shadow at all**, because on a dense screen, shadows multiply into visual noise. Shadows appear only when something is genuinely floating (modals, sticky headers, hover-lifted cards).

The live wire's glow is the exception — it's a *light* effect, not a shadow, and it's the only place depth comes from color rather than tone.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0 | Code blocks (sometimes), data-dense tables where corners would clip |
| `{rounded.xs}` | 4px | Small square badges, status dots' halo |
| `{rounded.sm}` | 6px | Sidebar nav items, small inline elements |
| `{rounded.md}` | 8px | **Buttons, inputs, segmented control items.** The action radius. |
| `{rounded.lg}` | 10px | Inner nested cards |
| `{rounded.xl}` | 12px | **Cards, tables, drawers, modals.** The container radius. |
| `{rounded.2xl}` | 14px | Large feature moments (empty state containers) |
| `{rounded.pill}` / `{rounded.full}` | 9999px | Pill badges, avatars, status dots, icon buttons |

### Principle — two radii, not seven

Despite the 8-step scale, the system effectively runs on **two working radii**: `{rounded.md}` (8px) for **actions** (buttons, inputs) and `{rounded.xl}` (12px) for **containers** (cards, tables, modals). The gap between them — 4px — is the signal: an 8px button reads as "press me", a 12px card reads as "contains something". Sidebar nav items at 6px sit between, reading as "navigational, not actionable".

Pills and full-rounds are reserved for **status, identity, and icon-only buttons** — never for text buttons (those stay at 8px).

---

## Components

### App Shell

**`app-shell`** — The root frame. `{colors.canvas}` background, `{typography.body}` everywhere. Holds the three zones (sidebar + topbar + canvas) in a fixed grid. The canvas scrolls independently; the sidebar and topbar are sticky.

**`sidebar`** — The dark left rail. 240px expanded, 64px collapsed. Background `{colors.surface-dark}` (#09090B), text `{colors.on-dark-soft}`. Holds the brand mark at top, sectioned nav groups in the middle (each group preceded by a `{component.sidebar-section-label}` in `{typography.micro}` — uppercase, faint), and user/exit controls at the bottom. **This is the only permanently-dark surface in the system.**

**`sidebar-nav-item`** — A single nav entry. 32px tall, `{rounded.sm}` (6px), icon (16px) + label. Default text `{colors.on-dark-soft}`; hover lifts to `{colors.on-dark}` with `{colors.surface-dark-elevated}` fill.

**`sidebar-nav-item-active`** — The live wire. Text brightens to `{colors.on-dark}`, background fills `{colors.surface-dark-elevated}`, and a **2px `{colors.accent-rail}` vertical rail** appears on the left edge with a soft `{colors.accent-glow}` bloom. When navigation changes, the rail **glides** to the new item over 200ms — this is the signature motion.

**`topbar`** — The slim orientation bar. 56px tall, `{colors.canvas}` background, 1px `{colors.hairline}` bottom border. Holds (left→right): collapse-toggle, breadcrumb or page context, spacer, global search trigger (renders as a pill reading "Search…  ⌘K"), notifications bell, profile avatar.

### Cards & Containers

**`card`** — The workhorse container. White (`{colors.surface-card}`), `{rounded.xl}` (12px), 1px `{colors.hairline}` border, 20px padding. No shadow by default — the border + the recessed canvas do the separation. Used for metric cards, form panels, detail panels, list panels.

**`card-header`** — Top section of a card. 16px×20px padding, `{typography.section-title}` title, optional actions on the right, 1px `{colors.hairline-soft}` divider below.

**`card-section`** — Subdivision inside a card. Same padding, hairline-soft divider. Used to stack related groups (e.g., "Profile" / "Security" / "Billing" sections in a settings card).

**`metric-card`** — The signature "instrument" card. Same chrome as `card` but internally structured: label (`{typography.caption}`, muted) → value (`{typography.metric}`, 28px tabular) → delta row (caption-sized up/down with caret) → optional sparkline (32px tall). The metric value is the hero — everything else is small and quiet. On the dashboard, the top row of 4 metric cards is the first thing the eye lands on.

### Tables — the core surface

**`table`** — The dense data container. White, `{rounded.xl}`, 1px hairline border. Tables are the most-used surface in the admin; everything about their design serves scannability.

**`table-header-row`** — `{colors.surface-inset}` fill, `{typography.micro}` (10px uppercase, 0.5px tracking) column labels in `{colors.muted}`, 36px tall. The uppercase micro labels are what make a dense header read as structure rather than crowding.

**`table-row`** — Default `{density.row-cozy}` (40px, switchable to 32px compact or 48px comfortable). `{typography.tabular}` (13px, tnum, weight 500). 1px `{colors.hairline-soft}` bottom divider — barely there, just enough to guide the eye down a column.

**`table-row-hover`** — Washes to `{colors.surface-soft}` (#FAFAFA) over 120ms.

**`table-row-selected`** — Tints to `{colors.accent-faint}` (#EFF6FF). Selected rows use the accent because selection is one of the five sanctioned accent uses.

**`table-cell-numeric`** — Right-aligned, `tnum` on. **Mandatory for any numeric column** — amounts, counts, timestamps-as-numbers, IDs.

**Table chrome rules:**
- Numeric columns always right-aligned with tabular figures.
- Primary identifier column (name, email, ID) left-aligned, `{typography.body-strong}`.
- Status columns render as a `{component.status-dot}` + `{component.badge-*}`, never just text.
- Timestamp columns right-aligned, `{typography.tabular-sm}` (12px), muted color unless it's the sort key.
- Action column (⋯ menu) right-aligned, 30px wide, sticky on horizontal scroll.

### Buttons

**`button-primary`** — The default primary action. Background `{colors.primary}` (#0A0A0B), white text, `{rounded.md}`, 32px tall, 14px horizontal padding, 14px icon. **This is the near-black Cal.com button, compressed.** Hover → `{colors.primary-active}`.

**`button-secondary`** — White with hairline border. The co-primary. Same dimensions as primary.

**`button-ghost`** — Transparent, muted text. Used for tertiary actions inside cards and in toolbars. Hover → soft fill.

**`button-accent`** — The lone blue button. Background `{colors.accent}` (#2563EB), white text. **Reserved for the single most important create/confirm action on a page** — "New order", "Publish", "Invite member". If a page has two accent buttons, one is wrong.

**`button-icon`** — 30×30px transparent icon button. Hover → soft fill. The ⋯ row-action menu, the refresh icon, the filter toggle.

> **Button hierarchy rule:** a page should have **at most one `button-accent`**, optionally one `button-primary`, and any number of `button-secondary` / `button-ghost` / `button-icon`. The accent button is the live wire at the action layer — it tells you "this is the thing to do".

### Inputs

**`input`** — Standard text input. 32px tall (matching button height), `{typography.body-sm}` (12px), 1px `{colors.hairline}` border, `{rounded.md}`. Dense and crisp.

**`input-focused`** — Border → `{colors.accent}`, plus the focus bloom: `0 0 0 3px {colors.accent-glow}`. The bloom is the signature — inputs feel alive when focused.

**`search-input`** — The global search field style. Background `{colors.surface-soft}` (not white), transparent border by default, 32px tall, 32px left padding for the search icon. On focus, border appears and bloom follows.

### Badges & Status

**`badge-neutral`** — Square (4px radius), `{colors.surface-panel}` fill, `{colors.ink-soft}` text. Default tag/category badge.

**`badge-accent` / `badge-success` / `badge-warning` / `badge-danger`** — Soft-fill semantic badges. Each uses its `{color}-soft` background and full-saturation text. Small, quiet, readable.

**`status-dot`** — 6px circle with a 3px halo (`glow: 0 0 0 3px <soft-variant>`). Status dots always pair with a label badge or a caption — never alone.

**All badges use `{typography.caption}` (11px/500)** and 2×6–8px padding. They are small because the table is dense.

### Segmented Control & Pagination

**`segmented`** — A pill-shaped wrapper (`{colors.surface-panel}` fill, `{rounded.md}`, 3px internal padding) holding 2–4 `{component.segmented-item}` options. Active item lifts to white with a faint shadow. Used for density toggles, view switchers (table/cards), time-range filters.

**`segmented-item-active`** — White fill, `{colors.ink}` text, `0 1px 2px rgba(0,0,0,0.06)` shadow. The lift reads as "selected".

### Command Palette

**`command-palette`** — Invoked by ⌘K. 560px wide, centered, `{rounded.xl}`, white surface with `backdrop-filter: blur(12px)` for a faint glass effect over the canvas. Heavy overlay shadow. This is the console's **fluid moment** — it appears instantly, accepts fuzzy input, and disappears on escape. It is the fastest path to anything.

**`command-item`** — 40px tall, `{typography.body}`, icon + title + optional shortcut hint on the right. Active item washes to `{colors.accent-faint}`.

The command palette is what makes a dense admin feel *light* — instead of navigating three menus to find "Suspended customers", you press ⌘K, type "susp", hit enter. The density of the sidebar is there for discovery; the command palette is there for speed.

### Drawers & Modals

**`drawer`** — Slides in from the right, 480px wide (full-width on mobile). White surface, 1px left border, heavy left-casting shadow. Used for detail views ("open a row without leaving the list"), edit forms, and settings panels. **Drawers are preferred over modals** for anything that doesn't need to block the full screen — they keep the list context visible.

**`modal`** — Centered, `{rounded.xl}`, heavy overlay shadow. Reserved for confirmations (especially destructive), and full-screen-blocking workflows. Most "edit" flows should use a drawer, not a modal.

### Empty State

**`empty-state`** — The orientation moment for an empty surface. Centered, 48px padding. Title in **Cal Sans** (`{typography.empty-state-title}` — this is one of the two sanctioned Cal Sans uses), body in `{typography.body}` (muted), and a single `{component.button-accent}` or `button-primary` CTA. The Cal Sans title here is deliberate — an empty state is a moment of orientation ("you have no orders yet"), and the brand voice belongs there.

---

## Layout Patterns

### Dashboard view

```
┌─ Page title (Cal Sans, 24px) ──────── density/refresh ─┐
│  Customers                                             │
├────────────────────────────────────────────────────────┤
│  ┌─ metric ─┐ ┌─ metric ─┐ ┌─ metric ─┐ ┌─ metric ─┐   │
│  │ MRR      │ │ Active   │ │ Churn    │ │ New       │   │
│  │ $48,210  │ │ 1,204    │ │ 2.1% ↓   │ │ +38 ↑     │   │
│  │ ▁▂▃▅▇    │ │ ▁▂▃▄▅    │ │ ▁▂▃▂▁    │ │ ▃▄▅▆▇     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├────────────────────────────────────────────────────────┤
│  ┌─ chart card (2/3) ─────────┐ ┌─ breakdown (1/3) ──┐ │
│  │ Revenue, last 12 months    │ │  By plan            │ │
│  │ [area chart, blue seq.]    │ │  Pro      62% ████  │ │
│  │                            │ │  Starter  28% ██    │ │
│  │                            │ │  Enterprise 10% ▌   │ │
│  └────────────────────────────┘ └─────────────────────┘ │
├────────────────────────────────────────────────────────┤
│  ┌─ table card (full) ───────────────────────────────┐ │
│  │ Recent customers · [filter] [export]              │ │
│  │ NAME        EMAIL             PLAN    MRR   STATUS│ │
│  │ ─────────────────────────────────────────────────│ │
│  │ Ada Lovelace ada@…          Pro     $99  ● active │ │
│  │ ...                                               │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### List view (the workhorse)

```
┌─ Page title ──── [+ New] (accent) ─┐
│  Orders                             │
├────────────────────────────────────┤
│  ┌─ toolbar ─────────────────────┐ │
│  │ [search]  [filter] [segmented]│ │
│  │           table·cards  cozy▾  │ │
│  ├───────────────────────────────┤ │
│  │ ID    CUSTOMER  TOTAL  STATUS │ │
│  │ ─────────────────────────────│ │
│  │ #1042 Ada L.    $99    ● paid│ │
│  │ ...                          │ │
│  │                              │ │
│  │ ◀ 1 2 3 … 42 ▶   100/page ▾  │ │
│  └───────────────────────────────┘ │
└────────────────────────────────────┘
```

### Detail drawer

Clicking a row opens a right-side `{component.drawer}` (480px) with the record's full detail, edit form, and action footer. The list stays visible on the left — context is never lost.

---

## Do's and Don'ts

### Do

- **Keep one accent hue above the monochrome floor.** Blue (#2563EB) in five sanctioned places: active sidebar rail, focus rings, the single accent CTA per page, selected table rows, inline links. Nowhere else.
- **Use Cal Sans for the page title and empty-state titles only.** One moment of brand voice per view. Everything else is Inter.
- **Set `font-feature-settings: 'tnum'` on every numeric token.** Tabular figures are non-optional in a data interface.
- **Default tables to cozy density (40px rows).** Offer compact (32px) and comfortable (48px) via a density toggle, but cozy is the baseline.
- **Use hairline borders for elevation on cards.** Reserve shadows for genuinely floating surfaces (modals, sticky headers, hover-lifted cards).
- **Prefer drawers over modals** for edit/detail flows — they preserve list context.
- **Glide the active rail between sidebar items.** 200ms, ease-out. The rail is a needle, not a switch.
- **Right-align numeric columns.** Always. With tabular figures.
- **Use the `{typography.micro}` uppercase token for table column headers.** It signals "label" typographically and lets the header stay compact.
- **End every primary action with a soft confirmation** — a toast or a state change, not a full-screen modal.

### Don't

- **Don't introduce a second accent color.** The live wire is blue. If you reach for green-for-go or red-for-stop on a button, use the semantic badge/dot instead — buttons stay monochrome (or the single accent blue).
- **Don't use Cal Sans on card titles, metrics, or buttons.** It's for page titles and empty states only. Blurring this boundary kills the "one orientation moment" principle.
- **Don't use shadows for routine card elevation.** A hairline border + the recessed canvas is the default. Shadows are scarce and meaningful.
- **Don't use proportional figures in tables.** `tnum` is mandatory on numeric data. Misaligned digits in a column look broken.
- **Don't put two accent buttons on one page.** The accent button means "this is THE action". Two means neither is.
- **Don't animate routine UI with the spring curve.** `{motion.ease-spring}` is for success celebrations only — a saved record, a completed task. Routine hover/focus uses ease-out.
- **Don't make the sidebar light.** The dark rail is the frame that grounds the interface and gives the live wire its contrast. It is permanently dark.
- **Don't go below 13px for body text.** 12px is reserved for secondary/helper text (`body-sm`); 11px for captions/badges; 10px for uppercase micro labels. Body never shrinks below 13px.
- **Don't use the accent blue for semantic states.** Success is green, warning is amber, danger is red. Blue is the *brand* accent, not a status color.
- **Don't snap, bounce, or pulse routine UI.** Motion is 200ms ease-out by default. Anything more energetic must be earned (a real success) or it becomes noise.

---

## Responsive Behavior

The admin is **desktop-first** — it is not a marketing site. But it must degrade gracefully on tablet and remain usable (if not primary) on mobile.

### Breakpoints

| Name | Width | Behavior |
|---|---|---|
| **Mobile** | < 768px | Sidebar collapses to a slide-over drawer (hamburger in topbar). Topbar stays. Canvas padding → 16px. Tables switch to a **card-list rendering** (each row becomes a stacked card) — the table layout does not survive at this width. Metric grid → 1 column. Drawers → full-width. |
| **Tablet** | 768–1024px | Sidebar auto-collapses to icon-rail (64px). Tables remain but shed secondary columns (configurable). Metric grid → 2 columns. Content margin → 24px. |
| **Desktop** | 1024–1440px | Full sidebar (240px). Full tables. Metric grid → 4 columns. Content margin → 32px. **This is the target.** |
| **Wide** | > 1440px | Content caps at 1440px centered; the extra space becomes outer breathing room. No layout change. |

### Touch Targets

- Buttons: 32px tall (slightly under WCAG 44px, but the system prioritizes density; touch usage is secondary).
- Table rows on touch: expand to 44px min height; the ⋯ action menu grows a larger tap zone.
- Sidebar items: 32px tall; on touch, the rail auto-expands to 240px on demand.

### Collapsing Strategy

- **Sidebar** collapses to icon-rail at < 1024px; to slide-over at < 768px. The active rail stays visible in all forms.
- **Tables** shed columns right-to-left (secondary columns hide first; primary identifier + status + actions always remain). At mobile, tables become card-lists.
- **Metric grids** collapse 4 → 2 → 1.
- **Drawers** go full-width at mobile.
- **Command palette** stays 560px until < 600px, then goes full-width-minus-margins.

---

## Iteration Guide

1. **Density before decoration.** When designing a new view, first decide the density tier (compact/cozy/comfortable) and the row count visible. Then decorate.
2. **One accent per page.** Before adding a blue element, count the existing ones. If there's already an accent CTA and a selected row, the next blue thing is wrong.
3. **Cal Sans is a budget.** You get one page title per view. Spend it on the view name, not on a section header.
4. **Reference tokens, never inline hex.** Every color, radius, spacing, and type size is a `{token}`. Inlining hex breaks the system.
5. **Motion is a state channel.** Before adding an animation, ask what state it communicates. If the answer is "decoration", remove it.
6. **Test with tabular figures off.** If a numeric column looks wrong without `tnum`, the column needs `tnum`. Always.
7. **The dark rail is fixed.** Don't propose a light-sidebar variant. The dark frame is load-bearing — it grounds the interface and hosts the live wire.
8. **When in doubt: less shadow, more hairline.** The system's default elevation is a 1px border. Reach for shadow only when something genuinely floats.

---

## Known Gaps

- **Cal Sans availability.** Licensed to Cal.com; the admin uses **Inter 600 at -0.04em** as the documented fallback. Geist or Manrope 700 are close geometric alternatives. The "one Cal Sans moment per page" principle means the fallback is low-risk — only the page title and empty states are affected.
- **Charting library.** The viz palette is specified, but the exact library (Recharts, Visx, ECharts, Chart.js) is not yet chosen. The palette is library-agnostic; the sequential blue scale maps cleanly to any library's quantitative scale.
- **Accessibility audit pending.** The 13px body and 32px controls are density-optimized and slightly under WCAG's 14px/44px recommendations. A formal a11y audit (contrast, target size, keyboard nav) is the next step before production.
- **Dark mode for the canvas.** The sidebar is permanently dark, but the canvas (cards, tables) is light-only. A full dark theme for the work surface is **out of scope** for v1 — the dark sidebar + light canvas is the deliberate "instrument" read, and inverting the canvas would flatten that. A future "dark worktop" mode would need its own design pass.
- **Motion timings are prescriptive but untested at scale.** The 200ms base / 120ms fast / rail-glide signature are specified from principle, not from user testing. They should be validated with real interaction before finalizing.
- **Density toggle persistence.** Whether the cozy/comfortable/compact choice persists per-user, per-table, or globally is an open product decision.
- **Right-to-left languages.** The right-aligned numeric columns and right-side drawers assume LTR. RTL would mirror the layout but the table alignment rules need re-stating.
