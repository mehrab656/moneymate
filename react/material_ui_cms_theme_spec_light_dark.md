# Material-UI CMS Theme Specification — Light & Dark

**Audience:** Frontend engineers and designers building a modern CMS with Material UI (MUI). Target model: *GPT-5 medium* — this doc is intentionally explicit so it can be used programmatically to generate theme code, storybook entries, and design tokens.

---

## Overview & goals

- **Goal:** Single, cohesive theme system for a modern CMS (dashboard + content editing) that supports **light** and **dark** modes, accessibility, responsive layouts, and easy token-driven customization.
- **Principles:** Clarity, hierarchy, consistency, accessibility (WCAG AA+ where possible), subtle motion, and support for dense data views.

---

## Design tokens (core)

**Spacing scale** — base: `8px` (1 unit). Provide `spacing(n) = 8 * n`.
- xs: 4px (0.5u)
- sm: 8px (1u)
- md: 16px (2u)
- lg: 24px (3u)
- xl: 32px (4u)

**Radii / Shape**
- radius-none: 0
- radius-xs: 4px
- radius-sm: 8px (default components)
- radius-md: 12px (cards)
- radius-lg: 20px (modals)

**Elevations / Shadows** (named tokens, subtle in dark mode)
- elevation-0: none
- elevation-1: `0 1px 2px rgba(16,24,40,0.04)`
- elevation-2: `0 4px 8px rgba(16,24,40,0.06)`
- elevation-3: `0 10px 20px rgba(16,24,40,0.08)`

**Motion & Timing**
- duration-fast: 120ms
- duration-medium: 200ms
- duration-slow: 350ms
- easing-standard: `cubic-bezier(.2,.8,.2,1)`
- focus-ring: `0 0 0 3px` using an accessible semi-transparent accent color

**Z-index scale** (relative to MUI defaults)
- z-appbar: 1100
- z-drawer: 1200
- z-modal: 1300
- z-popover/menu: 1400
- z-tooltip: 1500

---

## Color system

Provide *paired* palette tokens for light and dark modes. Use semantic names, not presentation names.

**Semantic tokens** (each token lists `light` / `dark` values):

- `primary` — brand/main action
  - light: `#0063F7` (strong blue)
  - dark: `#80B8FF`
- `onPrimary` (text/icon on primary)
  - light: `#FFFFFF`
  - dark: `#0B1A2B`
- `secondary` — secondary actions / highlights
  - light: `#7C4DFF`
  - dark: `#CFC0FF`
- `background` — app background (surface behind content)
  - light: `#F7F9FC`
  - dark: `#0B1220`
- `surface` — main cards, panels
  - light: `#FFFFFF`
  - dark: `#0F1724`
- `surfaceElevated` — elevation layer (cards)
  - light: `#FFFFFF` (with shadow)
  - dark: `#111827` (slightly lighter than surface)
- `textPrimary`
  - light: `#0B1726` (near-black)
  - dark: `#E6EEF8` (near-white)
- `textSecondary`
  - light: `#44566A`
  - dark: `#B9C6D8`
- `muted` (subtle text/borders)
  - light: `#98A2B3`
  - dark: `#6B7B8C`
- `divider`
  - light: `rgba(15,23,36,0.08)`
  - dark: `rgba(255,255,255,0.06)`
- `success`
  - light: `#12B76A`
  - dark: `#7EF3C4`
- `warning`
  - light: `#F79009`
  - dark: `#FFD9A6`
- `error`
  - light: `#FF4D4F`
  - dark: `#FFB3B8`
- `info`
  - light: `#2B8CF1`
  - dark: `#7FC3FF`
- `backdrop` (modal overlay)
  - light: `rgba(2,6,23,0.32)`
  - dark: `rgba(2,4,11,0.56)`

> **Tip:** Store tokens in JSON and export both a `light` and `dark` theme object for programmatic swapping.

---

## Accessibility & contrast

- Aim for **>= 4.5:1** for normal text (body, labels). Headings can be 3:1 only if large (>= 24px bold). Use tools (axe, Lighthouse) to verify.
- Provide high-contrast fallback theme for users who opt-in (larger contrast ratios on `textPrimary` and `background`).
- Focus outlines: visible 3px ring using `primary` at 24% alpha or a dedicated `focus` token.
- Avoid relying on color alone to convey status — always include icons/labels.

---

## Typography

**Base settings**
- font-family: `Inter, Roboto, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial` (inter for UI clarity)
- html font size: 16px
- scale: 1 rem = 16px

**Type scale** (with MUI variant mapping)
- `h1`: 32px / 40px line-height / 700
- `h2`: 28px / 36px / 700
- `h3`: 22px / 28px / 600
- `h4`: 18px / 24px / 600
- `h5`: 16px / 22px / 600
- `h6`: 14px / 20px / 600
- `subtitle1`: 16px / 24px / 600
- `body1`: 14px / 20px / 400
- `body2`: 13px / 18px / 400
- `caption`: 12px / 16px / 400
- `button`: 14px / 16px / 600 (uppercase optional)

**Utility rules**
- Use `500–700` font weights for headings and primary action labels. Keep body text at `400–500` for readability.
- Line length: 60–80 characters for content; dashboards can use denser lines (up to 100) in constrained spaces.

---

## Grid & layout

**Breakpoints** (MUI defaults recommended with slight adjustments)
- xs: 0
- sm: 600
- md: 900
- lg: 1280
- xl: 1600

**Container widths**
- small: 720px
- medium: 1024px
- large: 1280px

**Sidebar widths**
- collapsed: 72px (icons only)
- expanded: 256px
- responsive: hide or overlay below `md` (use drawer)

**Topbar height**
- desktop: 64px
- mobile: 56px

**Density mode** (optional)
- default spacing multiplier: 1
- compact: spacing * 0.75, smaller touch targets

---

## Component guidelines & tokens

Below are *explicit* tokens and recommended overrides for key MUI components. Use MUI `createTheme` and `components` overrides to implement.

### AppBar / Topbar
- background: `surface` with slight elevation
- text/icon color: `textPrimary` or `onSurface` token
- height: `64px`
- shadow: `elevation-2`
- compact variant: height `56px`

**Behavior**
- Sticky on scroll (option). Transparent when scrolled-to-top if desired.
- Provide search input integrated into AppBar for quick access.

### Drawer / Sidebar
- width tokens: `sidebar-collapsed` / `sidebar-expanded`
- background: `surface` or `surfaceElevated`
- divider color: `divider`
- item hover: background `rgba(primary, 0.06)` (or `rgba(255,255,255,0.04)` in dark)
- active item: border-left `3px solid primary` and `font-weight: 600`

### Buttons
- Primary: `primary` background, `onPrimary` text, elevation `elevation-1`, hover: darken 6–8%.
- Secondary: outlined with `secondary` border and text
- Ghost / text button: no background, primary color text
- Size tokens: small (32px), medium (40px), large (48px)
- Border radius: `radius-sm`

### Inputs / TextField
- background: `surface` (in dark: slightly lighter), border: `divider`
- focused state: outline of `focus` token + box-shadow `0 0 0 3px rgba(primary, 0.12)`
- error color: `error` for border + helper text
- placeholder color: `muted`
- dense variant for table filters: reduce vertical padding by half

### Cards / Panels
- background: `surfaceElevated`
- border radius: `radius-md`
- padding: `lg` for main cards, `md` for compact
- elevation: `elevation-2`

### Data tables / DataGrid
- header background: `surface` (slightly elevated)
- row hover: `rgba(primary, 0.04)`
- striped rows: alternate subtle surface tint in light mode
- cell focus: `focus` ring
- small density default with toggle to comfortable

### Chips / Tags
- filled: background `secondary` or `muted` for neutral
- outline chips: border `divider`
- rounded: `radius-lg` for pill look

### Avatars
- default background: `muted` with `textPrimary` initials
- size tokens: sm 24px, md 32px, lg 40px

### Dialogs / Modals
- background: `surfaceElevated` (radius-lg)
- backdrop color: `backdrop`
- max-width tokens: sm 480, md 720, lg 960
- close icon at top-right, confirm/cancel primary/secondary semantics

### Snackbars / Toasts
- position: bottom-left or bottom-right on desktop, bottom-center on mobile
- info/success/error variants using semantic tokens
- duration: 4000ms default, dismissible

### Tooltips & Popovers
- background: `textPrimary` (inverted text color) or `muted` depending on contrast
- arrow: present
- subtle entry animation (translateY 6px -> 0 + fade)

### Icons & Imagery
- Icon size: 20px default inline; 24px for toolbar; 28–32 for hero
- Use SVG icons with `currentColor` to inherit text color

---

## Implementation snippets (MUI v5 style)

> The full theme JSON is included in the repository. Below are minimal, copy-ready snippets.

**1) Token-based CSS variables (optional, for non-MUI parts):**

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --color-primary: #0063F7;
  --color-surface: #FFFFFF;
  --color-background: #F7F9FC;
}

[data-theme='dark'] {
  --color-primary: #80B8FF;
  --color-surface: #0F1724;
  --color-background: #0B1220;
}
```

**2) MUI `createTheme` skeleton**

```js
import { createTheme } from '@mui/material/styles';

const base = {
  spacing: 8,
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial',
    h1: { fontSize: '2rem', fontWeight: 700 },
    // ...rest
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, padding: '8px 16px' },
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: '0 4px 12px rgba(2,6,23,0.06)' } },
    },
    // add targeted overrides for TextField, Drawer, Card, DataGrid, etc.
  }
};

export const lightTheme = createTheme({
  ...base,
  palette: {
    mode: 'light',
    primary: { main: '#0063F7', contrastText: '#fff' },
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
    text: { primary: '#0B1726', secondary: '#44566A' },
  },
});

export const darkTheme = createTheme({
  ...base,
  palette: {
    mode: 'dark',
    primary: { main: '#80B8FF', contrastText: '#0B1A2B' },
    background: { default: '#0B1220', paper: '#0F1724' },
    text: { primary: '#E6EEF8', secondary: '#B9C6D8' },
  },
});
```

**3) Theme switcher (React)**

```js
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(() => localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light'));

  React.useEffect(() => { localStorage.setItem('theme', mode); }, [mode]);

  const theme = React.useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeProvider theme={theme}>
      {/* rest */}
    </ThemeProvider>
  );
}
```

---

## Dark-mode considerations (detailed)

- Avoid pure black for surfaces; use deep navy/gray to preserve detail (`#0B1220`).
- Increase contrast for text and interactive elements. Lift elevated surfaces slightly lighter than base surface.
- Shadows: reduce opacity and use lighter (bluish) tints instead of black shadows.
- Borders: often unnecessary in dark; use subtle tonal separation instead.
- Accent glows: prefer subtle outer glows for inputs and focus states (`rgba(primary,0.12)`).

---

## Developer checklist for theming

1. Create canonical tokens JSON for `light` and `dark`.
2. Implement MUI `createTheme` using tokens and `components` overrides.
3. Add CSS variable fallback for global non-MUI elements.
4. Implement theme persistence (localStorage + system preference fallback).
5. Test all major components (forms, tables, dialogs) in both modes.
6. Run automated accessibility checks and manual keyboard navigation tests.

---

## Microinteractions & motion details

- Buttons: quick scale 0.98 on active (duration-fast)
- Dialogs: scale from 0.985 → 1 + fade (duration-medium)
- Tooltips: translateY 6px → 0 (duration-fast)
- Sidebar collapse: animate width + crossfade icons (duration-medium)
- Use reduced-motion media query to reduce/disable nonessential motion.

---

## Example tokens JSON (short excerpt)

```json
{
  "spacing": 8,
  "colors": {
    "primary": { "light": "#0063F7", "dark": "#80B8FF" },
    "background": { "light": "#F7F9FC", "dark": "#0B1220" },
    "surface": { "light": "#FFFFFF", "dark": "#0F1724" }
  },
  "shape": { "radius": { "sm": 8, "md": 12 } }
}
```

---

## QA & cross-check matrix

Create a checklist page in storybook or a design QA doc that verifies each component in:
- Light / Dark / High contrast
- Desktop / Tablet / Mobile
- Keyboard-only navigation
- Screen-reader checks (aria labels, live regions)

---

## Appendix: Example component override hints (more)

- `MuiTableCell`: reduce padding for dense mode; ensure header boldness
- `MuiAvatar`: outline on focus
- `MuiIconButton`: circular hit target 40px, center icon
- `MuiSwitch`: thumb color `#fff` on active with track tinted by primary

---

## Final notes

This spec provides a complete starting point. If you want, I can:
- Produce a full `theme.ts`/`theme.js` file with all tokens wired and component overrides.
- Generate Storybook stories for each component in both themes.

(End of spec.)

