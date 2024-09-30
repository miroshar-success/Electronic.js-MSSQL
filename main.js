const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const url = require('url');

let mainWindow;
const loginFilePath = path.join(app.getPath('userData'), 'login.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'login.html'),
    protocol: 'file:',
    slashes: true,
  }));
}

const template = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  {
    label: 'Settings',
    click() {
      mainWindow.webContents.loadURL(url.format({
        pathname: path.join(__dirname, 'settings.html'),
        protocol: 'file:',
        slashes: true,
      }));
    }
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        role: 'reload'
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
        click() {
          mainWindow.webContents.toggleDevTools();
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      { role: 'about' }
    ]
  }
];


// Create menu from template
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// Read the login.json file and send data to the login page
ipcMain.handle('get-login-info', async () => {
  try {
    const data = fs.readFileSync(loginFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {}; // Return empty if file not found or error
  }
});

// Save the login information to login.json
ipcMain.on('save-login-info', (event, loginInfo) => {
  fs.writeFileSync(loginFilePath, JSON.stringify(loginInfo, null, 2));
  console.log('Login info saved to', loginFilePath);
});

const squirrelEvent = process.argv[1];

function handleSquirrelEvent() {
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      installOrUpdate();
      return true;

    case '--squirrel-uninstall':
      uninstall();
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }

  return false;
}

function installOrUpdate() {
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  const target = path.basename(process.execPath);
  spawn(updateDotExe, ['--createShortcut', target], { detached: true }).on('close', () => {
    app.quit();
  });
}

function uninstall() {
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  const target = path.basename(process.execPath);
  spawn(updateDotExe, ['--removeShortcut', target], { detached: true }).on('close', () => {
    app.quit();
  });
}

if (handleSquirrelEvent()) {
  // Squirrel event handled, exit the application
  return;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle data from login screen
ipcMain.on('login-submit', (event, credentials) => {
  // Store credentials or pass them to db.js
  // You can either call db.js from here or store them for later use
  global.dbCredentials = credentials;

  // Now load index.html after successful login
  mainWindow.loadFile('index.html');
});

ipcMain.handle('get-db-credentials', async () => {
  // Pass the stored credentials from the login page to the renderer
  return global.dbCredentials;
});
