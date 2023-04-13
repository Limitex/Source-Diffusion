const { app, ipcMain, shell } = require("electron");
const iwm = require("./window/main_window.js");
const iwl = require("./window/load_window.js");
const server = require("./src/server.js");
const startup = require("./src/startup.js");
const config = require("./config.js");

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
        sendExitStatus(0)
        loadWindowObj.close();
        iwm.mainWindow();
        app.once("window-all-closed", app.quit);
      }
    },
    (exi) => {
      sendExitStatus(1)
      txt = `Process exited with code ${exi}`;
      sendLogText(txt);
      console.log(txt);
    }
  );
};

const installProcess = () => {
  sendExitStatus(-1)
  sendTopStatus('Initial setup is in progress.')
  startup.installEnvironment(
    (data) => sendLogText(data),
    () => StartBackground(),
    () => {
      sendLogText("Installation failed.");
      sendExitStatus(1)
    }
  )
}

const sendToRendre = (functionName, ...args) => {
  if (loadWindowObj != null && !loadWindowObj.isDestroyed() && !loadWindowObj.webContents.isDestroyed()) {
    loadWindowObj.webContents.executeJavaScript(`${functionName}([${args.join(",")}])`).catch();
  }
}

const sendLogText = (text) => sendToRendre('setLogText', Array.from(new TextEncoder().encode(text)))
const sendTopStatus = (text) => sendToRendre('setTopStatus', Array.from(new TextEncoder().encode(text)));
const sendExitStatus = (text) => sendToRendre('setExitStatus', text);


if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// app.disableHardwareAcceleration()

let loadWindowObj = null;
ipcMain.handle("version", () => app.getVersion());
ipcMain.handle("devout", () => JSON.stringify(config));
ipcMain.handle("pid", () => process.pid);
ipcMain.handle("openBrowser", (event, arg) => shell.openExternal(arg));
ipcMain.handle("envreset", () => installProcess());
ipcMain.handle("exitAll", () => {
  loadWindowObj.close();
  app.once("window-all-closed", app.quit);
});

app.once("ready", () =>{
  loadWindowObj = iwl.loadWindow()
  sendLogText("Checking required directories...");
  startup.checkEnvironment(
    (data) => sendLogText(data),
    () => StartBackground(),
    () => installProcess()
  )
});