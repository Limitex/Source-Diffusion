const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("background", {
  topstatus: () => ipcRenderer.invoke("topstatus"),
  stdout: () => ipcRenderer.invoke("stdout"),
  devout: () => ipcRenderer.invoke("devout"),
  stdstatus: () => ipcRenderer.invoke("stdstatus"),
  exitAll: () => ipcRenderer.invoke("exitAll"),
});
