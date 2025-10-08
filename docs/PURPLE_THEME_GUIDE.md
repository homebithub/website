# Purple Theme System Guide

## Overview

The HomeXpert application now has a comprehensive purple theme system with floating bubbles and smooth animations that can be applied consistently across all pages and components.

## Components

### 1. FloatingBubbles Component

Located: `app/components/ui/FloatingBubbles.tsx`

Creates animated floating SVG shapes (circles, ellipses, rounded rectangles) in the background.

**Usage:**
```tsx
import { FloatingBubbles } from '~/components/ui';

<FloatingBubbles 
  variant="mixed"  // 'light' | 'dark' | 'mixed'
  density="medium" // 'low' | 'medium' | 'high'
/>
```

**Props:**
- `variant`: Color scheme of bubbles
  - `light`: Light purple (#e9d5ff)
  - `dark`: Dark purple (#a855f7)
  - `mixed`: Alternating light and dark (default)
- `density`: Number of bubbles
  - `low`: 2 bubbles
  - `medium`: 4 bubbles (default)
  - `high`: 6 bubbles

### 2. PurpleThemeWrapper Component

Located: `app/components/layout/PurpleThemeWrapper.tsx`

Wraps content with purple gradient background and optional floating bubbles.

**Usage:**
```tsx
import { PurpleThemeWrapper } from '~/components/layout';

<PurpleThemeWrapper
  variant="gradient"
  bubbles={true}
  bubbleDensity="medium"
  className="py-12"
>
  <YourContent />
</PurpleThemeWrapper>
```

**Props:**
- `variant`: Background style
  - `gradient`: Purple gradient (from-purple-100 via-white to-purple-200)
  - `light`: Light purple gradient
  - `white`: White background
- `bubbles`: Enable/disable floating bubbles (default: true)
- `bubbleDensity`: Bubble density (default: 'medium')
- `className`: Additional CSS classes

### 3. PurpleCard Component

Located: `app/components/ui/PurpleCard.tsx`

Styled card component with purple theme, optional hover effects, and glow.

**Usage:**
```tsx
import { PurpleCard } from '~/components/ui';

<PurpleCard 
  hover={true}
  glow={false}
  animate={true}
  className="p-6"
>
  <h3>Card Title</h3>
  <p>Card content...</p>
</PurpleCard>
```

**Props:**
- `hover`: Enable hover lift effect (default: true)
- `glow`: Enable purple glow effect (default: false)
- `animate`: Enable fade-in animation (default: true)
- `className`: Additional CSS classes

## CSS Animations

All animations are defined in `app/app.css`.

### Available Animations

#### 1. Float Animation
```css
.animate-float
```
- Smooth up/down floating with rotation
- Duration: 5s
- Perfect for bubbles and decorative elements

#### 2. Fade In
```css
.animate-fadeIn
```
- Fade in with upward slide
- Duration: 0.8s
- Use for content reveal

#### 3. Fade In on Scroll
```css
.fade-in-scroll
```
- Same as fadeIn but for scroll-triggered animations
- Starts with opacity: 0

#### 4. Pulse (Slow)
```css
.animate-pulse-slow
```
- Gentle opacity pulse
- Duration: 3s
- Good for attention-grabbing elements

#### 5. Bounce (Slow)
```css
.animate-bounce-slow
```
- Gentle vertical bounce
- Duration: 2s
- Perfect for CTAs and icons

#### 6. Shimmer
```css
.animate-shimmer
```
- Horizontal shimmer effect
- Duration: 2s
- Great for loading states

### Hover Effects

#### Scale on Hover
```css
.hover-scale
```
- Scales element to 1.05 on hover
- Smooth transition

#### Purple Glow
```css
.glow-purple
```
- Purple box-shadow that intensifies on hover
- Creates a glowing effect

### Animation Delays

Use these classes to stagger animations:

```css
.delay-100   /* 100ms */
.delay-200   /* 200ms */
.delay-300   /* 300ms */
.delay-500   /* 500ms */
.delay-1000  /* 1000ms */
```

## Color Palette

### Purple Shades (Tailwind)

```css
purple-50   #faf5ff  /* Lightest */
purple-100  #f3e8ff
purple-200  #e9d5ff
purple-300  #d8b4fe
purple-400  #c084fc  /* Primary light */
purple-500  #a855f7  /* Primary */
purple-600  #9333ea
purple-700  #7e22ce  /* Primary dark */
purple-800  #6b21a8
purple-900  #581c87  /* Darkest */
```

### Gradient Combinations

**Light Gradient:**
```css
bg-gradient-to-br from-purple-50 via-white to-purple-100
```

**Medium Gradient:**
```css
bg-gradient-to-br from-purple-100 via-white to-purple-200
```

**Bold Gradient:**
```css
bg-gradient-to-br from-primary-400 via-primary-700 to-purple-900
```

## Usage Examples

### Example 1: Full Page with Theme

```tsx
import { PurpleThemeWrapper } from '~/components/layout';
import { PurpleCard } from '~/components/ui';

export default function MyPage() {
  return (
    <PurpleThemeWrapper variant="gradient" bubbles={true}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-purple-700 animate-fadeIn">
          Welcome
        </h1>
        
        <div className="grid grid-cols-3 gap-6 mt-8">
          <PurpleCard hover glow className="p-6">
            <h3 className="text-xl font-bold">Feature 1</h3>
            <p>Description...</p>
          </PurpleCard>
          
          <PurpleCard hover glow className="p-6 delay-200">
            <h3 className="text-xl font-bold">Feature 2</h3>
            <p>Description...</p>
          </PurpleCard>
          
          <PurpleCard hover glow className="p-6 delay-300">
            <h3 className="text-xl font-bold">Feature 3</h3>
            <p>Description...</p>
          </PurpleCard>
        </div>
      </div>
    </PurpleThemeWrapper>
  );
}
```

### Example 2: Section with Bubbles

```tsx
import { FloatingBubbles } from '~/components/ui';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-primary-400 via-primary-700 to-purple-900 overflow-hidden">
      <FloatingBubbles variant="mixed" density="high" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-white animate-fadeIn">
          Your Home, Our Expertise!
        </h1>
        <p className="text-xl text-purple-100 mt-4 animate-fadeIn delay-200">
          Transform your living space...
        </p>
        <button className="mt-8 px-8 py-4 bg-white text-purple-700 rounded-xl font-bold hover-scale glow-purple animate-fadeIn delay-300">
          Get Started
        </button>
      </div>
    </div>
  );
}
```

### Example 3: Card Grid with Staggered Animation

```tsx
import { PurpleCard } from '~/components/ui';

const features = [
  { title: 'Feature 1', description: '...' },
  { title: 'Feature 2', description: '...' },
  { title: 'Feature 3', description: '...' },
];

export default function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, idx) => (
        <PurpleCard 
          key={feature.title}
          hover
          glow
          className="p-8"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg animate-float mx-auto">
            {/* Icon here */}
          </div>
          <h3 className="mt-4 text-xl font-bold text-purple-700">
            {feature.title}
          </h3>
          <p className="mt-2 text-gray-600">
            {feature.description}
          </p>
        </PurpleCard>
      ))}
    </div>
  );
}
```

### Example 4: Auth Page with Theme

```tsx
import { PurpleThemeWrapper } from '~/components/layout';
import { PurpleCard } from '~/components/ui';

export default function LoginPage() {
  return (
    <PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low">
      <div className="min-h-screen flex items-center justify-center px-4">
        <PurpleCard className="w-full max-w-md p-8" glow>
          <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
            Welcome Back
          </h2>
          <form className="space-y-4">
            {/* Form fields */}
          </form>
        </PurpleCard>
      </div>
    </PurpleThemeWrapper>
  );
}
```

## Best Practices

### 1. Consistency
- Use the same gradient variants across similar page types
- Maintain consistent bubble density (medium for most pages)
- Use the same animation timing for similar elements

### 2. Performance
- Don't overuse high-density bubbles on mobile
- Limit the number of animated elements on a single page
- Use `will-change: transform` for frequently animated elements

### 3. Accessibility
- Ensure text has sufficient contrast against purple backgrounds
- Don't rely solely on animations to convey information
- Provide reduced-motion alternatives if needed

### 4. Responsive Design
- Adjust bubble density for mobile (use 'low' or 'medium')
- Scale down animations on smaller screens
- Ensure cards stack properly on mobile

## Migration Guide

### Converting Existing Pages

**Before:**
```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <h1>My Page</h1>
        {/* content */}
      </div>
    </div>
  );
}
```

**After:**
```tsx
import { PurpleThemeWrapper } from '~/components/layout';

export default function MyPage() {
  return (
    <PurpleThemeWrapper variant="gradient" className="min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-purple-700 animate-fadeIn">My Page</h1>
        {/* content */}
      </div>
    </PurpleThemeWrapper>
  );
}
```

### Converting Cards

**Before:**
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

**After:**
```tsx
import { PurpleCard } from '~/components/ui';

<PurpleCard hover glow className="p-6">
  <h3 className="text-purple-700">Title</h3>
  <p>Content</p>
</PurpleCard>
```

## Troubleshooting

### Animations Not Working
- Ensure `app.css` is imported in your root layout
- Check that animation classes are spelled correctly
- Verify no conflicting CSS is overriding animations

### Bubbles Not Showing
- Check that `overflow: hidden` is set on parent container
- Ensure `position: relative` is on the wrapper
- Verify z-index layering (bubbles should be behind content)

### Performance Issues
- Reduce bubble density to 'low'
- Limit animations to above-the-fold content
- Use `transform` and `opacity` for animations (GPU-accelerated)

## Future Enhancements

Potential additions to the theme system:

1. **Dark Mode Support**: Purple theme variants for dark mode
2. **Theme Customization**: Allow users to adjust purple intensity
3. **More Shapes**: Additional bubble shapes (stars, hexagons)
4. **Interactive Bubbles**: Bubbles that respond to mouse movement
5. **Particle Effects**: Confetti or sparkle effects for celebrations
6. **Seasonal Themes**: Holiday-themed color variations

## Resources

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [React Animation Best Practices](https://reactjs.org/docs/animation.html)

---

**Happy Theming! 💜✨**
