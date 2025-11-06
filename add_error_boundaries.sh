#!/bin/bash

# Script to add ErrorBoundary export to all route files

cd "$(dirname "$0")"

echo "🔧 Adding ErrorBoundary to all route files..."
echo ""

# List of route files
routes=(
  "app/routes/_index.tsx"
  "app/routes/_auth/login.tsx"
  "app/routes/_auth/signup.tsx"
  "app/routes/_auth/forgot-password.tsx"
  "app/routes/_auth/reset-password.tsx"
  "app/routes/_auth/verify-email.tsx"
  "app/routes/_auth/verify-otp.tsx"
  "app/routes/_auth/change-password.tsx"
  "app/routes/household/_layout.tsx"
  "app/routes/household/profile.tsx"
  "app/routes/household/employment.tsx"
  "app/routes/household/househelp/profile.tsx"
  "app/routes/household/househelp/contact.tsx"
  "app/routes/househelp/profile.tsx"
  "app/routes/househelp/find-households.tsx"
  "app/routes/bureau/_layout.tsx"
  "app/routes/bureau/home.tsx"
  "app/routes/bureau/profile.tsx"
  "app/routes/bureau/househelps.tsx"
  "app/routes/bureau/commercials.tsx"
  "app/routes/profile-setup/household.tsx"
  "app/routes/profile-setup/househelp.tsx"
  "app/routes/public/about.tsx"
  "app/routes/public/contact.tsx"
  "app/routes/public/services.tsx"
  "app/routes/public/pricing.tsx"
  "app/routes/public/privacy.tsx"
  "app/routes/public/terms.tsx"
  "app/routes/public/cookies.tsx"
  "app/routes/profile.tsx"
  "app/routes/settings.tsx"
)

count=0
skipped=0

for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    # Check if ErrorBoundary export already exists
    if grep -q "export.*ErrorBoundary" "$route"; then
      echo "⏭️  Skipped: $route (already has ErrorBoundary)"
      ((skipped++))
    else
      # Add ErrorBoundary export at the end of the file
      echo "" >> "$route"
      echo "// Error boundary for better error handling" >> "$route"
      echo "export { ErrorBoundary } from \"~/components/ErrorBoundary\";" >> "$route"
      echo "✅ Added: $route"
      ((count++))
    fi
  else
    echo "❌ Not found: $route"
  fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Added ErrorBoundary: $count files"
echo "  ⏭️  Skipped (already has): $skipped files"
echo ""
echo "🎉 Done! All routes now have error boundaries."
echo ""
echo "Next steps:"
echo "  1. Test error handling by navigating to routes"
echo "  2. Trigger an error to see ErrorBoundary in action"
echo "  3. Check that error pages display correctly"
