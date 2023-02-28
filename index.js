const { app, BrowserWindow } = require('electron');
const Process = require('child_process');

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

  // DEBUG
  mainWindow.webContents.openDevTools(/*{ mode: 'detach' }*/);
};

app.once('ready', createWindow);
app.once('window-all-closed', app.quit);

Process.exec('python --version', (error, stdout, stderr) => {
  console.log(error ?? stdout ?? stderr);
});