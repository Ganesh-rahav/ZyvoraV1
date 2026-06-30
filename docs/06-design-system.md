# 06 — Zyvora Design System

---

## Document Metadata

| Field           | Value                                                        |
|-----------------|--------------------------------------------------------------|
| Document ID     | 06-design-system                                             |
| Version         | 1.0.0                                                        |
| Status          | Living Document                                              |
| Created         | 2026-06-29                                                   |
| Last Updated    | 2026-06-29                                                   |
| Authors         | Founding Design Team                                         |
| Audience        | Designers, Engineers, AI Coding Assistants, Product Team     |
| Parent Documents| docs/00-project-vision.md, docs/01-product-requirements.md   |
| Classification  | Internal — Design Foundation                                 |

---

## 1. Brand Philosophy

### 1.1 The Visual Identity

Zyvora is built on a single premise: the coaching relationship is the product. The visual identity exists to support that relationship — not to impress, entertain, or distract.

The design language is **clinical without being cold, structured without being rigid, and precise without being sterile**. It draws from the visual grammar of scientific instrumentation and premium health technology: calibrated data displays, deliberate negative space, and typography that communicates with authority.

The palette is anchored in deep navy and midnight — evocative of focus, seriousness, and trust. Electric blue serves as the primary action color: purposeful, energetic, unmistakable. The AI coach surfaces through a distinct emerald accent — the voice of intelligence in the interface.

Every visual decision asks: *does this make the user feel more capable, more informed, and more trusting of their coach?*

### 1.2 The Emotional Experience

| Stage | Emotion | Design Response |
|-------|---------|-----------------|
| First visit | Skepticism, curiosity | Restraint. Clear signal. No noise. |
| Onboarding | Optimism, mild anxiety | Warmth. Progress. Clarity. |
| Dashboard (active) | Agency, momentum | Data density balanced with breathing room. |
| AI Coach | Trust, dialogue | Conversational. Humanized. Focused. |
| Progress review | Pride, accountability | Data celebration. Visual milestone clarity. |
| Missed week | Shame risk | No judgment in the UI. Calm re-engagement. |

### 1.3 Design Principles

**1. Data is the hero.** Every layout decision optimizes for data legibility. Decoration serves function or is removed.

**2. Space is structure.** Zyvora does not fill space. Negative space communicates hierarchy, focus, and calm. A sparse screen is a confident screen.

**3. One voice, everywhere.** The AI coach has a defined personality (see docs/02-ai-coach-spec.md §3). The visual system echoes that voice: direct, warm, structured. Copy, illustration, and UI follow the same tone.

**4. Dark by default, light by choice.** The primary mode is dark. Fitness is often used in gyms, at night, on the go. A dark interface reduces eye strain in these contexts and communicates premium quality. Light mode is a first-class citizen — not an afterthought.

**5. Components earn their existence.** Every component must serve a coaching-relationship use case. No decorative elements without functional purpose.

---

## 2. Color System

### 2.1 Philosophy

The Zyvora palette uses a restricted, meaningful set of colors. Each color has a defined semantic role. Colors are never applied arbitrarily — they communicate system state, hierarchy, and brand voice.

### 2.2 Primary Brand Color — Zyvora Blue

The primary brand color. Used for primary actions, active states, links, and progress indicators. Communicates intelligence, focus, and forward motion.

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--brand-50` | `#EFF6FF` | 213 100% 97% | Tinted backgrounds, hover states |
| `--brand-100` | `#DBEAFE` | 214 95% 93% | Light mode accent backgrounds |
| `--brand-200` | `#BFDBFE` | 213 97% 87% | Light mode borders |
| `--brand-300` | `#93C5FD` | 212 96% 78% | Light mode text accents |
| `--brand-400` | `#60A5FA` | 213 94% 68% | Secondary actions, icon accents |
| `--brand-500` | `#3B82F6` | 217 91% 60% | **Primary interactive** — buttons, links, focus rings |
| `--brand-600` | `#2563EB` | 221 83% 53% | **Dark mode primary** — pressed states |
| `--brand-700` | `#1D4ED8` | 224 76% 48% | Gradient start, chart lines |
| `--brand-800` | `#1E40AF` | 226 71% 40% | Deep accent |
| `--brand-900` | `#1E3A8A` | 224 64% 33% | Deepest brand surface |

**Why this blue:** RGB blue is aggressive. This blue sits at 217° on the HSL wheel — slightly warmer than pure blue, avoiding the coldness of medical blue while maintaining the intelligence signal. At `500` it meets 3:1 contrast against `--brand-900` for component use cases, and 4.5:1 against white.

### 2.3 AI Coach Accent — Coach Emerald

Exclusively used to visually distinguish AI Coach outputs, messages, indicators, and statuses from user content. When a user sees emerald in the interface, they know they are seeing the coach's voice.

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--coach-DEFAULT` | `#10B981` | 158 64% 52% | AI message bubbles, coach indicators, active coaching badge |
| `--coach-foreground` | `#FFFFFF` | — | Text on coach surfaces |
| `--coach-subtle` | `#064E3B` | 160 76% 18% | AI section backgrounds (dark mode) |
| `--coach-muted` | `#D1FAE5` | 152 77% 91% | AI section backgrounds (light mode) |

**Why emerald:** Emerald reads as growth, nature, and intelligence — distinct from the energetic blue without competing. In a dark interface it reads cleanly at low saturation. It is uncommon in fitness applications, making it memorable.

### 2.4 Semantic Colors

#### Success — Verified Green

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--success` | `#22C55E` | 142 71% 45% | Completed sessions, logged macros met, goals achieved |
| `--success-foreground` | `#052E16` | — | Text on success backgrounds |
| `--success-subtle` | `#DCFCE7` | 140 76% 93% | Success state backgrounds (light) |

#### Warning — Amber

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--warning` | `#F59E0B` | 38 92% 50% | Incomplete check-ins, approaching caloric limits, plan flags |
| `--warning-foreground` | `#451A03` | — | Text on warning backgrounds |
| `--warning-subtle` | `#FEF3C7` | 48 96% 89% | Warning state backgrounds (light) |

#### Danger — Signal Red

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--destructive` | `#EF4444` | 0 84% 60% | Error states, delete actions, safety alerts |
| `--destructive-foreground` | `#FFFFFF` | — | Text on destructive backgrounds |
| `--destructive-subtle` | `#FEE2E2` | 0 93% 94% | Error state backgrounds (light) |

#### Info — Slate Blue

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--info` | `#6366F1` | 239 84% 67% | Informational callouts, tips, AI disclaimers |
| `--info-foreground` | `#FFFFFF` | — | Text on info backgrounds |
| `--info-subtle` | `#EEF2FF` | 226 100% 97% | Info state backgrounds (light) |

### 2.5 Neutral Scale

The neutral scale forms all surfaces, text, borders, and structural UI. It uses a cool-leaning dark that pairs with Zyvora's midnight tone.

| Token | HEX | HSL | Usage |
|-------|-----|-----|-------|
| `--neutral-50` | `#F8FAFC` | 210 40% 98% | Lightest surface (light mode page bg) |
| `--neutral-100` | `#F1F5F9` | 210 40% 95% | Card background (light mode) |
| `--neutral-200` | `#E2E8F0` | 214 32% 91% | Borders (light mode) |
| `--neutral-300` | `#CBD5E1` | 213 27% 84% | Dividers, input borders (light mode) |
| `--neutral-400` | `#94A3B8` | 215 20% 65% | Placeholder text, disabled |
| `--neutral-500` | `#64748B` | 215 16% 47% | Muted text, secondary labels |
| `--neutral-600` | `#475569` | 215 19% 35% | Body text (light mode) |
| `--neutral-700` | `#334155` | 215 25% 27% | Dark card surface |
| `--neutral-800` | `#1E293B` | 215 28% 17% | Sidebar, secondary surface (dark) |
| `--neutral-900` | `#0F172A` | 222 47% 11% | Page background (dark mode) |
| `--neutral-950` | `#020617` | 222 84% 5% | Deepest dark surface |

### 2.6 Dark Mode (Default)

```css
:root.dark {
  --background:         #0F172A;   /* neutral-900 — page bg */
  --foreground:         #F8FAFC;   /* neutral-50 — primary text */

  --surface:            #1E293B;   /* neutral-800 — card bg */
  --surface-raised:     #334155;   /* neutral-700 — elevated cards */
  --surface-overlay:    #1E293B;   /* neutral-800 — modal bg */

  --border:             #334155;   /* neutral-700 — card/input borders */
  --border-subtle:      #1E293B;   /* neutral-800 — dividers */

  --muted:              #334155;   /* neutral-700 — muted bg */
  --muted-foreground:   #94A3B8;   /* neutral-400 — muted text */

  --primary:            #3B82F6;   /* brand-500 */
  --primary-foreground: #FFFFFF;
  --primary-hover:      #2563EB;   /* brand-600 — pressed */

  --secondary:          #1E293B;   /* neutral-800 */
  --secondary-foreground: #CBD5E1; /* neutral-300 */

  --accent:             #334155;   /* neutral-700 */
  --accent-foreground:  #F8FAFC;   /* neutral-50 */

  --input:              #1E293B;   /* neutral-800 */
  --input-border:       #475569;   /* neutral-600 */
  --input-placeholder:  #64748B;   /* neutral-500 */

  --ring:               #3B82F6;   /* brand-500 — focus ring */
  --radius:             0.75rem;
}
```

### 2.7 Light Mode

```css
:root.light {
  --background:         #F8FAFC;   /* neutral-50 — page bg */
  --foreground:         #0F172A;   /* neutral-900 — primary text */

  --surface:            #FFFFFF;   /* white — card bg */
  --surface-raised:     #F1F5F9;   /* neutral-100 — elevated */
  --surface-overlay:    #FFFFFF;   /* white — modal bg */

  --border:             #E2E8F0;   /* neutral-200 */
  --border-subtle:      #F1F5F9;   /* neutral-100 */

  --muted:              #F1F5F9;   /* neutral-100 */
  --muted-foreground:   #64748B;   /* neutral-500 */

  --primary:            #2563EB;   /* brand-600 — slightly darker for contrast */
  --primary-foreground: #FFFFFF;
  --primary-hover:      #1D4ED8;   /* brand-700 */

  --secondary:          #F1F5F9;   /* neutral-100 */
  --secondary-foreground: #334155; /* neutral-700 */

  --accent:             #EFF6FF;   /* brand-50 */
  --accent-foreground:  #1D4ED8;   /* brand-700 */

  --input:              #FFFFFF;
  --input-border:       #CBD5E1;   /* neutral-300 */
  --input-placeholder:  #94A3B8;   /* neutral-400 */

  --ring:               #2563EB;   /* brand-600 */
}
```

### 2.8 Color Usage Rules

- **Never use brand colors for decorative purposes.** Brand blue signals an interactive state. Emerald signals the AI.
- **Never combine blue and emerald in a way that creates ambiguity** about whether content is from the user or the AI coach.
- **Text on dark backgrounds:** Use `neutral-50` for primary text, `neutral-300` for secondary, `neutral-500` for tertiary/placeholder.
- **Text on light backgrounds:** Use `neutral-900` for primary, `neutral-600` for secondary, `neutral-400` for tertiary.
- **Disabled state:** Always expressed as `opacity: 0.4` on the element — do not create separate disabled color tokens.
- **Hover states:** Primary interactive elements darken by one step in the brand scale. Neutral elements use a subtle `neutral-800→700` (dark) or `neutral-100→200` (light) shift.

---

## 3. Typography

### 3.1 Typeface Selection

| Role | Typeface | Google Fonts Import | Rationale |
|------|----------|--------------------|----|
| Display / Hero | **Outfit** | `Outfit:wght@300;400;500;600;700` | Geometric, modern, confident — premium without being corporate |
| Body / Interface | **Inter** | `Inter:wght@300;400;500;600;700` | The gold standard for UI text — exceptional legibility, neutral personality |
| Numbers / Data | **JetBrains Mono** | `JetBrains Mono:wght@400;500;600` | Tabular figures, monospaced for data alignment — dashboard metrics, weights, macros |

### 3.2 Type Scale

All sizes use `rem` to respect system font preferences. Base: `16px = 1rem`.

#### Display (Outfit)

| Token | Size | Line Height | Weight | Tracking | Usage |
|-------|------|-------------|--------|----------|-------|
| `--text-display-2xl` | `4.5rem` (72px) | 1.1 | 700 | -0.03em | Hero headlines only |
| `--text-display-xl` | `3.75rem` (60px) | 1.1 | 700 | -0.025em | Landing page H1 |
| `--text-display-lg` | `3rem` (48px) | 1.15 | 600 | -0.02em | Feature headers |
| `--text-display-md` | `2.25rem` (36px) | 1.2 | 600 | -0.015em | Section titles |

#### Heading (Inter)

| Token | Size | Line Height | Weight | Tracking | Usage |
|-------|------|-------------|--------|----------|-------|
| `--text-h1` | `1.875rem` (30px) | 1.25 | 600 | -0.01em | Page titles |
| `--text-h2` | `1.5rem` (24px) | 1.3 | 600 | -0.008em | Card headings, section headers |
| `--text-h3` | `1.25rem` (20px) | 1.35 | 600 | -0.005em | Widget titles, modal headings |
| `--text-h4` | `1.125rem` (18px) | 1.4 | 500 | 0 | Subheadings, group labels |
| `--text-h5` | `1rem` (16px) | 1.5 | 600 | 0 | Label-weight headings |

#### Body (Inter)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-body-lg` | `1.125rem` (18px) | 1.6 | 400 | Marketing copy, AI coach responses |
| `--text-body-md` | `1rem` (16px) | 1.6 | 400 | Default UI body text |
| `--text-body-sm` | `0.875rem` (14px) | 1.5 | 400 | Secondary information, form labels |
| `--text-body-xs` | `0.75rem` (12px) | 1.5 | 400 | Timestamps, helper text, captions |

#### UI / Functional (Inter)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-btn-lg` | `1rem` (16px) | 1 | 500 | Large buttons |
| `--text-btn-md` | `0.875rem` (14px) | 1 | 500 | Default buttons |
| `--text-btn-sm` | `0.8125rem` (13px) | 1 | 500 | Small buttons, tags |
| `--text-label` | `0.75rem` (12px) | 1 | 600 | ALL-CAPS form labels, data labels |
| `--text-overline` | `0.6875rem` (11px) | 1 | 700 | Overline labels (uppercase, tracked) |

#### Numeric / Data (JetBrains Mono)

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-num-xl` | `2.25rem` (36px) | 600 | Dashboard macro totals, body weight large displays |
| `--text-num-lg` | `1.5rem` (24px) | 500 | Chart y-axis values, metric cards |
| `--text-num-md` | `1rem` (16px) | 500 | Set/rep numbers, calorie counts |
| `--text-num-sm` | `0.875rem` (14px) | 400 | Table data cells |

### 3.3 Typography Usage Rules

- **Outfit is for branding only.** Never use Outfit for body text, labels, or interface elements. Use it for hero headlines, the wordmark, and marketing display only.
- **Inter handles all UI.** Forms, buttons, labels, body copy, navigation — all Inter.
- **JetBrains Mono handles all numbers that benefit from alignment.** Weight values in workout tables, calorie counts, body metrics, macro grams. This creates instant visual differentiation between label and value.
- **Line length:** Body text should not exceed 72 characters per line (`max-width: 68ch`). AI coach responses are constrained to 720px max-width containers.
- **Tracking:** Display type is negatively tracked. Body text is `normal`. Labels that appear in ALL CAPS use `0.08em` letter-spacing.
- **Weight discipline:** Use weight to express hierarchy, not decoration. Never use 300 (Light) for body text — use 400. Reserve 700 (Bold) for display and maximum emphasis.

---

## 4. Spacing System

### 4.1 The Grid

Zyvora uses an **8px base grid** with 4px subgrid for micro-spacing. All spacing values are multiples of 4px.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-px` | `1px` | Borders, hairlines |
| `--space-0.5` | `2px` | Internal micro-gaps |
| `--space-1` | `4px` | Icon gaps, tight stacking |
| `--space-2` | `8px` | Label-to-input gap, small padding |
| `--space-3` | `12px` | Compact component padding |
| `--space-4` | `16px` | **Standard component padding** |
| `--space-5` | `20px` | Card inner padding (compact) |
| `--space-6` | `24px` | **Default card padding** |
| `--space-8` | `32px` | Section separation within a card |
| `--space-10` | `40px` | Large component padding |
| `--space-12` | `48px` | Section spacing (mobile) |
| `--space-16` | `64px` | Section spacing (desktop) |
| `--space-20` | `80px` | Large section spacing |
| `--space-24` | `96px` | Hero section padding |
| `--space-32` | `128px` | Maximum section separation |

### 4.2 Container Widths

| Token | Max Width | Usage |
|-------|-----------|-------|
| `--container-xs` | `480px` | Auth forms, modals |
| `--container-sm` | `640px` | Narrow content, AI coach |
| `--container-md` | `768px` | Article, onboarding steps |
| `--container-lg` | `1024px` | Standard page content |
| `--container-xl` | `1280px` | Wide dashboard layouts |
| `--container-2xl` | `1440px` | Ultra-wide constrained max |
| `--container-full` | `100%` | Full-bleed sections |

Default content container: `--container-xl` with `padding-inline: var(--space-6)` on mobile, `var(--space-8)` on tablet, `var(--space-16)` on desktop.

### 4.3 Layout Spacing System

| Context | Padding | Gap |
|---------|---------|-----|
| Page (mobile) | `16px` horizontal | — |
| Page (tablet) | `24px` horizontal | — |
| Page (desktop) | `32px–64px` horizontal | — |
| Card (compact) | `16px` | — |
| Card (default) | `24px` | — |
| Card (large) | `32px` | — |
| Form group | — | `16px` vertical |
| Form inline | — | `8px` horizontal |
| Button group | — | `8px` horizontal |
| Nav items | `12px 16px` | — |
| Section vertical spacing (mobile) | `48px` top/bottom | — |
| Section vertical spacing (desktop) | `80px` top/bottom | — |

### 4.4 Dashboard Grid

The authenticated dashboard uses a 12-column CSS grid on desktop, collapsing to 4 columns on tablet and 1 column on mobile.

```
Desktop (≥1024px): 12 columns, 24px gap
Tablet (≥768px):   4 columns, 16px gap
Mobile (<768px):   1 column, 0 gap
```

Standard widget sizes:
- **Full width:** `col-span-12`
- **Half:** `col-span-6`
- **Third:** `col-span-4`
- **Quarter:** `col-span-3`
- **Two-thirds:** `col-span-8`

---

## 5. Border Radius

Zyvora uses a rounded-but-restrained radius scale. Sharp corners feel harsh; excessive rounding feels playful. The scale is calibrated for precision.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `4px` | Tags, badges, code blocks |
| `--radius-sm` | `6px` | Input fields, small buttons |
| `--radius-md` | `8px` | Default button radius |
| `--radius-lg` | `12px` | **Default card radius** |
| `--radius-xl` | `16px` | Large cards, modals |
| `--radius-2xl` | `24px` | Feature blocks, hero cards |
| `--radius-full` | `9999px` | Pills, toggles, avatar rings |

### 5.1 Radius Rules

- **Cards:** Always `--radius-lg` (12px). Never less.
- **Buttons:** `--radius-md` (8px) default. Pill buttons (e.g., tag filters) use `--radius-full`.
- **Inputs:** `--radius-sm` (6px). Slightly tighter than buttons — inputs are receptive, not active.
- **Modals and Dialogs:** `--radius-xl` (16px). They float above the interface and need softer edges.
- **Avatars:** Always `--radius-full`. Circles.
- **Images inside cards:** Inherit the card's radius only on exposed corners. Internal images use `0` on internal edges.
- **Toasts/Notifications:** `--radius-lg` (12px).

---

## 6. Shadows

Shadows express elevation. In dark mode, elevation is expressed through surface lightening (lighter `background-color`) as well as subtle shadows. In light mode, shadows are the primary elevation signal.

### 6.1 Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Subtle card lift (light mode) |
| `--shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)` | Cards, inputs on focus |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` | Dropdown menus, tooltips |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)` | Modals, floating panels |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)` | Full-screen modals |
| `--shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Navigation drawers |

### 6.2 Brand Glow Effects

Used sparingly for interactive emphasis, active AI states, and milestone moments.

| Token | Value | Usage |
|-------|-------|-------|
| `--glow-brand` | `0 0 0 3px rgba(59,130,246,0.25)` | Focus rings, active card borders |
| `--glow-brand-lg` | `0 0 20px 0 rgba(59,130,246,0.15)` | Primary button hover glow |
| `--glow-coach` | `0 0 0 3px rgba(16,185,129,0.25)` | AI coach message focus, active coach badge |
| `--glow-success` | `0 0 0 3px rgba(34,197,94,0.25)` | Goal completion, PR achievement |

### 6.3 Dark Mode Shadow Adjustments

In dark mode, shadows are less visible against dark backgrounds. Elevation is expressed by **surface lightening** instead:

- Base surface: `--neutral-900` (`#0F172A`)
- Elevated card: `--neutral-800` (`#1E293B`)
- Double-elevated (hover card, dropdown): `--neutral-700` (`#334155`)
- Overlay (modal): `--neutral-800` + `--shadow-xl`

Dark mode glow effects are increased 20% in alpha — glows read better against dark surfaces.

---

## 7. Buttons

### 7.1 Button Variants

#### Primary Button

The single highest-priority action on any view. Used for: "Start Workout," "Generate Plan," "Save Changes," "Subscribe Now."

```
Background:  var(--primary)         → #3B82F6 (dark) / #2563EB (light)
Text:        var(--primary-foreground)  → #FFFFFF
Border:      none
Hover:       var(--primary-hover)   → darken 1 step + --glow-brand-lg
Active:      scale(0.98) + darken 2 steps
Focus:       outline: 2px solid var(--ring), outline-offset: 2px
Disabled:    opacity: 0.4, cursor: not-allowed, no hover effect
```

Sizes:

| Size | Height | Padding | Font | Icon Size |
|------|--------|---------|------|-----------|
| `sm` | `32px` | `8px 12px` | `--text-btn-sm` | 14px |
| `md` | `40px` | `10px 16px` | `--text-btn-md` | 16px |
| `lg` | `48px` | `12px 24px` | `--text-btn-lg` | 18px |
| `xl` | `56px` | `16px 32px` | `1.125rem` 500 | 20px |

#### Secondary Button

Supporting actions. Used for: "Cancel," "Skip," "View Details."

```
Background:  transparent
Text:        var(--foreground)
Border:      1px solid var(--border)
Hover:       background: var(--muted), border-color: var(--border)
Active:      background: var(--accent)
```

#### Ghost Button

Lowest visual weight. Used for: tertiary actions, navigation links that function as buttons, inline controls.

```
Background:  transparent
Text:        var(--muted-foreground)
Border:      none
Hover:       background: var(--muted), text: var(--foreground)
Active:      background: var(--accent)
```

#### Outline Button

Similar to secondary but uses brand color outline. Used for: "Start Free Trial" on light marketing surfaces.

```
Background:  transparent
Text:        var(--primary)
Border:      1.5px solid var(--primary)
Hover:       background: var(--accent), text: var(--primary-hover)
```

#### Danger Button

Destructive actions. Always preceded by a confirmation step. Used for: "Delete Account," "Remove Exercise."

```
Background:  var(--destructive)
Text:        var(--destructive-foreground)
Border:      none
Hover:       darken + --glow-coach (emerald-replaced by red glow)
```

#### Coach Button

Exclusively for AI-coach-initiated actions: "Apply This Plan," "Confirm Adjustment." Signals that the action comes from the AI, not user-initiated UI.

```
Background:  var(--coach-DEFAULT)
Text:        var(--coach-foreground)
Border:      none
Hover:       darken + --glow-coach
```

### 7.2 Loading State

All async-triggered buttons display a loading state:

- Replace button text with a spinner (16px, `border: 2px solid currentColor`, animated)
- Keep the button width stable (no layout shift)
- Disable pointer events during load
- Show loading text: "Saving…" / "Generating…" / "Analyzing…" as appropriate

### 7.3 Button with Icon Rules

- **Icon-left:** Icon precedes text with `gap: 8px`
- **Icon-right:** Icon follows text with `gap: 8px` (use only for "expand," "external link," "next" semantics)
- **Icon-only:** Must have `aria-label`. Use `--radius-md` for square icon buttons, `--radius-full` for circular.
- Icon weight must match button font weight. If button uses 500, icon uses regular stroke weight.

### 7.4 Button Group Rules

- Horizontal groups: `gap: 8px`
- Vertical groups: `gap: 8px`
- Never stack primary + primary in a group. One primary maximum per view.
- Primary button is always on the right in horizontal groups (confirmation/CTA pattern).

---

## 8. Forms

### 8.1 Input Fields

```
Height:           40px (default) / 32px (compact) / 48px (large)
Background:       var(--input)            → #1E293B dark / #FFFFFF light
Border:           1px solid var(--input-border)
Border Radius:    var(--radius-sm)        → 6px
Padding:          10px 12px
Font:             var(--text-body-md), Inter 400
Color:            var(--foreground)
Placeholder:      var(--input-placeholder) → #64748B
```

**States:**

| State | Border | Background | Shadow |
|-------|--------|------------|--------|
| Default | `var(--input-border)` | `var(--input)` | none |
| Hover | `var(--neutral-500)` | same | none |
| Focus | `var(--ring)` 2px | same | `var(--glow-brand)` |
| Filled | `var(--border)` | same | none |
| Error | `var(--destructive)` 2px | same | none |
| Success | `var(--success)` 1px | same | none |
| Disabled | `var(--border)` | `var(--muted)` opacity 0.5 | none |

### 8.2 Textarea

Inherits all input field styles. Additional rules:
- Minimum height: `120px`
- `resize: vertical` only — horizontal resize is disabled
- Line height: 1.6 for readability
- Used in: AI chat input, check-in notes, injury descriptions

### 8.3 Form Labels

```
Font:         Inter 500, 14px (--text-body-sm)
Color:        var(--foreground)
Margin-bottom: 6px
```

Labels are always above inputs (never inline floating labels — these cause accessibility and UX friction in multi-step forms). Required fields append `*` in `--destructive` color.

### 8.4 Select / Dropdown

Styled to match input field appearance. Native select is styled with custom arrow icon. Complex dropdowns (multi-select, searchable) use Radix UI Select primitive with Zyvora styles applied.

### 8.5 Checkbox and Radio

| Property | Value |
|----------|-------|
| Size | `20px × 20px` |
| Border | `1.5px solid var(--input-border)` |
| Radius (checkbox) | `4px` |
| Radius (radio) | `50%` |
| Checked background | `var(--primary)` |
| Check icon | White, 12px |
| Focus ring | `var(--glow-brand)` |
| Label gap | `8px` from element |
| Label font | Inter 400, 15px |

### 8.6 Toggle / Switch

```
Width:         44px, Height: 24px
Track (off):   var(--muted) background
Track (on):    var(--primary) background
Thumb:         20px circle, white, 2px shadow
Transition:    300ms ease
```

### 8.7 Validation States

**Error:**
- Border changes to `--destructive` (2px)
- Below the field: `var(--destructive)` icon (AlertCircle, 14px) + error message text in `--destructive` color, 13px Inter 400
- Never replace the label — show error below the input

**Success:**
- Border changes to `--success` (1px)
- Below the field: `var(--success)` checkmark + optional success message

**Helper Text (no state):**
- Color: `var(--muted-foreground)`
- Font: 13px Inter 400
- Appears below input, 4px gap

### 8.8 Onboarding Form Rules

Onboarding steps use large, generous input sizing and increased spacing:
- Input height: `48px`
- Form group gap: `24px`
- Section gap: `40px`
- Progress indicator: top of card, brand-colored, percentage-based

---

## 9. Cards

### 9.1 Default Card

The standard container for grouped information.

```
Background:      var(--surface)      → #1E293B dark / #FFFFFF light
Border:          1px solid var(--border)
Border Radius:   var(--radius-lg)    → 12px
Padding:         var(--space-6)      → 24px
Shadow:          var(--shadow-sm) (light mode), none (dark mode, use surface lightening)
```

### 9.2 Glass Card

Used for overlaid content, marketing surfaces, and hero sections.

```
Background:      rgba(255,255,255,0.05) (dark) / rgba(255,255,255,0.70) (light)
Backdrop-filter: blur(16px) saturate(180%)
Border:          1px solid rgba(255,255,255,0.08) (dark) / rgba(0,0,0,0.08) (light)
Border Radius:   var(--radius-xl)    → 16px
Padding:         var(--space-8)      → 32px
```

Glass cards are used only in non-data contexts (landing page, onboarding intro, coach intro screen). Never use glass cards for data-heavy content — they reduce legibility.

### 9.3 Premium Card

Feature highlight cards. Coaching plan overview, subscription upsell, milestone celebration.

```
Background:      linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%) (dark)
                 linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%) (light)
Border:          1px solid rgba(59,130,246,0.30)
Border Radius:   var(--radius-xl)    → 16px
Padding:         var(--space-8)      → 32px
Shadow:          var(--shadow-lg) + --glow-brand (subtle)
```

### 9.4 Metric Card

Dashboard widgets for body weight, calorie totals, workout counts. Data-dense, visually structured.

```
Background:      var(--surface)
Border:          1px solid var(--border)
Border Radius:   var(--radius-lg)    → 12px
Padding:         var(--space-5)      → 20px
Structure:       Label top-left (--text-overline) / Value large center (--text-num-xl) / Trend bottom-right (--text-body-xs with colored indicator)
```

### 9.5 Coach Message Card

Exclusively used for AI coach messages in the chat interface.

```
Background:      var(--coach-subtle)    → #064E3B dark / #D1FAE5 light
Border:          1px solid rgba(16,185,129,0.20)
Border Radius:   var(--radius-lg) with flat top-left → top-left: 4px, others: 12px
Padding:         var(--space-4)         → 16px
Left accent:     3px solid var(--coach-DEFAULT)
Font:            Inter 400, 15px, line-height 1.6
```

### 9.6 User Message Card

Chat messages from the user.

```
Background:      var(--muted)
Border:          1px solid var(--border)
Border Radius:   var(--radius-lg) with flat top-right → top-right: 4px, others: 12px
Padding:         var(--space-4)  → 16px
Alignment:       right-aligned within the chat container
```

### 9.7 Feature Card (Landing Page)

Used on the marketing landing page to showcase features.

```
Background:      var(--surface)
Border:          1px solid var(--border)
Border Radius:   var(--radius-2xl)   → 24px
Padding:         var(--space-8)      → 32px
Icon:            48px container, brand-colored, top of card
Hover:           translateY(-4px) + border-color: var(--primary) transition 200ms
```

### 9.8 Card Hover Interactions

- **Default card hover:** `border-color` transitions from `--border` to `rgba(var(--primary-rgb), 0.4)` over 150ms
- **Metric card hover:** Subtle `background` lightening by one surface step
- **Feature card hover:** `translateY(-4px)` + border-brand
- **No card has a zoom or scale effect** — this reads as toy-like, not premium
- Cards that are clickable have `cursor: pointer` and the full hover state

---

## 10. Navigation

### 10.1 Top Navigation Bar (Landing / Auth)

Used on the landing page and authentication pages.

```
Height:          64px
Background:      var(--background) with 80% opacity + backdrop-blur(12px)
Position:        sticky top-0, z-index: var(--z-navbar)
Border-bottom:   1px solid var(--border-subtle)
Padding:         0 var(--space-8)

Left:   Zyvora wordmark (Outfit 700, 20px)
Center: Nav links (desktop only): Features, Pricing, Science
Right:  Ghost "Sign In" button + Primary "Start Free Trial" button
```

### 10.2 Authenticated Sidebar Navigation

The primary navigation in the dashboard. Left-side fixed sidebar on desktop, collapsible drawer on mobile.

```
Width:           240px (expanded) / 64px (collapsed)
Background:      var(--neutral-950) dark / var(--neutral-50) light
Border-right:    1px solid var(--border)
Padding:         var(--space-4)
Position:        fixed left-0 top-0 height 100vh
```

**Sidebar Structure:**

```
[Zyvora Logo + Collapse Toggle]
─────────────────────
[User Avatar + Name + Plan Badge]
─────────────────────
NAVIGATION
  Dashboard
  AI Coach         ← Highlighted with coach accent dot
  Workouts
  Nutrition
  Progress
  Physique
─────────────────────
ACCOUNT
  Settings
  Help
─────────────────────
[Upgrade to Premium]  (free users only)
```

**Nav Item States:**

| State | Background | Text | Icon |
|-------|------------|------|------|
| Default | transparent | `--muted-foreground` | `--neutral-500` |
| Hover | `var(--muted)` | `--foreground` | `--neutral-300` |
| Active | `var(--accent)` | `var(--primary)` | `var(--primary)` |

Nav items: `height: 40px`, `border-radius: var(--radius-md)`, `padding: 8px 12px`, `gap: 10px` between icon and label.

**Collapsed sidebar:** Shows only icons. Tooltip on hover reveals label.

### 10.3 Mobile Navigation

Bottom tab bar on mobile (≤768px). 5 tabs maximum.

```
Height:          60px + safe-area-inset-bottom
Background:      var(--surface) with 95% opacity + backdrop-blur
Border-top:      1px solid var(--border)
Position:        fixed bottom-0 width 100%
```

Tabs: Dashboard, Coach, Workouts, Progress, Settings. Active tab uses `--primary` icon + `--primary` label text at 11px.

### 10.4 Breadcrumbs

Used in nested navigation contexts (workout detail, settings sections).

```
Font:    Inter 400, 13px
Color:   var(--muted-foreground)
Separator: "/" in var(--neutral-600)
Current:  var(--foreground) Inter 500
Gap:     8px between crumbs
```

---

## 11. Icons

### 11.1 Icon Library

**Primary library: [Lucide React](https://lucide.dev)**

Lucide was chosen for:
- Consistent stroke geometry across all icons
- Clean, geometric style compatible with Zyvora's visual language
- React-first integration
- MIT license, actively maintained

### 11.2 Icon Standards

| Property | Value |
|----------|-------|
| Default stroke width | `1.5px` |
| Strong stroke (emphasis) | `2px` |
| Light stroke (muted) | `1px` |
| Corner radius | Inherits from Lucide standard (`round` join) |
| Default size | `20px × 20px` |
| Small | `16px × 16px` |
| Large | `24px × 24px` |
| XL (feature icons) | `32px × 32px` |

### 11.3 Icon Color Rules

- **Navigation icons:** Match nav item text color
- **Action icons (in buttons):** Inherit `currentColor` from button text
- **Status icons:** Use semantic color (`--success`, `--warning`, `--destructive`)
- **AI Coach icons:** `--coach-DEFAULT` emerald
- **Data icons:** `--muted-foreground`
- **Never use an icon as sole communication.** Always pair with visible text or `aria-label`.

### 11.4 Custom Domain Icons

The following concepts require distinct icon treatment (sourced from Lucide or extended):

| Concept | Icon | Notes |
|---------|------|-------|
| AI Coach | `Bot` or `Sparkles` | Always in coach emerald |
| Physique Analysis | `ScanFace` | In brand blue |
| Workout | `Dumbbell` | In foreground |
| Nutrition | `Apple` or `Utensils` | In success green or foreground |
| Progress | `TrendingUp` | Direction matters — always upward |
| Check-in | `ClipboardCheck` | In warning amber when pending |
| Body weight | `Scale` | In foreground |
| Streak | `Flame` | In `#F59E0B` warning amber |
| PR (Personal Record) | `Trophy` | In `#F59E0B` warning amber (gold) |

---

## 12. Motion System

### 12.1 Animation Philosophy

Motion in Zyvora serves two purposes: **orientation** and **feedback**. It helps users understand what happened, what changed, and what is available.

Motion is never decorative. Animations do not play to entertain — they play to communicate.

**Guiding principle:** If removing the animation would make the interface harder to understand, it belongs. If removing it would be imperceptible, it should not exist.

### 12.2 Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `--duration-instant` | `0ms` | State-only changes, no visual movement |
| `--duration-fast` | `100ms` | Micro-interactions, button press feedback |
| `--duration-normal` | `200ms` | **Default** — hover states, icon swaps, color transitions |
| `--duration-moderate` | `300ms` | Card hover lifts, dropdown open, toast appear |
| `--duration-slow` | `500ms` | Modal open, sidebar expand, page section reveal |
| `--duration-deliberate` | `700ms` | Onboarding step transitions, progress bar fills |
| `--duration-loading` | `1200ms` | Skeleton pulse, AI thinking indicator |

### 12.3 Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-linear` | `linear` | Looping animations (spinners, pulse) |
| `--ease-out` | `cubic-bezier(0,0,0.2,1)` | **Default** — elements entering, dropdown open, toast appear |
| `--ease-in` | `cubic-bezier(0.4,0,1,1)` | Elements leaving (modal close, element remove) |
| `--ease-in-out` | `cubic-bezier(0.4,0,0.2,1)` | Position changes, sidebar expand |
| `--ease-bounce` | `cubic-bezier(0.34,1.56,0.64,1)` | Achievement celebrations, PR notification only |
| `--ease-spring` | `cubic-bezier(0.175,0.885,0.32,1.275)` | Toggle switches, check completion |

### 12.4 Specific Animation Behaviors

**Page Transitions:**
- Between authenticated routes: `opacity: 0→1` + `translateY(8px→0)` over `300ms ease-out`
- Back navigation: `opacity: 0→1` + `translateX(-8px→0)` over `300ms ease-out`

**Hover States:**
- Color and border transitions: `200ms ease-out`
- Transform transitions (card lift): `200ms ease-out`
- Never transition on `color` or `background-color` for interactive elements — always include both with `transition: all 200ms ease-out` scoped to color properties

**Modal/Dialog:**
- Enter: `opacity: 0→1` + `scale(0.97→1)` + `translateY(8px→0)` over `300ms ease-out`
- Exit: `opacity: 1→0` + `scale(1→0.97)` over `200ms ease-in`
- Overlay backdrop: `opacity: 0→1` over `200ms ease-out`

**Toasts/Notifications:**
- Enter from right: `translateX(calc(100% + 16px)→0)` + `opacity: 0→1` over `350ms ease-out`
- Exit to right: `translateX(0→calc(100% + 16px))` + `opacity: 1→0` over `200ms ease-in`

**Skeleton Loading:**
- Background: animated gradient `shimmer` from `--surface` to `--muted` looping `1200ms linear`

**AI Thinking Indicator:**
- Three dots pulsing in sequence, `400ms` stagger, `--coach-DEFAULT` color
- Never say "Loading…" — show the thinking dots only

**Accordion/Expand:**
- Height: `0 → auto` via `grid-template-rows: 0fr → 1fr`, `300ms ease-out`
- Chevron rotation: `0° → 180°`, `300ms ease-out`

**Progress Bar Fill:**
- Initial fill on page load: `0 → target%` over `700ms ease-out` with `300ms` delay for visual drama
- Live update on macro log: immediate jump to new value, `200ms ease-out`

**Check/Complete State (workout set):**
- Checkbox: scale `0.9 → 1.1 → 1.0` over `250ms ease-spring`
- Background flash: `--success` flash at `opacity: 0.15` for `300ms`

### 12.5 Reduced Motion

All animations must respect the `prefers-reduced-motion: reduce` media query.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Page transitions and modal animations are replaced with instant opacity changes in reduced motion mode.

---

## 13. Illustrations and Media

### 13.1 Illustration Style

Zyvora does not use stock fitness photography (muscled bodies, gym poses, supplement ads). This category of imagery is explicitly excluded.

The illustration style is **abstract, data-driven, and architectural**:

- **Geometric abstractions:** Wireframe body silhouettes built from precise geometric forms. Not anatomical — structural.
- **Data visualization as art:** Progress graphs, body composition radar charts used as hero imagery.
- **Minimal line work:** Single-weight stroke illustrations in `--brand-300` or `--neutral-500` on dark backgrounds.
- **No human faces in illustrations.** Silhouettes and abstract forms only.
- **Color:** Illustrations use only Zyvora palette colors. Monochrome brand blue or emerald-accented on dark backgrounds.

### 13.2 Photography Guidelines

If photography is used (user-generated physique photos excluded):

- **Environment photography only:** gym equipment, architectural spaces, light through windows — abstract and atmospheric.
- **No stock model photography.** Ever.
- **Overlay treatment:** All photography receives a `--neutral-900` overlay at `40–60%` opacity to unify with the dark UI.
- **Color grading:** Desaturated base with subtle blue shift to align with brand palette.
- **Format:** WebP, minimum 2x resolution for retina displays.

### 13.3 User-Generated Content (Physique Photos)

- Displayed only within secure, authenticated contexts with explicit user action (viewing their own progress)
- Never used as product imagery or social proof
- Always accompanied by privacy indicator UI (lock icon, "Only visible to you" label)
- Photo comparison grids: side-by-side, consistent crop, consistent aspect ratio (3:4 portrait)

### 13.4 Empty States

Empty states should be **instructive and warm**, not decorative.

Structure:
1. Simple abstract icon or minimal illustration (48px icon)
2. Short title: "No workouts logged yet"
3. One-sentence instruction: "Complete your first session to see your progress here."
4. Single action button (primary)

Never use sad/empty/broken imagery. Empty = opportunity, not failure.

---

## 14. Charts and Data Visualization

### 14.1 Chart Library

**Recommended:** Recharts (React-native, composable, accessible) or Tremor for dashboard-ready components.

All charts are SVG-based. Canvas charts are used only for high-density visualizations (progress photo overlays).

### 14.2 Chart Color Rules

| Data Type | Color | Token |
|-----------|-------|-------|
| Body weight | `--brand-500` | Primary line |
| Calories consumed | `--warning` | Amber fills |
| Protein | `--coach-DEFAULT` | Emerald |
| Carbohydrates | `--brand-400` | Blue lighter |
| Fats | `--neutral-400` | Muted |
| Body fat % | `--info` | Indigo |
| Volume (workout) | `--brand-600` | Dark blue |
| Strength (PR) | `--success` | Green |
| Target / Goal line | Dashed, `--border` | Neutral reference |

Zyvora charts use a **maximum of 3 data series** on a single chart. More than 3 creates visual noise. Split into multiple charts if needed.

### 14.3 Chart Types by Use Case

| Use Case | Chart Type | Notes |
|----------|------------|-------|
| Body weight trend | Line chart | 7/30/90/365 day toggle |
| Macro progress (daily) | Horizontal stacked bar or ring | Real-time fill |
| Volume per week | Bar chart | Week-over-week |
| Body fat trend | Area chart | Filled under line with 20% opacity |
| Strength progression (per exercise) | Line chart | Multiple lines for sets |
| Calorie adherence | Bar + target line overlay | Goal line dashed |
| Measurement change | Radar chart | Multi-metric view |
| Check-in streaks | Heat map (calendar) | GitHub contribution style |

### 14.4 Chart Styling Standards

```
Grid lines:      1px, var(--border), horizontal only
Axis labels:     Inter 400, 11px, var(--muted-foreground)
Tooltip:         var(--surface-overlay), shadow-md, radius-md, Inter 400 14px
Data point dot:  6px circle, filled brand color, white border 2px
Line weight:     2px
Area fill:       20% opacity of line color
Chart background: transparent (inherits card background)
```

Chart aspect ratios:
- Dashboard widget (full width): `4:1` minimum
- Dashboard widget (half width): `3:1`
- Progress detail page: `16:5`
- Mobile: `3:1` minimum

---

## 15. Accessibility

### 15.1 Color Contrast Requirements

All text meets WCAG 2.1 AA minimum:

| Context | Minimum Ratio | Target |
|---------|--------------|--------|
| Normal text (<18px) | 4.5:1 | 7:1 (AAA) |
| Large text (≥18px bold or ≥24px) | 3:1 | 4.5:1 |
| Interactive component boundaries | 3:1 | — |
| Focus indicators | 3:1 against adjacent colors | — |

Verified contrast pairs (dark mode):
- `--foreground` (#F8FAFC) on `--background` (#0F172A): **15.8:1** ✅
- `--primary` (#3B82F6) on `--background` (#0F172A): **5.4:1** ✅
- `--muted-foreground` (#94A3B8) on `--surface` (#1E293B): **4.9:1** ✅
- `--coach-DEFAULT` (#10B981) on `--neutral-950` (#020617): **8.1:1** ✅

### 15.2 Focus States

Every interactive element has a visible focus state. Zyvora uses a consistent focus ring system:

```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  border-radius: inherit;
}
```

Focus rings use `var(--glow-brand)` as a shadow to enhance visibility in complex backgrounds. Never use `:focus` alone — use `:focus-visible` to avoid focus rings on mouse clicks.

### 15.3 Keyboard Navigation

- All interactive elements are reachable via Tab in logical reading order
- Custom components (dropdowns, modals, date pickers) implement full ARIA keyboard patterns:
  - Menus: Arrow keys to navigate, Enter/Space to select, Escape to close
  - Modals: Focus trapped within modal, Escape to dismiss
  - Tabs: Arrow keys to switch tabs
- Skip-to-content link: Hidden but focusable, appears on Tab as first interactive element

### 15.4 ARIA Requirements

| Element | Required Attributes |
|---------|---------------------|
| Icon-only buttons | `aria-label` |
| Progress bars | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Live macro updates | `aria-live="polite"` on the macro counter region |
| Form validation | `aria-describedby` pointing to error message, `aria-invalid="true"` on error state |
| Loading states | `aria-busy="true"` on container, `aria-live="polite"` |
| Modal dialogs | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title |
| Navigation | `<nav>` with `aria-label` |
| Chart containers | `role="img"`, `aria-label` describing the data |

### 15.5 Touch Target Sizing

All interactive elements meet the 44×44px minimum:
- Buttons: Height minimum `40px`, width minimum `44px`
- Nav items: Height minimum `44px`
- Checkboxes/radios: Hit area 44×44px even if visual size is 20×20px (achieved via padding)
- Icon-only buttons: Minimum 44×44px container

### 15.6 Reduced Motion

As defined in §12.5, all animations respect `prefers-reduced-motion`. The interface functions identically without animation.

---

## 16. Responsive Rules

### 16.1 Breakpoint System

| Name | Min Width | Device Context |
|------|-----------|---------------|
| `xs` | `320px` | Small mobile |
| `sm` | `480px` | Standard mobile |
| `md` | `768px` | Tablet / large mobile |
| `lg` | `1024px` | Laptop / small desktop |
| `xl` | `1280px` | Desktop |
| `2xl` | `1440px` | Large desktop |
| `3xl` | `1920px` | Ultra-wide |

### 16.2 Mobile (320px–767px)

- Single column layout throughout
- Bottom tab navigation (5 tabs)
- Cards full-width with `16px` horizontal margins
- Sidebar hidden, accessible via hamburger drawer
- Font scale reduced: display xl → display lg
- Dashboard metric cards in 2-column grid
- Charts `3:1` aspect ratio minimum
- Forms stack vertically with full-width inputs
- Primary CTAs full-width buttons
- AI chat: full-screen on mobile

### 16.3 Tablet (768px–1023px)

- Two column layout for dashboard widgets
- Sidebar collapses to icon-only (64px)
- Cards `calc(50% - 8px)` in grids
- Font scale restored to standard
- Charts maintain aspect ratio within container
- Navigation top bar OR collapsed sidebar

### 16.4 Laptop (1024px–1279px)

- Full sidebar at 240px width
- 12-column grid active
- Standard dashboard layout: sidebar + main content
- All chart sizes at designed aspect ratios

### 16.5 Desktop (1280px–1439px)

- Content constrained to `--container-xl` (1280px) max-width
- Sidebar: 240px, content area: 1040px
- Dashboard: 3-4 column metric grid

### 16.6 Large Desktop / Ultra-wide (1440px+)

- Content constrained to `--container-2xl` (1440px)
- No layout changes beyond max-width constraint
- Extra whitespace at page sides — the layout does not stretch infinitely

---

## 17. Component Naming

### 17.1 Naming Conventions

All components follow a strict naming system: `[Domain][Component][Variant?]`

Examples:
- `DashboardMetricCard`
- `WorkoutSessionLogger`
- `CoachMessageBubble`
- `AuthLoginForm`
- `OnboardingStepHeader`
- `NutritionMacroProgress`

**Rules:**
- PascalCase for React components
- kebab-case for CSS tokens and classNames
- camelCase for prop names
- Never abbreviate unless universally understood (`btn` → `button`, `auth` → acceptable)

### 17.2 Component Variants

Variants are expressed as props: `variant`, `size`, `state`

```typescript
// Variant prop pattern
<Button variant="primary" size="md" loading={isSubmitting} />
<Card variant="metric" size="default" />
<Input size="lg" state="error" />
```

Standard variant names:
- `variant`: `"primary" | "secondary" | "ghost" | "outline" | "danger" | "coach"`
- `size`: `"xs" | "sm" | "md" | "lg" | "xl"`
- `state`: `"default" | "hover" | "focus" | "error" | "success" | "disabled" | "loading"`

### 17.3 States

Components express state through:
1. Props (preferred for controlled components)
2. CSS pseudo-classes (`:hover`, `:focus-visible`, `:disabled`)
3. Data attributes: `data-state="open"`, `data-state="checked"` (Radix UI pattern)

### 17.4 Token Naming

All design tokens follow `--{category}-{subcategory?}-{scale?}` pattern:

```
--color-brand-500
--color-coach-default
--text-body-md
--space-6
--radius-lg
--shadow-md
--duration-normal
--ease-out
--z-modal
```

---

## 18. Design Tokens

Complete token reference for implementation.

### 18.1 Color Tokens

```css
:root {
  /* Brand */
  --color-brand-50:  #EFF6FF;
  --color-brand-100: #DBEAFE;
  --color-brand-200: #BFDBFE;
  --color-brand-300: #93C5FD;
  --color-brand-400: #60A5FA;
  --color-brand-500: #3B82F6;
  --color-brand-600: #2563EB;
  --color-brand-700: #1D4ED8;
  --color-brand-800: #1E40AF;
  --color-brand-900: #1E3A8A;

  /* AI Coach */
  --color-coach:         #10B981;
  --color-coach-subtle:  #064E3B;
  --color-coach-muted:   #D1FAE5;

  /* Neutral */
  --color-neutral-50:  #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;
  --color-neutral-950: #020617;

  /* Semantic */
  --color-success:    #22C55E;
  --color-warning:    #F59E0B;
  --color-danger:     #EF4444;
  --color-info:       #6366F1;
}
```

### 18.2 Spacing Tokens

```css
:root {
  --space-px:  1px;
  --space-0-5: 2px;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32:  128px;
}
```

### 18.3 Radius Tokens

```css
:root {
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;
}
```

### 18.4 Typography Tokens

```css
:root {
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-sans:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  /* Display */
  --text-display-2xl-size: 4.5rem;
  --text-display-xl-size:  3.75rem;
  --text-display-lg-size:  3rem;
  --text-display-md-size:  2.25rem;

  /* Heading */
  --text-h1-size: 1.875rem;
  --text-h2-size: 1.5rem;
  --text-h3-size: 1.25rem;
  --text-h4-size: 1.125rem;
  --text-h5-size: 1rem;

  /* Body */
  --text-body-lg-size: 1.125rem;
  --text-body-md-size: 1rem;
  --text-body-sm-size: 0.875rem;
  --text-body-xs-size: 0.75rem;

  /* Line Heights */
  --leading-tight:  1.15;
  --leading-snug:   1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
  --leading-loose:  1.75;
}
```

### 18.5 Shadow Tokens

```css
:root {
  --shadow-xs:  0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-sm:  0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10);
  --shadow-md:  0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10);
  --shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10);
  --shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10);
  --shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25);

  --glow-brand:    0 0 0 3px rgba(59,130,246,0.25);
  --glow-brand-lg: 0 0 20px 0 rgba(59,130,246,0.15);
  --glow-coach:    0 0 0 3px rgba(16,185,129,0.25);
  --glow-success:  0 0 0 3px rgba(34,197,94,0.25);
}
```

### 18.6 Animation Tokens

```css
:root {
  --duration-instant:    0ms;
  --duration-fast:       100ms;
  --duration-normal:     200ms;
  --duration-moderate:   300ms;
  --duration-slow:       500ms;
  --duration-deliberate: 700ms;
  --duration-loading:    1200ms;

  --ease-linear:   linear;
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring:   cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 18.7 Z-Index Tokens

```css
:root {
  --z-below:    -1;
  --z-base:      0;
  --z-raised:    10;   /* Cards on hover */
  --z-dropdown:  100;  /* Dropdown menus, tooltips */
  --z-sticky:    200;  /* Sticky headers, table headers */
  --z-navbar:    300;  /* Top navigation bar */
  --z-sidebar:   400;  /* Sidebar navigation */
  --z-overlay:   500;  /* Modal backdrop */
  --z-modal:     600;  /* Modal content */
  --z-toast:     700;  /* Toast notifications */
  --z-tooltip:   800;  /* Tooltips over modals */
}
```

### 18.8 Opacity Tokens

```css
:root {
  --opacity-disabled: 0.4;
  --opacity-muted:    0.6;
  --opacity-overlay:  0.8;   /* Modal backdrop */
  --opacity-glass:    0.05;  /* Glass card background */
}
```

---

## 19. Future Expansion

### 19.1 AI Coach Interface

As the AI Coach evolves into a more prominent product surface, the design system should extend:

- **Coach Avatar System:** A non-anthropomorphic visual identifier for the AI — a geometric mark (not a human face) that appears in chat, check-ins, and notifications. Should use the coach emerald color system.
- **Streaming Typography:** Animated text rendering for streaming AI responses — characters appear left-to-right at 20ms intervals with a cursor indicator.
- **Coach Action Cards:** Rich structured cards within chat for displaying workout adjustments, nutrition changes, and plan previews directly in the conversation thread.
- **Voice Mode (Future):** Visual identity for a voice-based coaching interface — waveform visualization in coach emerald.

### 19.2 Dashboard — Data Density Evolution

As users accumulate data, dashboard complexity will increase:

- **Compact View Mode:** An optional dense layout for power users who want more data visible simultaneously
- **Custom Widget Grid:** Drag-and-drop dashboard personalization — widgets snap to the 12-column grid
- **Sparkline Integration:** Inline mini-charts (40px tall) within metric cards for at-a-glance trends without leaving the dashboard

### 19.3 Community (Post-MVP)

When community features are introduced:

- **User Profile Cards:** Public-facing profile with achievement badges, current program label, and streak indicator
- **Challenge Cards:** Team/group challenge UI with shared progress visualization
- **Feed Item Components:** Activity cards for community milestones — distinct visual style from coaching content

### 19.4 Wearable Integration

When wearable data is integrated:

- **Live Data Indicators:** Pulsing dot indicators (12px, success green) on metric cards sourcing from real-time wearable data
- **HRV / Recovery Dashboard:** New visualization types: radial gauge for recovery scores, multi-series line for sleep stages
- **Biometric Alert System:** A new alert type (distinct from warning/danger) for biometric flags — uses a dedicated purple accent: `#7C3AED`

### 19.5 Mobile App (Native)

When native iOS/Android apps are built:

- **Platform-Specific Adaptations:** Navigation pattern shifts from sidebar to bottom tab bar (already designed as the mobile pattern). Haptic feedback replaces visual micro-animations on touch interactions.
- **Native Type Scale:** Slightly increased base font size (`18px`) for mobile native environments
- **Safe Area Handling:** All layouts account for iPhone notch, Dynamic Island, and Android gesture navigation bars

### 19.6 Admin Panel

The admin panel uses a modified version of the design system:

- **Monochrome mode:** No brand blue primary — admin uses `--neutral-500` as primary action color to visually distinguish admin surfaces from user-facing surfaces
- **Dense table layout:** Compact row heights (32px), smaller type (13px), more data per screen
- **Status badge system:** Extended badge set for subscription states (Active, Trial, Cancelled, Paused, Overdue)

---

*This document is the visual constitution of Zyvora. Every interface decision must be traceable to a token, a rule, or a principle defined here. When in doubt: more space, less color, clearer data.*

*All changes require design system team review. Additions are welcome; exceptions are not.*
