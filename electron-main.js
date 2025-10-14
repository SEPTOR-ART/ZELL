const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false // Allow file access for offline functionality
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add your app icon
    title: 'ZELL - File Converter & Editor',
    show: false // Don't show until ready
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: Load from localhost
    mainWindow.loadURL('http://localhost:19006');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile', 'multiSelections'],
              filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Documents', extensions: ['pdf', 'docx', 'txt', 'pptx'] },
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
                { name: 'Audio', extensions: ['mp3', 'wav', 'aac'] },
                { name: 'Video', extensions: ['mp4', 'mov', 'avi', 'mkv'] },
                { name: 'Archives', extensions: ['zip', 'rar', '7z'] }
              ]
            }).then(result => {
              if (!result.canceled) {
                mainWindow.webContents.send('files-selected', result.filePaths);
              }
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About ZELL',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ZELL',
              message: 'ZELL - File Converter, Compressor, Editor & Compiler',
              detail: 'Version 2.0.0\n\nA fully offline cross-platform file processing application.\n\nFeatures:\n• File Conversion\n• File Compression\n• File Editing\n• File Compilation\n• File Sharing\n• 100% Offline Operation'
            });
          }
        },
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/your-repo/zell');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for file operations
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// Handle file operations
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    const { shell } = require('electron');
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle app updates (if needed)
ipcMain.handle('check-for-updates', async () => {
  // Implement update checking logic here
  return { hasUpdate: false };
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});

// Handle protocol for deep linking (optional)
app.setAsDefaultProtocolClient('zell');

// Handle protocol URLs
app.on('open-url', (event, url) => {
  event.preventDefault();
  // Handle deep link URL
  console.log('Received URL:', url);
});

// Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:19006' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

module.exports = { mainWindow };

