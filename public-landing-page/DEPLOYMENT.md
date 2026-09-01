# CIVIC1.1 - GitHub Pages Deployment Guide

## Prerequisites
- Git installed on your system
- Node.js and npm installed
- GitHub account (mayu1344)

## Deployment Steps

### 1. Initialize and Push to GitHub

```bash
cd civi1.1
git init
git add .
git commit -m "Initial commit: CIVIC1.1 project"
git branch -M main
git remote add origin https://github.com/mayu1344/CIVIC1.1.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository: https://github.com/mayu1344/CIVIC1.1
2. Click on "Settings" tab
3. Navigate to "Pages" in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. Save the settings

### 3. Automatic Deployment

The GitHub Actions workflow will automatically:
- Build your Next.js project
- Deploy to GitHub Pages
- Your site will be available at: https://mayu1344.github.io/CIVIC1.1

### 4. Manual Deployment (Alternative)

If you prefer manual deployment using gh-pages:

```bash
npm install
npm run deploy
```

## Project Configuration

- **Homepage**: https://mayu1344.github.io/CIVIC1.1
- **Base Path**: /CIVIC1.1
- **Output**: Static export
- **Images**: Unoptimized for static hosting

## Troubleshooting

### Build Errors
- Check `build_err.log` for details
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf .next out`

### 404 Errors
- Verify basePath in `next.config.mjs` matches repository name
- Check GitHub Pages source is set to "GitHub Actions"

### Updates Not Showing
- Clear browser cache
- Wait a few minutes for GitHub Pages to update
- Check Actions tab for deployment status

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to view locally.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet (Maps)
- Recharts (Analytics)
- Framer Motion (Animations)
