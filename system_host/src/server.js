const { app } = require("electron");
const Process = require("child_process");
const psTree = require("ps-tree");
const config = require("../config.js");

const StartServer = (stdout, stderr, exited) => {
  process.chdir(config.AppDir);
  const ServerProcess = Process.exec(
    config.PythonPath +
      " -m uvicorn --host " +
      config.HOST +
      " --port=" +
      config.PORT +
      " --workers 1 " +
      config.WORK
  );
  ServerProcess.stdout.on("data", stdout);
  ServerProcess.stderr.on("data", stderr);
  ServerProcess.on("close", exited);

  pids = [];
  psTree(ServerProcess.pid, (err, children) =>
    children.forEach((element) => pids.push(element.PID))
  );

  app.on("before-quit", () =>
    pids.forEach((element) => process.kill(element, "SIGINT"))
  );
};

module.exports = {
  StartServer: StartServer,
};
