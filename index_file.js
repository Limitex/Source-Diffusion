const fs = require("fs");
const path = require("path");
const https = require("https");
const unzipper = require("unzipper");

const deleteDirectory = (directoryPath) => {
  if (fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        deleteDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }

    fs.rmdirSync(directoryPath);
  }
};

const httpDownload = (uri, out_path, success_callback, failed_callback) => {
  const req = https.get(uri, (response) => {
    const file = fs.createWriteStream(out_path);
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      success_callback();
    });
  });
  req.on("error", failed_callback);
};

const unzip = (zipPath, outDirPath, success_callback, failed_callback) => {
  const file = 
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: outDirPath }))
      .on("finish", success_callback)
      .on("error", failed_callback);
};

const createDirectoryByOverwrite = (directoryPath) => {
  if (fs.existsSync(directoryPath)) deleteDirectory(directoryPath);
  fs.mkdirSync(directoryPath);
};

module.exports = {
  deleteDirectory: deleteDirectory,
  httpDownload: httpDownload,
  unzip: unzip,
  createDirectoryByOverwrite: createDirectoryByOverwrite,
};
