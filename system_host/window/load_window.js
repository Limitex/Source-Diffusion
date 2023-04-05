const { BrowserWindow } = require("electron");
const path = require("path");
const config = require("../config.js")

const loadWindow = () => {
  const loadWindowObj = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    skipTaskbar: true,
    resizable: false,
    icon: config.IconPath,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "load_window.js"),
    },
  });
  // loadWindowObj.setAlwaysOnTop(true);
  loadWindowObj.loadFile("window_load/index.html");
  return loadWindowObj;
};

module.exports = {
  loadWindow: loadWindow,
};
