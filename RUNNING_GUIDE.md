# 🚀 How to Run Recipe Book Mobile App

This guide will help you run the Recipe Book Mobile App with all the new UI/UX enhancements including dark mode, animations, and offline caching.

---

## 📋 Prerequisites

### **Required Software:**

1. **Node.js** (v18 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Expo CLI** (Globally installed)

   ```bash
   npm install -g @expo/cli
   ```

3. **Expo Go App** (On your device)
   - **iOS**: Download from App Store - "Expo Go"
   - **Android**: Download from Google Play - "Expo Go"

### **Optional Development Tools:**

- **Android Studio** (for Android emulation)
- **Xcode** (for iOS emulation - macOS only)
- **Visual Studio Code** with React Native extensions

---

## 🛠️ Setup and Installation

### **1. Navigate to Project Directory**

```bash
cd c:/mobile-app-projects/recipe-book-mobile
```

### **2. Install Dependencies**

```bash
npm install
```

_This will install all required packages including:_

- `@react-native-async-storage/async-storage` (for offline caching)
- `react-native-reanimated` (for animations)
- `expo` and related Expo packages
- Firebase and other app dependencies

### **3. Install Orbit/Development Environment**

If you don't have a preferred React Native development environment, here are your options:

#### **Option A: Expo Go (Recommended for Beginners)**

- Just use the Expo Go app on your phone
- No additional setup required

#### **Option B: Orbit Developer Studio**

```bash
# Note: Orbit UI packages are not available via npm
# Use Orbit's official installer from their website
# Visit: https://orbit.dev/
```

#### **Option C: VS Code with React Native Extensions**

1. Install VS Code
2. Install these extensions:
   - React-Native/React/Redux Snippets
   - Prettier - Code formatter
   - ES7+ React/Redux/React-Native snippets

---

## ▶️ Running the App

### **1. Start the Development Server**

```bash
npm start
```

_or_

```bash
expo start
```

### **2. Choose Your Platform**

After running `npm start`, you'll see a QR code and options:

#### **📱 On Physical Device:**

1. Open Expo Go app on your phone
2. Scan the QR code that appears in your terminal
3. The app will load on your device

#### **🖥️ On Emulator/Simulator:**

- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Press `w` for web browser

#### **🌐 Web Browser:**

- Press `w` to run in web browser
- Useful for quick testing and development

---

## 🎨 Testing New Features

### **Dark Mode Testing:**

1. **Navigate to Settings** (Profile tab → Settings)
2. **Find "Appearance" section**
3. **Toggle the switch** to enable/disable dark mode
4. **Verify** the entire app updates theme instantly

### **Animation Testing:**

- **Loading States**: Navigate between screens to see loading animations
- **Button Interactions**: Tap buttons to see pulse effects
- **List Animations**: Scroll through recipe lists for smooth animations
- **Theme Toggle**: Watch the smooth theme transition animation

### **Offline Caching Testing:**

1. **Go offline** (disable WiFi/mobile data)
2. **Navigate through the app** - cached data should still load
3. **Go back online** - data should sync automatically
4. **Check cache status** in console (see logs)

### **Performance Testing:**

- **Smooth Animations**: Verify 60fps performance
- **Fast Loading**: Check reduced loading times
- **Memory Usage**: Monitor for memory leaks
- **Battery Impact**: Check background usage

---

## 🔧 Common Commands

### **Development Commands:**

```bash
npm start              # Start development server
npm run android        # Start on Android
npm run ios           # Start on iOS (macOS only)
npm run web           # Start on web browser
npm run reset-project # Reset project configuration
npm run lint          # Run ESLint
```

### **Debugging Commands:**

```bash
expo start --clear    # Clear cache and restart
expo doctor          # Check project health
expo install --fix   # Fix dependency issues
```

---

## 🐛 Troubleshooting

### **Common Issues and Solutions:**

#### **1. Metro Bundler Issues**

```bash
# Clear Metro cache
npx expo start --clear

# Reset node_modules
rm -rf node_modules
npm install
```

#### **2. Expo Go Not Loading**

- **Check internet connection**
- **Ensure same WiFi network** for device and computer
- **Restart Expo Go app**
- **Try different port**: `expo start --port 19001`

#### **3. Animation Performance Issues**

```bash
# Install Reanimated dependencies
npm install react-native-reanimated@~4.1.1

# Configure Babel for Reanimated
# Add to babel.config.js:
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

#### **4. AsyncStorage Errors**

```bash
# Reinstall AsyncStorage
npm uninstall @react-native-async-storage/async-storage
npm install @react-native-async-storage/async-storage@1.24.0
```

#### **5. Firebase Connection Issues**

- **Check internet connection**
- **Verify Firebase config** in `firebaseConfig.js`
- **Check Firebase project status**

#### **6. Dark Mode Not Working**

- **Clear app data** on device
- **Restart development server**
- **Check theme context** in console logs

---

## 📱 Platform-Specific Setup

### **Android Setup:**

1. **Enable Developer Options** on Android device
2. **Enable USB Debugging**
3. **Install Android Studio** for emulator
4. **Run**: `adb devices` to check connection

### **iOS Setup (macOS only):**

1. **Install Xcode** from App Store
2. **Install iOS Simulator**
3. **Trust Developer** on iOS device if using physical device
4. **Run**: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

---

## 🎯 Development Workflow

### **1. Hot Reloading**

- Changes to JS/TS files auto-reload
- Styles update without restart
- Fast iteration during development

### **2. Debugging Tools**

- **React Native Debugger**
- **Flipper** (Meta's debugging tool)
- **Expo Dev Tools**
- **Chrome DevTools** (for web)

### **3. Performance Monitoring**

- **Performance monitor** in Expo DevTools
- **React DevTools Profiler**
- **Flipper Performance Plugin**

---

## 📊 Development Tips

### **React Native IDE Integration:**

Choose your preferred React Native IDE:

1. **VS Code** with React Native extensions
2. **Android Studio** for Android development
3. **IntelliJ IDEA** with React Native plugin
4. **Exponent** for web-based development

### **Code Organization:**

```
📁 Project Structure
├── 📁 app/                    # App screens and navigation
├── 📁 components/            # Reusable components
├── 📁 hooks/                 # Custom React hooks
├── 📁 utils/                 # Utility functions
├── 📁 constants/             # App constants
└── 📁 assets/                # Images and fonts
```

### **Best Practices:**

- **Use TypeScript** for type safety
- **Follow component patterns** for consistency
- **Test dark mode** on both platforms
- **Monitor performance** during development
- **Use React DevTools** for component inspection

---

## 🚀 Quick Start Commands

```bash
# Complete setup sequence
npm install
npm start

# For specific platform
npm run android  # Android device/emulator
npm run ios     # iOS device/simulator (macOS)
npm run web     # Web browser

# Development shortcuts
npm start --clear     # Clear cache
npm start --tunnel   # Use tunnel for remote devices
```

---

## 📞 Support

If you encounter issues:

1. **Check Expo documentation**: https://docs.expo.dev/
2. **React Native troubleshooting**: https://reactnative.dev/docs/troubleshooting
3. **Orbit documentation**: Check Orbit's official docs
4. **Community support**: Stack Overflow, React Native Discord

---

**🎉 You're all set!** Your Recipe Book Mobile App with dark mode, animations, and offline caching is ready to run!

_Remember to test all the new features: theme toggle, smooth animations, and offline functionality._
