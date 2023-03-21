const { BrowserWindow } = require("electron");

const mainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 600,
    minHeight: 600,
    title: "Source-Diffusion",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadFile("window_main/index.html");

  // DEBUG
  mainWindow.webContents.openDevTools(/*{ mode: 'detach' }*/);
};

module.exports = {
  mainWindow: mainWindow,
};
