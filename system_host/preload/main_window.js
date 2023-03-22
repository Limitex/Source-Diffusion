const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("startup", {
  pid: () => ipcRenderer.invoke("pid"),
  openBrowser: (arg) => ipcRenderer.invoke("openBrowser", arg)
});