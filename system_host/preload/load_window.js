const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("background", {
  version: () => ipcRenderer.invoke("version"),
  topstatus: () => ipcRenderer.invoke("topstatus"),
  devout: () => ipcRenderer.invoke("devout"),
  stdstatus: () => ipcRenderer.invoke("stdstatus"),
  envreset: () => ipcRenderer.invoke("envreset"),
  exitAll: () => ipcRenderer.invoke("exitAll"),
});
