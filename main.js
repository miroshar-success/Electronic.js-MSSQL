const { app, BrowserWindow } = require('electron');
const path = require('path');
const spawn = require('child_process').spawn;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

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
