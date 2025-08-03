import { ThemeShowcase } from '@/components/theme-showcase'

export default function DemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Theme System Demo</h1>
        <p className="text-muted-foreground text-lg">
          Explore the comprehensive light and dark theme system with enhanced colors, 
          glass effects, and theme-aware components.
        </p>
      </div>
      
      <ThemeShowcase />
      
      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Theme Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Light Theme</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Clean white backgrounds with subtle shadows</li>
              <li>• High contrast text for excellent readability</li>
              <li>• Soft borders and muted accents</li>
              <li>• Professional and modern appearance</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Dark Theme</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Deep dark backgrounds with enhanced contrast</li>
              <li>• Bright text and accent colors</li>
              <li>• Glowing effects and stronger shadows</li>
              <li>• Eye-friendly for low-light environments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 