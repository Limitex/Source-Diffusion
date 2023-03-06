const { app } = require("electron");
const path = require("path");
const Process = require("child_process");
const https = require("https");
const fs = require("fs");
const unzipper = require("unzipper");
const { createDirectoryByOverwrite } = require("./index_file.js");
const config = require("./config.js")

const checkPython = (callback) => {
  Process.exec(config.PythonPath + " --version", (error, stdout, stderr) => {
    callback(stdout.includes("Python 3.10"));
  });
};

const checkPythonModules = (callback) => {
  callback(true);
};

const installPython = (callback) => {
  createDirectoryByOverwrite(config.TmpPath);
  createDirectoryByOverwrite(config.PythonDirPath);

  const zipPath = path.join(config.TmpPath, "python.zip");
  const pipPath = path.join(config.TmpPath, "get-pip.py");

  https.get(config.PythonURI, (response) => {
    const file = fs.createWriteStream(zipPath);
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: config.PythonDirPath }))
        .on("finish", () => {
          https.get(config.PythonPIPURI, (response) => {
            const pfile = fs.createWriteStream(pipPath);
            response.pipe(pfile);
            Process.exec(
              config.PythonPath + " " + pipPath,
              (error, stdout, stderr) => {
                const pthPath = path.join(config.PythonDirPath, "python310._pth");
                fs.readFile(pthPath, "utf8", (err, data) => {
                  if (err) throw err;
                  const updatedData = data.replace(
                    /#import site/g,
                    "import site"
                  );
                  fs.writeFile(pthPath, updatedData, "utf8", (err) => {
                    if (err) throw err;
                    callback(true);
                  });
                });
              }
            );
          });
        });
    });
  });
};

const installModules = (callback) => {
  callback(true);
};

module.exports = {
  checkPython: checkPython,
  checkPythonModules: checkPythonModules,
  installPython: installPython,
  installModules: installModules
};
