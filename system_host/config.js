const os = require('os');
const { app } = require("electron");
const path = require("path");
const Process = require("child_process");

const isDev = process.argv.some(arg => arg === '--dev');
const isDevLoad = process.argv.some(arg => arg === '--lw-dev');

let AppDir;
let AppDataDir;
let CheckScriptPath;
let InstallScriptPath;
let PythonPath;
let IconPath;
if (os.platform() === 'win32') {
  AppDir = process.defaultApp ? app.getAppPath() : path.dirname(app.getPath("exe"));
  AppDataDir = app.getPath("userData");
  CheckScriptPath = path.join(AppDir,  'system_dependent', 'win', 'py_check.bat');
  InstallScriptPath = path.join(AppDir,  'system_dependent', 'win', 'py_install.bat');
  PythonPath = path.join(AppDataDir, "python", "python.exe");
  IconPath = path.join(AppDir, 'system_src', 'icon', 'cat_tail.ico');
} else if (os.platform() === 'darwin') {
  AppDir = process.defaultApp ? app.getAppPath() : path.join(path.dirname(app.getPath("exe")), "..");
  AppDataDir = path.join("/", "Users", "Shared", app.getName());
  CheckScriptPath = path.join(AppDir,  'system_dependent', 'mac', 'py_check.sh');
  InstallScriptPath = path.join(AppDir,  'system_dependent', 'mac', 'py_install.sh');
  PythonPath = path.join(AppDataDir, "python", "bin", "python3");
  IconPath = path.join(AppDir, 'system_src', 'icon', 'cat_tail.ico');
  Process.exec(`chmod +x \"${CheckScriptPath}\"`, (error, stdout, stderr) => {});
  Process.exec(`chmod +x \"${InstallScriptPath}\"`, (error, stdout, stderr) => {});
} else {

}

const PORT = 8000;
const HOST = "localhost";
const WORK = "py_src.main:app";

module.exports = {
  isDev: isDev,
  isDevLoad: isDevLoad,

  AppDir: AppDir,
  AppDataDir: AppDataDir,
  CheckScriptPath: CheckScriptPath,
  InstallScriptPath: InstallScriptPath,
  PythonPath: PythonPath,
  IconPath: IconPath,

  PORT: PORT,
  HOST: HOST,
  WORK: WORK,
};
