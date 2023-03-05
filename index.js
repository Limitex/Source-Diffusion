const { app, ipcMain } = require("electron");
const iwm = require("./index_w_main.js");
const iwl = require("./index_w_load.js");
const server = require("./index_server.js");
const startup = require("./index_startup.js");

const SERVER_READY_SHARE_STRING='Server is ready'

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
      std_data.push(std.trim());
      console.log(std.trim());
    },
    (err) => {
      std_data.push(err.trim());
      console.error(err.trim());
      if (err.includes(SERVER_READY_SHARE_STRING)) {
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
};

std_data.push("Checking required directories...");
startup.checkPython((result) => {
  // Python Check
  if (result) {
    // Python is installed
    startup.checkPythonModules((result) => {
      // Module Check
      if (result) {
        // Module is installed
        StartBackground();
      } else {
        // Module is not installed
        std_data.push("Installing module...");
        startup.installModules((result) => {
          if (result) {
            std_data.push("Installation complete.");
            StartBackground();
          } else {
            std_data.push("Installation failed.");
            std_status = 1;
          }
        });
      }
    });
  } else {
    // Python is not installed
    std_data.push("This is the first boot.");
    std_data.push("Python installing... Please wait.");
    startup.installPython((result) => {
      // Python install
      if (result) {
        // install is complete
        std_data.push("Installation is complete.");
        StartBackground();
      } else {
        // install is failed
        std_data.push("Installation failed.");
        std_status = 1;
      }
    });
  }
});
