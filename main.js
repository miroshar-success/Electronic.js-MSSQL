const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true, // Show the window frame (title bar)
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity; use context isolation in production
        },
    });

    win.maximize(); // Maximize the window
    win.loadFile('index.html');
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
