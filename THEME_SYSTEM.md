# Theme System Documentation

This document describes the comprehensive light and dark theme system implemented in the Next.js Shopify Commerce application.

## Overview

The theme system provides:
- **Light Theme**: Clean, professional appearance with high contrast
- **Dark Theme**: Eye-friendly dark mode with enhanced contrast
- **System Theme**: Automatically follows user's system preference
- **Smooth Transitions**: Seamless theme switching with no layout shifts
- **Theme-Aware Components**: All components adapt to the current theme

## Features

### 🎨 Enhanced Color Palettes

#### Light Theme
- Clean white backgrounds (`oklch(100% 0 0)`)
- High contrast text (`oklch(25% 0.02 250)`)
- Soft borders and muted accents
- Professional and modern appearance

#### Dark Theme
- Deep dark backgrounds (`oklch(8% 0.02 250)`)
- Bright text and accent colors
- Glowing effects and stronger shadows
- Eye-friendly for low-light environments

### 🔧 Theme Utilities

The system includes several utility classes for theme-aware styling:

```css
/* Theme transitions */
.theme-transition {
  @apply transition-colors duration-200 ease-in-out;
}

/* Theme-aware hover states */
.theme-hover {
  @apply hover:bg-accent hover:text-accent-foreground theme-transition;
}

/* Theme-aware focus states */
.theme-focus {
  @apply focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background;
}

/* Theme-aware cards */
.theme-card {
  @apply bg-card text-card-foreground border border-border rounded-lg shadow-sm;
}

/* Elevated cards with enhanced shadows */
.theme-elevated {
  @apply bg-card text-card-foreground border border-border rounded-lg shadow-md dark:shadow-lg;
}

/* Glow effects */
.theme-glow {
  @apply shadow-lg dark:shadow-xl;
  box-shadow: 0 0 20px rgba(var(--primary), 0.1);
}

.theme-glow-strong {
  @apply shadow-xl dark:shadow-2xl;
  box-shadow: 0 0 30px rgba(var(--primary), 0.2);
}
```

### 🎭 Glass Effects

Five levels of glass morphism effects that adapt to the current theme:

```css
.glass-1 { /* Subtle glass effect */ }
.glass-2 { /* Medium glass effect */ }
.glass-3 { /* Enhanced glass effect */ }
.glass-4 { /* Strong glass effect */ }
.glass-5 { /* Maximum glass effect */ }
```

## Components

### ThemeToggle

A dropdown menu component that allows users to switch between:
- **Light**: Forces light theme
- **Dark**: Forces dark theme  
- **System**: Follows system preference

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

<ThemeToggle />
```

### ThemeShowcase

A demonstration component that showcases all theme features:

```tsx
import { ThemeShowcase } from "@/components/theme-showcase"

<ThemeShowcase />
```

### useThemeExtended Hook

A custom hook that provides enhanced theme functionality:

```tsx
import { useThemeExtended } from "@/lib/use-theme"

const {
  theme,           // Current theme setting
  resolvedTheme,   // Actual applied theme
  mounted,         // Whether component is mounted
  isDark,          // Boolean for dark theme
  isLight,         // Boolean for light theme
  isSystem,        // Boolean for system theme
  toggleTheme,     // Toggle between light/dark
  setLightTheme,   // Set light theme
  setDarkTheme,    // Set dark theme
  setSystemTheme,  // Set system theme
} = useThemeExtended()
```

## Implementation

### 1. Theme Provider Setup

The theme provider is configured in `app/layout.tsx`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {/* App content */}
</ThemeProvider>
```

### 2. CSS Variables

Theme colors are defined using CSS custom properties in `app/globals.css`:

```css
:root {
  /* Light theme colors */
  --background: oklch(100% 0 0);
  --foreground: oklch(25% 0.02 250);
  /* ... more colors */
}

.dark {
  /* Dark theme colors */
  --background: oklch(8% 0.02 250);
  --foreground: oklch(98% 0.01 250);
  /* ... more colors */
}
```

### 3. Tailwind Integration

The theme system integrates with Tailwind CSS using the `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

## Usage Examples

### Basic Theme-Aware Component

```tsx
function MyComponent() {
  const { isDark, theme } = useThemeExtended()
  
  return (
    <div className="theme-card theme-hover">
      <h2 className="text-foreground">Title</h2>
      <p className="text-muted-foreground">Content</p>
    </div>
  )
}
```

### Theme-Aware Button

```tsx
<Button className="theme-hover theme-focus">
  Click me
</Button>
```

### Glass Effect Card

```tsx
<Card className="glass-1">
  <CardHeader>
    <CardTitle>Glass Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content with glass effect
  </CardContent>
</Card>
```

## Best Practices

1. **Always use theme-aware classes**: Use `bg-card` instead of `bg-white`
2. **Test in both themes**: Ensure components look good in light and dark modes
3. **Use semantic colors**: Use `text-foreground` instead of `text-black`
4. **Leverage utility classes**: Use the provided theme utilities for consistency
5. **Handle hydration**: Use the `mounted` state from `useThemeExtended` to avoid hydration mismatches

## Demo

Visit `/demo` to see the theme system in action with the `ThemeShowcase` component.

## Browser Support

The theme system supports:
- ✅ Modern browsers with CSS custom properties
- ✅ Tailwind CSS dark mode
- ✅ System theme detection
- ✅ Smooth transitions
- ✅ No layout shifts during theme switching 