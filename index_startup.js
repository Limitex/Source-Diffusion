const { app } = require('electron');
const path = require('path');
const SavePath = path.join(app.getPath('userData'), 'python');
const Process = require("child_process");

const PythonURI = 'https://www.python.org/ftp/python/3.10.8/python-3.10.8-embed-amd64.zip'
const PythonPIPURI = 'https://bootstrap.pypa.io/get-pip.py'


const checkPython = (callback) => {
  const pythonPath = path.join(SavePath, 'python.exe');
  Process.exec(pythonPath + ' --version', (error, stdout, stderr) => {
    callback(stdout.includes('Python 3.10'));
  });
};

const checkPythonModules = (callback) => {
  callback(true)
}

const installPython = (callback) => {
  callback(true)
}

const installModules = (callback) => {
  callback(true)
}

module.exports = {
  checkPython: checkPython,
  checkPythonModules: checkPythonModules,
  installPython: installPython,
  installModules: installModules
};
