const { app } = require("electron");
const path = require("path");

const isDev = process.argv.some(arg => arg === '--dev');

const IconPath = path.join(__dirname, '..', 'system_src', 'icon', 'cat_tail.ico');

const PORT = 8000;
const HOST = "localhost";
const WORK = "py_src.main:app";

const SavePath = app.getPath("userData");
const TmpPath = path.join(SavePath, "tmp");
const PythonPath = path.join(SavePath, "python", "python.exe");
const PythonDirPath = path.join(SavePath, "python");
const PipPath = path.join(PythonDirPath, "Scripts", "pip.exe");

const PythonURI =
  "https://www.python.org/ftp/python/3.10.8/python-3.10.8-embed-amd64.zip";
const PythonPIPURI = "https://bootstrap.pypa.io/get-pip.py";

module.exports = {
  isDev: isDev,

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
