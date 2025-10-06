#!/bin/bash

# Script to add API config imports to files that use API_ENDPOINTS or API_BASE_URL

for file in $(grep -l "API_ENDPOINTS\|API_BASE_URL" app/ -r --include="*.tsx" --include="*.ts" | grep -v "config/api.ts"); do
  # Check if import already exists
  if ! grep -q "from '~/config/api'" "$file" && ! grep -q 'from "~/config/api"' "$file"; then
    # Check what needs to be imported
    has_endpoints=$(grep -c "API_ENDPOINTS" "$file")
    has_base_url=$(grep -c "API_BASE_URL" "$file")
    
    # Build import statement
    if [ "$has_endpoints" -gt 0 ] && [ "$has_base_url" -gt 0 ]; then
      import_line="import { API_ENDPOINTS, API_BASE_URL } from '~/config/api';"
    elif [ "$has_endpoints" -gt 0 ]; then
      import_line="import { API_ENDPOINTS } from '~/config/api';"
    elif [ "$has_base_url" -gt 0 ]; then
      import_line="import { API_BASE_URL } from '~/config/api';"
    else
      continue
    fi
    
    # Add import after the first import statement or at the beginning
    if grep -q "^import" "$file"; then
      # Find the last import line and add after it
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      sed -i '' "${last_import_line}a\\
$import_line
" "$file"
    else
      # Add at the beginning
      sed -i '' "1i\\
$import_line
" "$file"
    fi
    
    echo "Added import to: $file"
  fi
done

echo "Done!"
