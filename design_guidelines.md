# ReelRevive Design Guidelines

## Design Approach

**Reference-Based with Custom Elements**: Drawing inspiration from Stripe's clean minimalism and trust-building patterns, combined with nostalgic warmth appropriate for a memory preservation service. The design balances professional credibility with emotional resonance.

## Core Design Principles

1. **Nostalgic Minimalism**: Clean layouts with subtle retro nods (VHS-era amber accents, optional film grain texture on hero sections)
2. **Trust-First**: Generous whitespace, clear typography, prominent contact information, and security indicators
3. **Accessibility-Centered**: WCAG 2.1 AA compliant, 16px minimum body text, high contrast ratios

## Visual Identity

### Color System
- **Primary Navy**: `#1a2744` - headers, primary buttons, key sections
- **Accent Amber**: `#e8a838` - CTAs, highlights, VHS tape visual references
- **Background**: `#fafafa` - warm off-white for main canvas
- **Text**: `#1a1a1a` - high-contrast near-black for body text
- **Neutrals**: Gray scale from navy-tinted grays for supporting elements

### Typography
- **Font Family**: Inter or Plus Jakarta Sans (geometric sans-serif)
- **Scale**: 
  - H1: 3.5rem (mobile: 2.5rem) - bold weight
  - H2: 2.5rem (mobile: 2rem) - semibold
  - H3: 1.75rem - semibold
  - Body: 1rem (16px minimum) - regular weight
  - Small: 0.875rem - supporting text

### Spacing System
Use Tailwind units: **4, 6, 8, 12, 16, 24** for consistent rhythm
- Section padding: `py-16` to `py-24` (desktop), `py-12` (mobile)
- Component spacing: `gap-6` to `gap-8`
- Container max-width: `max-w-7xl` for content sections

## Layout Architecture

### Homepage Structure
1. **Hero Section** (`min-h-[600px]`):
   - Large headline with compelling message centered or left-aligned
   - Subheadline (max-w-2xl)
   - Dual CTAs: primary "Get Started" (amber bg), secondary "How It Works" (outlined)
   - Hero image: Nostalgic VHS tapes transforming to digital (family watching old footage on modern devices)
   - Background: Subtle gradient or film grain texture overlay

2. **How It Works** (4-step horizontal cards):
   - Icon-based visual cards with numbered badges
   - Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
   - Icons: Simple line-style, amber accent color

3. **Trust Indicators** (multi-column):
   - 3-column testimonial cards (`grid-cols-1 md:grid-cols-3`)
   - Customer photos, quotes, star ratings
   - Badge section: "50,000+ tapes converted", security indicators

4. **Pricing Preview**: Clean table or comparison cards
5. **FAQ Accordion**: Expandable sections with subtle hover states

### Pricing Page
- **Format Cards**: Visual grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-5`)
  - Each card: format icon/illustration, name, brief description
  - Hover: subtle lift effect (`hover:shadow-lg`)
- **Pricing Table**: Striped rows, clear headers, accent color for prices
- **Bulk Discount Callout**: Highlighted banner with amber background

### Order Configurator (Multi-Step Wizard)
- **Progress Indicator**: Top-fixed stepper showing 10 steps
- **Step Layout**: 
  - Single question/section per view
  - Large, tappable selection cards (`min-h-[120px]`)
  - Price summary: sticky sidebar (desktop), bottom bar (mobile)
- **Card Selection Style**:
  - Unselected: white bg, gray border
  - Selected: navy border (3px), amber accent badge
  - Hover: subtle shadow and border color change
- **Navigation**: "Back" and "Continue" buttons, always visible
- **Animations**: Smooth slide transitions between steps (Framer Motion)

### Dashboard & Admin
- **Sidebar Navigation**: Dark navy background, white text, amber active state
- **Content Area**: White background, card-based layouts
- **Tables**: Alternating row colors, sticky headers, color-coded status badges
- **Metrics Cards**: White cards with subtle shadow, large numbers, trend indicators

## Component Library

### Buttons
- **Primary**: Amber background, white text, rounded corners (`rounded-lg`), medium shadow
- **Secondary**: Navy outline, navy text, transparent background
- **Text**: No background, amber text, underline on hover
- **Sizes**: Large (py-4 px-8), Medium (py-3 px-6), Small (py-2 px-4)

### Cards
- White background, subtle shadow (`shadow-sm`), rounded borders (`rounded-xl`)
- Padding: `p-6` for standard cards
- Hover states: `hover:shadow-md` transition

### Forms
- Input fields: Light gray background, navy border, rounded corners
- Focus state: Amber border, subtle glow
- Labels: Above inputs, semibold, small size
- Error states: Red border and text

### Status Badges
- Pill-shaped (`rounded-full`), small padding (`px-3 py-1`)
- Color-coded: Pending (gray), In Progress (blue), Complete (green), Rush (amber)

### Modals/Overlays
- Backdrop: Dark overlay (`bg-black/50`)
- Content: White card with close button, centered, max-width constraints

## Images

### Hero Section
**Large hero image** showing nostalgic VHS tapes being held or transforming into digital formats, with a family in soft focus watching old footage on a modern device. Image should have warm, inviting tones and convey emotional connection to memories.

### Format Identification
Visual illustrations of each tape type (VHS, VHS-C, Hi8, MiniDV, Betamax) showing physical dimensions and distinguishing features.

### Process Section
Photos or illustrations of professional equipment, secure facility, and digitization process to build credibility.

### Testimonial Section
Authentic customer photos (or tasteful stock photos representing diverse families) paired with testimonials.

## Accessibility
- Minimum text size: 16px for body
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: Visible amber outline on all interactive elements
- Keyboard navigation: Full support for wizard, forms, and admin dashboard
- Alt text: Required for all images, especially format identification visuals