# ZELL Setup Guide

This guide will help you set up ZELL for development and production deployment.

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/zell.git
cd zell
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Start Development Servers
```bash
# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
npm start
```

## 📋 Prerequisites

### Required Software
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (or yarn v1.22.0+)
- **Git**: Latest version

### For Mobile Development
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

### For Desktop Development
- **Electron**: For desktop app packaging
- **Platform-specific build tools**

## 🔧 Development Setup

### Backend Configuration

1. **Create environment file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure environment variables**:
   ```env
   PORT=3001
   NODE_ENV=development
   MAX_FILE_SIZE=104857600
   UPLOAD_DIR=./uploads
   OUTPUT_DIR=./outputs
   CORS_ORIGIN=http://localhost:19006
   ```

3. **Install system dependencies** (if needed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # macOS
   brew install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

### Frontend Configuration

1. **Update API endpoints** (if needed):
   ```javascript
   // src/services/ConversionService.js
   static BASE_URL = 'http://localhost:3001/api';
   
   // src/services/CompressionService.js
   static BASE_URL = 'http://localhost:3001/api';
   ```

2. **Configure app settings**:
   ```javascript
   // app.json
   {
     "expo": {
       "name": "ZELL",
       "slug": "zell",
       // ... other settings
     }
   }
   ```

## 📱 Mobile Development

### Android Setup

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and build tools
   - Set up Android emulator

2. **Configure environment**:
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Run on Android**:
   ```bash
   npm run android
   ```

### iOS Setup (macOS only)

1. **Install Xcode**:
   - Download from Mac App Store
   - Install Xcode Command Line Tools
   - Set up iOS Simulator

2. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

3. **Run on iOS**:
   ```bash
   npm run ios
   ```

## 🖥️ Desktop Development

### Web Development
```bash
npm run web
```

### Electron Setup (for desktop apps)
```bash
# Install Electron
npm install -g electron

# Build for desktop
npm run build:desktop
```

## 🏗️ Production Build

### Backend Deployment

1. **Build for production**:
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy to server**:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name zell-backend
   
   # Using Docker
   docker build -t zell-backend .
   docker run -p 3001:3001 zell-backend
   ```

### Mobile App Builds

#### Android APK
```bash
expo build:android --type apk
```

#### Android AAB (Play Store)
```bash
expo build:android --type app-bundle
```

#### iOS (App Store)
```bash
expo build:ios
```

### Desktop App Builds

#### Windows
```bash
npm run build:windows
```

#### macOS
```bash
npm run build:macos
```

#### Linux
```bash
npm run build:linux
```

## 🐳 Docker Deployment

### Backend Docker Setup

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:16-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 3001
   
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t zell-backend .
   docker run -p 3001:3001 zell-backend
   ```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads
      - ./outputs:/app/outputs
    environment:
      - NODE_ENV=production
      - PORT=3001
```

## 🔍 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
npm test
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Check supported formats
curl http://localhost:3001/api/formats
```

### Logs
```bash
# Backend logs
cd backend
npm run logs

# PM2 logs
pm2 logs zell-backend
```

## 🛠️ Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
lsof -ti:3001 | xargs kill -9

# Permission issues
sudo chown -R $USER:$USER ./uploads ./outputs

# Missing dependencies
cd backend && npm install
```

#### Frontend Issues
```bash
# Clear Expo cache
expo r -c

# Reset Metro bundler
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force
```

#### Mobile Build Issues
```bash
# Android build issues
cd android && ./gradlew clean

# iOS build issues
cd ios && pod install
```

### Performance Optimization

#### Backend
- Use PM2 for process management
- Configure nginx for reverse proxy
- Set up Redis for caching
- Use CDN for static files

#### Frontend
- Enable Hermes for React Native
- Use Flipper for debugging
- Optimize bundle size
- Implement lazy loading

## 🔐 Security

### Production Security Checklist
- [ ] Use HTTPS in production
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] File upload validation
- [ ] Input sanitization

### Environment Variables
```env
# Production
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=104857600
JWT_SECRET=your-secret-key
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx)
- Multiple backend instances
- Database clustering
- CDN for file storage

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use caching strategies
- Monitor performance metrics

## 🆘 Support

### Getting Help
1. Check the [Issues](https://github.com/your-repo/zell/issues) page
2. Search existing issues
3. Create a new issue with:
   - Detailed description
   - Error logs
   - System information
   - Steps to reproduce

### Community
- [Discord Server](https://discord.gg/zell)
- [GitHub Discussions](https://github.com/your-repo/zell/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/zell)

---

For more detailed information, check the [README.md](README.md) file.


