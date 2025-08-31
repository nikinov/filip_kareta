# UI Components Library

This directory contains reusable UI components built with a mobile-first approach using Tailwind CSS and inspired by shadcn/ui design patterns. All components are optimized for the Prague tour guide website with custom Prague-themed colors and responsive design.

## Design Principles

- **Mobile-First**: All components are designed with mobile devices as the primary target
- **Touch-Friendly**: Minimum 44px touch targets for better mobile usability
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Prague Theme**: Custom color palette inspired by Prague's architecture and culture

## Components

### Core Components

#### Button
Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="cta">Call to Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
```

#### Card
Flexible card component for content containers.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Input & Form Components

```tsx
import { Input, Textarea, Label } from '@/components/ui';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>

<div>
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Your message" />
</div>
```

### Layout Components

#### Container
Responsive container with consistent padding and max-widths.

```tsx
import { Container } from '@/components/ui/container';

<Container size="lg">
  <p>Content with responsive padding</p>
</Container>
```

#### Grid
Responsive grid system for layouts.

```tsx
import { Grid, GridItem } from '@/components/ui/grid';

<Grid cols={3} gap="lg">
  <GridItem>Item 1</GridItem>
  <GridItem span={2}>Item 2 (spans 2 columns)</GridItem>
</Grid>
```

### Media Components

#### ResponsiveImage
Optimized image component with loading states and error handling.

```tsx
import { ResponsiveImage } from '@/components/ui/responsive-image';

<ResponsiveImage
  src="/tour-image.jpg"
  alt="Prague Castle Tour"
  aspectRatio="landscape"
  width={800}
  height={600}
  priority
/>
```

#### Avatar
User avatar component with fallback support.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/filip-avatar.jpg" alt="Filip Kareta" />
  <AvatarFallback>FK</AvatarFallback>
</Avatar>
```

### Feedback Components

#### Badge
Small status indicators and labels.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">New</Badge>
<Badge variant="success">Available</Badge>
<Badge variant="destructive">Sold Out</Badge>
```

#### Loading States

```tsx
import { Spinner, Skeleton, LoadingCard, LoadingTourCard } from '@/components/ui';

// Spinner for buttons and inline loading
<Spinner size="md" />

// Skeleton for content placeholders
<Skeleton className="h-4 w-full" />

// Pre-built loading cards
<LoadingTourCard />
<LoadingBlogCard />
```

### Utility Components

#### Separator
Visual dividers for content sections.

```tsx
import { Separator } from '@/components/ui/separator';

<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>
```

## Color Palette

The components use a Prague-inspired color palette:

- **Prague Orange** (`prague-*`): Primary brand color inspired by Prague's red rooftops
- **Castle Blue** (`castle-*`): Secondary color inspired by Prague Castle and Vltava River
- **Gold** (`gold-*`): Accent color for CTAs and highlights
- **Stone** (`stone-*`): Neutral colors for text and backgrounds

## Responsive Breakpoints

Components follow Tailwind's default breakpoints:
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

## Accessibility Features

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios for text
- Focus indicators for interactive elements
- Touch-friendly sizing (minimum 44px targets)

## Performance Optimizations

- Lazy loading for images
- Skeleton loading states
- Optimized bundle size with tree shaking
- CSS-in-JS avoided for better performance
- Minimal JavaScript for static components

## Testing

All components include comprehensive tests covering:
- Rendering with different props
- Accessibility compliance
- Responsive behavior
- User interactions
- Error states

Run tests with:
```bash
npm test
```

## Usage Guidelines

1. **Import from the main UI barrel**: `import { Button, Card } from '@/components/ui';`
2. **Use semantic HTML**: Components maintain proper HTML semantics
3. **Follow mobile-first**: Design for mobile, enhance for desktop
4. **Maintain consistency**: Use the design system consistently across the app
5. **Test accessibility**: Ensure all interactive elements are accessible