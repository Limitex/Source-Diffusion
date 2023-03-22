const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("startup", {
  pid: () => ipcRenderer.invoke("pid"),
});