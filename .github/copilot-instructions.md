# Sastify - Copilot Instructions

## Project Overview

Next.js 16.1.3 application using React 19, TypeScript, and Tailwind CSS v4 with shadcn/ui components (New York style). Built with App Router architecture.

## Tech Stack & Key Dependencies

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 (using new `@import "tailwindcss"` syntax)
- **UI Components**: shadcn/ui with Radix UI primitives + Aceternity UI
- **Theming**: `next-themes` for dark/light/system modes
- **Icons**: `lucide-react`
- **Animations**: `framer-motion` + `tw-animate-css` (Aceternity UI animations integrated)
- **Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

## Critical Architecture Patterns

### Component Structure

**UI Components** (`src/components/ui/`): Follow shadcn/ui patterns with CVA variants. All are client components using Radix primitives.

Example pattern from [src/components/ui/button.tsx](src/components/ui/button.tsx):
```tsx
const buttonVariants = cva(
  "base-classes...",
  { variants: { variant: {...}, size: {...} }, defaultVariants: {...} }
)

function Button({ asChild, variant, size, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

Key conventions:
- Use `data-slot`, `data-variant`, `data-size` attributes for styling hooks
- Support `asChild` prop via `@radix-ui/react-slot` for composition
- Always use `cn()` utility (never raw `className`)
- Client components must have `"use client"` directive

### Theme System

Theme managed via `next-themes` wrapped in [src/components/theme-provider.tsx](src/components/theme-provider.tsx):
- Applied at root via [src/app/layout.tsx](src/app/layout.tsx) with `attribute="class"`
- Colors use OKLCH format in [src/app/globals.css](src/app/globals.css)
- Dark mode toggled via `.dark` class on `<html>` element
- Custom Tailwind variant: `@custom-variant dark (&:is(.dark *))`

When adding theme-aware components:
1. Wrap in `ThemeProvider` (already done at root)
2. Use `dark:` prefix for dark mode styles
3. Access theme state via `useTheme()` from `next-themes`

### Styling System

**Tailwind CSS v4 specifics**:
- Import syntax: `@import "tailwindcss"` (not `@tailwind` directives)
- Theme defined in `@theme inline` block with CSS variables
- Uses `@custom-variant` for dark mode
- Includes custom keyframe animations for Aceternity UI effects (spotlight, shimmer, scroll, moveBorder)

**Path aliases** (from [tsconfig.json](tsconfig.json)):
- `@/*` maps to `./src/*`
- Always use path aliases for imports

### Fonts

Geist Sans & Geist Mono loaded via `next/font/google` in [src/app/layout.tsx](src/app/layout.tsx):
```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
// Applied to body via className={`${geistSans.variable} ${geistMono.variable}`}
```

## Development Workflows

**Run dev server**: `npm run dev` (opens http://localhost:3000)
**Build**: `npm run build`
**Lint**: `npm run lint` (uses Next.js ESLint config with TypeScript support)

## Component Addition Guide

When adding new shadcn/ui components:
1. Check [components.json](components.json) for config (New York style, `src/components/ui`, CSS variables mode)
2. Use shadcn CLI: `npx shadcn@latest add [component-name]`
3. Components auto-install to `src/components/ui/` with proper aliases

## Common Patterns & Anti-Patterns

✅ **DO**:
- Use CVA for variant-based component styling
- Apply `"use client"` for interactive/state components
- Use `cn()` utility for className merging
- Support `asChild` prop for composition in reusable components
- Use OKLCH colors for theme consistency
- Destructure props and pass `...props` for flexibility

❌ **DON'T**:
- Use old Tailwind v3 `@tailwind` directives
- Hardcode colors (use CSS variables from theme)
- Create client components without `"use client"` directive
- Ignore TypeScript strict mode (enabled in project)
- Use class concatenation without `cn()` utility

## File Organization

```
src/
├── app/              # Next.js App Router (pages, layouts, globals.css)
├── components/
│   ├── ui/          # shadcn/ui components (Radix-based)
│   └── *.tsx        # Custom components (theme-provider, theme-toggle)
└── lib/
    └── utils.ts     # cn() utility and shared helpers
```

## Testing & Deployment

No test setup currently configured. Deploy to Vercel (optimized for Next.js).
