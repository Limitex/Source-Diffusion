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

std_data = [];
dev_data = JSON.stringify(config);
std_status = -1; // -1:Default, 0:ServerRunning, 1:ServerExitedForError
top_status = ''
ipcMain.handle("version", () => app.getVersion());
ipcMain.handle("stdout", () => std_data);
ipcMain.handle("devout", () => dev_data);
ipcMain.handle("stdstatus", () => std_status);
ipcMain.handle("topstatus", () => top_status);
ipcMain.handle("pid", () => process.pid);
ipcMain.handle("openBrowser", (event, arg) => shell.openExternal(arg));
ipcMain.handle("exitAll", () => {
  loadWindowObj.close();
  app.once("window-all-closed", app.quit);
});

const StartBackground = () => {
  std_data.push("Starting background app...");
  server.StartServer(
    (std) => {
      std_data.push(std.trimEnd());
      console.log(std.trimEnd());
    },
    (err) => {
      std_data.push(err.trimEnd());
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
      std_data.push(txt);
      console.log(txt);
    }
  );
};

std_data.push("Checking required directories...");
startup.checkEnvironment(
  (data) => std_data.push(data),
  () => StartBackground(),
  () => {
    top_status = 'Initial setup is in progress.'
    startup.installEnvironment(
      (data) => std_data.push(data),
      () => StartBackground(),
      () => {
        std_data.push("Installation failed.");
        std_status = 1;
      }
    )
  }
)