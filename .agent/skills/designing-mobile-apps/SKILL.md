---
name: designing-mobile-apps
description: Guides the creation of easy, clean, and modern mobile application designs and UX. Use when the user requests a visually stunning, user-friendly, or "premium" mobile web app or PWA.
---

# Mobile Component & UX Design System

## When to use this skill

- When the user asks to "make it look good" or "improve the design" of a mobile app.
- When creating new UI components for a mobile-first web application.
- When the user mentions "modern," "clean," "sleek," or "premium" aesthetics.

## Core Design Principles (The "Wow" Factor)

1. **Thumb-Driven Navigation**: Place primary actions (save, navigation, main buttons) in the bottom 30% of the screen. Top corners are for secondary/destructive actions.
2. **Visual Depth & Texture**: Use subtle gradients, soft shadows (elevation), and glassmorphism (backdrop-filter) to create hierarchy. Avoid flat, solid blocks of generic colors.
3. **Haptic & Visual Feedback**: Every tap must have immediate feedback (scale down 0.98, ripple, or color change). "Buttons should feel like buttons."
4. **Generous Typography**: Use larger-than-default font sizes. 16px minimum for body text, 24px+ for headers. Use spacing (margin/padding) to group elements, not borders.

## Workflow: The "Premium Polish" Cycle

1. **Structure**: layout the HTML with semantic tags (`<nav>`, `<header>`, `<main>`).
2. **Theme**: Define CSS variables for the color palette (Primary, Accent, Backgrounds, Text).
3. **Components**: Build the core interactive elements (Cards, Buttons, Modals) using the Design Tokens below.
4. **Interaction**: Add `:active` states and transitions to everything interactive.
5. **Refine**: Check touch targets (min 44px) and safe areas (`env(safe-area-inset-bottom)`).

## Design Tokens & Snippets

### 1. Modern Color Palette (CSS Variables)

Start every project by defining a sophisticated palette.

```css
:root {
  /* HSL allows for easy theming */
  --hue-primary: 260; /* Deep Purple */
  --hue-accent: 190;  /* Cyan */
  
  --bg-body: hsl(var(--hue-primary), 30%, 10%);
  --bg-card: hsla(var(--hue-primary), 25%, 20%, 0.8);
  --bg-glass: hsla(var(--hue-primary), 30%, 15%, 0.6);
  
  --text-main: hsl(0, 0%, 100%);
  --text-muted: hsla(0, 0%, 100%, 0.6);
  
  --accent: hsl(var(--hue-accent), 90%, 50%);
  --accent-glow: hsla(var(--hue-accent), 90%, 50%, 0.4);
  
  --radius-lg: 24px;
  --radius-sm: 12px;
  --shadow-card: 0 10px 30px -10px rgba(0,0,0,0.5);
}
```

### 2. Glassmorphism Card

```css
.card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
```

### 3. Mobile Modal (Bottom Sheet)

Always use bottom sheets for actionable modals on mobile.

```css
.modal-content {
  position: fixed;
  bottom: 0;
  left: 0; 
  right: 0;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--bg-card);
  padding-bottom: env(safe-area-inset-bottom);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.modal.open .modal-content { transform: translateY(0); }
```

### 4. Interactive "Bouncy" Click

```css
.btn {
  transition: transform 0.1s ease, background 0.2s;
  /* Disable double-tap zoom */
  touch-action: manipulation; 
}
.btn:active {
  transform: scale(0.96);
}
```

## UX Checklist for Mobile

- [ ] **Sticky Headers/Footers**: Are they accounting for `safe-area-inset`?
- [ ] **Tap Targets**: Are all buttons at least 44x44px?
- [ ] **Input Modes**: Do number inputs have `inputmode="numeric"`?
- [ ] **Loading States**: Are skeletons or spinners used instead of blank screens?
- [ ] **Scroll Snapping**: specific lists (like carousels) should use `scroll-snap-type`.
- [ ] **Close Actions**: Can user close modals by dragging down or tapping background?

## Resources

- **Fonts**: Prefer "Inter", "Outfit", or system fonts (`-apple-system`) for speed and clarity.
- **Icons**: Use outline icons (Feather, Heroicons) with 2px stroke width for a modern look.
