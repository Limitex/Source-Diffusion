const { app, ipcMain } = require("electron");
const iwm = require("./index_w_main.js");
const iwl = require("./index_w_load.js");
const server = require("./index_server.js");
const startup = require("./index_startup.js");

let loadWindowObj = null;
app.once("ready", () => (loadWindowObj = iwl.loadWindow()));

std_data = [];
std_status = -1; // -1:Default, 0:ServerRunning, 1:ServerExitedForError
ipcMain.handle("stdout", () => std_data);
ipcMain.handle("stdstatus", () => std_status);
ipcMain.handle("exitAll", () => {
  loadWindowObj.close();
  app.once("window-all-closed", app.quit);
});

std_data.push("Checking required directories...");
if (!startup.checkRequiredFiles()) {
  std_data.push("This is the first boot.");
  std_data.push("Python installing... Please wait.");
  if (!startup.installPython()) {
    std_data.push("Installation failed.");
    std_status = 1;
  } else {
    std_data.push("Installation is complete.");
  }
}

if (std_status != 1) {
  std_data.push("Starting background app...");
  server.StartServer(
    (std) => {
      std_data.push(std.trim());
      console.log(std.trim());
    },
    (err) => {
      std_data.push(err.trim());
      console.error(err.trim());
      if (err.includes("Uvicorn running")) {
        std_status = 0;
        loadWindowObj.close();
        iwm.mainWindow();
        app.once("window-all-closed", app.quit);
      }
    },
    (exi) => {
      std_status = 1;
      txt = `Server process exited with code ${exi}`;
      std_data.push(txt);
      console.log(txt);
    }
  );
}
