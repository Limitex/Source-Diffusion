const { app, BrowserWindow, ipcMain } = require('electron')
const Process = require('child_process')
const psTree = require('ps-tree')
const path = require('path')

const PORT = 8000
const HOST = 'localhost'
const WORK = 'py_src.main:app'

const mainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Source-Diffusion',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  mainWindow.loadFile('window_main/index.html');

  // DEBUG
  mainWindow.webContents.openDevTools(/*{ mode: 'detach' }*/);
};


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

const ServerProcess = Process.exec('python -m uvicorn --host ' + HOST + ' --port=' + PORT + ' --workers 1 ' + WORK);
ServerProcess.stdout.on('data', (data) => {
  std_data.push(data.trim())
  console.log(data.trim())
});
ServerProcess.stderr.on('data', (data) => {
  std_data.push(data.trim())
  console.error(data.trim())
  if (data.includes('Uvicorn running')) {
    std_status = 0;
    loadWindowObj.close();
    mainWindow();
    app.once('window-all-closed', app.quit);
  }
});
ServerProcess.on('close', (code) => {
  std_status = 1;
  txt = `Server process exited with code ${code}`
  std_data.push(txt)
  console.log(txt)
});

pids = []
psTree(ServerProcess.pid, (err, children) => children.forEach(element => pids.push(element.PID)))

app.on('before-quit', () => pids.forEach(element => process.kill(element, 'SIGINT')))