const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('background', {
  stdout: () => ipcRenderer.invoke('stdout'),
  stdstatus: () => ipcRenderer.invoke('stdstatus'),
  exitAll: () => ipcRenderer.invoke('exitAll'),
})