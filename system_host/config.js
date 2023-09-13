const os = require('os');
const { app } = require("electron");
const path = require("path");
const Process = require("child_process");

const isDev = process.argv.some(arg => arg === '--dev');
const isDevLoad = process.argv.some(arg => arg === '--lw-dev');

const selectPlatform = (win32, macos, linux) => {
  if (os.platform() === 'win32') return win32;
  else if (os.platform() === 'darwin') return macos;
  else if (os.platform() === 'linux') return linux;
  else return undefined;
}

const AppDir = selectPlatform(
  process.defaultApp ? app.getAppPath() : path.dirname(app.getPath("exe")),
  process.defaultApp ? app.getAppPath() : path.join(path.dirname(app.getPath("exe")), ".."),
  undefined
);

const AppDataDir = selectPlatform(
  app.getPath("userData"),
  path.join("/", "Users", "Shared", app.getName()),
  undefined
);

const CheckScriptPath = selectPlatform(
  path.join(AppDir,  'system_dependent', 'win', 'py_check.bat'),
  path.join(AppDir,  'system_dependent', 'mac', 'py_check.sh'),
  undefined
);

const InstallScriptPath = selectPlatform(
  path.join(AppDir,  'system_dependent', 'win', 'py_install.bat'),
  path.join(AppDir,  'system_dependent', 'mac', 'py_install.sh'),
  undefined
);

const PythonPath = selectPlatform(
  path.join(AppDataDir, "python", "python.exe"),
  path.join(AppDataDir, "python", "bin", "python3"),
  undefined
);

const IconPath = path.join(AppDir, 'system_src', 'icon', 'cat_tail.ico')
const CachePath = path.join(AppDataDir, '.cache')

if (os.platform() === 'darwin') {
  Process.exec(`chmod +x \"${CheckScriptPath}\"`, (error, stdout, stderr) => {});
  Process.exec(`chmod +x \"${InstallScriptPath}\"`, (error, stdout, stderr) => {});
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
  CachePath: CachePath,

  PORT: PORT,
  HOST: HOST,
  WORK: WORK,
};
