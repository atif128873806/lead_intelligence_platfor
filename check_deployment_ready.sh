#!/bin/bash

# Pre-Deployment Checklist Script
# Run this before deploying to make sure everything is ready

echo "=================================="
echo "🚀 DEPLOYMENT READINESS CHECKER"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((CHECKS_FAILED++))
    fi
}

echo "Checking project structure..."
echo ""

# Check backend files
[ -f "backend/main.py" ]
check $? "backend/main.py exists"

[ -f "backend/requirements.txt" ]
check $? "backend/requirements.txt exists"

[ -f "backend/railway.toml" ]
check $? "backend/railway.toml exists"

echo ""
echo "Checking frontend files..."
echo ""

# Check frontend files
[ -f "frontend/package.json" ]
check $? "frontend/package.json exists"

[ -f "frontend/vite.config.ts" ]
check $? "frontend/vite.config.ts exists"

[ -f "frontend/vercel.json" ]
check $? "frontend/vercel.json exists"

[ -f "frontend/src/App.tsx" ]
check $? "frontend/src/App.tsx exists"

echo ""
echo "Checking Git..."
echo ""

# Check git
if [ -d ".git" ]; then
    check 0 "Git repository initialized"
    
    # Check if remote exists
    git remote -v | grep origin > /dev/null 2>&1
    check $? "Git remote 'origin' configured"
else
    check 1 "Git repository initialized"
fi

echo ""
echo "Testing local setup..."
echo ""

# Check if Python is installed
command -v python3 > /dev/null 2>&1
check $? "Python 3 installed"

# Check if Node is installed
command -v node > /dev/null 2>&1
check $? "Node.js installed"

# Check if npm is installed
command -v npm > /dev/null 2>&1
check $? "npm installed"

echo ""
echo "=================================="
echo "RESULTS:"
echo "=================================="
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ You're ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push code to GitHub"
    echo "2. Deploy backend to Railway"
    echo "3. Deploy frontend to Vercel"
    echo ""
    echo "Follow DEPLOY_NOW.md for detailed instructions"
else
    echo -e "${YELLOW}⚠ Fix the failed checks before deploying${NC}"
    echo ""
    echo "Missing files? Download them from the outputs folder"
fi

echo ""
