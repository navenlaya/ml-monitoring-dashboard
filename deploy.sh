#!/bin/bash

# ML Monitoring Dashboard - Deployment Script
# This script helps you deploy to Render.com

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 ML Monitoring Dashboard - Deployment Helper${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "api" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Please run this script from the ml-monitoring-dashboard root directory${NC}"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not found. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  No remote origin found.${NC}"
    echo -e "${BLUE}📝 Please add your GitHub repository as remote origin:${NC}"
    echo -e "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo -e ""
    echo -e "${BLUE}📝 Then run this script again.${NC}"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes.${NC}"
    echo -e "${BLUE}📝 Please commit your changes first:${NC}"
    echo -e "   git add ."
    echo -e "   git commit -m 'Prepare for deployment'"
    echo -e ""
    echo -e "${BLUE}📝 Then run this script again.${NC}"
    exit 1
fi

# Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

echo -e "\n${GREEN}🎉 Ready for deployment!${NC}"
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo -e "1. Go to ${BLUE}https://render.com${NC}"
echo -e "2. Sign up/Login with GitHub"
echo -e "3. Click 'New +' → 'Web Service'"
echo -e "4. Connect your repository"
echo -e "5. Use the settings from ${BLUE}DEPLOYMENT_GUIDE.md${NC}"
echo -e ""
echo -e "${BLUE}🚀 Or use the auto-deploy with render.yaml:${NC}"
echo -e "   Just push this file and Render will auto-detect it!"
echo -e ""
echo -e "${GREEN}💡 Pro tip: Deploy both backend and frontend for a complete demo${NC}"
echo -e "${GREEN}💡 Your recruiters will love seeing a live, working project!${NC}"
