const Process = require("child_process");
const config = require("../config.js");

const checkEnvironment = (outputCallback, normalCallback, abnormalCallback) => {
  const process = Process.exec(`\"${config.CheckScriptPath}\" \"${config.AppDir}\" \"${config.AppDataDir}\"`, (error, stdout, stderr) => {});
  process.stdout.on("data", (data) => outputCallback(data.trimEnd()));
  process.on("close", (data) => {
    if (data == 0) {
      normalCallback();
    } else {
      abnormalCallback();
    }
  });
}

const installEnvironment = (outputCallback, normalCallback, abnormalCallback) => {
  const process = Process.exec(`\"${config.InstallScriptPath}\" \"${config.AppDir}\" \"${config.AppDataDir}\"`, (error, stdout, stderr) => {});
  process.stdout.on("data", (data) => outputCallback(data.trimEnd()));
  process.on("close", (data) => {
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
