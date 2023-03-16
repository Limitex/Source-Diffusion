const { app, ipcMain } = require("electron");
const iwm = require("./index_w_main.js");
const iwl = require("./index_w_load.js");
const server = require("./index_server.js");
const startup = require("./index_startup.js");

// app.disableHardwareAcceleration()

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
startup.checkPython((pythonExist) => {
  if (pythonExist) {
    startup.checkPythonModules((moduleExist) => {
      if (moduleExist) {
        StartBackground();
      } else { // moduleExist
        startup.installModules((installSuccess) => {
          if (installSuccess) {
            std_data.push("Installation complete.");
            StartBackground();
          } else { // installSuccess
            std_data.push("Installation failed.");
            std_status = 1;
          } // installSuccess
        }, std_data);
      } // moduleExist
    });
  } else { // pythonExist
    std_data.push("This is the first boot.");
    std_data.push("Python installing... Please wait.");
    startup.installPython((installSuccess) => {
      if (installSuccess) {
        std_data.push("Installation is complete.");
        StartBackground();
      } else { // installSuccess
        std_data.push("Installation failed.");
        std_status = 1;
      } // installSuccess
    }, std_data);
  } // pythonExist
});
