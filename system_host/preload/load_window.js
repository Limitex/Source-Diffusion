const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("background", {
  version: () => ipcRenderer.invoke("version"),
  devout: () => ipcRenderer.invoke("devout"),
  envreset: () => ipcRenderer.invoke("envreset"),
  exitAll: () => ipcRenderer.invoke("exitAll"),
});
