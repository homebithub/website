# Modern Loading Component Documentation

## Overview
The new Loading component is a highly customizable, modern, and stylish loading indicator with multiple animation variants, sizes, colors, and dark mode support. It provides a much better user experience compared to the basic spinner.

## Features

### 🎨 **Multiple Animation Variants**
- **Spinner**: Classic spinning animation
- **Dots**: Bouncing dots animation
- **Pulse**: Pulsing circle animation
- **Wave**: Wave-like animation
- **Bounce**: Bouncing circle animation
- **Ring**: Ringing circle animation

### 📏 **Size Options**
- **Small (sm)**: 24x24px
- **Medium (md)**: 48x48px (default)
- **Large (lg)**: 64x64px
- **Extra Large (xl)**: 96x96px

### 🌈 **Color Themes**
- **Primary**: Brand primary color
- **Secondary**: Neutral gray
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

### 🌙 **Dark Mode Support**
- Automatic dark mode detection
- Optimized colors for both light and dark themes
- Smooth transitions between themes

### ✨ **Enhanced Visual Elements**
- Animated background patterns
- Floating decorative elements
- Progress bar indicator
- Brand logo integration
- Subtle dot indicators

## Usage

### Basic Usage
```tsx
import { Loading } from "~/components/Loading";

// Default loading (spinner, medium size, primary color)
<Loading />

// With custom text
<Loading text="Please wait..." />

// Full screen loading
<Loading text="Loading your dashboard..." fullScreen={true} />
```

### Customized Loading
```tsx
// Different animation variants
<Loading variant="dots" text="Processing..." />
<Loading variant="pulse" text="Saving..." />
<Loading variant="wave" text="Uploading..." />
<Loading variant="bounce" text="Connecting..." />
<Loading variant="ring" text="Verifying..." />

// Different sizes
<Loading size="sm" text="Quick load..." />
<Loading size="lg" text="Loading..." />
<Loading size="xl" text="Please wait..." />

// Different colors
<Loading color="success" text="Success!" />
<Loading color="warning" text="Warning..." />
<Loading color="error" text="Error occurred..." />
<Loading color="secondary" text="Loading..." />
```

### Individual Components
For specific use cases, you can import individual animation components:

```tsx
import { Spinner, Dots, Pulse, Wave, Bounce, Ring } from "~/components/Loading";

// Use individual components (no full screen, no text)
<Spinner size="lg" color="primary" />
<Dots size="md" color="success" />
<Pulse size="sm" color="warning" />
<Wave size="xl" color="error" />
<Bounce size="lg" color="secondary" />
<Ring size="md" color="primary" />
```

### Inline Loading
```tsx
// For inline use (not full screen)
<Loading 
  variant="dots" 
  size="sm" 
  color="primary" 
  text="Loading..." 
  fullScreen={false} 
  className="my-4"
/>
```

## Props

### LoadingProps Interface
```typescript
interface LoadingProps {
  text?: string;                    // Loading text (default: "Loading...")
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'bounce' | 'ring';  // Animation type
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Size of the animation
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';    // Color theme
  fullScreen?: boolean;             // Full screen overlay (default: true)
  className?: string;               // Additional CSS classes
}
```

## Animation Details

### 1. Spinner
- **Type**: Rotating border animation
- **Best for**: General loading states
- **Animation**: Continuous 360° rotation

### 2. Dots
- **Type**: Three bouncing dots
- **Best for**: Processing or thinking states
- **Animation**: Sequential bounce with delays

### 3. Pulse
- **Type**: Pulsing circle
- **Best for**: Background processes
- **Animation**: Opacity pulsing

### 4. Wave
- **Type**: Five vertical bars
- **Best for**: Audio or data loading
- **Animation**: Sequential height changes

### 5. Bounce
- **Type**: Bouncing circle
- **Best for**: Playful or casual loading
- **Animation**: Up and down bouncing

### 6. Ring
- **Type**: Expanding ring
- **Best for**: Notifications or alerts
- **Animation**: Ping effect with ring expansion

## Visual Enhancements

### Background Pattern
- Animated gradient circles in background
- Subtle opacity and positioning
- Creates depth and visual interest

### Floating Elements
- Small decorative dots
- Staggered animation delays
- Adds life to the loading state

### Progress Indicator
- Animated progress bar
- Shows loading progress visually
- Customizable width and animation

### Brand Integration
- HomeXpert logo prominently displayed
- Maintains brand consistency
- Professional appearance

## Dark Mode Features

### Automatic Adaptation
- Detects system dark mode preference
- Adjusts colors automatically
- Smooth transitions between themes

### Optimized Colors
- **Light Mode**: Bright, vibrant colors
- **Dark Mode**: Softer, muted colors
- **Contrast**: Ensures readability in both modes

## Performance Considerations

### Optimized Animations
- CSS-based animations for performance
- Hardware acceleration where possible
- Minimal JavaScript overhead

### Memory Management
- Clean component unmounting
- No memory leaks from animations
- Efficient re-rendering

## Accessibility

### Screen Reader Support
- Proper ARIA labels
- Loading state announcements
- Keyboard navigation support

### Visual Accessibility
- High contrast ratios
- Clear visual indicators
- Non-reliant on color alone

## Examples in Application

### Authentication Loading
```tsx
// Login page loading
<Loading 
  variant="spinner" 
  text="Checking authentication..." 
  color="primary" 
/>

// Signup processing
<Loading 
  variant="dots" 
  text="Creating your account..." 
  color="success" 
/>
```

### Dashboard Loading
```tsx
// Dashboard initialization
<Loading 
  variant="pulse" 
  text="Loading your dashboard..." 
  color="primary" 
  size="lg" 
/>
```

### Form Submission
```tsx
// Form processing
<Loading 
  variant="wave" 
  text="Saving changes..." 
  color="success" 
  fullScreen={false} 
/>
```

### Error States
```tsx
// Error loading
<Loading 
  variant="ring" 
  text="Something went wrong..." 
  color="error" 
/>
```

## Migration from Old Component

### Before (Old Component)
```tsx
<Loading text="Loading..." />
```

### After (New Component)
```tsx
// Same basic usage (backward compatible)
<Loading text="Loading..." />

// Enhanced usage
<Loading 
  variant="dots" 
  text="Loading..." 
  size="lg" 
  color="primary" 
/>
```

## Demo Page

Visit `/loading-demo` to see all variants in action with live customization options.

## Best Practices

### 1. Choose Appropriate Variants
- **Spinner**: General loading
- **Dots**: Processing/thinking
- **Pulse**: Background tasks
- **Wave**: Data loading
- **Bounce**: Casual contexts
- **Ring**: Notifications

### 2. Use Meaningful Text
- Be specific about what's loading
- Keep text concise but informative
- Use action-oriented language

### 3. Consider Context
- **Full screen**: Major page transitions
- **Inline**: Small operations
- **Colors**: Match the context (success, warning, error)

### 4. Performance
- Use appropriate sizes for context
- Avoid unnecessary re-renders
- Consider loading time expectations

## Future Enhancements

### Planned Features
1. **Progress Integration**: Real progress percentage
2. **Custom Animations**: User-defined animations
3. **Sound Effects**: Optional audio feedback
4. **Haptic Feedback**: Mobile vibration support
5. **Animation Speed**: Customizable timing

### Potential Improvements
1. **Skeleton Loading**: Content placeholders
2. **Smooth Transitions**: Between loading states
3. **Loading Queues**: Multiple operations
4. **Cancel Support**: User-initiated cancellation
5. **Analytics**: Loading time tracking 