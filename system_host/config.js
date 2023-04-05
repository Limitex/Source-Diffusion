const { app } = require("electron");
const path = require("path");
const os = require('os');

const isDev = process.argv.some(arg => arg === '--dev');
const isDevLoad = process.argv.some(arg => arg === '--lw-dev');

const IconPath = path.join(__dirname, '..', 'system_src', 'icon', 'cat_tail.ico');

const PORT = 8000;
const HOST = "localhost";
const WORK = "py_src.main:app";

const SavePath = app.getPath("userData");
const TmpPath = path.join(SavePath, "tmp");
const PythonDirPath = path.join(SavePath, "python");
const PythonPIPURI = "https://bootstrap.pypa.io/get-pip.py";

let PythonPath
let PipPath
let PythonURI

if (os.platform() === 'win32') {
  PythonPath = path.join(SavePath, "python", "python.exe");
  PipPath = path.join(PythonDirPath, "Scripts", "pip.exe");
  PythonURI = "https://www.python.org/ftp/python/3.10.8/python-3.10.8-embed-amd64.zip";
} else if (os.platform() === 'darwin' || os.platform() === 'linux') {
  PythonPath = path.join(SavePath, "python", "python");
  PipPath = path.join(PythonDirPath, "Scripts", "pip");
  PythonURI = "https://www.python.org/ftp/python/3.10.8/Python-3.10.8.tar.xz";
}


module.exports = {
  isDev: isDev,
  isDevLoad: isDevLoad,

  IconPath: IconPath,

  PORT: PORT,
  HOST: HOST,
  WORK: WORK,

  SavePath: SavePath,
  TmpPath: TmpPath,
  PythonPath: PythonPath,
  PythonDirPath: PythonDirPath,
  PipPath: PipPath,

  PythonURI: PythonURI,
  PythonPIPURI: PythonPIPURI,
};
