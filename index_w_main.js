const { BrowserWindow } = require("electron");
const path = require("path");

const mainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 700,
    minHeight: 600,
    title: "Source-Diffusion",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload_main.js"),
    },
  });
  mainWindow.loadFile("window_main/index.html");

  // DEBUG
  mainWindow.webContents.openDevTools(/*{ mode: 'detach' }*/);
};

module.exports = {
  mainWindow: mainWindow,
};
