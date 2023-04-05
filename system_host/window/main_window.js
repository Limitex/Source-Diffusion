const { BrowserWindow } = require("electron");
const path = require("path");
const config = require("../config.js")

const mainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 700,
    minHeight: 600,
    title: "Source-Diffusion",
    icon: config.IconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "..", "preload", "main_window.js"),
    },
  });

  if (config.isDev) { 
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.setMenuBarVisibility(false);
  }

  mainWindow.loadFile("window_main/index.html");
};

module.exports = {
  mainWindow: mainWindow,
};
