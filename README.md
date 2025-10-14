# ZELL - Fully Offline Cross-Platform File Converter, Compressor, Editor & Compiler

ZELL is a comprehensive, fully offline cross-platform file processing suite that supports mobile (Android & iOS) and desktop (Windows, macOS, Linux) platforms. Built with React Native and WebAssembly, it provides fast, high-quality file conversion, compression, editing, and compilation with a modern, intuitive interface - all without requiring an internet connection.

## 🚀 Features

### Core Functionality

#### 🗂 File Conversion
- **Documents**: PDF, DOCX, TXT, PPTX
- **Images**: JPG, PNG, WEBP, GIF
- **Audio**: MP3, WAV, AAC
- **Video**: MP4, MOV, AVI, MKV
- **Archives**: ZIP, RAR, 7Z
- **Share Results**: Share converted files via email, WhatsApp, Bluetooth, and more

#### 🪶 File Compression
- Multiple compression levels (Low, Medium, High)
- Format-specific optimization
- Batch processing support
- **Share Results**: Share compressed files via email, WhatsApp, Bluetooth, and more
- Real-time compression ratio estimation

#### ✍️ File Editing (Fully Offline)
- **Documents**: Text editing, formatting, merge/split pages (PDF), find & replace
- **Images**: Crop, resize, rotate, add text, filters, annotations, watermarks
- **Audio**: Trim, merge, fade in/out, adjust volume, normalize
- **Video**: Trim, crop, merge clips, add subtitles, watermark, text overlay
- **Archives**: Extract selected files, rename, add or remove files
- **Share Results**: Share edited files via email, WhatsApp, Bluetooth, and more

#### 🧩 File Compilation (Merge Multiple Files)
- Merge multiple documents into a single file
- Merge images into PDF or image sequence
- Merge audio files into one track
- Merge video files into a single video
- Merge archives into new compressed file
- Support reordering files before compiling
- **Share Results**: Share compiled files via email, WhatsApp, Bluetooth, and more

#### 📤 File Sharing (Cross-Platform)
- **Native Sharing**: Use device's built-in share functionality
- **Multiple Apps**: Share via Email, WhatsApp, Telegram, Bluetooth
- **Platform Support**: Android (Nearby Share), iOS (AirDrop), Web (Web Share API)
- **Multi-File Sharing**: Share multiple files as ZIP archive
- **Custom Messages**: Add custom messages for email and messaging apps
- **Offline Sharing**: Works completely offline, no cloud dependencies
- **Quick Share**: One-tap sharing to most-used apps
- **Share History**: Share files from operation history

#### 🕒 Advanced Features
- **Batch Operations**: Process multiple files simultaneously
- **Drag & Drop**: Easy file upload with drag-and-drop support
- **Progress Tracking**: Real-time processing progress
- **History Management**: Track all operations with detailed statistics
- **Undo/Redo**: Full editing history with undo/redo support
- **Password Protection**: Secure compressed and compiled files
- **Auto Renaming**: Prevent file overwrites automatically

### User Interface
- **Modern Design**: Clean, responsive interface with Material Design 3
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Tabbed Navigation**: Organized workflow with Convert, Compress, Edit, Compile, and History tabs
- **File Preview**: Visual file information with type indicators
- **Progress Indicators**: Real-time progress bars and status updates
- **Real-time Preview**: Live preview for edits and compilations
- **Mobile-first Design**: Optimized for touch interfaces

### Offline Capability
- **100% Offline**: Entire system works without internet connection
- **Local Processing**: All files processed locally on device
- **WebAssembly Modules**: High-performance offline processing
- **Local Storage**: SQLite database for offline history management
- **File Validation**: Comprehensive file type and size validation
- **Compression Estimation**: Pre-conversion size and time estimates
- **Export/Import**: History export and import functionality
- **Search & Filter**: Advanced history search and filtering options

## 🛠️ Tech Stack

### Frontend
- **React Native**: Cross-platform mobile and desktop development
- **Expo**: Development platform and build tools
- **React Native Paper**: Material Design components
- **React Navigation**: Navigation library
- **Expo SQLite**: Local database storage
- **Expo Document Picker**: File selection
- **Expo Sharing**: File sharing functionality

### Offline Processing
- **WebAssembly**: High-performance offline processing modules
- **Sharp**: Image processing and manipulation
- **PDF-lib**: PDF manipulation and creation
- **Mammoth**: DOCX processing
- **JSZip**: Archive creation and manipulation
- **Yauzl**: Archive extraction
- **Node-7z**: 7z archive support
- **Custom WASM Modules**: Optimized C/C++ processing engines

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- For mobile development: Android Studio / Xcode
- For desktop development: Electron (optional)
- Emscripten (for WebAssembly compilation)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build WebAssembly modules** (optional, for enhanced performance):
   ```bash
   npm run build:wasm
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on specific platforms**:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## 🏗️ Building for Production

### Mobile Apps

#### Android
```bash
# Build APK
expo build:android

# Build AAB (for Play Store)
expo build:android --type app-bundle
```

#### iOS
```bash
# Build for iOS
expo build:ios
```

### Desktop Apps

#### Windows
```bash
# Build Windows executable
expo build:web
# Then use Electron Builder for desktop packaging
```

#### macOS
```bash
# Build macOS app
expo build:web
# Then use Electron Builder for desktop packaging
```

#### Linux
```bash
# Build Linux app
expo build:web
# Then use Electron Builder for desktop packaging
```

## 📱 Usage

### Converting Files

1. **Open the Convert tab**
2. **Select a file** using the file picker or drag-and-drop
3. **Choose target format** from supported options
4. **Select compression level** (Low, Medium, High)
5. **Click Convert** and wait for processing
6. **Download** the converted file

### Compressing Files

1. **Open the Compress tab**
2. **Select a file** to compress
3. **Choose compression level** based on your needs:
   - **Low**: High quality, minimal compression
   - **Medium**: Balanced quality and size
   - **High**: Maximum compression, smaller size
4. **Click Compress** and wait for processing
5. **Download** the compressed file

### Editing Files

1. **Open the Edit tab**
2. **Select a file** to edit
3. **Choose edit mode** based on file type:
   - **Images**: Crop, resize, rotate, filters, text, watermark
   - **Audio**: Trim, merge, fade, volume, normalize
   - **Video**: Trim, crop, merge, subtitles, watermark, text
   - **Documents**: Text editing, formatting, merge/split, annotations
   - **Archives**: Extract, add, remove, rename files
4. **Configure edit parameters** using the intuitive interface
5. **Apply changes** and download the edited file
6. **Use undo/redo** to manage edit history

### Compiling Files

1. **Open the Compile tab**
2. **Select multiple files** to merge
3. **Reorder files** by dragging (optional)
4. **Choose output format** based on file types
5. **Preview compilation** details
6. **Click Compile** and wait for processing
7. **Download** the compiled file
8. **Share** the compiled file via email, WhatsApp, etc.

### Sharing Files

1. **After Processing**: Use Share button on any result page
2. **Quick Share**: Tap share icon for instant sharing
3. **Multiple Files**: Select multiple files to share as ZIP
4. **Custom Message**: Add message for email/messaging apps
5. **Platform Apps**: Share via installed apps (Gmail, WhatsApp, etc.)
6. **History Sharing**: Share files from operation history

### Managing History

1. **Open the History tab**
2. **View all operations** with details
3. **Search and filter** by operation type, date, or file name
4. **Export history** for backup
5. **Clear old entries** to free up space

## 🔧 Configuration

### Offline Configuration

ZELL is designed to work completely offline. No backend server or internet connection is required.

### WebAssembly Configuration

To enable enhanced performance, build the WebAssembly modules:

```bash
# Install Emscripten
# Follow instructions at: https://emscripten.org/docs/getting_started/downloads.html

# Build WASM modules
npm run build:wasm
```

### Local Storage Configuration

The app uses SQLite for local storage. Database files are automatically created in the app's data directory.

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Offline Processing Tests
```bash
npm run test:offline
```

## 📊 Performance

### Supported File Sizes
- **Maximum file size**: 100MB
- **Recommended file size**: < 50MB for optimal performance
- **Batch processing**: Up to 10 files simultaneously

### Processing Times (Approximate)
- **Images**: 0.3 seconds per MB (with WASM)
- **Audio**: 1.5 seconds per MB (with WASM)
- **Video**: 3 seconds per MB (with WASM)
- **Documents**: 0.05 seconds per MB (with WASM)
- **Archives**: 0.8 seconds per MB (with WASM)
- **Editing Operations**: 1-5 seconds depending on complexity
- **Compilation**: 2-10 seconds depending on file count and size

## 🔒 Security

- **100% Offline**: No data leaves your device
- File type validation
- Size limits enforcement
- Temporary file cleanup
- Input sanitization
- Password protection for archives
- Local-only processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Backend not starting**:
- Check if port 3001 is available
- Ensure all dependencies are installed
- Check Node.js version compatibility

**File conversion fails**:
- Verify file format is supported
- Check file size limits
- Ensure backend is running

**Mobile app not building**:
- Update Expo CLI to latest version
- Clear Expo cache: `expo r -c`
- Check platform-specific requirements

### Getting Help

- Check the [Issues](https://github.com/your-repo/zell/issues) page
- Create a new issue with detailed description
- Include error logs and system information

## 🗺️ Roadmap

### Version 2.1
- [ ] Enhanced WebAssembly modules
- [ ] Advanced image filters and effects
- [ ] Video transitions and effects
- [ ] OCR text recognition
- [ ] Voice-to-text conversion
- [ ] Text-to-audio conversion

### Version 2.2
- [ ] Advanced batch operations
- [ ] Custom compression profiles
- [ ] Plugin system for extensions
- [ ] Advanced analytics and reporting
- [ ] Cloud sync (optional)

### Version 3.0
- [ ] AI-powered image enhancement
- [ ] Advanced video editing tools
- [ ] Real-time collaboration
- [ ] Advanced security features
- [ ] Enterprise features

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Expo team for the amazing development platform
- All open-source libraries used in this project
- Contributors and testers

---

**ZELL** - Making file conversion, compression, editing, and compilation simple, fast, and reliable across all platforms - completely offline.
