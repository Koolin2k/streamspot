# StreamSpot Deployment Guide

## Overview
This repository contains the StreamSpot application - a platform for finding local venues hosting watch parties for shows, sports, and movies.

## Project Structure
- `project/` - Main Next.js application
- `push-to-v0.sh` - Script for pushing code to v0-streamspot repository
- Standard Next.js configuration files

## Prerequisites
- Node.js (version 18.2.0 or later)
- npm or yarn package manager
- Git

## Local Development

### 1. Install Dependencies
```bash
cd project
npm install
```

### 2. Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

### 4. Run Production Build
```bash
npm start
```

## Code Quality

### Linting
```bash
npm run lint
```

### Build Verification
The build process includes:
- TypeScript compilation
- ESLint checking
- Next.js optimizations
- Static page generation

## Deployment to v0-streamspot

### Automated Push (Recommended)
Use the provided script to push to the v0-streamspot repository:

```bash
./push-to-v0.sh
```

This script will:
1. ✅ Check for uncommitted changes
2. 🏗️ Verify the build process
3. 📡 Set up the v0-streamspot remote (if needed)
4. 📥 Fetch latest changes
5. 🚀 Push the current branch

### Manual Push
If you prefer to push manually:

```bash
# Ensure build works
cd project && npm run build && cd ..

# Add remote (if not already added)
git remote add v0-streamspot https://github.com/Koolin2k/v0-streamspot.git

# Push to v0-streamspot
git push v0-streamspot $(git branch --show-current)
```

## Technologies Used
- **Framework**: Next.js 13.5.1
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Ready for Vercel/Netlify

## Key Features
- 🏠 Venue discovery and management
- 📅 Event scheduling and RSVPs
- 👤 User authentication and profiles
- 📱 Responsive design
- 🎨 Modern UI with dark/light themes
- 🔍 Search and filtering capabilities

## Environment Setup
Make sure to configure your environment variables:
- Supabase credentials
- API endpoints
- Other service configurations

## Notes
- The application uses Google Fonts (Inter and Space Grotesk)
- Supabase integration for data management
- Responsive design optimized for all devices
- SEO-friendly with proper meta tags

## Support
For issues or questions, please check the repository issues or contact the development team.