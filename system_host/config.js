const { app } = require("electron");
const path = require("path");

const isDev = process.argv.some(arg => arg === '--dev');
const isDevLoad = process.argv.some(arg => arg === '--lw-dev');

const AppDir = process.defaultApp ? app.getAppPath() : path.dirname(app.getPath("exe"));
const AppDataDir = app.getPath("userData");

const IconPath = path.join(AppDir, 'system_src', 'icon', 'cat_tail.ico');
const CheckScriptPath = path.join(AppDir,  'system_dependent', 'win', 'py_check.bat');
const InstallScriptPath = path.join(AppDir,  'system_dependent', 'win', 'py_install.bat');

const PORT = 8000;
const HOST = "localhost";
const WORK = "py_src.main:app";

const PythonPath = path.join(AppDataDir, "python", "python.exe");

module.exports = {
  isDev: isDev,
  isDevLoad: isDevLoad,

  AppDir: AppDir,
  AppDataDir: AppDataDir,

  IconPath: IconPath,
  CheckScriptPath: CheckScriptPath,
  InstallScriptPath: InstallScriptPath,

  PORT: PORT,
  HOST: HOST,
  WORK: WORK,

  PythonPath: PythonPath,
};
