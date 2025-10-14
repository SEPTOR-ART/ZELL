# 🖥️ ZELL Installation Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

### 🌐 Option 1: Web Version (Recommended for Testing)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the web version:**
   ```bash
   npm run web
   ```

3. **Open your browser:**
   - The app will automatically open at `http://localhost:19006`
   - Or manually navigate to the URL shown in the terminal

### 📱 Option 2: Desktop App (Windows, macOS, Linux)

#### For Windows:
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for Windows:**
   ```bash
   npx expo install --fix
   npx expo export:web
   ```

3. **Create desktop app with Electron:**
   ```bash
   npm install -g electron
   npm install electron --save-dev
   ```

4. **Create Electron main file:**
   ```javascript
   // electron-main.js
   const { app, BrowserWindow } = require('electron');
   const path = require('path');

   function createWindow() {
     const mainWindow = new BrowserWindow({
       width: 1200,
       height: 800,
       webPreferences: {
         nodeIntegration: true,
         contextIsolation: false
       }
     });

     mainWindow.loadFile('dist/index.html');
   }

   app.whenReady().then(createWindow);
   ```

5. **Add to package.json:**
   ```json
   {
     "main": "electron-main.js",
     "scripts": {
       "electron": "electron .",
       "build:desktop": "expo export:web && electron ."
     }
   }
   ```

6. **Run desktop app:**
   ```bash
   npm run build:desktop
   ```

#### For macOS:
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for macOS:**
   ```bash
   npx expo export:web
   npm run build:desktop
   ```

#### For Linux:
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for Linux:**
   ```bash
   npx expo export:web
   npm run build:desktop
   ```

### 📱 Option 3: Mobile Development

#### Android:
1. **Install Android Studio** and set up Android SDK
2. **Start Android emulator** or connect device
3. **Run:**
   ```bash
   npm run android
   ```

#### iOS (macOS only):
1. **Install Xcode** from App Store
2. **Install iOS Simulator**
3. **Run:**
   ```bash
   npm run ios
   ```

## 🛠️ Development Setup

### Install Development Tools:
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install project dependencies
npm install

# Install WebAssembly build tools (optional)
npm run build:wasm
```

### Development Commands:
```bash
# Start development server
npm start

# Start web version
npm run web

# Start Android version
npm run android

# Start iOS version
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

## 🔧 Configuration

### Environment Variables:
Create a `.env` file in the root directory:
```env
# Optional: Custom configuration
EXPO_PUBLIC_APP_NAME=ZELL
EXPO_PUBLIC_APP_VERSION=2.0.0
```

### WebAssembly Modules (Optional):
For enhanced performance, build WebAssembly modules:
```bash
# Install Emscripten (follow instructions at emscripten.org)
# Then build WASM modules
npm run build:wasm
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. **Port already in use:**
```bash
# Kill process using port 19006
npx kill-port 19006
# Or use different port
npx expo start --web --port 3000
```

#### 2. **Node.js version issues:**
```bash
# Check Node.js version
node --version
# Should be v16 or higher
```

#### 3. **Dependencies issues:**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. **Expo CLI issues:**
```bash
# Update Expo CLI
npm install -g @expo/cli@latest
# Clear Expo cache
npx expo install --fix
```

### Platform-Specific Issues:

#### Windows:
- **PowerShell execution policy:** Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Long path support:** Enable in Windows settings
- **Antivirus:** May block file operations, add exclusion for project folder

#### macOS:
- **Xcode Command Line Tools:** Run `xcode-select --install`
- **Permissions:** Grant necessary permissions when prompted

#### Linux:
- **Build tools:** Install `build-essential` package
- **Node.js:** Use NodeSource repository for latest version

## 📦 Building for Production

### Web Production Build:
```bash
# Create production build
npx expo export:web
# Files will be in 'dist' folder
```

### Desktop Production Build:
```bash
# Build web version first
npx expo export:web

# Create Electron app
npm run build:desktop

# Package for distribution
npx electron-builder
```

### Mobile Production Build:
```bash
# Android APK
npx expo build:android

# iOS IPA
npx expo build:ios
```

## 🎯 Quick Test

After installation, test these features:
1. **File Conversion:** Convert a PDF to DOCX
2. **File Compression:** Compress an image
3. **File Editing:** Edit an image (crop, resize)
4. **File Compilation:** Merge multiple PDFs
5. **File Sharing:** Share a processed file
6. **History:** Check operation history

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console for error messages
4. Try clearing cache and reinstalling dependencies

## 🎉 Success!

Once installed, you'll have access to:
- ✅ **File Conversion** (PDF, DOCX, Images, Audio, Video, Archives)
- ✅ **File Compression** (Multiple levels, batch processing)
- ✅ **File Editing** (Images, Audio, Video, Documents, Archives)
- ✅ **File Compilation** (Merge multiple files)
- ✅ **File Sharing** (Email, WhatsApp, Bluetooth, etc.)
- ✅ **Operation History** (Track all operations)
- ✅ **100% Offline** (No internet required)

Enjoy using ZELL! 🚀

