#!/bin/bash

# Inbox API Migration Script
# This script updates the frontend to use the notifications service for inbox functionality

set -e

echo "🚀 Starting Inbox API Migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backup directory
BACKUP_DIR="./backup-$(date +%Y%m%d-%H%M%S)"

echo "📦 Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp app/config/api.ts "$BACKUP_DIR/" 2>/dev/null || true
cp app/routes/inbox.tsx "$BACKUP_DIR/" 2>/dev/null || true
cp app/root.tsx "$BACKUP_DIR/" 2>/dev/null || true
cp .env.development "$BACKUP_DIR/" 2>/dev/null || true
cp .env.production "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Backup created"
echo ""

# Update .env.development
echo "📝 Updating .env.development..."
if [ -f .env.development ]; then
  if ! grep -q "NOTIFICATIONS_API_BASE_URL" .env.development; then
    echo "NOTIFICATIONS_API_BASE_URL=http://localhost:8081/notifications" >> .env.development
    echo -e "${GREEN}✓${NC} Added NOTIFICATIONS_API_BASE_URL to .env.development"
  else
    echo -e "${YELLOW}⚠${NC}  NOTIFICATIONS_API_BASE_URL already exists in .env.development"
  fi
else
  echo -e "${YELLOW}⚠${NC}  .env.development not found, skipping"
fi
echo ""

# Update .env.production
echo "📝 Updating .env.production..."
if [ -f .env.production ]; then
  if ! grep -q "NOTIFICATIONS_API_BASE_URL" .env.production; then
    echo "NOTIFICATIONS_API_BASE_URL=https://api.homebit.co.ke/notifications" >> .env.production
    echo -e "${GREEN}✓${NC} Added NOTIFICATIONS_API_BASE_URL to .env.production"
  else
    echo -e "${YELLOW}⚠${NC}  NOTIFICATIONS_API_BASE_URL already exists in .env.production"
  fi
else
  echo -e "${YELLOW}⚠${NC}  .env.production not found, skipping"
fi
echo ""

echo "✅ Migration preparation complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review the changes in app/config/api.ts"
echo "  2. Update app/routes/inbox.tsx to use NOTIFICATIONS_BASE"
echo "  3. Update app/root.tsx to include NOTIFICATIONS_API_BASE_URL in ENV"
echo "  4. Test locally with both services running"
echo "  5. Deploy to staging and test"
echo "  6. Deploy to production"
echo ""
echo "📚 See INBOX_FRONTEND_MIGRATION.md for detailed instructions"
echo ""
echo "💾 Backup saved in: $BACKUP_DIR"
echo ""
echo -e "${GREEN}Done!${NC}"
