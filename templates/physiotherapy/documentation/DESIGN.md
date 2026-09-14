---
name: Clinical Serenity
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#3f484c'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f787d'
  outline-variant: '#bec8cd'
  surface-tint: '#006781'
  primary: '#005a71'
  on-primary: '#ffffff'
  primary-container: '#0e7490'
  on-primary-container: '#d3f1ff'
  inverse-primary: '#81d1f0'
  secondary: '#006877'
  on-secondary: '#ffffff'
  secondary-container: '#3fe1fd'
  on-secondary-container: '#00616f'
  tertiary: '#505355'
  on-tertiary: '#ffffff'
  tertiary-container: '#686b6d'
  on-tertiary-container: '#eaecee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9eaff'
  primary-fixed-dim: '#81d1f0'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
  clinical-white: '#FFFFFF'
  success-green: '#10B981'
  warning-amber: '#F59E0B'
  emergency-red: '#EF4444'
  surface-muted: '#F1F5F9'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 1.5rem
  section-padding-desktop: 5rem
  section-padding-mobile: 2.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

This design system is engineered to project **professionalism, medical authority, and empathetic care**. The target audience includes patients seeking recovery, athletes, and the elderly, necessitating a UI that is both high-fidelity and exceptionally accessible.

The chosen style is **Corporate / Modern** with a focus on high-fidelity healthcare standards. It utilizes a clean, "clinical white" foundation punctuated by calming medical blues. To avoid a cold or sterile feeling, the design incorporates soft shadows and rounded geometry, creating a welcoming environment that reduces patient anxiety. Visual clarity is prioritized through generous whitespace, ensuring that critical actions—like booking an appointment or contacting a therapist—are never obscured.

## Colors

The palette is anchored in **Teal-Blue (#0E7490)**, a color that balances the authority of a medical institution with the freshness of wellness. 

- **Primary:** Used for main actions (Booking, Confirmations) and brand headers.
- **Secondary:** An accent blue used for highlights, active states, and secondary calls-to-action.
- **Tertiary:** A very light slate used for background sections to break up pure white space without adding visual noise.
- **Neutral:** A professional slate-gray for body text and labels, ensuring high contrast for readability.
- **Emergency Red:** Specifically reserved for "Red Flag" triase alerts and urgent medical warnings as identified in the system requirements.

## Typography

The typography system prioritizes legibility across a diverse age demographic.

- **Headlines (Manrope):** A modern, geometric sans-serif that feels balanced and trustworthy. It is used for page titles and service headers to establish hierarchy.
- **Body (Inter):** A highly functional, systematic typeface designed for screen readability. It is used for all medical information, articles, and patient data.
- **Labels (JetBrains Mono):** Used sparingly for technical data points, time slots in the booking system, and status tags (e.g., "STR Verified") to provide a precise, organized feel.

## Layout & Spacing

This design system uses a **Fixed Grid** approach for desktop (12 columns) to maintain a controlled, professional reading experience, transitioning to a fluid single-column layout for mobile.

- **Margins:** Desktop margins are set to auto-center the 1200px container. Mobile margins are fixed at 20px to maximize screen real estate for assessment forms.
- **Rhythm:** A vertical rhythm based on 8px increments is used to maintain consistency between elements.
- **Adaptation:** On tablet, the 3-column "Therapist Cards" reflow into a 2-column grid. On mobile, all cards stack vertically to ensure large tap targets for patients with limited mobility.

## Elevation & Depth

To maintain a "clean" and "modern" medical aesthetic, the system uses **Tonal Layers** supplemented by **Ambient Shadows**.

- **Surface Levels:** The background uses `Clinical White`. Secondary containers (like sidebar navigation or search filters) use `Surface Muted`.
- **Shadows:** Use extremely soft, diffused shadows (Blur: 20px, Opacity: 5%) with a slight blue tint (#0E7490 at 5% alpha) to make cards appear to float gently above the surface. 
- **Depth Hierarchy:** 
    - Level 0: Main Background.
    - Level 1: Cards and assessment form containers.
    - Level 2: Modals, dropdowns, and the "Booking Summary" sticky bar.

## Shapes

The shape language is **Rounded (Level 2)**. 

This level of roundedness (8px base) strikes a perfect balance: it is professional enough to be taken seriously as a medical platform, but soft enough to feel approachable and modern. 
- `rounded-lg` (16px) is used for large service cards and container sections.
- `rounded-xl` (24px) is reserved for featured "Hero" sections or patient testimonial blocks.
- Interactive elements like Checkboxes utilize the 4px (Soft) radius to maintain a precise, clickable feel.

## Components

### Buttons
- **Primary:** Solid `Primary Color` with white text. High contrast, 12px vertical padding. Used for "Book Now" and "Submit Assessment."
- **Secondary:** Ghost style with `Primary Color` border and text. Used for "Learn More" or "View Schedule."
- **Emergency:** Solid `Emergency Red`. Used exclusively for the AI Triase's "Go to ER" button.

### Cards
- **Therapist Card:** Features a circular avatar, "STR Verified" badge in `Label-sm`, and a clear "Book Schedule" primary button. 
- **Service Card:** Uses a subtle `Surface Muted` background that shifts to a soft shadow on hover.

### Inputs & Forms
- Input fields use a 1px border (#CBD5E1). In focus state, they transition to a 2px `Secondary Color` border with a soft blue outer glow.
- Labels are always positioned above the field for maximum accessibility.

### Navigation
- **Desktop:** A sticky top-bar with a "Quick Booking" button highlighted in the `Secondary Color`.
- **Mobile:** A bottom-tab navigation for "Home," "My Bookings," "Education," and "Profile" to ensure easy thumb reach.

### Status Chips
- Used for booking statuses: "Confirmed" (Success Green), "Pending" (Warning Amber), and "Cancelled" (Neutral Slate).