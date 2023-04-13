const Process = require("child_process");
const config = require("../config.js");
const { spawn } = require('child_process');

const checkEnvironment = (outputCallback, normalCallback, abnormalCallback) => {
  const process = spawn(config.CheckScriptPath, [config.AppDir, config.AppDataDir]);
  process.stdout.on('data', (data) => outputCallback(`${data}`));
  process.stderr.on('data', (data) => outputCallback(`${data}`));
  process.on('close', (data) => {
    if (data == 0) {
      normalCallback();
    } else {
      abnormalCallback();
    }
  });
}

const installEnvironment = (outputCallback, normalCallback, abnormalCallback) => {
  const process = spawn(config.InstallScriptPath, [config.AppDir, config.AppDataDir]);
  process.stdout.on('data', (data) => outputCallback(`${data}`));
  process.stderr.on('data', (data) => outputCallback(`${data}`));
  process.on('close', (data) => {
    if (data == 0) {
      normalCallback();
    } else {
      abnormalCallback();
    }
  });
}

module.exports = {
  checkEnvironment: checkEnvironment,
  installEnvironment: installEnvironment
};
