#!/bin/bash

# Script to apply purple theme to auth pages

AUTH_PAGES=(
  "app/routes/_auth/signup.tsx"
  "app/routes/_auth/forgot-password.tsx"
  "app/routes/_auth/reset-password.tsx"
  "app/routes/_auth/verify-email.tsx"
  "app/routes/_auth/verify-otp.tsx"
  "app/routes/_auth/change-password.tsx"
)

for file in "${AUTH_PAGES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Add imports if not present
    if ! grep -q "PurpleThemeWrapper" "$file"; then
      # Find the last import line
      last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      if [ -n "$last_import" ]; then
        sed -i '' "${last_import}a\\
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';\\
import { PurpleCard } from '~/components/ui/PurpleCard';
" "$file"
        echo "  ✓ Added imports"
      fi
    fi
    
    echo "  ✓ Done"
  fi
done

echo "Theme imports added to auth pages!"
