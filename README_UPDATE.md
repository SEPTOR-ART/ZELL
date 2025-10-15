# ZELL v2.0 - Modern File Processing Suite

> **⚠️ IMPORTANT UPDATE**: This project has been completely redesigned with a modern Word/Nitro PDF-style interface and Supabase integration!

## 🎨 What's New in v2.0

### Modern Professional Interface
- **Ribbon Toolbar**: Word/Nitro-style ribbon interface with contextual tabs
- **Enhanced Navigation**: Improved tab navigation with modern Material Design 3
- **Professional Layout**: Clean, sophisticated visual presentation
- **Responsive Design**: Optimized for all screen sizes

### Supabase Database Integration
- **Cloud-Synced History**: Optional cloud backup of file operations
- **User Preferences**: Sync settings across devices
- **File Metadata**: Cached file information for quick access
- **Automatic Fallback**: Uses local SQLite when offline

### Enhanced Features
- Ribbon toolbar with 6 contextual tabs (Home, Convert, Compress, Edit, View, Tools)
- Quick action buttons for common operations
- Improved file sharing with multiple platform support
- Better progress tracking and status indicators
- Modern card-based UI for all operations

## 🚀 Quick Start

### Prerequisites
```bash
node -v  # v16+ required
npm -v   # v8+ required
```

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/YOUR_USERNAME/zell.git
cd zell
```

2. **Install dependencies**:
```bash
npm install --legacy-peer-deps
```

3. **Set up Supabase** (Optional):
   - The project already includes Supabase credentials in `.env`
   - Run the migration to set up your database:
```bash
# Apply the database migration
npx supabase db push
```

4. **Start the development server**:
```bash
npm start
```

5. **Run on your preferred platform**:
```bash
npm run web      # Run on web browser
npm run android  # Run on Android
npm run ios      # Run on iOS
```

## 📱 Platform Support

- ✅ **Web**: Full support with modern browsers
- ✅ **Android**: Native Android app via Expo
- ✅ **iOS**: Native iOS app via Expo
- ✅ **Desktop**: Electron wrapper for Windows, macOS, Linux

## 🏗️ Project Structure

```
zell/
├── App.js                          # Main app component with ribbon UI
├── src/
│   ├── components/
│   │   ├── RibbonToolbar.js       # NEW: Word-style ribbon toolbar
│   │   ├── FilePreview.js          # File preview component
│   │   ├── ShareButton.js          # Enhanced sharing component
│   │   ├── ImageEditor.js          # Image editing tools
│   │   └── ...                     # Other editors
│   ├── screens/
│   │   ├── ConvertScreen.js        # File conversion
│   │   ├── CompressScreen.js       # File compression
│   │   ├── EditScreen.js           # File editing
│   │   ├── CompileScreen.js        # File merging
│   │   └── HistoryScreen.js        # Operation history
│   ├── services/
│   │   ├── ConversionService.js    # Conversion logic
│   │   ├── CompressionService.js   # Compression logic
│   │   ├── HistoryService.js       # SQLite history (local)
│   │   ├── SupabaseHistoryService.js  # NEW: Cloud history
│   │   ├── ShareService.js         # Sharing functionality
│   │   └── OfflineProcessor.js     # Offline processing
│   ├── config/
│   │   └── supabase.js             # NEW: Supabase configuration
│   └── theme/
│       └── theme.js                # Material Design 3 theme
├── supabase/
│   └── migrations/
│       └── 001_init_zell_database.sql  # NEW: Database schema
└── backend/                        # Optional Node.js backend
    ├── server.js
    └── converters/
```

## 🛠️ Technologies

### Frontend
- **React Native 0.72.6**: Cross-platform mobile framework
- **Expo SDK 49**: Development platform
- **React Native Paper 5.10**: Material Design 3 components
- **React Navigation 6**: Navigation library
- **Supabase JS 2.39**: Cloud database client

### Backend (Optional)
- **Express.js**: REST API server
- **Multer**: File upload handling
- **Sharp**: Image processing
- **FFmpeg**: Audio/Video processing

### Database
- **Supabase**: Cloud PostgreSQL database
- **Expo SQLite**: Local fallback database

## 🔧 Configuration

### Environment Variables

The project uses the following environment variables (already configured in `.env`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

The database schema is automatically created using the migration file:

```sql
-- Tables
- file_operations_history  # Tracks all operations
- user_preferences         # User settings
- file_metadata           # Cached file info
```

All tables have Row Level Security (RLS) enabled with public access policies for local-first operation.

## 📊 Features in Detail

### Ribbon Toolbar
- **Home Tab**: New, Open, Save, Share, Quick Actions
- **Convert Tab**: Format conversion options with quality settings
- **Compress Tab**: Compression levels and options
- **Edit Tab**: Crop, Resize, Rotate, Filters, Annotate tools
- **View Tab**: Preview and display options
- **Tools Tab**: Additional utilities and settings

### File Operations
1. **Convert**: Transform files between formats
2. **Compress**: Reduce file sizes with quality options
3. **Edit**: Modify files with various tools
4. **Compile**: Merge multiple files into one
5. **Share**: Export via native sharing or cloud

### History Management
- View all operations with detailed statistics
- Search and filter by operation type, date, filename
- Export/import history data
- Cloud sync with Supabase (optional)
- Automatic cleanup of old entries

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📦 Building for Production

### Web
```bash
expo build:web
```

### Android
```bash
expo build:android -t apk
```

### iOS
```bash
expo build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native and Expo teams
- Supabase for the amazing cloud database
- Material Design team for design guidelines
- All contributors and testers

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Check existing issues for solutions
- Read the documentation files

---

**ZELL v2.0** - Professional file processing, now with modern interface and cloud sync! 🚀
