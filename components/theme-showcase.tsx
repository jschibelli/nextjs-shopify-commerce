"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useThemeExtended } from "@/lib/use-theme"

export function ThemeShowcase() {
  const { theme, resolvedTheme, mounted } = useThemeExtended()

  if (!mounted) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Theme Showcase</h2>
            <p className="text-muted-foreground">Loading theme...</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme Showcase</h2>
          <p className="text-muted-foreground">
            Current theme: <span className="font-medium">{theme}</span>
            {theme === "system" && ` (${resolvedTheme})`}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards */}
        <Card className="theme-elevated">
          <CardHeader>
            <CardTitle>Primary Card</CardTitle>
            <CardDescription>
              This card demonstrates the primary theme colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This card uses the theme-elevated utility class for enhanced styling.
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-glow">
          <CardHeader>
            <CardTitle>Glow Effect</CardTitle>
            <CardDescription>
              This card has a subtle glow effect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The glow effect adapts to the current theme and primary color.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-1">
          <CardHeader>
            <CardTitle>Glass Effect</CardTitle>
            <CardDescription>
              This card uses a glass morphism effect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Glass effects work differently in light and dark modes.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="ghost" size="sm">Ghost</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            Theme-aware color demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-12 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">Primary</span>
              </div>
              <p className="text-xs text-muted-foreground">Primary color</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-secondary rounded-md flex items-center justify-center">
                <span className="text-secondary-foreground text-sm font-medium">Secondary</span>
              </div>
              <p className="text-xs text-muted-foreground">Secondary color</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-accent rounded-md flex items-center justify-center">
                <span className="text-accent-foreground text-sm font-medium">Accent</span>
              </div>
              <p className="text-xs text-muted-foreground">Accent color</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-destructive rounded-md flex items-center justify-center">
                <span className="text-destructive-foreground text-sm font-medium">Destructive</span>
              </div>
              <p className="text-xs text-muted-foreground">Destructive color</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <CardDescription>
            Test the theme-aware hover and focus states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="theme-hover theme-focus">Hover & Focus</Button>
            <Button variant="outline" className="theme-hover theme-focus">Outline</Button>
            <Button variant="ghost" className="theme-hover theme-focus">Ghost</Button>
            <Button variant="secondary" className="theme-hover theme-focus">Secondary</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 