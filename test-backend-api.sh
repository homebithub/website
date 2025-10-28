#!/bin/bash

# Backend API Test Script for Househelp Profile Setup
# This script tests all the new fields added in Phases 1-3

# CONFIGURATION
API_BASE_URL="http://localhost:8000"  # Change this to your backend URL
TOKEN="YOUR_TOKEN_HERE"  # Replace with actual token

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Backend API Verification Test"
echo "========================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET \
            "$API_BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
        echo -e "${GREEN}✓ SUCCESS (HTTP $http_code)${NC}"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
    echo "---"
    echo ""
}

# Test 1: Get current profile
test_endpoint \
    "Get Househelp Profile" \
    "GET" \
    "/api/v1/househelps/me/fields" \
    ""

# Test 2: Update Service Type (NanyType)
test_endpoint \
    "Update Service Type & Availability" \
    "PATCH" \
    "/api/v1/househelps/me/fields" \
    '{
        "updates": {
            "offers_live_in": true,
            "offers_day_worker": false,
            "off_days": "Sunday,Monday",
            "availability_schedule": "{\"monday\":{\"morning\":true,\"afternoon\":false,\"evening\":true},\"tuesday\":{\"morning\":true,\"afternoon\":true,\"evening\":false}}",
            "available_from": "2025-01-01"
        }
    }'

# Test 3: Update Certifications (Enhanced)
test_endpoint \
    "Update Certifications & Skills" \
    "PATCH" \
    "/api/v1/househelps/me/fields" \
    '{
        "updates": {
            "certifications": "I have a valid driving license,I have a First Aid certificate,CPR Certified,Food Safety Level 2",
            "can_help_with": "Cooking,Childcare,Elderly care,Gardening,Pet care,House cleaning"
        }
    }'

# Test 4: Update Work Environment Preferences
test_endpoint \
    "Update Work Environment Preferences" \
    "PATCH" \
    "/api/v1/househelps/me/fields" \
    '{
        "updates": {
            "preferred_household_size": "medium",
            "preferred_location_type": "urban",
            "preferred_family_type": "young_family",
            "work_environment_notes": "I prefer quiet households with a structured routine. I am comfortable with pets and children."
        }
    }'

# Test 5: Update References
test_endpoint \
    "Update References" \
    "PATCH" \
    "/api/v1/househelps/me/fields" \
    '{
        "updates": {
            "references": "[{\"name\":\"John Doe\",\"relationship\":\"Previous Employer\",\"phone\":\"0712345678\",\"email\":\"john@example.com\",\"duration\":\"2 years\"},{\"name\":\"Jane Smith\",\"relationship\":\"Supervisor\",\"phone\":\"0723456789\",\"email\":\"jane@example.com\",\"duration\":\"1 year\"}]"
        }
    }'

# Test 6: Update Background Check Consent
test_endpoint \
    "Update Background Check Consent" \
    "PATCH" \
    "/api/v1/househelps/me/fields" \
    '{
        "updates": {
            "background_check_consent": true
        }
    }'

# Test 7: Save Profile Setup Progress
test_endpoint \
    "Save Profile Setup Progress" \
    "POST" \
    "/api/v1/profile-setup-progress" \
    '{
        "profile_type": "househelp",
        "current_step": 5,
        "last_completed_step": 5,
        "completed_steps": [1, 2, 3, 4, 5],
        "step_id": "certifications",
        "time_spent_seconds": 120,
        "status": "in_progress",
        "skipped": false,
        "is_auto_save": false
    }'

# Test 8: Get profile again to verify all updates
test_endpoint \
    "Verify All Updates (Get Profile Again)" \
    "GET" \
    "/api/v1/househelps/me/fields" \
    ""

echo "========================================="
echo "Test Complete!"
echo "========================================="
echo ""
echo "Summary:"
echo "- Check if all tests passed (green checkmarks)"
echo "- Verify that GET request returns all new fields"
echo "- Verify that PATCH requests save correctly"
echo ""
echo "If any tests failed:"
echo "1. Check if backend is running"
echo "2. Verify TOKEN is correct"
echo "3. Check if database has new columns"
echo "4. Review backend logs for errors"
