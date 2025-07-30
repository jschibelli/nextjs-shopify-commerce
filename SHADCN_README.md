# shadcn/ui + Next.js Commerce

This project now includes [shadcn/ui](https://ui.shadcn.com/) components for beautiful, accessible UI elements.

## 🚀 What's Included

### Core Components
- **Button** - Multiple variants (default, secondary, outline, ghost, destructive)
- **Card** - Flexible card components with header, content, and footer
- **Badge** - Small status indicators and labels
- **Separator** - Visual dividers
- **Skeleton** - Loading state components
- **Dialog** - Modal dialogs
- **Alert Dialog** - Confirmation dialogs
- **Sheet** - Slide-out panels

### Custom Components
- **ProductCard** - Beautiful product display with multiple variants
- **ProductSkeleton** - Loading states for products

## 🎨 Usage Examples

### Product Cards
```tsx
import { ProductCard } from "@/components/ui/product-card";

// Default variant
<ProductCard product={product} />

// Compact variant
<ProductCard product={product} variant="compact" />

// Featured variant
<ProductCard product={product} variant="featured" />
```

### Loading States
```tsx
import { ProductSkeleton } from "@/components/ui/product-skeleton";

// Show while loading
<ProductSkeleton variant="default" />
```

### Buttons
```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

### Badges
```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

## 🎯 Demo Page

Visit `/demo` to see all components in action with examples and different variants.

## 📦 Adding More Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Popular components for e-commerce:
```bash
npx shadcn@latest add input select dropdown-menu tabs
npx shadcn@latest add form label textarea
npx shadcn@latest add table pagination
npx shadcn@latest add tooltip popover
```

## 🎨 Customization

### Colors
The color scheme is based on **Zinc** but can be changed in `components.json`:

```json
{
  "tailwind": {
    "baseColor": "zinc"
  }
}
```

### Styling
All components use CSS variables defined in `app/globals.css`. You can customize:

- Colors (primary, secondary, muted, etc.)
- Border radius
- Spacing
- Typography

## 🔧 Configuration

The project is configured with:

- **Import alias**: `@/` points to the project root
- **Tailwind CSS v4**: Latest version with modern features
- **TypeScript**: Full type safety
- **Lucide React**: Beautiful icons
- **CSS Variables**: Easy theming

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Component Library](https://ui.shadcn.com/docs/components)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 🚀 Next Steps

1. **Visit the demo page** at `/demo` to see components in action
2. **Replace existing components** with shadcn/ui equivalents
3. **Add more components** as needed for your e-commerce features
4. **Customize the theme** to match your brand
5. **Build beautiful product pages** with these components

## 💡 Tips

- Use the **ProductCard** component for consistent product displays
- Implement **ProductSkeleton** for better loading UX
- Leverage **Badge** components for product tags and status
- Use **Dialog** and **Alert Dialog** for cart confirmations
- Implement **Sheet** for mobile cart and filters

Happy building! 🎉 