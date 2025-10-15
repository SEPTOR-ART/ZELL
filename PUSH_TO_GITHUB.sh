#!/bin/bash

# ZELL v2.0 - GitHub Push Script
# This script helps you push the ZELL project to GitHub

echo "========================================="
echo "  ZELL v2.0 - GitHub Push Helper"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Git repository not initialized!${NC}"
    echo "Run: git init"
    exit 1
fi

echo -e "${BLUE}Current git status:${NC}"
git status --short
echo ""

# Get GitHub username
echo -e "${YELLOW}Enter your GitHub username:${NC}"
read -p "Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}Error: GitHub username is required!${NC}"
    exit 1
fi

# Get repository name (default: zell)
echo ""
echo -e "${YELLOW}Enter repository name (default: zell):${NC}"
read -p "Repository name: " REPO_NAME
REPO_NAME=${REPO_NAME:-zell}

# Confirm repository URL
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
echo ""
echo -e "${BLUE}Repository URL will be:${NC}"
echo "$REPO_URL"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Have you created this repository on GitHub? (yes/no)${NC}"
read -p "Answer: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo -e "${YELLOW}Please create the repository first:${NC}"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Description: Modern offline file converter with Ribbon UI"
    echo "4. Choose Public or Private"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run this script again!"
    exit 0
fi

# Check if remote exists
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}Remote 'origin' already exists. Removing...${NC}"
    git remote remove origin
fi

# Add remote
echo ""
echo -e "${BLUE}Adding remote repository...${NC}"
git remote add origin "$REPO_URL"

# Rename branch to main (optional)
echo ""
echo -e "${BLUE}Renaming branch to 'main'...${NC}"
git branch -M main

# Push to GitHub
echo ""
echo -e "${BLUE}Pushing to GitHub...${NC}"
echo -e "${YELLOW}You may be prompted for GitHub credentials.${NC}"
echo ""

git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}  SUCCESS! 🎉${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${GREEN}Your ZELL project has been pushed to GitHub!${NC}"
    echo ""
    echo -e "${BLUE}Repository URL:${NC}"
    echo "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Visit your repository on GitHub"
    echo "2. Add topics/tags for discoverability"
    echo "3. Create a release (v2.0.0)"
    echo "4. Star your own repository! ⭐"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}  Push Failed! ❌${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    echo -e "${YELLOW}Common solutions:${NC}"
    echo "1. Verify the repository exists on GitHub"
    echo "2. Check your GitHub credentials"
    echo "3. Try using SSH instead: git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git"
    echo "4. Check GITHUB_SETUP.md for more help"
    echo ""
fi
