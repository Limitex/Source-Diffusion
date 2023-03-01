const { app, BrowserWindow } = require('electron')
const Process = require('child_process')
const psTree = require('ps-tree')

const PORT = 8000
const HOST = 'localhost'
const WORK = 'py-src.main:app'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Source-Diffusion',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  mainWindow.loadFile('index.html');

  // DEBUG
  mainWindow.webContents.openDevTools(/*{ mode: 'detach' }*/);
};

app.once('ready', createWindow);
app.once('window-all-closed', app.quit);

const ServerProcess = Process.exec('python -m uvicorn --host ' + HOST + ' --port=' + PORT + ' --workers 1 ' + WORK);

pids = []
psTree(ServerProcess.pid, (err, children) => children.forEach(element => pids.push(element.PID)))

app.on('before-quit', () => pids.forEach(element => process.kill(element, 'SIGINT')))