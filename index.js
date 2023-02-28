const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Source-Diffusion',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  mainWindow.loadFile('index.html');
};

app.once('ready', createWindow);
app.once('window-all-closed', app.quit);