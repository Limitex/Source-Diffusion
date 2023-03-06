const fs = require("fs");
const path = require("path");

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

const createDirectoryByOverwrite = (directoryPath) => {
  if (fs.existsSync(directoryPath)) deleteDirectory(directoryPath);
  fs.mkdirSync(directoryPath);
};

module.exports = {
  deleteDirectory: deleteDirectory,
  createDirectoryByOverwrite: createDirectoryByOverwrite,
};
