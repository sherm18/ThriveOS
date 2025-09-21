# 🚀 Sleep Quest - Web Deployment Guide

## Overview
Your Sleep Quest app is now configured for easy web deployment using Vercel. This guide will help you deploy and share your app with friends for testing.

## 📦 Prerequisites

- Node.js and npm installed
- Vercel account (free at [vercel.com](https://vercel.com))
- Git repository with your code

## 🌐 Deployment Steps

### Option 1: Deploy via Vercel Website (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Connect GitHub**: Click "New Project" and import your GitHub repository
3. **Configure Project**:
   - Framework: Select "Expo"
   - Build Command: `npm run build-web`
   - Output Directory: `dist`
   - Root Directory: `./` (leave empty)
4. **Deploy**: Click "Deploy" and wait for build to complete
5. **Get URL**: Copy your live URL (e.g., `https://sleep-quest-abc123.vercel.app`)

### Option 2: Deploy via Command Line

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - Visit the authentication URL provided
   - Complete login in browser

3. **Deploy**:
   ```bash
   npm run build-web
   vercel --prod
   ```

## 🔄 Redeploying After Changes

### Automatic Redeployment (Recommended)
Once connected to GitHub, Vercel automatically redeploys when you:
1. Make changes to your code
2. Commit changes: `git add . && git commit -m "your changes"`
3. Push to GitHub: `git push origin main`
4. Vercel automatically rebuilds and deploys

### Manual Redeployment
```bash
# Make your changes, then:
npm run build-web
vercel --prod
```

## 📱 Mobile & Desktop Optimization

The app is configured for responsive design:
- **Mobile**: Touch-friendly interface, optimized for phones
- **Tablet**: Adaptive layout for medium screens
- **Desktop**: Full functionality with mouse/keyboard support
- **PWA Features**: Can be "installed" on phones like a native app

## 🧪 Testing Your Deployment

### Before Sharing
1. **Test All Features**:
   - Sleep entry logging with date picker
   - Badge system and achievement unlocking
   - Progress charts (weekly/monthly views)
   - Friends leaderboard
   - Sleep history (list and calendar views)

2. **Test Responsiveness**:
   - Open on phone browser
   - Try tablet/iPad
   - Test on desktop computer
   - Check different screen orientations

3. **Performance Check**:
   - App loads quickly
   - Smooth scrolling and transitions
   - Charts render properly
   - Data persists between sessions

### Sharing with Friends

Send your friends the Vercel URL with these instructions:

```
🌙 Hey! Try my Sleep Quest app:
[YOUR_VERCEL_URL]

What to test:
✅ Log a sleep entry (any date)
✅ Check the badge collection
✅ View progress charts
✅ See the friends leaderboard
✅ Try on your phone & computer

It's like a game for better sleep habits! 😴
```

## 🛠 Configuration Files

The following files configure your deployment:

- **`vercel.json`**: Vercel deployment settings
- **`app.json`**: Expo web configuration with PWA settings
- **`package.json`**: Build scripts and dependencies

## 🔧 Troubleshooting

### Common Issues

**Build Fails**:
```bash
npm run lint
npm run build-web
```

**Charts Not Loading**:
- Ensure `react-native-svg` is properly installed
- Check browser console for errors

**Date Picker Issues on Web**:
- Uses native HTML date inputs on web
- Fallback provided for unsupported browsers

**Badge System Not Working**:
- Check that sleep entries are being saved
- Badges calculate based on actual data patterns

### Getting Help

1. Check Vercel deployment logs
2. Test locally first: `npm run web`
3. Check browser developer console for errors
4. Ensure all dependencies are installed

## 📊 Features Available on Web

✅ **Full Feature Parity**:
- Sleep entry logging with date picker
- Badge achievement system (10 badges)
- Progress charts and analytics
- Friends leaderboard
- Sleep history management
- Responsive design for all devices
- PWA capabilities (installable)
- Real-time badge notifications

## 🎯 Performance Optimizations

- Static site generation for fast loading
- Optimized bundle splitting
- Cached assets and resources
- Responsive images and icons
- Progressive Web App features

## 🔒 Security

- HTTPS by default on Vercel
- Content Security Policy headers
- XSS protection enabled
- No sensitive data exposure

---

**Ready to deploy?** Follow the steps above and start sharing your Sleep Quest app with friends! 🚀

For questions or issues, check the Vercel documentation or create an issue in your GitHub repository.