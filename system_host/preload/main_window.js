const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("background", {
  pid: () => ipcRenderer.invoke("pid"),
  version: () => ipcRenderer.invoke("version"),
  openBrowser: (arg) => ipcRenderer.invoke("openBrowser", arg)
});