const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Import conversion modules
const imageConverter = require('./converters/imageConverter');
const audioConverter = require('./converters/audioConverter');
const videoConverter = require('./converters/videoConverter');
const documentConverter = require('./converters/documentConverter');
const archiveConverter = require('./converters/archiveConverter');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
const outputsDir = path.join(__dirname, 'outputs');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ZELL Backend is running' });
});

/**
 * Get supported formats
 */
app.get('/api/formats', (req, res) => {
  const formats = {
    documents: ['pdf', 'docx', 'txt', 'pptx'],
    images: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    audio: ['mp3', 'wav', 'aac'],
    video: ['mp4', 'mov', 'avi', 'mkv'],
    archives: ['zip', 'rar', '7z']
  };
  res.json(formats);
});

/**
 * Convert single file
 */
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { targetFormat, compressionLevel = 'medium' } = req.body;
    const inputPath = req.file.path;
    const originalName = req.file.originalname;
    const fileExtension = path.extname(originalName).toLowerCase().slice(1);
    
    // Generate output filename
    const outputFileName = `${path.parse(originalName).name}.${targetFormat}`;
    const outputPath = path.join(outputsDir, `${uuidv4()}-${outputFileName}`);

    let result;
    
    // Route to appropriate converter based on file type
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
        result = await imageConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
        break;
      case 'mp3':
      case 'wav':
      case 'aac':
        result = await audioConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
        break;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        result = await videoConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
        break;
      case 'pdf':
      case 'docx':
      case 'txt':
      case 'pptx':
        result = await documentConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
        break;
      case 'zip':
      case 'rar':
      case '7z':
        result = await archiveConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file format' });
    }

    // Clean up input file
    await fs.remove(inputPath);

    res.json({
      success: true,
      outputPath: result.outputPath,
      fileName: outputFileName,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed', details: error.message });
  }
});

/**
 * Compress file
 */
app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { compressionLevel = 'medium' } = req.body;
    const inputPath = req.file.path;
    const originalName = req.file.originalname;
    const fileExtension = path.extname(originalName).toLowerCase().slice(1);
    
    // Generate output filename
    const outputFileName = `${path.parse(originalName).name}_compressed.${fileExtension}`;
    const outputPath = path.join(outputsDir, `${uuidv4()}-${outputFileName}`);

    let result;
    
    // Route to appropriate compressor
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        result = await imageConverter.compress(inputPath, outputPath, compressionLevel);
        break;
      case 'mp3':
      case 'wav':
      case 'aac':
        result = await audioConverter.compress(inputPath, outputPath, compressionLevel);
        break;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        result = await videoConverter.compress(inputPath, outputPath, compressionLevel);
        break;
      default:
        return res.status(400).json({ error: 'Compression not supported for this file type' });
    }

    // Clean up input file
    await fs.remove(inputPath);

    res.json({
      success: true,
      outputPath: result.outputPath,
      fileName: outputFileName,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio
    });

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Compression failed', details: error.message });
  }
});

/**
 * Download converted file
 */
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed' });
      } else {
        // Clean up file after download
        setTimeout(() => {
          fs.remove(filePath).catch(console.error);
        }, 5000);
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

/**
 * Batch convert files
 */
app.post('/api/batch-convert', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { targetFormat, compressionLevel = 'medium' } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        const inputPath = file.path;
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName).toLowerCase().slice(1);
        
        const outputFileName = `${path.parse(originalName).name}.${targetFormat}`;
        const outputPath = path.join(outputsDir, `${uuidv4()}-${outputFileName}`);

        let result;
        
        // Route to appropriate converter
        switch (fileExtension) {
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'webp':
          case 'gif':
            result = await imageConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
            break;
          case 'mp3':
          case 'wav':
          case 'aac':
            result = await audioConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
            break;
          case 'mp4':
          case 'mov':
          case 'avi':
          case 'mkv':
            result = await videoConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
            break;
          case 'pdf':
          case 'docx':
          case 'txt':
          case 'pptx':
            result = await documentConverter.convert(inputPath, outputPath, targetFormat, compressionLevel);
            break;
          default:
            results.push({
              fileName: originalName,
              success: false,
              error: 'Unsupported format'
            });
            continue;
        }

        results.push({
          fileName: originalName,
          success: true,
          outputPath: result.outputPath,
          outputFileName: outputFileName,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio
        });

        // Clean up input file
        await fs.remove(inputPath);

      } catch (error) {
        results.push({
          fileName: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({ results });

  } catch (error) {
    console.error('Batch conversion error:', error);
    res.status(500).json({ error: 'Batch conversion failed', details: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ZELL Backend server running on port ${PORT}`);
});


