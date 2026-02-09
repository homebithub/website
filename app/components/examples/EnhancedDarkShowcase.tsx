import React from 'react';

/**
 * Enhanced Dark Theme Showcase Component
 * 
 * This component demonstrates all the new dark theme features.
 * Use this as a reference for implementing the enhanced dark theme
 * in your components.
 */

export function EnhancedDarkShowcase() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Gradient Text Example */}
        <section className="text-center space-y-4">
          <h1 className="gradient-text text-5xl sm:text-6xl font-bold">
            Enhanced Dark Theme
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Kiro-level quality with glowing effects
          </p>
        </section>

        {/* Glowing Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Glowing Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="
              glow-button 
              bg-gradient-to-r from-purple-600 to-pink-600
              dark:shadow-glow-sm hover:dark:shadow-glow-md
              px-6 py-1.5 rounded-xl text-white font-bold
              transition-all duration-300 hover:scale-105
            ">
              Primary Glow
            </button>
            
            <button className="
              px-6 py-1.5 rounded-xl font-bold
              bg-white dark:bg-[#13131a]
              text-purple-600 dark:text-purple-400
              border-2 border-purple-600 dark:border-purple-500/50
              dark:shadow-glow-sm hover:dark:shadow-glow-md
              transition-all duration-300 hover:scale-105
            ">
              Secondary Glow
            </button>
            
            <button className="
              neon-border
              px-6 py-1.5 rounded-xl font-bold
              bg-transparent
              text-purple-600 dark:text-purple-400
              transition-all duration-300 hover:scale-105
              hover:bg-purple-600/10
            ">
              Neon Border
            </button>
          </div>
        </section>

        {/* Dark Cards */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enhanced Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dark Card */}
            <div className="dark-card">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Dark Card
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hover me to see the purple glow effect!
              </p>
            </div>

            {/* Glass Card */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Glass Card
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Frosted glass effect with blur.
              </p>
            </div>

            {/* Gradient Background Card */}
            <div className="gradient-bg dark-card">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Animated Gradient
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Watch the subtle gradient shift!
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid with Glow */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Feature Grid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="
                  dark-card
                  group cursor-pointer
                "
              >
                <div className="
                  w-12 h-12 rounded-lg 
                  bg-gradient-to-br from-purple-600 to-pink-600
                  dark:shadow-glow-sm
                  group-hover:dark:shadow-glow-md
                  flex items-center justify-center
                  mb-4
                  transition-all duration-300
                  group-hover:scale-110
                ">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Gradient Text Examples */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gradient Text
          </h2>
          <div className="space-y-4">
            <h3 className="gradient-text text-4xl font-bold">
              Large Gradient Heading
            </h3>
            <p className="gradient-text text-2xl font-semibold">
              Medium gradient text
            </p>
            <span className="gradient-text text-lg font-medium">
              Small gradient accent
            </span>
          </div>
        </section>

        {/* Glassmorphic Panel */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Glassmorphic Panel
          </h2>
          <div className="glass-card neon-border p-8 space-y-4">
            <h3 className="gradient-text text-2xl font-bold">
              Premium Panel
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Combining glass card with neon border creates a premium effect.
            </p>
            <div className="flex gap-3">
              <button className="
                glow-button
                bg-gradient-to-r from-purple-600 to-pink-600
                dark:shadow-glow-sm hover:dark:shadow-glow-md
                px-4 py-1 rounded-xl text-white text-sm font-bold
                transition-all duration-300
              ">
                Action
              </button>
              <button className="
                px-4 py-1 rounded-xl text-sm font-bold
                bg-white/10 hover:bg-white/20
                text-gray-900 dark:text-white
                backdrop-blur-sm
                transition-all duration-300
              ">
                Cancel
              </button>
            </div>
          </div>
        </section>

        {/* Animated Elements */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Animated Elements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="dark-card animate-pulse-slow">
              <div className="w-12 h-12 rounded-full bg-purple-600 dark:shadow-glow-md mx-auto mb-2" />
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Pulse Slow
              </p>
            </div>
            
            <div className="dark-card">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 dark:shadow-glow-md animate-glow mx-auto mb-2" />
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Glow Animation
              </p>
            </div>

            <div className="dark-card gradient-bg">
              <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-2" />
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Gradient Shift
              </p>
            </div>

            <div className="dark-card hover:dark:shadow-glow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-purple-600 mx-auto mb-2" />
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Hover Glow
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette Display */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[#0a0a0f] border border-purple-500/30" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                #0a0a0f
              </p>
              <p className="text-xs text-gray-500">Main BG</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[#13131a] border border-purple-500/30" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                #13131a
              </p>
              <p className="text-xs text-gray-500">Cards</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-glow-md" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                Gradient
              </p>
              <p className="text-xs text-gray-500">Accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg border-2 border-purple-500 shadow-neon" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                Neon
              </p>
              <p className="text-xs text-gray-500">Borders</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Sample data
const features = [
  {
    icon: '✨',
    title: 'Glowing Effects',
    description: 'Beautiful purple glows that make elements pop'
  },
  {
    icon: '🎨',
    title: 'Gradient Text',
    description: 'Eye-catching text with smooth gradients'
  },
  {
    icon: '💎',
    title: 'Glassmorphism',
    description: 'Frosted glass effects with blur'
  },
  {
    icon: '🌈',
    title: 'Animated Orbs',
    description: 'Subtle background animations'
  },
  {
    icon: '⚡',
    title: 'Smooth Transitions',
    description: 'Buttery smooth 60fps animations'
  },
  {
    icon: '🎯',
    title: 'Deep Blacks',
    description: 'Rich, true blacks for better contrast'
  },
];

export default EnhancedDarkShowcase;

