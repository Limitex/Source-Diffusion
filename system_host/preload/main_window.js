const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("background", {
  pid: () => ipcRenderer.invoke("pid"),
  openBrowser: (arg) => ipcRenderer.invoke("openBrowser", arg)
});