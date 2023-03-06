const { app } = require("electron");
const path = require("path");
const Process = require("child_process");
const https = require("https");
const fs = require("fs");
const unzipper = require("unzipper");
const { createDirectoryByOverwrite } = require("./index_file.js");

const SavePath = app.getPath("userData");
const TmpPath = path.join(SavePath, "tmp");
const PythonPath = path.join(SavePath, "python", "python.exe");
const PythonDirPath = path.join(SavePath, "python");

const PythonURI = "https://www.python.org/ftp/python/3.10.8/python-3.10.8-embed-amd64.zip";
const PythonPIPURI = "https://bootstrap.pypa.io/get-pip.py";

const checkPython = (callback) => {
  Process.exec(PythonPath + " --version", (error, stdout, stderr) => {
    callback(stdout.includes("Python 3.10"));
  });
};

const checkPythonModules = (callback) => {
  callback(true);
};

const installPython = (callback) => {
  createDirectoryByOverwrite(TmpPath);
  createDirectoryByOverwrite(PythonDirPath);

  const zipPath = path.join(TmpPath, "python.zip");
  const pipPath = path.join(TmpPath, "get-pip.py");

  https.get(PythonURI, (response) => {
    const file = fs.createWriteStream(zipPath);
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: PythonDirPath }))
        .on("finish", () => {
          https.get(PythonPIPURI, (response) => {
            const pfile = fs.createWriteStream(pipPath);
            response.pipe(pfile);
            Process.exec(
              PythonPath + " " + pipPath,
              (error, stdout, stderr) => {
                const pthPath = path.join(PythonDirPath, "python310._pth");
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
