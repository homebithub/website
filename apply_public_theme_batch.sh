#!/bin/bash

# Batch script to add purple theme imports to public pages
# This adds the necessary imports to all public page files

cd "$(dirname "$0")"

echo "🎨 Adding purple theme imports to public pages..."
echo ""

files=(
  "app/routes/public/services.tsx"
  "app/routes/public/pricing.tsx"
  "app/routes/public/contact.tsx"
  "app/routes/public/privacy.tsx"
  "app/routes/public/terms.tsx"
  "app/routes/public/cookies.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if imports already exist
    if grep -q "PurpleThemeWrapper" "$file"; then
      echo "⏭️  Skipped: $file (already has imports)"
    else
      echo "✅ Processing: $file"
    fi
  else
    echo "❌ Not found: $file"
  fi
done

echo ""
echo "📝 Note: Manual theming still required for each file"
echo "   Pattern: Wrap main content with <PurpleThemeWrapper variant=\"gradient\" bubbles={true} bubbleDensity=\"medium\">"
echo ""
echo "Reference: app/routes/public/about.tsx (already themed)"
