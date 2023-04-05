const path = require("path");
const Process = require("child_process");
const fs = require("fs");
const os = require('os');
const { exec } = require('child_process');
const {
  createDirectoryByOverwrite,
  httpDownload,
  unzip,
} = require("./file.js");
const config = require("../config.js");

const MVR_HKLM86='HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
const MVR_HKLM64='HKLM:\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
const MVR_HKCU='HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'

const checkRuntime = (callback) => {
  if (os.platform() != 'win32') {
    callback(true);
    return;
  }
  exec(`powershell -Command \"Get-ItemProperty '${MVR_HKLM86}', '${MVR_HKLM64}', '${MVR_HKCU}' | Select-Object DisplayName | Where-Object { $_.DisplayName -like 'Microsoft Visual C++*' }\"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`\"exec\" ERROR: ${err}`);
      callback(false)
      return;
    }
    const list = ['Additional', 'Minimum', 'Redistributable']
    const applist = stdout.split('\r\n').filter(item => item.includes('Microsoft Visual C++'));
    if (applist.length > 0 && list.every(listStr => applist.some(appName => appName.includes(listStr)))) {
      callback(true)
    } else {
      callback(false)
    }
  });
}

const checkPython = (callback) => {
  Process.exec("\"" + config.PythonPath + "\" --version", (error, stdout, stderr) => {
    callback(stdout.includes("Python 3.10"));
  });
};

const checkPythonModules = (callback) => {
  const pipprocess = Process.exec("\"" + config.PipPath + "\" freeze");
  pipprocess.stdout.on("data", (data) => {
    const packageNames = data.trimEnd().split('\r\n');
    fs.readFile('py_src/requirements.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      const requirementsPackageNames = data.split('\r\n')
        .filter((item) => !item.includes("--extra-index-url"))
        .map(rpn => rpn.includes('[') && rpn.includes(']') ? rpn.replace(/\[.*?\]/g, "") : rpn)
      const result = requirementsPackageNames.every(requirement => packageNames.some(package => package.includes(requirement)))
      callback(result);
    });
  });
  pipprocess.stderr.on("data", (data) => console.log(data.trimEnd()));
  pipprocess.on("close", (data) => {
    if (data != 0) callback(false);
  });
};

const installPython = (callback, stdDataRef) => {
  stdDataRef.push("Initializing...");

  createDirectoryByOverwrite(config.TmpPath);
  createDirectoryByOverwrite(config.PythonDirPath);

  const zipTmpPath = path.join(config.TmpPath, "python.zip");
  const pipTmpPath = path.join(config.TmpPath, "get-pip.py");

  stdDataRef.push("Downloading Python...");
  httpDownload(
    config.PythonURI,
    zipTmpPath,
    () => {
      stdDataRef.push("Unpacking the zip...");
      unzip(
        zipTmpPath,
        config.PythonDirPath,
        () => {
          stdDataRef.push("Downloading pip install tool...");
          httpDownload(
            config.PythonPIPURI,
            pipTmpPath,
            () => {
              stdDataRef.push("Installing pip...");
              const installPipProcess = Process.exec(
                "\"" + config.PythonPath +
                  "\" \"" +
                  pipTmpPath +
                  "\" --no-warn-script-location",
                (error, stdout, stderr) => {
                  const pthPath = path.join(
                    config.PythonDirPath,
                    "python310._pth"
                  );
                  fs.readFile(pthPath, "utf8", (err, data) => {
                    stdDataRef.push("Setting pip...");
                    if (err) throw err;
                    const updatedData = data.replace(
                      /#import site/g,
                      "import site"
                    );
                    fs.writeFile(pthPath, updatedData, "utf8", (err) => {
                      if (err) throw err;
                      installModules(
                        (response) => callback(response),
                        stdDataRef
                      );
                    });
                  });
                }
              );
              installPipProcess.stdout.on("data", (data) => {
                stdDataRef.push(data.trimEnd());
                console.log(data.trimEnd());
              });
              installPipProcess.stderr.on("data", (data) =>
                console.log(data.trimEnd())
              );
              installPipProcess.on("close", (data) => {
                if (data != 0) callback(false);
              });
            },
            (pipDlErr) => callback(false)
          );
        },
        (pyUnzipErr) => callback(false)
      );
    },
    (pyZipDlErr) => callback(false)
  );
};

const installModules = (callback, stdDataRef) => {
  stdDataRef.push("Installing module...");
  const pipprocess = Process.exec(
    "\"" + config.PipPath +
      "\" install -r py_src/requirements.txt --no-warn-script-location"
  );
  pipprocess.stdout.on("data", (data) => {
    stdDataRef.push(data.trimEnd());
    console.log(data.trimEnd());
  });
  pipprocess.stderr.on("data", (data) => console.log(data.trimEnd()));
  pipprocess.on("close", (data) => callback(data == 0));
};

module.exports = {
  checkPython: checkPython,
  checkPythonModules: checkPythonModules,
  installPython: installPython,
  checkRuntime: checkRuntime
};
