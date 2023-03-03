const { app } = require("electron");
const Process = require("child_process");
const psTree = require("ps-tree");

const PORT = 8000;
const HOST = "localhost";
const WORK = "py_src.main:app";

const StartServer = (stdout, stderr, exited) => {
  const ServerProcess = Process.exec(
    "python -m uvicorn --host " +
      HOST +
      " --port=" +
      PORT +
      " --workers 1 " +
      WORK
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
  StartServer: StartServer
};