# Automatic Updates Setup Guide

## 🚀 **BEST SOLUTION: Expo Updates (OTA)**

For automatic updates when you change styles or code, **Expo Updates** is perfect for your app!

### **✅ Configuration Complete**

Your `app.json` now includes:

```json
"updates": {
  "url": "https://u.expo.dev/9cc91a9b-a489-46b8-af81-0155a6f9e540"
},
"runtimeVersion": {
  "policy": "sdkVersion"
}
```

---

## 🎯 **How It Works**

### **Before (Traditional Way):**

1. Make style changes → ❌ Need to rebuild APK
2. Rebuild with EAS → ❌ Wait 10-20 minutes
3. Download new APK → ❌ Install manually
4. Users download new version → ❌ Manual process

### **With Expo Updates (New Way):**

1. Make style changes ✅
2. Run: `eas update --branch production --message "Updated styles"` ✅
3. Users get update automatically when they open app ✅
4. **No APK rebuild needed!** ✅

---

## 🔧 **Setup Steps**

### **Step 1: Install EAS CLI (if not done)**

```bash
npm install -g @expo/eas-cli
eas login
```

### **Step 2: Configure Your Build for Updates**

Update your `eas.json` to include updates support:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "updates": {
        "url": "https://u.expo.dev/9cc91a9b-a489-46b8-af81-0155a6f9e540"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal",
      "updates": {
        "url": "https://u.expo.dev/9cc91a9b-a489-46b8-af81-0155a6f9e540"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "updates": {
        "url": "https://u.expo.dev/9cc91a9b-a489-46b8-af81-0155a6f9e540"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🚀 **Daily Update Workflow**

### **When You Make Changes:**

1. **Make your style/code changes** in the app
2. **Test locally first**: `npm start`
3. **When ready to publish**:

   ```bash
   # For testing updates
   eas update --branch preview --message "Updated profile screen styles"

   # For production users
   eas update --branch production --message "Updated app styles"
   ```

### **What Happens Automatically:**

1. **EAS detects changes** in your JavaScript/styling code
2. **Creates update package** (much faster than full build)
3. **Uploads to Expo CDN**
4. **Users get update** next time they open the app
5. **Update happens in background** - smooth experience!

---

## 📱 **Update Types Supported**

### ✅ **These Update Automatically:**

- **Style changes** (colors, fonts, layouts)
- **Component code** (new features, bug fixes)
- **Text content** (labels, messages)
- **Navigation changes** (new screens, routes)
- **Asset changes** (images, icons)
- **Logic changes** (function updates)

### ❌ **These Need New Build:**

- **Native code changes** (new libraries)
- **App icons/splash screens**
- **Permissions** (new device access)
- **SDK version changes**

---

## 🎯 **Quick Commands Reference**

### **Development Updates:**

```bash
# Test updates in development build
eas update --branch development --message "Testing new features"
```

### **Preview Updates:**

```bash
# Share updates with beta testers
eas update --branch preview --message "Beta update with new styles"
```

### **Production Updates:**

```bash
# Deploy to all users
eas update --branch production --message "New UI update"
```

### **Check Update Status:**

```bash
# View recent updates
eas update:list

# View update details
eas update:view [UPDATE_ID]
```

---

## ⚡ **Speed Comparison**

| Method               | Time          | User Experience             |
| -------------------- | ------------- | --------------------------- |
| **Full APK Rebuild** | 10-20 minutes | Manual download required    |
| **Expo Updates**     | 2-5 minutes   | Automatic background update |

**Expo Updates are 4-10x faster!**

---

## 🛠️ **Troubleshooting**

### **Updates Not Working?**

```bash
# Check if updates are configured
eas update:list

# Clear update cache (in development)
npx expo install --fix
```

### **Force Update Check:**

Users can force update check by:

1. Closing and reopening the app
2. Going to app settings and clearing cache

### **Rollback Updates:**

```bash
# Rollback to previous update
eas update:rollback [UPDATE_ID]
```

---

## 🎉 **You're Ready!**

### **Your Setup:**

- ✅ **EAS Build**: Configured and ready
- ✅ **Expo Updates**: Configured and ready
- ✅ **Automatic Updates**: Enabled

### **Next Steps:**

1. **Rebuild once with updates support**:
   ```bash
   eas build --profile preview --platform android
   ```
2. **Make style changes**
3. **Deploy update**:
   ```bash
   eas update --branch production --message "Updated styles"
   ```

### **Result:**

Your users will automatically get style updates without needing to download new APK files!

---

## 💡 **Pro Tips**

### **Update Strategy:**

- **Use preview branch** for testing updates
- **Use production branch** for stable releases
- **Test locally first** with `npm start`
- **Keep update messages clear** for tracking

### **Performance:**

- **Updates are incremental** - only changed files
- **Background download** - users don't notice
- **Instant reload** - fast user experience

Your Recipe Book app now supports automatic updates! 🎉
