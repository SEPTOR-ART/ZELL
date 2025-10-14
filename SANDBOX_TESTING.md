# 🧪 ZELL Sandbox Testing Guide

## 🎯 Quick Sandbox Setup

### Step 1: Verify Environment
```bash
# Check Node.js version (should be v16+)
node --version

# Check npm version
npm --version

# Check if we're in the right directory
pwd
ls -la
```

### Step 2: Clean Installation
```bash
# Remove any existing node_modules (if any)
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Test Web Version
```bash
# Start the web version
npm run web

# Should open at http://localhost:19006
# If not, manually navigate to that URL
```

## 🧪 Testing Scenarios

### Test 1: Basic File Conversion
1. **Prepare test files:**
   - Create a simple text file: `test.txt`
   - Add some content: "Hello, this is a test file for ZELL!"

2. **Test conversion:**
   - Open ZELL web interface
   - Go to "Convert" tab
   - Upload `test.txt`
   - Select target format: PDF
   - Click "Convert"
   - Verify conversion works
   - Test "Download" and "Share" buttons

### Test 2: Image Compression
1. **Prepare test image:**
   - Use any JPG/PNG image file
   - Or create a simple test image

2. **Test compression:**
   - Go to "Compress" tab
   - Upload image
   - Select compression level: Medium
   - Click "Compress"
   - Verify compression ratio
   - Test "Download" and "Share" buttons

### Test 3: File Editing
1. **Test image editing:**
   - Go to "Edit" tab
   - Upload an image
   - Try basic edits: crop, resize, rotate
   - Apply changes
   - Test "Download" and "Share" buttons

### Test 4: File Compilation
1. **Prepare multiple files:**
   - Create 2-3 text files or images

2. **Test compilation:**
   - Go to "Compile" tab
   - Upload multiple files
   - Select output format
   - Click "Compile"
   - Verify merged file
   - Test "Download" and "Share" buttons

### Test 5: History Management
1. **Check history:**
   - Go to "History" tab
   - Verify previous operations appear
   - Test filtering and sorting
   - Test sharing from history

### Test 6: File Sharing
1. **Test sharing functionality:**
   - After any operation, click "Share" button
   - Verify sharing options appear
   - Test different sharing methods
   - Verify success/error messages

## 🔧 Troubleshooting Common Issues

### Issue 1: Port Already in Use
```bash
# Kill any process using port 19006
npx kill-port 19006

# Or use different port
npx expo start --web --port 3000
```

### Issue 2: Dependencies Not Found
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Expo CLI Issues
```bash
# Install/update Expo CLI
npm install -g @expo/cli@latest

# Clear Expo cache
npx expo install --fix
```

### Issue 4: File System Permissions
```bash
# Check file permissions
ls -la

# Make sure you have write permissions
chmod 755 .
```

## 🧪 Automated Testing Script

Create a test script to verify all functionality:

```bash
# test-zell.sh
#!/bin/bash

echo "🧪 ZELL Sandbox Testing Script"
echo "=============================="

# Test 1: Check dependencies
echo "1. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies missing - running npm install"
    npm install
fi

# Test 2: Check if web server starts
echo "2. Testing web server startup..."
timeout 10s npm run web > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Web server starts successfully"
else
    echo "❌ Web server failed to start"
fi

# Test 3: Check file structure
echo "3. Checking file structure..."
required_files=("App.js" "package.json" "src/screens/ConvertScreen.js" "src/services/ShareService.js")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo "Testing complete!"
```

## 🎯 Manual Testing Checklist

### ✅ Core Functionality
- [ ] Web interface loads at http://localhost:19006
- [ ] All 5 tabs are visible (Convert, Compress, Edit, Compile, History)
- [ ] File upload works (drag & drop and file picker)
- [ ] File conversion works (at least one format)
- [ ] File compression works (at least one format)
- [ ] File editing works (at least one edit type)
- [ ] File compilation works (merge multiple files)
- [ ] Download buttons work
- [ ] Share buttons work
- [ ] History tracking works

### ✅ UI/UX Testing
- [ ] Dark/light mode toggle works
- [ ] Responsive design (try different window sizes)
- [ ] Loading indicators appear during operations
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Progress bars work during long operations

### ✅ File Operations
- [ ] Multiple file selection works
- [ ] File preview displays correctly
- [ ] File size information shows correctly
- [ ] File type detection works
- [ ] Batch operations work
- [ ] File renaming works

### ✅ Sharing Functionality
- [ ] Share button appears on all result pages
- [ ] Share options menu opens
- [ ] Quick share chips work
- [ ] Custom message option works
- [ ] Multi-file sharing works
- [ ] Sharing success/error messages work

## 🚨 Error Reporting

If you encounter errors, please note:

1. **Error message** (exact text)
2. **Steps to reproduce**
3. **Browser/OS information**
4. **Console errors** (F12 → Console tab)
5. **Network errors** (F12 → Network tab)

## 🎉 Success Criteria

ZELL is working correctly if:
- ✅ Web interface loads without errors
- ✅ All 5 main tabs are functional
- ✅ File upload/download works
- ✅ At least one conversion type works
- ✅ At least one compression type works
- ✅ At least one editing type works
- ✅ At least one compilation type works
- ✅ Sharing functionality works
- ✅ History tracking works
- ✅ No critical JavaScript errors in console

## 🔄 Quick Reset

If something goes wrong:
```bash
# Stop any running processes
pkill -f "expo\|node"

# Clean everything
rm -rf node_modules package-lock.json

# Fresh start
npm install
npm run web
```

Happy testing! 🚀
