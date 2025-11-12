# EAS Build Setup Guide for Recipe Book App

## 🚀 EAS Build Configuration Complete

### **Configuration Files Created:**

- ✅ `eas.json` - Build profiles configuration
- ✅ `app.json` - Already has project ID and owner info

---

## 📋 Prerequisites

### **1. Install EAS CLI**

```bash
npm install -g @expo/eas-cli
```

### **2. Login to Expo**

```bash
eas login
# Login with your Expo account
```

### **3. Verify Project Setup**

```bash
eas whoami
eas projects:list
```

---

## 🏗️ Build Commands

### **Development Build (For Testing)**

```bash
# Create development APK for testing
eas build --profile development --platform android

# Create development iOS build (if available)
eas build --profile development --platform ios
```

### **Preview Build (For Beta Testing)**

```bash
# Create preview APK for internal testing
eas build --profile preview --platform android

# Build for iOS
eas build --profile preview --platform ios
```

### **Production Build (For Store)**

```bash
# Create production APK for Google Play Store
eas build --profile production --platform android

# Create production iOS build for App Store
eas build --profile production --platform ios
```

### **Build All Platforms**

```bash
# Build for both platforms at once
eas build --profile production --platform all
```

---

## 📱 Build Profiles Explained

### **Development Build**

- **Purpose**: Testing new features during development
- **Features**:
  - Development client enabled
  - Internal distribution
  - Hot reloading support
  - Debugging enabled
- **Output**: APK for Android testing

### **Preview Build**

- **Purpose**: Beta testing with testers
- **Features**:
  - Production-like build
  - Internal distribution
  - Easier to share with testers
- **Output**: APK/IPA files for beta testing

### **Production Build**

- **Purpose**: App store submission
- **Features**:
  - Optimized for performance
  - Code minification
  - Production-ready
- **Output**: Store-ready APK/IPA files

---

## 🔧 Common EAS Commands

### **Check Build Status**

```bash
# List recent builds
eas build:list

# View specific build details
eas build:view [BUILD_ID]
```

### **Build Queue Management**

```bash
# Cancel a build
eas build:cancel [BUILD_ID]

# View build queue
eas build:list --limit 10
```

### **Build History**

```bash
# View all builds for the project
eas build:list

# Filter by platform
eas build:list --platform android
```

---

## 📦 Installation & Distribution

### **For Development/Preview Builds**

1. **Get Build Link**: EAS provides download URL after build completes
2. **Install on Device**:
   - Android: Download APK and install
   - iOS: Install via TestFlight or direct install

### **For Production Builds**

1. **Submit to Stores**:

   ```bash
   # Android (Google Play Store)
   eas submit --platform android

   # iOS (Apple App Store)
   eas submit --platform ios
   ```

2. **Manual Upload**: Download from EAS dashboard and upload manually

---

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

#### **Build Fails**

```bash
# Check build logs
eas build:view [BUILD_ID]

# Common fixes:
# 1. Clear npm cache: npm start -- --clear
# 2. Update dependencies: npm install
# 3. Check expo doctor: npx expo doctor
```

#### **Authentication Issues**

```bash
# Re-login to Expo
eas login

# Check account permissions
eas whoami
```

#### **Project Sync Issues**

```bash
# Pull latest project configuration
eas pull

# Push local changes
eas push
```

---

## 📋 Build Checklist

### **Before Building:**

- [ ] All Firebase configurations updated
- [ ] Environment variables set (if using)
- [ ] All dependencies installed (`npm install`)
- [ ] No TypeScript errors
- [ ] App runs in development mode

### **For Production:**

- [ ] Version number updated in `app.json`
- [ ] App icons and splash screens optimized
- [ ] Privacy policy and app description ready
- [ ] Store listing assets prepared
- [ ] Beta testing completed

---

## 🎯 Quick Start Commands

### **First Time Setup**

```bash
# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Login
eas login

# 3. Build for testing
eas build --profile development --platform android
```

### **Development Workflow**

```bash
# Make changes to code
# Test locally first
npm start

# When ready to test on device
eas build --profile development --platform android
```

### **Release Workflow**

```bash
# Update version in app.json
# Test with preview build first
eas build --profile preview --platform android

# When ready for store
eas build --profile production --platform android
eas submit --platform android
```

---

## 📊 Build Information

**Project ID**: `9cc91a9b-a489-46b8-af81-0155a6f9e540`
**Owner**: `school-mobile-projects`
**Platforms**: Android (APK), iOS (IPA)
**Build Types**: Development, Preview, Production

---

## 🚀 Ready to Build!

Your Recipe Book app is now configured for EAS builds. Start with:

```bash
# Test build (development)
eas build --profile development --platform android
```

The build will be available in your EAS dashboard after completion!
