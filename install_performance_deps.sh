#!/bin/bash

# Install performance monitoring dependencies

cd "$(dirname "$0")"

echo "Installing web-vitals for performance tracking..."
npm install web-vitals

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "Installed:"
echo "  - web-vitals (Core Web Vitals tracking)"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Check browser console for Web Vitals metrics"
echo "  3. Monitor LCP, FID, CLS, FCP, TTFB, INP"
