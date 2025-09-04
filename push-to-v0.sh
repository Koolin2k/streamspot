#!/bin/bash

# Script to push latest code to v0-streamspot repository
# This script should be run after ensuring all tests pass and the build is successful

echo "🚀 Preparing to push code to v0-streamspot repository..."

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes. Please commit them first."
    echo "Uncommitted files:"
    git status --porcelain
    exit 1
fi

# Verify the build works
echo "🏗️  Testing build process..."
cd project && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before pushing."
    exit 1
fi
cd ..

# Check if v0-streamspot remote exists
if ! git remote | grep -q "v0-streamspot"; then
    echo "📡 Adding v0-streamspot remote..."
    git remote add v0-streamspot https://github.com/Koolin2k/v0-streamspot.git
fi

# Fetch latest from v0-streamspot to avoid conflicts
echo "📥 Fetching latest from v0-streamspot..."
git fetch v0-streamspot

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Push to v0-streamspot
echo "🚀 Pushing $CURRENT_BRANCH to v0-streamspot..."
git push v0-streamspot $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to v0-streamspot!"
    echo "🔗 You can view the repository at: https://github.com/Koolin2k/v0-streamspot"
else
    echo "❌ Failed to push to v0-streamspot. Please check your permissions and try again."
    exit 1
fi