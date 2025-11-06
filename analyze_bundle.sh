#!/bin/bash

# Bundle Analysis Script
# Analyzes the production bundle size and identifies optimization opportunities

cd "$(dirname "$0")"

echo "🔍 Analyzing bundle size..."
echo ""

# Build for production
echo "📦 Building for production..."
npm run build

echo ""
echo "📊 Bundle Analysis Results:"
echo "================================"
echo ""

# Check if build directory exists
if [ ! -d "build/client" ]; then
    echo "❌ Build directory not found. Build may have failed."
    exit 1
fi

# Analyze JavaScript bundles
echo "📄 JavaScript Bundles:"
echo "-------------------"
find build/client -name "*.js" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr

echo ""
echo "🎨 CSS Bundles:"
echo "-------------------"
find build/client -name "*.css" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr

echo ""
echo "📈 Total Bundle Size:"
echo "-------------------"
du -sh build/client

echo ""
echo "💡 Optimization Tips:"
echo "-------------------"
echo "1. Look for large bundles (>500KB)"
echo "2. Consider code splitting for heavy components"
echo "3. Use dynamic imports for rarely-used features"
echo "4. Check for duplicate dependencies"
echo "5. Remove unused dependencies from package.json"

echo ""
echo "🔧 To reduce bundle size:"
echo "-------------------"
echo "- Use lazyLoad() for heavy components (charts, editors, etc.)"
echo "- Add 'prefetch=\"intent\"' to navigation links"
echo "- Remove unused npm packages"
echo "- Use tree shaking (already enabled in Vite)"

echo ""
echo "✅ Analysis complete!"
