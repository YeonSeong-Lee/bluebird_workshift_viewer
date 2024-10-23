// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetch_xlsx: (filePath) => ipcRenderer.invoke('fetch_xlsx', filePath),
  set_file_path: (filePath) => ipcRenderer.invoke('set_file_path', filePath),
  open_file_dialog: () => ipcRenderer.invoke('dialog:openFile'),
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});
