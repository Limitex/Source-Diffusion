const { app, BrowserWindow, ipcMain } = require('electron')
const Process = require('child_process')
const psTree = require('ps-tree')
const path = require('path')
const iwm = require('./index_w_main.js');
const server = require('./index_server.js');

const PORT = 8000
const HOST = 'localhost'
const WORK = 'py_src.main:app'

std_data = []
std_status = -1
let loadWindowObj = null;
const loadWindow = () => {
  loadWindowObj = new BrowserWindow({ 
    width: 600, 
    height: 400, 
    frame: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload_load.js'),
    },
  })
  loadWindowObj.setAlwaysOnTop(true)
  ipcMain.handle('stdout', () => std_data)
  ipcMain.handle('stdstatus', () => std_status)
  ipcMain.handle('exitAll', () => {
    loadWindowObj.close();
    app.once('window-all-closed', app.quit);
  })
  loadWindowObj.loadFile('window_load/index.html');
}
app.once('ready', loadWindow);

server.StartServer(
  (std) => {
    std_data.push(std.trim())
    console.log(std.trim())
  },
  (err) => {
    std_data.push(err.trim())
    console.error(err.trim())
    if (err.includes('Uvicorn running')) {
      std_status = 0;
      loadWindowObj.close();
      iwm.mainWindow();
      app.once('window-all-closed', app.quit);
    }
  },
  (exi) => {
    std_status = 1;
    txt = `Server process exited with code ${exi}`
    std_data.push(txt)
    console.log(txt)
  }
)