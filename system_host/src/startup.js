const config = require("../config.js");
const { spawn } = require('child_process');

const environmentProcess = (scriptPath, outputCallback, normalCallback, abnormalCallback) => {
  const process = spawn(scriptPath, [config.AppDir, config.AppDataDir]);
  process.stdout.on('data', (data) => outputCallback(`${data}`.trimEnd()));
  process.stderr.on('data', (data) => outputCallback(`${data}`.trimEnd()));
  process.on('close', (data) => {
    if (data == 0) {
      normalCallback();
    } else {
      abnormalCallback();
    }
  });
} 

const checkEnvironment = (outputCallback, normalCallback, abnormalCallback) => 
  environmentProcess(config.CheckScriptPath, outputCallback, normalCallback, abnormalCallback);

const installEnvironment = (outputCallback, normalCallback, abnormalCallback) => 
  environmentProcess(config.InstallScriptPath, outputCallback, normalCallback, abnormalCallback);

module.exports = {
  checkEnvironment: checkEnvironment,
  installEnvironment: installEnvironment
};
