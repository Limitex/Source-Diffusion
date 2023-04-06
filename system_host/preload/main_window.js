const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("background", {
  version: () => ipcRenderer.invoke("version"),
  pid: () => ipcRenderer.invoke("pid"),
  openBrowser: (arg) => ipcRenderer.invoke("openBrowser", arg)
});