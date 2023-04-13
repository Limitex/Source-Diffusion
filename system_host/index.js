const { app, ipcMain, shell } = require("electron");
const iwm = require("./window/main_window.js");
const iwl = require("./window/load_window.js");
const server = require("./src/server.js");
const startup = require("./src/startup.js");
const config = require("./config.js");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// app.disableHardwareAcceleration()

let loadWindowObj = null;
app.once("ready", () => (loadWindowObj = iwl.loadWindow()));

dev_data = JSON.stringify(config);
std_status = -1; // -1:Default, 0:ServerRunning, 1:ServerExitedForError
top_status = ''
ipcMain.handle("version", () => app.getVersion());
ipcMain.handle("devout", () => dev_data);
ipcMain.handle("stdstatus", () => std_status);
ipcMain.handle("topstatus", () => top_status);
ipcMain.handle("pid", () => process.pid);
ipcMain.handle("openBrowser", (event, arg) => shell.openExternal(arg));
ipcMain.handle("envreset", () => installProcess());
ipcMain.handle("exitAll", () => {
  loadWindowObj.close();
  app.once("window-all-closed", app.quit);
});

const sendLogText = (text) => {
  if (loadWindowObj != null && !loadWindowObj.isDestroyed() && !loadWindowObj.webContents.isDestroyed()) {
    const hexString = Array.from(new TextEncoder().encode(text));
    loadWindowObj.webContents.executeJavaScript(`setLogText([${hexString.join(",")}])`).catch();
  }
}

const StartBackground = () => {
  sendLogText("Starting background app...");
  server.StartServer(
    (std) => {
      sendLogText(std.trimEnd());
      console.log(std.trimEnd());
    },
    (err) => {
      sendLogText(err.trimEnd());
      console.error(err.trimEnd());
      if (err.includes("Uvicorn running")) {
        if (config.isDevLoad) return;
        std_status = 0;
        loadWindowObj.close();
        iwm.mainWindow();
        app.once("window-all-closed", app.quit);
      }
    },
    (exi) => {
      std_status = 1;
      txt = `Process exited with code ${exi}`;
      sendLogText(txt);
      console.log(txt);
    }
  );
};

const installProcess = () => {
  std_status = -1;
  top_status = 'Initial setup is in progress.'
  startup.installEnvironment(
    (data) => sendLogText(data),
    () => StartBackground(),
    () => {
      sendLogText("Installation failed.");
      std_status = 1;
    }
  )
}

sendLogText("Checking required directories...");
startup.checkEnvironment(
  (data) => sendLogText(data),
  () => StartBackground(),
  () => installProcess()
)