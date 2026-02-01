---
name: health-mobile-style
description: A premium, health-focused mobile design system for React Native using Expo, SVG, and the Outfit font.
---

# Health Mobile Design Style

This skill provides the design tokens, component templates, and layout principles for creating premium health and wellness mobile applications. It is optimized for React Native (Expo).

## Design Tokens

### Color Palette
Use these color tokens to maintain the "HealthPulse" aesthetic:
- **Background**: `#F9F6ED` (Cream)
- **Primary Text**: `#1C1C1C` (Near Black)
- **Secondary Text**: `#757575` (Medium Gray)
- **Accents**:
  - `accentPink`: `#FAB7D3`
  - `accentYellow`: `#FEE58A`
  - `accentBlue`: `#C5D5F5`
  - `accentGreen`: `#D4E6B5`
  - `accentOrange`: `#FFD1A9`

### Typography
- **Primary Font**: `Outfit` (Loaded via `@expo-google-fonts/outfit`)
- **Weights**: 
  - `400Regular` for body text.
  - `600SemiBold` for buttons and medium headers.
  - `700Bold` for scores and primary titles.

## Component Principles

### 1. Rounded Containers
All cards and interactive elements should use a high corner radius:
- **Buttons**: `24px` to `28px`
- **Cards**: `24px`
- **Navigation Bars**: `40px`

### 2. SVG Visualization
For health scores and metrics, use `react-native-svg` to create organic, segmented rings.
- **Stroke Linecap**: `round`
- **Stroke Width**: `10%` to `15%` of the container size.
- **Spacing**: Maintain a `10-15 degree` gap between segments.

### 3. Navigation
A floating bottom navigation bar in `#1C1C1C` (Black) with:
- Elevated center action button (plus sign).
- High transparency icons (0.5 opacity) for inactive states.
- Rounded corners (`40px`).

## Layout Guidelines
- **Padding**: Uniform `24px` horizontal padding for screens.
- **Spacing**: Use a `8px` grid for micro-spacing and `24px` for section spacing.
- **Top Bar**: Minimalist, often just a dashed-border back button or a logo.

## Usage in Coding Tasks
When asked to build a new screen or component in this style:
1. Initialize the `Colors.ts` constant file.
2. Load the `Outfit` font family.
3. Use the `react-native-svg` patterns for any charts.
4. Apply the `SafeAreaView` with the background color `#F9F6ED`.
